"use client";

import { Separator } from "@emach/ui/components/separator";
import { Lock, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CartItemRow } from "@/components/cart-item-row";
import { EmachButton } from "@/components/emach-button";
import { FreeShippingProgress } from "@/components/free-shipping-progress";
import { PageContainer } from "@/components/page-container";
import { useCart } from "@/lib/cart-context";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { fmtBRL, numericToCents } from "@/lib/format";

const STANDARD_SHIPPING = 2490;
const COUPON_DISCOUNT_RATE = 0.1;
const INSTALLMENTS = 12;

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

	const subtotal = items.reduce(
		(s, i) => s + numericToCents(i.priceAmount) * i.quantity,
		0
	);
	const discount = couponApplied
		? Math.round(subtotal * COUPON_DISCOUNT_RATE)
		: 0;
	const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
	const total = subtotal - discount + shipping;

	if (items.length === 0) {
		return (
			<PageContainer as="main" className="py-20 text-center">
				<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gray-10">
					<ShoppingBag className="text-gray-50" size={32} />
				</div>
				<h1 className="font-display font-medium text-[36px]">
					Seu carrinho está vazio
				</h1>
				<p className="mt-2.5 text-[15px] text-gray-60">
					Explore nosso catálogo e encontre as ferramentas certas para o seu
					trabalho.
				</p>
				<Link className="mt-7 inline-block" href="/catalog">
					<EmachButton size="lg" variant="primary">
						Ver catálogo
					</EmachButton>
				</Link>
			</PageContainer>
		);
	}

	return (
		<PageContainer as="main" className="pt-10 pb-20">
			<h1 className="mb-2 font-display font-medium text-[40px] tracking-[-0.01em]">
				Carrinho
			</h1>
			<div className="mb-8 text-[14px] text-gray-60">
				{items.reduce((s, i) => s + i.quantity, 0)} itens
			</div>

			<div className="grid grid-cols-[1fr_400px] gap-12">
				{/* Items */}
				<div>
					<FreeShippingProgress className="mb-5" subtotal={subtotal} />

					{items.map((item) => (
						<CartItemRow
							item={item}
							key={item.variantId}
							leaving={removing === item.variantId}
							onQuantityChange={(next) => setQty(item.variantId, next)}
							onRemove={() => handleRemove(item.variantId)}
						/>
					))}
				</div>

				{/* Summary */}
				<div className="sticky top-24 self-start">
					<div className="bg-gray-10 p-7">
						<div className="mb-5 font-bold font-display text-[14px] uppercase tracking-[0.14em]">
							RESUMO DO PEDIDO
						</div>

						{/* Coupon */}
						<div className="mb-5">
							<div className="flex gap-0">
								<input
									className="emach-input flex-1 rounded-none border-r-0"
									onChange={(e) => setCoupon(e.target.value)}
									placeholder="Cupom de desconto"
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
								<div className="mt-2 font-semibold text-[12px] text-success">
									✓ Cupom aplicado: 10% off
								</div>
							)}
						</div>

						{/* Totals */}
						<div className="flex flex-col gap-2.5 text-[14px]">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span className="tabular-nums">{fmtBRL(subtotal)}</span>
							</div>
							{discount > 0 && (
								<div className="flex justify-between text-success">
									<span>Desconto</span>
									<span className="tabular-nums">−{fmtBRL(discount)}</span>
								</div>
							)}
							<div className="flex justify-between">
								<span>Frete</span>
								<span className="tabular-nums">
									{shipping === 0 ? "Grátis" : fmtBRL(shipping)}
								</span>
							</div>
						</div>

						<Separator className="mt-4" />
						<div className="mt-4 flex items-baseline justify-between">
							<span className="font-bold font-display text-[14px] uppercase tracking-[0.1em]">
								TOTAL
							</span>
							<span className="font-bold font-display text-[28px] tabular-nums">
								{fmtBRL(total)}
							</span>
						</div>
						<div className="mt-0.5 text-right text-[12px] text-gray-60">
							ou {INSTALLMENTS}× de {fmtBRL(total / INSTALLMENTS)} sem juros
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

					<div className="mt-5 flex flex-col gap-2.5 text-[12px] text-gray-60">
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
		</PageContainer>
	);
}
