"use client";

import { Separator } from "@emach/ui/components/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { cn } from "@emach/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

const TRIGGER_CLASS =
	"h-auto flex-1 whitespace-nowrap border-none px-0 py-3.5 font-semibold text-[14px] text-gray-50 hover:text-near-black data-active:text-near-black focus-visible:ring-0 focus-visible:border-transparent";

export default function LoginPage() {
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const signInForm = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Login realizado com sucesso");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("E-mail inválido"),
				password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
			}),
		},
	});

	const signUpForm = useForm({
		defaultValues: { name: "", email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{ email: value.email, password: value.password, name: value.name },
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Conta criada com sucesso");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
				email: z.email("E-mail inválido"),
				password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
			}),
		},
	});

	if (isPending) {
		return (
			<main className="flex h-svh items-center justify-center bg-near-black">
				<Loader />
			</main>
		);
	}

	return (
		<main className="grid min-h-svh grid-cols-2">
			{/* Left — dark panel */}
			<div className="relative flex flex-col justify-between overflow-hidden bg-black px-[60px] py-20 text-white">
				<div
					aria-hidden="true"
					className="emach-bg-diagonal absolute inset-0"
				/>
				<span className="relative font-display font-semibold text-[12px] text-white/70 uppercase tracking-[0.14em]">
					EMACH Profissional
				</span>
				<div className="relative">
					<h2 className="font-display font-medium text-[44px] leading-[1.05] tracking-[-0.01em]">
						Bem-vindo de
						<br />
						volta à <span className="text-emach-red">bancada</span>.
					</h2>
					<p className="mt-5 max-w-[380px] text-[15px] text-white/70 leading-relaxed">
						Acesse sua conta para acompanhar pedidos, gerenciar endereços e
						aproveitar descontos exclusivos para profissionais.
					</p>
				</div>
				<div className="relative text-[12px] text-white/45 uppercase tracking-[0.12em]">
					© 2026 EMACH FERRAMENTAS
				</div>
			</div>

			{/* Right — white form panel */}
			<div className="flex items-center justify-center bg-white px-[60px] py-20">
				<div className="w-full max-w-[400px]">
					<Tabs
						className="mb-8 gap-0"
						onValueChange={(v) => setMode(v as "sign-in" | "sign-up")}
						value={mode}
					>
						<TabsList className="w-full" variant="line">
							<TabsTrigger className={TRIGGER_CLASS} value="sign-in">
								Entrar
							</TabsTrigger>
							<TabsTrigger className={TRIGGER_CLASS} value="sign-up">
								Cadastrar
							</TabsTrigger>
						</TabsList>

						<TabsContent value="sign-in">
							<form
								className="flex flex-col gap-3.5 pt-8"
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									signInForm.handleSubmit();
								}}
							>
								<signInForm.Field name="email">
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
												<span
													className="emach-field__error"
													key={error?.message}
												>
													{error?.message}
												</span>
											))}
										</label>
									)}
								</signInForm.Field>

								<signInForm.Field name="password">
									{(field) => (
										<label className="emach-field" htmlFor={field.name}>
											<span className="emach-field__label">Senha</span>
											<input
												className="emach-input"
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="••••••••"
												type="password"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<span
													className="emach-field__error"
													key={error?.message}
												>
													{error?.message}
												</span>
											))}
										</label>
									)}
								</signInForm.Field>

								<div className="flex items-center justify-between">
									<label className="emach-check-label text-[13px]">
										<input className="emach-check" type="checkbox" />
										Lembrar de mim
									</label>
									<button
										className="emach-ghost-btn font-semibold text-[13px] text-emach-red"
										type="button"
									>
										Esqueci a senha
									</button>
								</div>

								<signInForm.Subscribe
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
											{isSubmitting ? "Entrando…" : "Entrar"}
										</button>
									)}
								</signInForm.Subscribe>
							</form>
						</TabsContent>

						<TabsContent value="sign-up">
							<form
								className="flex flex-col gap-3.5 pt-8"
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									signUpForm.handleSubmit();
								}}
							>
								<signUpForm.Field name="name">
									{(field) => (
										<label className="emach-field" htmlFor={field.name}>
											<span className="emach-field__label">Nome completo</span>
											<input
												className="emach-input"
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="João da Silva"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<span
													className="emach-field__error"
													key={error?.message}
												>
													{error?.message}
												</span>
											))}
										</label>
									)}
								</signUpForm.Field>

								<signUpForm.Field name="email">
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
												<span
													className="emach-field__error"
													key={error?.message}
												>
													{error?.message}
												</span>
											))}
										</label>
									)}
								</signUpForm.Field>

								<signUpForm.Field name="password">
									{(field) => (
										<label className="emach-field" htmlFor={field.name}>
											<span className="emach-field__label">Senha</span>
											<input
												className="emach-input"
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="••••••••"
												type="password"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<span
													className="emach-field__error"
													key={error?.message}
												>
													{error?.message}
												</span>
											))}
										</label>
									)}
								</signUpForm.Field>

								<signUpForm.Subscribe
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
											{isSubmitting ? "Criando conta…" : "Criar conta"}
										</button>
									)}
								</signUpForm.Subscribe>
							</form>
						</TabsContent>
					</Tabs>

					{/* Divider */}
					<div className="my-7 flex items-center gap-3 text-[12px] text-gray-50">
						<Separator className="flex-1" />
						ou
						<Separator className="flex-1" />
					</div>

					{/* Social login */}
					<div className="flex flex-col gap-2">
						<button
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-near-black bg-transparent py-2.5 font-medium text-[14px] transition-colors"
							type="button"
						>
							<svg
								height="16"
								viewBox="0 0 18 18"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>Google</title>
								<path
									d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
									fill="#4285F4"
								/>
								<path
									d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
									fill="#34A853"
								/>
								<path
									d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
									fill="#FBBC05"
								/>
								<path
									d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
									fill="#EA4335"
								/>
							</svg>
							Continuar com Google
						</button>
						<button
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-near-black bg-transparent py-2.5 font-medium text-[14px] transition-colors"
							type="button"
						>
							<svg
								fill="currentColor"
								height="16"
								viewBox="0 0 24 24"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>Apple</title>
								<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
							</svg>
							Continuar com Apple
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
