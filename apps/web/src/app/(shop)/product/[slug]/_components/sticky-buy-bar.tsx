"use client";

import { cn } from "@emach/ui/lib/utils";
import { ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/product-image";

interface StickyBuyBarProps {
	categorySlug?: string;
	imageUrl: string | null;
	inStock: boolean;
	onAdd: () => void;
	/** Preço já formatado (ex.: "R$ 1.849,00"). */
	priceLabel: string;
	productName: string;
	variantLabel: string;
	visible: boolean;
}

/**
 * Barra de compra fixa no rodapé (mobile). Espelha o estado da buy box inline
 * do `ProductInfo` — não duplica lógica; só dispara o mesmo `onAdd`. Sempre
 * montada; alterna `translate-y` via transição CSS (robusta, sem o conflito do
 * `animate-in`/framer com o React Compiler). `lg:hidden`.
 */
export function StickyBuyBar({
	imageUrl,
	categorySlug,
	productName,
	variantLabel,
	priceLabel,
	inStock,
	onAdd,
	visible,
}: StickyBuyBarProps) {
	return (
		<div
			aria-hidden={!visible}
			className={cn(
				"fixed inset-x-0 bottom-0 z-30 border-border border-t bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out lg:hidden",
				visible ? "translate-y-0" : "pointer-events-none translate-y-full"
			)}
		>
			<div className="flex h-[62px] items-center gap-3 px-4">
				<div className="relative size-10 shrink-0 overflow-hidden bg-image-bg">
					<ProductImage
						alt={productName}
						categorySlug={categorySlug ?? ""}
						sizes="40px"
						src={imageUrl ?? undefined}
					/>
				</div>

				<div className="min-w-0 flex-1">
					<div className="truncate font-display font-semibold text-[10px] text-gray-60 uppercase tracking-[0.12em]">
						{variantLabel}
					</div>
					<div className="whitespace-nowrap font-bold font-display text-[21px] text-near-black tabular-nums leading-[1.05]">
						{priceLabel}
					</div>
				</div>

				<button
					aria-label={inStock ? "Adicionar ao carrinho" : "Esgotado"}
					className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center bg-emach-red text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!inStock}
					onClick={onAdd}
					type="button"
				>
					<ShoppingBag size={22} />
					{inStock && (
						<span className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-white font-bold text-[11px] text-emach-red leading-none">
							+
						</span>
					)}
				</button>
			</div>
		</div>
	);
}
