"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
	const [hovered, setHovered] = useState(false);
	const { add } = useCart();

	function handleQuickAdd(e: React.MouseEvent) {
		e.preventDefault();
		add(product, 1);
		toast.success(`${product.name} adicionado ao carrinho`);
	}

	return (
		<Link
			className="block cursor-pointer"
			href={`/product/${product.slug}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<div
				className="overflow-hidden rounded-[2px] bg-white"
				style={{
					boxShadow: hovered
						? "0 14px 40px rgba(0,0,0,0.1)"
						: "0 1px 2px rgba(0,0,0,0.04)",
					transform: hovered ? "translateY(-4px)" : "translateY(0)",
					transition: "all 240ms cubic-bezier(.2,.6,.2,1)",
				}}
			>
				{/* Image area */}
				<div
					className="relative overflow-hidden rounded-[2px]"
					style={{ aspectRatio: "1 / 1", background: "#ECECEC" }}
				>
					<ProductImage
						alt={product.name}
						categorySlug={product.categorySlug}
						src={product.images[0]}
						zoom={hovered}
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
						className="pointer-events-none absolute inset-0 transition-opacity duration-240"
						style={{
							background:
								"linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)",
							opacity: hovered ? 1 : 0,
						}}
					/>

					{/* SKU reveal on hover */}
					<div
						aria-hidden="true"
						className="absolute right-[14px] bottom-[14px] left-[14px] font-display font-semibold text-[11px] text-white uppercase tracking-[0.1em] transition-all duration-240"
						style={{
							opacity: hovered ? 1 : 0,
							transform: hovered ? "translateY(0)" : "translateY(8px)",
						}}
					>
						SKU {product.sku}
					</div>

					{/* Quick-add button */}
					<button
						aria-label={`Adicionar ${product.name} ao carrinho`}
						className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-[2px] transition-all duration-240"
						onClick={handleQuickAdd}
						style={{
							width: 36,
							height: 36,
							background: "var(--emach-red)",
							color: "#fff",
							opacity: hovered ? 1 : 0,
							transform: hovered ? "translateY(0)" : "translateY(-8px)",
							boxShadow: "0 6px 16px rgba(218,41,28,0.35)",
						}}
						type="button"
					>
						<Plus size={16} strokeWidth={2.5} />
					</button>
				</div>

				{/* Card body */}
				<div className="flex flex-col gap-1 px-0 py-3">
					<SectionLabel>{product.category}</SectionLabel>
					<p
						className="mt-1 font-medium text-[14px] leading-tight"
						style={{ color: "var(--near-black)" }}
					>
						{product.name}
					</p>
					<div className="mt-1 flex items-baseline gap-2">
						<span
							className="font-bold text-[15px]"
							style={{
								color: "var(--near-black)",
								fontVariantNumeric: "tabular-nums",
							}}
						>
							{fmtBRL(product.price)}
						</span>
						{product.originalPrice && (
							<span
								className="text-[11px] line-through"
								style={{
									color: "var(--gray-50)",
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{fmtBRL(product.originalPrice)}
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
