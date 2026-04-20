"use client";

import { CircleCheckBig, Lock, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmachButton } from "@/components/emach-button";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { useCart } from "@/lib/cart-context";
import { fmtBRL } from "@/lib/format";

export function CartContent() {
	const { items, setQty, remove } = useCart();
	const [coupon, setCoupon] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [removing, setRemoving] = useState<string | null>(null);

	function handleRemove(id: string) {
		setRemoving(id);
		window.setTimeout(() => {
			remove(id);
			setRemoving(null);
		}, 220);
	}

	const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
	const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
	const shipping = subtotal >= 29_900 ? 0 : 2490;
	const total = subtotal - discount + shipping;
	const freeShippingProgress = Math.min(100, (subtotal / 29_900) * 100);

	if (items.length === 0) {
		return (
			<main
				className="mx-auto px-10 py-20 text-center"
				style={{ maxWidth: 1440 }}
			>
				<div
					className="mx-auto mb-6 flex items-center justify-center rounded-full"
					style={{
						width: 80,
						height: 80,
						background: "var(--gray-10)",
					}}
				>
					<ShoppingBag size={32} style={{ color: "var(--gray-50)" }} />
				</div>
				<h1
					className="m-0 font-medium"
					style={{ fontFamily: "var(--font-display)", fontSize: 36 }}
				>
					Seu carrinho está vazio
				</h1>
				<p className="mt-2.5 text-[15px]" style={{ color: "var(--gray-60)" }}>
					Explore nosso catálogo e encontre as ferramentas certas para o seu
					trabalho.
				</p>
				<Link className="mt-7 inline-block" href="/catalog">
					<EmachButton size="lg" variant="primary">
						Ver catálogo
					</EmachButton>
				</Link>
			</main>
		);
	}

	return (
		<main
			className="mx-auto px-10 py-10"
			style={{ maxWidth: 1440, paddingBottom: 80 }}
		>
			<h1
				className="m-0 mb-2 font-medium"
				style={{
					fontFamily: "var(--font-display)",
					fontSize: 40,
					letterSpacing: "-0.01em",
				}}
			>
				Carrinho
			</h1>
			<div className="mb-8 text-[14px]" style={{ color: "var(--gray-60)" }}>
				{items.reduce((s, i) => s + i.quantity, 0)} itens
			</div>

			<div className="grid grid-cols-[1fr_400px] gap-12">
				{/* Items */}
				<div>
					{/* Free shipping progress */}
					<div className="mb-5 p-4" style={{ background: "var(--gray-10)" }}>
						{subtotal >= 29_900 ? (
							<div className="flex items-center gap-2.5 font-semibold text-[13px]">
								<CircleCheckBig size={18} style={{ color: "var(--success)" }} />
								Você ganhou frete grátis!
							</div>
						) : (
							<>
								<div className="mb-2 text-[13px]">
									Faltam <strong>{fmtBRL(29_900 - subtotal)}</strong> para frete
									grátis.
								</div>
								<div className="h-1.5 overflow-hidden bg-white">
									<div
										style={{
											height: "100%",
											background: "var(--emach-red)",
											width: `${freeShippingProgress}%`,
											transition: "width 300ms ease",
										}}
									/>
								</div>
							</>
						)}
					</div>

					{/* Item list */}
					{items.map(({ product, quantity }) => (
						<div
							className="emach-cart-item grid grid-cols-[120px_1fr_auto] items-center gap-5 py-5"
							data-leaving={removing === product.id ? "true" : undefined}
							key={product.id}
							style={{
								borderBottom: "1px solid var(--gray-10)",
							}}
						>
							<div
								className="relative overflow-hidden"
								style={{
									width: 120,
									height: 120,
									background: "#ECECEC",
								}}
							>
								<ProductImage
									alt={product.name}
									categorySlug={product.categorySlug}
									sizes="120px"
									src={product.images[0]}
								/>
							</div>

							<div>
								<SectionLabel>{product.category}</SectionLabel>
								<div className="mt-1 font-medium text-[16px]">
									{product.name}
								</div>
								<div
									className="mt-1 text-[12px]"
									style={{ color: "var(--gray-60)" }}
								>
									SKU {product.sku}
								</div>
								<div className="mt-3 flex flex-wrap items-center gap-4">
									<div
										className="emach-qty"
										style={{
											transform: "scale(0.85)",
											transformOrigin: "left",
										}}
									>
										<button
											aria-label="Diminuir"
											className="emach-qty__btn"
											onClick={() => setQty(product.id, quantity - 1)}
											type="button"
										>
											−
										</button>
										<div className="emach-qty__val">{quantity}</div>
										<button
											aria-label="Aumentar"
											className="emach-qty__btn emach-qty__btn--plus"
											onClick={() => setQty(product.id, quantity + 1)}
											type="button"
										>
											+
										</button>
									</div>
									<button
										className="text-[12px] underline"
										onClick={() => handleRemove(product.id)}
										style={{
											background: "none",
											border: "none",
											cursor: "pointer",
											color: "var(--gray-60)",
										}}
										type="button"
									>
										Remover
									</button>
								</div>
							</div>

							<div
								className="font-bold text-[16px]"
								style={{ fontVariantNumeric: "tabular-nums" }}
							>
								{fmtBRL(product.price * quantity)}
							</div>
						</div>
					))}
				</div>

				{/* Summary */}
				<div className="sticky top-24 self-start">
					<div className="p-7" style={{ background: "var(--gray-10)" }}>
						<div className="mb-5 font-bold font-display text-[14px] uppercase tracking-[0.14em]">
							RESUMO DO PEDIDO
						</div>

						{/* Coupon */}
						<div className="mb-5">
							<div className="flex gap-0">
								<input
									className="emach-input flex-1"
									onChange={(e) => setCoupon(e.target.value)}
									placeholder="Cupom de desconto"
									style={{ flex: 1, borderRight: "none", borderRadius: 0 }}
									value={coupon}
								/>
								<EmachButton
									onClick={() => coupon && setCouponApplied(true)}
									variant="dark"
								>
									Aplicar
								</EmachButton>
							</div>
							{couponApplied && (
								<div
									className="mt-2 font-semibold text-[12px]"
									style={{ color: "var(--success)" }}
								>
									✓ Cupom aplicado: 10% off
								</div>
							)}
						</div>

						{/* Totals */}
						<div className="flex flex-col gap-2.5 text-[14px]">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span style={{ fontVariantNumeric: "tabular-nums" }}>
									{fmtBRL(subtotal)}
								</span>
							</div>
							{discount > 0 && (
								<div
									className="flex justify-between"
									style={{ color: "var(--success)" }}
								>
									<span>Desconto</span>
									<span style={{ fontVariantNumeric: "tabular-nums" }}>
										−{fmtBRL(discount)}
									</span>
								</div>
							)}
							<div className="flex justify-between">
								<span>Frete</span>
								<span style={{ fontVariantNumeric: "tabular-nums" }}>
									{shipping === 0 ? "Grátis" : fmtBRL(shipping)}
								</span>
							</div>
						</div>

						<div
							className="mt-4 flex items-baseline justify-between pt-4"
							style={{ borderTop: "1px solid var(--border)" }}
						>
							<span className="font-bold font-display text-[14px] uppercase tracking-[0.1em]">
								TOTAL
							</span>
							<span
								className="font-bold"
								style={{
									fontFamily: "var(--font-display)",
									fontSize: 28,
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{fmtBRL(total)}
							</span>
						</div>
						<div
							className="mt-0.5 text-right text-[12px]"
							style={{ color: "var(--gray-60)" }}
						>
							ou 12× de {fmtBRL(total / 12)} sem juros
						</div>

						<Link className="mt-5 block" href="/checkout">
							<EmachButton full size="lg" variant="primary">
								Finalizar compra
							</EmachButton>
						</Link>
						<Link className="mt-2 block" href="/catalog">
							<EmachButton full size="md" variant="ghost">
								Continuar comprando
							</EmachButton>
						</Link>
					</div>

					<div
						className="mt-5 flex flex-col gap-2.5 text-[12px]"
						style={{ color: "var(--gray-60)" }}
					>
						<div className="flex items-center gap-2">
							<Lock size={14} />
							Pagamento 100% seguro
						</div>
						<div className="flex items-center gap-2">
							<RotateCcw size={14} />
							30 dias para troca ou devolução
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
