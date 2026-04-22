"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { EmachBadge } from "@/components/emach-badge";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { useCart } from "@/lib/cart-context";
import { fmtBRL } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

interface ProductCardProps {
	product: Product;
}

function getBadgeVariant(badge: string) {
	if (badge === "Novo") {
		return "dark" as const;
	}
	if (badge === "Promoção") {
		return "promo" as const;
	}
	return "primary" as const;
}

export function ProductCard({ product }: ProductCardProps) {
	const { add } = useCart();

	function handleQuickAdd(e: React.MouseEvent) {
		e.preventDefault();
		add(product, 1);
		toast.success(`${product.name} adicionado ao carrinho`);
	}

	return (
		<Link
			className="group block cursor-pointer"
			href={`/product/${product.slug}`}
		>
			<div className="overflow-hidden rounded-[2px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-240 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:-translate-y-1 group-hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)]">
				{/* Image area */}
				<div className="relative aspect-square overflow-hidden rounded-[2px] bg-image-bg">
					<ProductImage
						alt={product.name}
						categorySlug={product.categorySlug}
						src={product.images[0]}
						zoom
					/>

					{product.badge && (
						<div className="absolute top-3 left-3 z-10">
							<EmachBadge variant={getBadgeVariant(product.badge)}>
								{product.badge}
							</EmachBadge>
						</div>
					)}

					{/* Hover gradient overlay */}
					<div
						aria-hidden="true"
						className="emach-bg-card-hover pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-240 group-hover:opacity-100"
					/>

					{/* SKU reveal on hover */}
					<div
						aria-hidden="true"
						className="absolute right-[14px] bottom-[14px] left-[14px] translate-y-2 font-display font-semibold text-[11px] text-white uppercase tracking-wide opacity-0 transition-all duration-240 group-hover:translate-y-0 group-hover:opacity-100"
					>
						SKU {product.sku}
					</div>

					{/* Quick-add button */}
					<button
						aria-label={`Adicionar ${product.name} ao carrinho`}
						className="absolute top-3 right-3 z-10 flex size-9 -translate-y-2 items-center justify-center rounded-[2px] bg-emach-red text-white opacity-0 transition-all duration-240 group-hover:translate-y-0 group-hover:opacity-100"
						onClick={handleQuickAdd}
						type="button"
					>
						<Plus size={16} strokeWidth={2.5} />
					</button>
				</div>

				{/* Card body */}
				<div className="flex flex-col gap-1 bg-gray-10 px-2 py-3">
					<SectionLabel>{product.category}</SectionLabel>
					<p className="mt-1 font-medium text-[14px] text-near-black leading-tight">
						{product.name}
					</p>
					<div className="mt-1 flex items-baseline gap-2">
						<span className="font-bold text-[15px] text-near-black tabular-nums">
							{fmtBRL(product.price)}
						</span>
						{product.originalPrice && (
							<span className="text-[11px] text-gray-50 tabular-nums line-through">
								{fmtBRL(product.originalPrice)}
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
