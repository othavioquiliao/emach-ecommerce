"use server";

import { db } from "@emach/db";
import { toolVariant } from "@emach/db/schema/tools";
import { inArray } from "drizzle-orm";
import { z } from "zod";

import { type CouponLine, validateCoupon } from "@/lib/coupons/validate-coupon";
import { log } from "@/lib/evlog";
import { requireCurrentClient } from "@/lib/session";

const schema = z.object({
	code: z.string().min(1),
	cartItems: z
		.array(
			z.object({
				toolId: z.string().min(1),
				variantId: z.string().min(1),
				quantity: z.number().int().positive(),
			})
		)
		.min(1),
});

export type ApplyCouponResult =
	| { ok: true; discountCents: number }
	| { ok: false; error: string };

export async function applyCouponAction(
	raw: z.infer<typeof schema>
): Promise<ApplyCouponResult> {
	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		return { ok: false, error: "Dados inválidos" };
	}
	await requireCurrentClient();
	const { code, cartItems } = parsed.data;

	try {
		const variantIds = cartItems.map((i) => i.variantId);
		const variants = await db
			.select({
				id: toolVariant.id,
				toolId: toolVariant.toolId,
				priceAmount: toolVariant.priceAmount,
			})
			.from(toolVariant)
			.where(inArray(toolVariant.id, variantIds));
		const byId = new Map(variants.map((v) => [v.id, v]));

		const lines: CouponLine[] = [];
		for (const item of cartItems) {
			const variant = byId.get(item.variantId);
			if (!variant || variant.toolId !== item.toolId) {
				return { ok: false, error: "Carrinho inválido" };
			}
			lines.push({
				toolId: item.toolId,
				quantity: item.quantity,
				basePriceCents: Math.round(Number(variant.priceAmount) * 100),
			});
		}

		const result = await validateCoupon(db, code, lines);
		if (!result.ok) {
			return { ok: false, error: result.error };
		}
		return { ok: true, discountCents: result.discountCents };
	} catch (err) {
		log.error({
			action: "apply_coupon_failed",
			code,
			error: err instanceof Error ? err.message : "erro inesperado",
		});
		return { ok: false, error: "Não foi possível validar o cupom" };
	}
}
