import type { ToolListItem } from "@emach/db/queries/catalog";
import type { Voltage } from "@emach/db/schema/tools";

import type { Product } from "@/lib/mock-data";

const VOLTAGE_VALUES: Voltage[] = ["127V", "220V", "Bivolt", "380V"];

function pickVoltage(values: string[] | undefined): Voltage | null {
	if (!values || values.length === 0) {
		return null;
	}
	const joined = values.join(",");
	const match = VOLTAGE_VALUES.find((v) => joined.includes(v));
	return match ?? null;
}

export function productToToolListItem(product: Product): ToolListItem {
	const hasPromo = product.originalPrice != null;
	const baseAmount = hasPromo
		? (product.originalPrice as number) / 100
		: product.price / 100;
	const discountedAmount = hasPromo ? product.price / 100 : null;

	return {
		id: product.id,
		slug: product.slug,
		name: product.name,
		status: "active",
		primaryCategory: {
			id: product.categorySlug,
			slug: product.categorySlug,
			name: product.category,
		},
		defaultVariant: {
			id: `${product.id}-default`,
			sku: product.sku,
			voltage: pickVoltage(product.voltage),
			priceAmount: baseAmount.toFixed(2),
			discountedAmount:
				discountedAmount == null ? null : discountedAmount.toFixed(2),
		},
		hasOtherVariants: false,
		primaryImage: product.images[0] ? { url: product.images[0] } : null,
		inStock: product.inStock,
		avgRating: product.rating?.average ?? null,
		reviewCount: product.rating?.count ?? 0,
		activePromotionId: hasPromo ? "mock-promo" : null,
	};
}
