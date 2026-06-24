export type PromoLayout = "hidden" | "pair" | "trio" | "grid";

/** Decide o arranjo da seção de promoção pela contagem de produtos.
 * < 2 → "hidden" (não renderiza); 2 → "pair" (horizontais alternados);
 * 3 → "trio" (3 horizontais iguais); >= 4 → "grid" (grid vertical atual). */
export function selectPromoLayout(count: number): PromoLayout {
	if (count < 2) {
		return "hidden";
	}
	if (count === 2) {
		return "pair";
	}
	if (count === 3) {
		return "trio";
	}
	return "grid";
}

/** Percentual de desconto inteiro (ex.: 20). null se não há desconto válido. */
export function computeDiscountPercent(
	price: string,
	discounted: string | null
): number | null {
	if (discounted == null) {
		return null;
	}
	const p = Number(price);
	const d = Number(discounted);
	if (!(p > 0 && d >= 0) || d >= p) {
		return null;
	}
	return Math.round((1 - d / p) * 100);
}

/** Economia em reais (price - discounted). null se não há desconto válido. */
export function computeSavings(
	price: string,
	discounted: string | null
): number | null {
	if (discounted == null) {
		return null;
	}
	const p = Number(price);
	const d = Number(discounted);
	if (!(p > 0 && d >= 0) || d >= p) {
		return null;
	}
	return Math.round((p - d) * 100) / 100;
}
