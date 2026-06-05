import type { db } from "@emach/db";
import { promotion, promotionTool } from "@emach/db/schema/promotions";
import { and, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";

export interface CouponLine {
	/** Preço ORIGINAL da variante em centavos (sem auto-promo). */
	basePriceCents: number;
	quantity: number;
	toolId: string;
}

export type CouponValidation =
	| { ok: true; discountCents: number; promotionId: string }
	| { ok: false; error: string };

/** Tools sob promoção automática ativa (global ou específica) — não empilham com cupom. */
async function fetchAutoPromoToolIds(
	tx: typeof db,
	toolIds: string[],
	now: Date
): Promise<Set<string>> {
	const [globalAuto] = await tx
		.select({ id: promotion.id })
		.from(promotion)
		.where(
			and(
				eq(promotion.active, true),
				eq(promotion.type, "promotion"),
				eq(promotion.appliesToAll, true),
				or(isNull(promotion.startsAt), lte(promotion.startsAt, now)),
				or(isNull(promotion.endsAt), gt(promotion.endsAt, now))
			)
		)
		.limit(1);
	if (globalAuto) {
		return new Set(toolIds);
	}

	const rows = await tx
		.select({ toolId: promotionTool.toolId })
		.from(promotion)
		.innerJoin(promotionTool, eq(promotionTool.promotionId, promotion.id))
		.where(
			and(
				eq(promotion.active, true),
				eq(promotion.type, "promotion"),
				inArray(promotionTool.toolId, toolIds),
				or(isNull(promotion.startsAt), lte(promotion.startsAt, now)),
				or(isNull(promotion.endsAt), gt(promotion.endsAt, now))
			)
		);
	return new Set(rows.map((r) => r.toolId));
}

export async function validateCoupon(
	tx: typeof db,
	rawCode: string,
	lines: CouponLine[]
): Promise<CouponValidation> {
	const code = rawCode.trim();
	if (!code) {
		return { ok: false, error: "Cupom inválido" };
	}
	const now = new Date();

	const [promo] = await tx
		.select()
		.from(promotion)
		.where(
			and(
				sql`lower(${promotion.code}) = lower(${code})`,
				eq(promotion.type, "promocode")
			)
		)
		.limit(1);

	if (!(promo && promo.active)) {
		return { ok: false, error: "Cupom inválido" };
	}
	if (promo.startsAt && promo.startsAt > now) {
		return { ok: false, error: "Cupom inválido" };
	}
	if (promo.endsAt && promo.endsAt <= now) {
		return { ok: false, error: "Cupom expirado" };
	}
	if (
		promo.maxRedemptions !== null &&
		promo.redemptionCount >= promo.maxRedemptions
	) {
		return { ok: false, error: "Cupom esgotado" };
	}

	const toolIds = Array.from(new Set(lines.map((l) => l.toolId)));

	// Escopo: null = vale para todos; senão restringe ao promotion_tool do cupom.
	let scopeToolIds: Set<string> | null = null;
	if (!promo.appliesToAll) {
		const scoped = await tx
			.select({ toolId: promotionTool.toolId })
			.from(promotionTool)
			.where(
				and(
					eq(promotionTool.promotionId, promo.id),
					inArray(promotionTool.toolId, toolIds)
				)
			);
		scopeToolIds = new Set(scoped.map((r) => r.toolId));
	}

	const autoPromoToolIds = await fetchAutoPromoToolIds(tx, toolIds, now);

	let eligibleSubtotalCents = 0;
	for (const line of lines) {
		const inScope = scopeToolIds === null || scopeToolIds.has(line.toolId);
		if (inScope && !autoPromoToolIds.has(line.toolId)) {
			eligibleSubtotalCents += line.basePriceCents * line.quantity;
		}
	}

	if (eligibleSubtotalCents === 0) {
		return { ok: false, error: "Cupom não cobre nenhum item do carrinho" };
	}

	if (promo.minOrderAmount !== null) {
		const minCents = Math.round(Number(promo.minOrderAmount) * 100);
		if (eligibleSubtotalCents < minCents) {
			const minBRL = Number(promo.minOrderAmount).toLocaleString("pt-BR", {
				currency: "BRL",
				style: "currency",
			});
			return { ok: false, error: `Pedido mínimo de ${minBRL}` };
		}
	}

	const value = Number(promo.discountValue);
	const discountCents =
		promo.discountType === "fixed"
			? Math.min(Math.round(value * 100), eligibleSubtotalCents)
			: Math.min(
					Math.round((eligibleSubtotalCents * value) / 100),
					eligibleSubtotalCents
				);

	return {
		ok: true,
		discountCents: Math.max(0, discountCents),
		promotionId: promo.id,
	};
}
