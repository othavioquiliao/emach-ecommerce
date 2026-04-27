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
	return resend.emails.send({
		from: env.EMAIL_FROM,
		to,
		subject,
		html,
	});
}
