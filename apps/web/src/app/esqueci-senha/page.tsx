"use client";

import { cn } from "@emach/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			await authClient.requestPasswordReset(
				{ email: value.email, redirectTo: "/redefinir-senha" },
				{
					onSuccess: () => {
						toast.success(
							"Se a conta existir, enviamos um link para redefinir sua senha."
						);
					},
					onError: () => {
						toast.success(
							"Se a conta existir, enviamos um link para redefinir sua senha."
						);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("E-mail inválido"),
			}),
		},
	});

	return (
		<main className="flex min-h-svh items-center justify-center bg-white px-6 py-20">
			<div className="w-full max-w-[400px]">
				<h1 className="font-display font-medium text-[32px] text-near-black leading-tight">
					Esqueci a senha
				</h1>
				<p className="mt-3 text-[14px] text-gray-50">
					Informe seu e-mail. Se houver uma conta, enviaremos um link para
					redefinir sua senha.
				</p>

				<form
					className="mt-8 flex flex-col gap-3.5"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="email">
						{(field) => (
							<label className="emach-field" htmlFor={field.name}>
								<span className="emach-field__label">E-mail</span>
								<input
									className="emach-input"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="seu@email.com"
									type="email"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<span className="emach-field__error" key={error?.message}>
										{error?.message}
									</span>
								))}
							</label>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
					>
						{({ canSubmit, isSubmitting }) => (
							<button
								className={cn(
									"mt-2 w-full cursor-pointer rounded-[2px] border-0 bg-emach-red py-3 font-semibold text-[14px] text-white transition-all duration-180",
									canSubmit ? "opacity-100" : "opacity-65"
								)}
								disabled={!canSubmit || isSubmitting}
								type="submit"
							>
								{isSubmitting ? "Enviando…" : "Enviar link"}
							</button>
						)}
					</form.Subscribe>
				</form>

				<div className="mt-6 text-[13px] text-gray-50">
					<Link
						className="text-emach-red hover:underline"
						href={{ pathname: "/login" }}
					>
						Voltar para o login
					</Link>
				</div>
			</div>
		</main>
	);
}
