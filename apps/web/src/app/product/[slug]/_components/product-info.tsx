"use client";

import type { ToolDetail } from "@emach/db/queries/catalog";
import { cn } from "@emach/ui/lib/utils";
import {
	Check,
	CheckCircle,
	Share2,
	ShoppingBag,
	Truck,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmachButton } from "@/components/emach-button";
import { FreightCalculator } from "@/components/freight-calculator";
import { ProductRating } from "@/components/product-rating";
import { QuantityPicker } from "@/components/quantity-picker";
import { SectionLabel } from "@/components/section-label";
import { useCart } from "@/lib/cart-context";
import { fmtBRL, fmtNumericBRL, numericToCents } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

interface ProductInfoProps {
	activePromotion: ToolDetail["activePromotion"];
	primaryCategoryName: string | null;
	primaryCategorySlug: string | null;
	primaryImageUrl: string | null;
	reviewStats: ToolDetail["reviewStats"];
	stockByVariant: ToolDetail["stockByVariant"];
	tool: ToolDetail["tool"];
	variants: ToolDetail["variants"];
}

function applyDiscount(
	priceAmount: string,
	promotion: ToolDetail["activePromotion"]
): string | null {
	if (!promotion) {
		return null;
	}
	const pct = Number(promotion.discountPct);
	if (!Number.isFinite(pct) || pct <= 0) {
		return null;
	}
	const final = Number(priceAmount) * (1 - pct / 100);
	return final.toFixed(2);
}

export function ProductInfo({
	tool,
	variants,
	activePromotion,
	stockByVariant,
	reviewStats,
	primaryCategoryName,
	primaryCategorySlug,
	primaryImageUrl,
}: ProductInfoProps) {
	const orderedVariants = useMemo(() => {
		const sorted = [...variants];
		sorted.sort((a, b) => {
			if (a.isDefault !== b.isDefault) {
				return a.isDefault ? -1 : 1;
			}
			return a.sortOrder - b.sortOrder;
		});
		return sorted;
	}, [variants]);

	const initialVariant = orderedVariants[0];
	const [selectedVariantId, setSelectedVariantId] = useState<string>(
		initialVariant?.id ?? ""
	);
	const [qty, setQty] = useState(1);
	const [shared, setShared] = useState(false);
	const { add, clear } = useCart();
	const router = useRouter();

	const selected =
		orderedVariants.find((v) => v.id === selectedVariantId) ?? initialVariant;

	if (!selected) {
		return (
			<div className="w-[480px] space-y-6">
				<h1 className="font-display font-medium text-[36px] leading-[1.1] tracking-[-0.01em]">
					{tool.name}
				</h1>
				<p className="text-[14px] text-gray-60">
					Variante indisponível no momento.
				</p>
			</div>
		);
	}

	const discounted = applyDiscount(selected.priceAmount, activePromotion);
	const finalAmount = discounted ?? selected.priceAmount;
	const inStock = stockByVariant[selected.id] ?? false;
	const installmentCents = Math.round(numericToCents(finalAmount) / 12);

	function buildLegacyProduct(): Product {
		return {
			id: `${tool.id}:${selected.id}`,
			slug: tool.slug ?? tool.id,
			name: tool.name,
			category: primaryCategoryName ?? "",
			categorySlug: primaryCategorySlug ?? "",
			price: numericToCents(finalAmount),
			originalPrice:
				discounted == null ? undefined : numericToCents(selected.priceAmount),
			description: tool.description ?? "",
			shortDescription: [],
			specs: {},
			images: primaryImageUrl ? [primaryImageUrl] : [],
			inStock,
			voltage: selected.voltage ? [selected.voltage] : undefined,
			sku: selected.sku,
		};
	}

	function handleAddToCart() {
		if (!inStock) {
			toast.error("Variante esgotada");
			return;
		}
		add(buildLegacyProduct(), qty);
		toast.success(`${tool.name} adicionado ao carrinho`);
	}

	function handleBuyNow() {
		if (!inStock) {
			toast.error("Variante esgotada");
			return;
		}
		clear();
		add(buildLegacyProduct(), qty);
		router.push("/checkout");
	}

	async function handleShare() {
		const url =
			typeof window === "undefined"
				? `/product/${tool.slug ?? tool.id}`
				: window.location.href;
		const data = {
			title: `${tool.name} — EMACH`,
			text: tool.description ?? tool.name,
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
			{primaryCategoryName && (
				<SectionLabel tone="accent">{primaryCategoryName}</SectionLabel>
			)}

			<div>
				<h1 className="mt-3 font-display font-medium text-[36px] leading-[1.1] tracking-[-0.01em]">
					{tool.name}
				</h1>
				<div className="mt-2 text-[13px] text-gray-60">SKU {selected.sku}</div>
				{reviewStats.count > 0 && reviewStats.avg != null && (
					<ProductRating average={reviewStats.avg} className="mt-3" />
				)}
			</div>

			<div className="border-border border-y py-5">
				<div className="flex items-baseline gap-3">
					<span className="font-bold font-display text-[40px] tabular-nums">
						{fmtNumericBRL(finalAmount)}
					</span>
					{discounted != null && (
						<span className="text-[16px] text-gray-50 tabular-nums line-through">
							{fmtNumericBRL(selected.priceAmount)}
						</span>
					)}
				</div>
				<div className="mt-1.5 text-[13px] text-gray-60">
					Em até <strong>12× de {fmtBRL(installmentCents)}</strong> sem juros
				</div>
			</div>

			{orderedVariants.length > 1 && (
				<div>
					<div className="mb-2.5 font-semibold text-md">Opções disponíveis</div>
					<div className="flex flex-wrap gap-2">
						{orderedVariants.map((v) => {
							const variantStock = stockByVariant[v.id] ?? false;
							const isActive = v.id === selectedVariantId;
							return (
								<button
									className={cn(
										"flex min-w-[140px] flex-col gap-1 border-2 px-4 py-3 text-left transition-colors",
										isActive
											? "border-emach-red bg-near-black text-white"
											: "border-gray-20 bg-background text-foreground hover:border-foreground"
									)}
									key={v.id}
									onClick={() => setSelectedVariantId(v.id)}
									type="button"
								>
									<span className="font-display font-semibold text-[11px] uppercase tracking-[0.14em] opacity-70">
										{v.voltage ?? "Padrão"}
									</span>
									<span className="font-bold text-[16px] tabular-nums">
										{fmtNumericBRL(
											applyDiscount(v.priceAmount, activePromotion) ??
												v.priceAmount
										)}
									</span>
									<span className="text-[11px] opacity-70">
										SKU {v.sku}
										{!variantStock && " · Esgotado"}
										{v.isDefault && " · Padrão"}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<div className="flex items-stretch gap-3">
					<QuantityPicker onChange={setQty} value={qty} />
					<EmachButton
						disabled={!inStock}
						full
						icon={<ShoppingBag size={16} />}
						onClick={handleAddToCart}
						size="md"
						variant="dark"
					>
						{inStock ? "Adicionar ao carrinho" : "Esgotado"}
					</EmachButton>
				</div>
				<EmachButton
					disabled={!inStock}
					full
					icon={<Zap size={16} />}
					onClick={handleBuyNow}
					size="md"
					variant="primary"
				>
					Comprar agora
				</EmachButton>
			</div>

			<button
				aria-label="Compartilhar produto"
				className="emach-ghost-btn inline-flex items-center gap-2 font-semibold text-[13px] text-gray-60"
				onClick={handleShare}
				type="button"
			>
				{shared ? (
					<>
						<Check className="text-success" size={14} />
						Link copiado
					</>
				) : (
					<>
						<Share2 size={14} />
						Compartilhar
					</>
				)}
			</button>

			<FreightCalculator subtotal={numericToCents(finalAmount) * qty} />

			<div className="flex h-16 justify-between rounded-sm bg-gray-10 px-5">
				<div className="flex items-center gap-2">
					<Truck size={16} />
					<div>
						<div className="font-semibold text-sm">Frete grátis</div>
						<div className="text-gray-60 text-xs">acima de R$ 299</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<CheckCircle size={16} />
					<div>
						<div className="font-semibold text-sm">Garantia 2 anos</div>
						<div className="text-gray-60 text-xs">direto com a marca</div>
					</div>
				</div>
			</div>
		</div>
	);
}
