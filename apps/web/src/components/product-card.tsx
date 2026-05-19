import type { ToolListItem } from "@emach/db/queries/catalog";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { fmtNumericBRL } from "@/lib/format";

interface ProductCardProps {
	tool: ToolListItem;
}

export function ProductCard({ tool }: ProductCardProps) {
	const categorySlug = tool.primaryCategory?.slug ?? "";
	const categoryName = tool.primaryCategory?.name ?? "";
	const hasDiscount = tool.defaultVariant.discountedAmount != null;

	return (
		<Link
			className="group block h-full cursor-pointer"
			href={`/product/${tool.slug}`}
		>
			<div className="flex h-full flex-col overflow-hidden rounded-[2px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-240 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:-translate-y-1 group-hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)]">
				<div className="relative aspect-square shrink-0 overflow-hidden rounded-[2px] bg-image-bg">
					<ProductImage
						alt={tool.name}
						categorySlug={categorySlug}
						src={tool.primaryImage?.url}
						zoom
					/>

					{!tool.inStock && (
						<div className="absolute inset-0 z-10 flex items-center justify-center bg-near-black/60">
							<span className="font-display font-semibold text-[12px] text-white uppercase tracking-[0.14em]">
								Esgotado
							</span>
						</div>
					)}

					<div
						aria-hidden="true"
						className="emach-bg-card-hover pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-240 group-hover:opacity-100"
					/>

					<div
						aria-hidden="true"
						className="absolute right-[14px] bottom-[14px] left-[14px] translate-y-2 font-display font-semibold text-[11px] text-white uppercase tracking-wide opacity-0 transition-all duration-240 group-hover:translate-y-0 group-hover:opacity-100"
					>
						SKU {tool.defaultVariant.sku}
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-1 bg-gray-10 px-2 py-3">
					<SectionLabel>{categoryName}</SectionLabel>
					<p className="mt-1 font-medium text-[14px] text-near-black leading-tight">
						{tool.name}
					</p>
					<div className="mt-auto pt-2">
						<div className="flex items-baseline gap-2">
							<span className="font-bold text-[15px] text-near-black tabular-nums">
								{fmtNumericBRL(
									hasDiscount
										? tool.defaultVariant.discountedAmount
										: tool.defaultVariant.priceAmount
								)}
							</span>
							{hasDiscount && (
								<span className="text-[11px] text-gray-50 tabular-nums line-through">
									{fmtNumericBRL(tool.defaultVariant.priceAmount)}
								</span>
							)}
						</div>
						{tool.hasOtherVariants && (
							<div className="mt-1 font-display text-[10px] text-gray-60 uppercase tracking-[0.14em]">
								Mais opções de voltagem
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
