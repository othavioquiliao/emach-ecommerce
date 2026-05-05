"use client";

import { cn } from "@emach/ui/lib/utils";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import type { CartItem } from "@/lib/cart-store";
import { fmtNumericBRL, numericToCents } from "@/lib/format";
import { QuantityPicker } from "./quantity-picker";

interface CartItemRowProps {
	item: CartItem;
	leaving?: boolean;
	onLinkClick?: () => void;
	onQuantityChange: (next: number) => void;
	onRemove: () => void;
	variant?: "full" | "compact";
}

export function CartItemRow({
	item,
	leaving = false,
	variant = "full",
	onQuantityChange,
	onRemove,
	onLinkClick,
}: CartItemRowProps) {
	const isCompact = variant === "compact";
	const lineTotalCents = numericToCents(item.priceAmount) * item.quantity;
	const labelText =
		item.categoryName ?? (item.voltage ? item.voltage : `SKU ${item.sku}`);

	return (
		<div
			className={cn(
				"emach-cart-item border-gray-10 border-b",
				isCompact
					? "grid grid-cols-[80px_1fr_auto] items-start gap-3.5 py-4"
					: "grid grid-cols-[120px_1fr_auto] items-center gap-5 py-5"
			)}
			data-leaving={leaving ? "true" : undefined}
		>
			<div
				className={cn(
					"relative overflow-hidden bg-image-bg",
					isCompact ? "size-20" : "size-[120px]"
				)}
			>
				<ProductImage
					alt={item.name}
					categorySlug={item.categorySlug ?? ""}
					sizes={isCompact ? "80px" : "120px"}
					src={item.imageUrl ?? undefined}
				/>
			</div>

			<div className="min-w-0">
				<SectionLabel>{labelText}</SectionLabel>
				{isCompact ? (
					<Link
						className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[14px] hover:underline"
						href={`/product/${item.slug}`}
						onClick={onLinkClick}
						title={item.name}
					>
						{item.name}
					</Link>
				) : (
					<div className="mt-1 font-medium text-[16px]">{item.name}</div>
				)}
				<div
					className={cn(
						"text-gray-60",
						isCompact ? "mt-0.5 text-[11px]" : "mt-1 text-[12px]"
					)}
				>
					SKU {item.sku}
					{item.voltage && ` · ${item.voltage}`}
				</div>
				<div
					className={cn(
						"flex",
						isCompact
							? "mt-2 flex-col items-start gap-1"
							: "mt-3 flex-wrap items-center gap-4"
					)}
				>
					<QuantityPicker onChange={onQuantityChange} value={item.quantity} />
					<button
						className="cursor-pointer border-none bg-transparent text-[12px] text-gray-60 underline hover:text-near-black"
						onClick={onRemove}
						type="button"
					>
						Remover
					</button>
				</div>
			</div>

			<div
				className={cn(
					"font-bold tabular-nums",
					isCompact ? "pt-0.5 text-[14px]" : "text-[16px]"
				)}
			>
				{fmtNumericBRL((lineTotalCents / 100).toFixed(2))}
			</div>
		</div>
	);
}
