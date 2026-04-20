"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

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
			<main
				className="flex h-svh items-center justify-center"
				style={{ background: "var(--near-black)" }}
			>
				<Loader />
			</main>
		);
	}

	const isSignIn = mode === "sign-in";

	return (
		<main
			className="grid"
			style={{
				gridTemplateColumns: "1fr 1fr",
				minHeight: "100svh",
			}}
		>
			{/* Left — dark panel */}
			<div
				className="relative flex flex-col justify-between overflow-hidden px-[60px] py-20"
				style={{ background: "#000", color: "#fff" }}
			>
				<div
					aria-hidden="true"
					className="absolute inset-0"
					style={{
						background:
							"repeating-linear-gradient(35deg, transparent 0 40px, rgba(255,255,255,0.02) 40px 80px)",
					}}
				/>
				<span
					className="relative font-display font-semibold text-[12px] uppercase tracking-[0.14em]"
					style={{ color: "rgba(255,255,255,0.72)" }}
				>
					EMACH Profissional
				</span>
				<div className="relative">
					<h2
						className="m-0 font-medium leading-[1.05]"
						style={{
							fontFamily: "var(--font-display)",
							fontSize: 44,
							letterSpacing: "-0.01em",
						}}
					>
						Bem-vindo de
						<br />
						volta à <span style={{ color: "var(--emach-red)" }}>bancada</span>.
					</h2>
					<p
						className="mt-5 max-w-[380px] text-[15px] leading-relaxed"
						style={{ color: "rgba(255,255,255,0.7)" }}
					>
						Acesse sua conta para acompanhar pedidos, gerenciar endereços e
						aproveitar descontos exclusivos para profissionais.
					</p>
				</div>
				<div
					className="relative text-[12px] uppercase tracking-[0.12em]"
					style={{ color: "rgba(255,255,255,0.45)" }}
				>
					© 2026 EMACH FERRAMENTAS
				</div>
			</div>

			{/* Right — white form panel */}
			<div className="flex items-center justify-center bg-white px-[60px] py-20">
				<div style={{ width: "100%", maxWidth: 400 }}>
					{/* Tabs */}
					<div
						className="mb-8 flex"
						style={{ borderBottom: "1px solid var(--border)" }}
					>
						{(["sign-in", "sign-up"] as const).map((m) => (
							<button
								className="flex-1 cursor-pointer border-0 bg-transparent py-3.5 font-semibold text-[14px]"
								key={m}
								onClick={() => setMode(m)}
								style={{
									color: mode === m ? "var(--near-black)" : "var(--gray-50)",
									borderBottom:
										mode === m
											? "2px solid var(--emach-red)"
											: "2px solid transparent",
									marginBottom: -1,
								}}
								type="button"
							>
								{m === "sign-in" ? "Entrar" : "Cadastrar"}
							</button>
						))}
					</div>

					{isSignIn ? (
						<form
							className="flex flex-col gap-3.5"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								signInForm.handleSubmit();
							}}
						>
							<signInForm.Field name="email">
								{(field) => (
									<label className="emach-field">
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
							</signInForm.Field>

							<signInForm.Field name="password">
								{(field) => (
									<label className="emach-field">
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
											<span className="emach-field__error" key={error?.message}>
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
									className="emach-ghost-btn font-semibold text-[13px]"
									style={{ color: "var(--emach-red)" }}
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
										className="mt-2 w-full cursor-pointer border-0 py-3 font-semibold text-[14px] text-white transition-all duration-180"
										disabled={!canSubmit || isSubmitting}
										style={{
											background: "var(--emach-red)",
											borderRadius: 2,
											opacity: canSubmit ? 1 : 0.65,
										}}
										type="submit"
									>
										{isSubmitting ? "Entrando…" : "Entrar"}
									</button>
								)}
							</signInForm.Subscribe>
						</form>
					) : (
						<form
							className="flex flex-col gap-3.5"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								signUpForm.handleSubmit();
							}}
						>
							<signUpForm.Field name="name">
								{(field) => (
									<label className="emach-field">
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
											<span className="emach-field__error" key={error?.message}>
												{error?.message}
											</span>
										))}
									</label>
								)}
							</signUpForm.Field>

							<signUpForm.Field name="email">
								{(field) => (
									<label className="emach-field">
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
							</signUpForm.Field>

							<signUpForm.Field name="password">
								{(field) => (
									<label className="emach-field">
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
											<span className="emach-field__error" key={error?.message}>
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
										className="mt-2 w-full cursor-pointer border-0 py-3 font-semibold text-[14px] text-white transition-all duration-180"
										disabled={!canSubmit || isSubmitting}
										style={{
											background: "var(--emach-red)",
											borderRadius: 2,
											opacity: canSubmit ? 1 : 0.65,
										}}
										type="submit"
									>
										{isSubmitting ? "Criando conta…" : "Criar conta"}
									</button>
								)}
							</signUpForm.Subscribe>
						</form>
					)}

					{/* Divider */}
					<div
						className="my-7 flex items-center gap-3"
						style={{ color: "var(--gray-50)", fontSize: 12 }}
					>
						<div
							className="flex-1"
							style={{ height: 1, background: "var(--border)" }}
						/>
						ou
						<div
							className="flex-1"
							style={{ height: 1, background: "var(--border)" }}
						/>
					</div>

					{/* Social login */}
					<div className="flex flex-col gap-2">
						<button
							className="flex w-full cursor-pointer items-center justify-center gap-2 border py-2.5 font-medium text-[14px] transition-colors"
							style={{
								borderColor: "var(--near-black)",
								background: "transparent",
								borderRadius: 2,
							}}
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
							className="flex w-full cursor-pointer items-center justify-center gap-2 border py-2.5 font-medium text-[14px] transition-colors"
							style={{
								borderColor: "var(--near-black)",
								background: "transparent",
								borderRadius: 2,
							}}
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
