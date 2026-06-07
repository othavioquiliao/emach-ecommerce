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
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createGoogleProviderConfig } from "./google";

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

export const authEcommerce = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	trustedOrigins: isProd ? [env.ECOMMERCE_ORIGIN] : ["http://localhost:*"],
	emailAndPassword: {
		enabled: true,
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
		sendOnSignUp: false,
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
	databaseHooks: {
		user: {
			create: {
				before: async (user) => ({
					data: { ...user, emailVerified: true },
				}),
			},
		},
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
	advanced: {
		cookiePrefix: "ecommerce",
	},
	plugins: [nextCookies()],
});

export type EcommerceSession = typeof authEcommerce.$Infer.Session;
