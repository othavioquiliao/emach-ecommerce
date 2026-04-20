"use client";

import { Button } from "@emach/ui/components/button";
import { Input } from "@emach/ui/components/input";
import { Label } from "@emach/ui/components/label";
import { Separator } from "@emach/ui/components/separator";
import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import z from "zod";

import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/mock-data";

const checkoutSchema = z.object({
	firstName: z.string().min(2, "Nome é obrigatório"),
	lastName: z.string().min(2, "Sobrenome é obrigatório"),
	email: z.email("E-mail inválido"),
	phone: z.string().min(10, "Telefone inválido"),
	address: z.string().min(5, "Endereço é obrigatório"),
	city: z.string().min(2, "Cidade é obrigatória"),
	zipCode: z.string().min(8, "CEP inválido"),
	state: z.string().min(2, "Estado é obrigatório"),
});

export function CheckoutContent() {
	const router = useRouter();
	const { items, clear } = useCart();
	const submittedRef = useRef(false);

	useEffect(() => {
		if (items.length === 0 && !submittedRef.current) {
			router.replace("/cart");
		}
	}, [items.length, router]);

	const { orderItems, subtotal, shipping, total } = useMemo(() => {
		const sub = items.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0
		);
		const ship = sub >= 29_900 || sub === 0 ? 0 : 2990;
		return {
			orderItems: items,
			subtotal: sub,
			shipping: ship,
			total: sub + ship,
		};
	}, [items]);

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			zipCode: "",
			state: "",
		},
		validators: {
			onSubmit: checkoutSchema,
		},
		onSubmit: () => {
			const orderId = `EMC-${Date.now().toString(36).toUpperCase()}`;
			submittedRef.current = true;
			clear();
			toast.success("Pedido confirmado!");
			router.push(`/checkout/success?order=${orderId}` as Route);
		},
	});

	return (
		<div className="mx-auto max-w-6xl px-20 py-10">
			<div className="flex flex-row gap-15">
				{/* Form */}
				<div className="flex-1">
					<h1 className="font-medium text-2xl">Dados Pessoais</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Preencha seus dados para continuar
					</p>

					<form
						className="mt-8 space-y-6"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						{/* Nome + Sobrenome */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label
									className="font-display text-xs uppercase tracking-wider"
									htmlFor="firstName"
								>
									Nome
								</Label>
								<form.Field name="firstName">
									{(field) => (
										<>
											<Input
												className="mt-2 h-11 rounded-none"
												id="firstName"
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Seu nome"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<p
													className="mt-1 text-destructive text-xs"
													key={error?.message}
												>
													{error?.message}
												</p>
											))}
										</>
									)}
								</form.Field>
							</div>

							<div>
								<Label
									className="font-display text-xs uppercase tracking-wider"
									htmlFor="lastName"
								>
									Sobrenome
								</Label>
								<form.Field name="lastName">
									{(field) => (
										<>
											<Input
												className="mt-2 h-11 rounded-none"
												id="lastName"
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Seu sobrenome"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<p
													className="mt-1 text-destructive text-xs"
													key={error?.message}
												>
													{error?.message}
												</p>
											))}
										</>
									)}
								</form.Field>
							</div>
						</div>

						{/* E-mail */}
						<div>
							<Label
								className="font-display text-xs uppercase tracking-wider"
								htmlFor="email"
							>
								E-mail
							</Label>
							<form.Field name="email">
								{(field) => (
									<>
										<Input
											className="mt-2 h-11 rounded-none"
											id="email"
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="seu@email.com"
											type="email"
											value={field.state.value}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												className="mt-1 text-destructive text-xs"
												key={error?.message}
											>
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						{/* Telefone */}
						<div>
							<Label
								className="font-display text-xs uppercase tracking-wider"
								htmlFor="phone"
							>
								Telefone
							</Label>
							<form.Field name="phone">
								{(field) => (
									<>
										<Input
											className="mt-2 h-11 rounded-none"
											id="phone"
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="(11) 99999-9999"
											type="tel"
											value={field.state.value}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												className="mt-1 text-destructive text-xs"
												key={error?.message}
											>
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						<Separator />

						<h2 className="font-medium text-lg">Endereço de Entrega</h2>

						{/* Endereço */}
						<div>
							<Label
								className="font-display text-xs uppercase tracking-wider"
								htmlFor="address"
							>
								Endereço
							</Label>
							<form.Field name="address">
								{(field) => (
									<>
										<Input
											className="mt-2 h-11 rounded-none"
											id="address"
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Rua, número, complemento"
											value={field.state.value}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												className="mt-1 text-destructive text-xs"
												key={error?.message}
											>
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						{/* Cidade + Estado */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label
									className="font-display text-xs uppercase tracking-wider"
									htmlFor="city"
								>
									Cidade
								</Label>
								<form.Field name="city">
									{(field) => (
										<>
											<Input
												className="mt-2 h-11 rounded-none"
												id="city"
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="São Paulo"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<p
													className="mt-1 text-destructive text-xs"
													key={error?.message}
												>
													{error?.message}
												</p>
											))}
										</>
									)}
								</form.Field>
							</div>

							<div>
								<Label
									className="font-display text-xs uppercase tracking-wider"
									htmlFor="state"
								>
									Estado
								</Label>
								<form.Field name="state">
									{(field) => (
										<>
											<Input
												className="mt-2 h-11 rounded-none"
												id="state"
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="SP"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<p
													className="mt-1 text-destructive text-xs"
													key={error?.message}
												>
													{error?.message}
												</p>
											))}
										</>
									)}
								</form.Field>
							</div>
						</div>

						{/* CEP */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label
									className="font-display text-xs uppercase tracking-wider"
									htmlFor="zipCode"
								>
									CEP
								</Label>
								<form.Field name="zipCode">
									{(field) => (
										<>
											<Input
												className="mt-2 h-11 rounded-none"
												id="zipCode"
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="00000-000"
												value={field.state.value}
											/>
											{field.state.meta.errors.map((error) => (
												<p
													className="mt-1 text-destructive text-xs"
													key={error?.message}
												>
													{error?.message}
												</p>
											))}
										</>
									)}
								</form.Field>
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex items-center justify-between pt-4">
							<Button
								className="h-12 rounded-none"
								nativeButton={false}
								render={<Link href="/cart" />}
								variant="outline"
							>
								Voltar ao Carrinho
							</Button>
							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
								})}
							>
								{({ canSubmit, isSubmitting }) => (
									<Button
										className="h-12 rounded-none"
										disabled={!canSubmit || isSubmitting}
										type="submit"
									>
										{isSubmitting ? "Salvando..." : "Continuar para Entrega →"}
									</Button>
								)}
							</form.Subscribe>
						</div>
					</form>
				</div>

				{/* Order Summary */}
				<div className="w-[380px]">
					<div className="sticky top-10 space-y-4 border border-border p-6">
						<h2 className="font-display font-semibold text-xs uppercase tracking-wider">
							Resumo do Pedido
						</h2>
						<Separator />

						{orderItems.map((item) => (
							<div className="flex gap-4" key={item.product.id}>
								<div className="relative size-16 shrink-0 overflow-hidden bg-muted">
									{item.product.images[0] ? (
										<NextImage
											alt={item.product.name}
											className="object-cover"
											fill
											sizes="64px"
											src={item.product.images[0]}
										/>
									) : (
										<div className="absolute inset-0 bg-[color:var(--gray-10)]" />
									)}
								</div>
								<div className="flex-1 text-sm">
									<p className="font-medium">{item.product.name}</p>
									<p className="text-muted-foreground">Qtd: {item.quantity}</p>
								</div>
								<span className="font-medium text-sm">
									{formatPrice(item.product.price * item.quantity)}
								</span>
							</div>
						))}

						<Separator />

						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Frete</span>
								<span>{shipping === 0 ? "Grátis" : formatPrice(shipping)}</span>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between font-bold text-base">
							<span>Total</span>
							<span>{formatPrice(total)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
