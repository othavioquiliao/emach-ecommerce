import { env } from "@emach/env/server";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailArgs {
	react: ReactElement;
	subject: string;
	to: string;
}

export async function sendEmail({ to, subject, react }: SendEmailArgs) {
	const html = await render(react);
	const { data, error } = await resend.emails.send({
		from: env.EMAIL_FROM,
		to,
		subject,
		html,
	});

	if (error) {
		console.error("[email] Resend send failed", {
			to,
			subject,
			from: env.EMAIL_FROM,
			error,
		});
		throw new Error(
			`Resend send failed: ${error.name ?? "unknown"} — ${error.message ?? JSON.stringify(error)}`
		);
	}

	console.info("[email] sent", { to, subject, id: data?.id });
	return data;
}
