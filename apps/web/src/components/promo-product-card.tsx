"use client";

import type { ToolListItem } from "@emach/db/queries/tools";
import type { Voltage } from "@emach/db/schema/tools";
import { cn } from "@emach/ui/lib/utils";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { ProductRating } from "@/components/product-rating";
import { QuickAddButton } from "@/components/quick-add-button";
import { SectionLabel } from "@/components/section-label";
import type { CartItemSnapshot } from "@/lib/cart-store";
import { fmtNumericBRL } from "@/lib/format";
import {
	computeDiscountPercent,
	computeSavings,
} from "@/lib/promo-card-helpers";

interface PromoProductCardProps {
	/** Espelha o card no desktop (imagem à direita). Usado no 2º card do caso de 2. */
	mirrored?: boolean;
	tool: ToolListItem;
	voltages?: Voltage[];
}

export function PromoProductCard({
	tool,
	voltages,
	mirrored = false,
}: PromoProductCardProps) {
	const categorySlug = tool.primaryCategory?.slug ?? "";
	const categoryName = tool.primaryCategory?.name ?? "";
	const hasDiscount = tool.defaultVariant.discountedAmount != null;
	const discount = computeDiscountPercent(
		tool.defaultVariant.priceAmount,
		tool.defaultVariant.discountedAmount
	);
	const savings = computeSavings(
		tool.defaultVariant.priceAmount,
		tool.defaultVariant.discountedAmount
	);

	const snapshot: CartItemSnapshot = {
		categoryName: tool.primaryCategory?.name ?? null,
		categorySlug: tool.primaryCategory?.slug ?? null,
		imageUrl: tool.primaryImage?.url ?? null,
		name: tool.name,
		priceAmount:
			tool.defaultVariant.discountedAmount ?? tool.defaultVariant.priceAmount,
		sku: tool.defaultVariant.sku,
		slug: tool.slug,
		toolId: tool.id,
		variantId: tool.defaultVariant.id,
		voltage: tool.defaultVariant.voltage,
	};

	return (
		<div
			className={cn(
				"group relative grid h-full overflow-hidden rounded-[2px] border border-white/14 bg-surface-elevated transition-[transform,border-color] duration-[var(--card-dur)] ease-[var(--card-ease)] hover:-translate-y-1 hover:border-white/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
				mirrored ? "md:grid-cols-[1fr_40%]" : "md:grid-cols-[40%_1fr]"
			)}
		>
			{/* Imagem — mobile aspect-square no topo; desktop preenche a altura (elástica). */}
			<div
				className={cn(
					"relative aspect-square overflow-hidden bg-image-bg md:aspect-auto md:h-full",
					mirrored && "md:order-2"
				)}
			>
				<ProductImage
					alt={tool.name}
					categorySlug={categorySlug}
					sizes="(max-width: 768px) 100vw, 40vw"
					src={tool.primaryImage?.url}
					zoom
				/>

				{discount != null && (
					<span className="absolute top-0 right-0 z-10 inline-flex items-center bg-emach-red px-2.5 py-1 font-bold font-display text-lg text-white uppercase tracking-[0.06em]">
						-{discount}%
					</span>
				)}

				{voltages && voltages.length > 0 && (
					<div className="absolute bottom-2 left-2 z-[2] flex flex-wrap gap-1.5">
						{voltages.map((v) => (
							<span
								className="rounded-[2px] bg-near-black/85 px-2 py-0.5 font-bold font-display text-[11px] text-white uppercase tracking-[0.06em]"
								key={v}
							>
								{v}
							</span>
						))}
					</div>
				)}

				{tool.inStock ? (
					<QuickAddButton
						className="absolute inset-x-0 bottom-0 z-[3] flex translate-y-full items-center justify-center gap-2 bg-emach-red py-2.5 font-bold font-display text-[13px] text-white uppercase tracking-[0.1em] transition-transform duration-[var(--card-dur)] ease-[var(--card-ease)] hover:bg-emach-red-hover group-hover:translate-y-0 motion-reduce:transition-none"
						item={snapshot}
					/>
				) : (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-near-black/60">
						<span className="font-display font-semibold text-[12px] text-white uppercase tracking-[0.14em]">
							Esgotado
						</span>
					</div>
				)}
			</div>

			{/* Texto — distribuído com justify-between pra não deixar vazio. */}
			<div
				className={cn(
					"flex flex-col justify-between gap-3 p-5",
					mirrored && "md:order-1 md:items-end md:text-right"
				)}
			>
				<div className="flex flex-col gap-1.5">
					<SectionLabel tone="light">{categoryName}</SectionLabel>
					<p className="font-medium text-[16px] text-white leading-tight">
						{tool.name}
					</p>
					{tool.reviewCount > 0 && tool.avgRating != null && (
						<ProductRating
							average={tool.avgRating}
							className="mt-1"
							tone="light"
						/>
					)}
				</div>

				<div className={cn("flex flex-col gap-2", mirrored && "md:items-end")}>
					<div className="flex items-baseline gap-2">
						<span className="font-bold text-[18px] text-white tabular-nums">
							{fmtNumericBRL(
								hasDiscount
									? tool.defaultVariant.discountedAmount
									: tool.defaultVariant.priceAmount
							)}
						</span>
						{hasDiscount && (
							<span className="text-[12px] text-white/60 tabular-nums line-through">
								{fmtNumericBRL(tool.defaultVariant.priceAmount)}
							</span>
						)}
					</div>
					{savings != null && savings > 0 && (
						<span className="inline-flex w-fit items-center rounded-[2px] bg-white/10 px-2 py-1 font-bold font-display text-[11px] text-white uppercase tracking-[0.06em]">
							Economize {fmtNumericBRL(savings.toFixed(2))}
						</span>
					)}
				</div>
			</div>

			{/* Stretched link: cobre o card pra navegação, abaixo do quick-add (z-[3]). */}
			<Link className="absolute inset-0 z-[1]" href={`/product/${tool.slug}`}>
				<span className="sr-only">{tool.name}</span>
			</Link>
		</div>
	);
}
