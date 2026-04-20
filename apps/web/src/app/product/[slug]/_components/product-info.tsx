"use client";

import { Check, Share2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmachBadge } from "@/components/emach-badge";
import { EmachButton } from "@/components/emach-button";
import { SectionLabel } from "@/components/section-label";
import { useCart } from "@/lib/cart-context";
import { fmtBRL } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

interface ProductInfoProps {
	product: Product;
}

function getBadgeVariant(badge: string) {
	if (badge === "Promoção") {
		return "promo" as const;
	}
	return "dark" as const;
}

export function ProductInfo({ product }: ProductInfoProps) {
	const [selectedVoltage, setSelectedVoltage] = useState<string | null>(
		product.voltage?.[0] ?? null
	);
	const [qty, setQty] = useState(1);
	const [shared, setShared] = useState(false);
	const { add } = useCart();

	function handleAddToCart() {
		add(product, qty);
		toast.success(`${product.name} adicionado ao carrinho`);
	}

	async function handleShare() {
		const url =
			typeof window === "undefined"
				? `/product/${product.slug}`
				: window.location.href;
		const data = {
			title: `${product.name} — EMACH`,
			text: product.shortDescription,
			url,
		};
		try {
			if (navigator.share) {
				await navigator.share(data);
				return;
			}
			await navigator.clipboard.writeText(url);
			setShared(true);
			toast.success("Link copiado");
			window.setTimeout(() => setShared(false), 1600);
		} catch {
			// user cancelled or unsupported — noop
		}
	}

	return (
		<div className="w-[480px] space-y-6">
			<SectionLabel tone="accent">{product.category}</SectionLabel>

			<div>
				<h1
					className="m-0 mt-3 font-medium leading-[1.1]"
					style={{
						fontFamily: "var(--font-display)",
						fontSize: 36,
						letterSpacing: "-0.01em",
					}}
				>
					{product.name}
				</h1>
				{product.badge && (
					<EmachBadge className="mt-2" variant={getBadgeVariant(product.badge)}>
						{product.badge}
					</EmachBadge>
				)}
				<div className="mt-2 text-[13px]" style={{ color: "var(--gray-60)" }}>
					SKU {product.sku}
				</div>
			</div>

			<div
				className="py-5"
				style={{
					borderTop: "1px solid var(--border)",
					borderBottom: "1px solid var(--border)",
				}}
			>
				<div className="flex items-baseline gap-3">
					<span
						className="font-bold"
						style={{
							fontFamily: "var(--font-display)",
							fontSize: 40,
							fontVariantNumeric: "tabular-nums",
						}}
					>
						{fmtBRL(product.price)}
					</span>
					{product.originalPrice && (
						<span
							className="text-[16px] line-through"
							style={{
								color: "var(--gray-50)",
								fontVariantNumeric: "tabular-nums",
							}}
						>
							{fmtBRL(product.originalPrice)}
						</span>
					)}
				</div>
				<div className="mt-1.5 text-[13px]" style={{ color: "var(--gray-60)" }}>
					Em até{" "}
					<strong>12× de {fmtBRL(Math.round(product.price / 12))}</strong> sem
					juros
				</div>
			</div>

			<p
				className="text-[15px] leading-relaxed"
				style={{ color: "var(--gray-60)" }}
			>
				{product.shortDescription}
			</p>

			{product.voltage && product.voltage.length > 1 && (
				<div>
					<div className="mb-2.5 font-semibold text-[13px]">Voltagem</div>
					<div className="flex gap-2">
						{product.voltage.map((v) => (
							<button
								className={`emach-chip ${selectedVoltage === v ? "emach-chip--active" : ""}`}
								key={v}
								onClick={() => setSelectedVoltage(v)}
								style={{ minWidth: 64 }}
								type="button"
							>
								{v}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="flex items-stretch gap-3">
				<div className="emach-qty">
					<button
						aria-label="Diminuir"
						className="emach-qty__btn"
						onClick={() => setQty(Math.max(1, qty - 1))}
						type="button"
					>
						−
					</button>
					<div className="emach-qty__val">{qty}</div>
					<button
						aria-label="Aumentar"
						className="emach-qty__btn emach-qty__btn--plus"
						onClick={() => setQty(qty + 1)}
						type="button"
					>
						+
					</button>
				</div>
				<EmachButton
					full
					icon={<ShoppingBag size={16} />}
					onClick={handleAddToCart}
					size="lg"
					variant="primary"
				>
					Adicionar ao carrinho
				</EmachButton>
			</div>

			<button
				aria-label="Compartilhar produto"
				className="emach-ghost-btn inline-flex items-center gap-2 font-semibold text-[13px]"
				onClick={handleShare}
				style={{ color: "var(--gray-60)" }}
				type="button"
			>
				{shared ? (
					<>
						<Check size={14} style={{ color: "var(--success)" }} />
						Link copiado
					</>
				) : (
					<>
						<Share2 size={14} />
						Compartilhar
					</>
				)}
			</button>

			<div
				className="grid gap-3 p-5"
				style={{
					background: "var(--gray-10)",
					gridTemplateColumns: "1fr 1fr",
				}}
			>
				<div>
					<div className="font-semibold text-[13px]">Frete grátis</div>
					<div className="text-[12px]" style={{ color: "var(--gray-60)" }}>
						acima de R$ 299
					</div>
				</div>
				<div>
					<div className="font-semibold text-[13px]">Garantia 2 anos</div>
					<div className="text-[12px]" style={{ color: "var(--gray-60)" }}>
						direto com a marca
					</div>
				</div>
			</div>
		</div>
	);
}
