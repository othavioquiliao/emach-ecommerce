import { createDb } from "@emach/db";
import {
	client,
	clientAccount,
	clientSession,
	clientVerification,
} from "@emach/db/schema/client";
import { sendEmail } from "@emach/email/send";
import { ResetPasswordEmail } from "@emach/email/templates/reset-password";
import { VerifyEmailEmail } from "@emach/email/templates/verify-email";
import { env } from "@emach/env/server";
import { isValidCpfCnpj, onlyDigits } from "@emach/validators";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { createGoogleProviderConfig } from "./google";
import {
	createRateLimitStorage,
	RATE_LIMIT_WINDOW_SECONDS,
} from "./rate-limit-storage";

const db = createDb();
const schema = { client, clientSession, clientAccount, clientVerification };

const isProd = env.NODE_ENV === "production";

// Em produção, a URL é fixa e determinística (segurança: sem inferência de
// host arbitrário). Em dev, o host é derivado da request e validado contra
// `localhost:*`, permitindo rodar em qualquer porta sem editar o .env —
// útil quando a 3001 está ocupada por outro projeto. As portas locais ainda
// precisam estar nas "Authorized redirect URIs" do OAuth (Google não aceita
// wildcard de porta).
const ecommerceBaseURL = isProd
	? env.BETTER_AUTH_URL_ECOMMERCE
	: { allowedHosts: ["localhost:*"], protocol: "http" as const };

// Validação server-side de CPF/CNPJ (#92). A política client-side (Zod) é só
// UX; requests diretos aos endpoints do Better Auth (sign-up, updateUser)
// bypassam o cliente. Lança `APIError` (não `Error` plano) porque só ela
// propaga a mensagem ao cliente. Retorno tri-estado:
//   - `undefined`: campo não veio no payload → o hook não mexe no documento.
//   - `null`: campo veio vazio → limpar (grava NULL, **não** "" — string vazia
//     colidiria no unique `client_document_unique` no 2º cliente que limpasse,
//     e violaria a invariante "só dígitos" do schema).
//   - `string`: CPF/CNPJ normalizado (só dígitos) e válido.
function normalizeDocumentForWrite(raw: unknown): string | null | undefined {
	if (typeof raw !== "string") {
		return;
	}
	const trimmed = raw.trim();
	if (trimmed === "") {
		return null;
	}
	const document = onlyDigits(trimmed);
	if (!isValidCpfCnpj(document)) {
		throw new APIError("BAD_REQUEST", {
			message: "CPF ou CNPJ inválido.",
		});
	}
	return document;
}

export const authEcommerce = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	trustedOrigins: isProd ? [env.ECOMMERCE_ORIGIN] : ["http://localhost:*"],
	emailAndPassword: {
		enabled: true,
		// Enforce server-side do mínimo de senha (#92). O Zod no cliente é só UX;
		// requests diretos ao endpoint bypassariam essa regra sem isto.
		minPasswordLength: 8,
		requireEmailVerification: false,
		autoSignIn: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Redefinir sua senha — EMACH",
				react: ResetPasswordEmail({ name: user.name, url }),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Confirme seu e-mail — EMACH",
				react: VerifyEmailEmail({ name: user.name, url }),
			});
		},
	},
	socialProviders: {
		google: createGoogleProviderConfig({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}),
	},
	user: {
		modelName: "client",
		additionalFields: {
			phone: {
				type: "string",
				required: false,
				input: true,
			},
			document: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// `document` é additionalField — o Better Auth ainda não infere
					// seu tipo, daí o acesso por cast estrutural (não é `any`).
					const document = normalizeDocumentForWrite(
						(user as { document?: unknown }).document
					);
					// `undefined` = campo ausente (não mexe); `null`/string = grava.
					return {
						data: document === undefined ? user : { ...user, document },
					};
				},
			},
			update: {
				before: async (userData) => {
					const document = normalizeDocumentForWrite(
						(userData as { document?: unknown }).document
					);
					return {
						data: document === undefined ? userData : { ...userData, document },
					};
				},
			},
		},
	},
	session: {
		modelName: "clientSession",
	},
	account: {
		modelName: "clientAccount",
	},
	verification: {
		modelName: "clientVerification",
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: ecommerceBaseURL,
	rateLimit: {
		// `enabled: true` liga inclusive em dev (o Better Auth só ativa em prod
		// por default), permitindo testar o 429 localmente. Limite global frouxo;
		// regras agressivas nos paths sensíveis logo abaixo.
		enabled: true,
		window: RATE_LIMIT_WINDOW_SECONDS,
		max: 100,
		customStorage: createRateLimitStorage(),
		customRules: {
			"/sign-in/email": { window: RATE_LIMIT_WINDOW_SECONDS, max: 5 },
			"/sign-up/email": { window: RATE_LIMIT_WINDOW_SECONDS, max: 5 },
			// O endpoint email/password real no Better Auth 1.6.11 é
			// `/request-password-reset` (envia o e-mail) — NÃO `/forget-password`
			// (que é do plugin email-OTP, não usado aqui; seria dead code). E
			// `/reset-password` é a troca efetiva com o token. Os customRules
			// usam `p === path` (match exato), por isso o path tem que ser exato.
			"/request-password-reset": { window: RATE_LIMIT_WINDOW_SECONDS, max: 3 },
			"/reset-password": { window: RATE_LIMIT_WINDOW_SECONDS, max: 5 },
		},
	},
	advanced: {
		cookiePrefix: "ecommerce",
		// Atrás da Vercel o IP do cliente chega em x-forwarded-for. Sem declarar
		// o header, o Better Auth não resolve o IP e pula o rate limit. Na Vercel
		// esse header é setado pela infra (não é user-controlled).
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for"],
		},
		// Cookie de sessão (#96B): flags fixadas explicitamente em vez de depender
		// dos defaults implícitos do Better Auth. `secure` só em prod (https) —
		// em dev (http localhost) o cookie não setaria com secure. Sem `domain`:
		// subdomínios isolam por host (invariante P0 — não vazar sessão entre apps).
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: "lax",
			secure: isProd,
		},
	},
	plugins: [nextCookies()],
});

export type EcommerceSession = typeof authEcommerce.$Infer.Session;
