import { db } from "@emach/db";
import { promotion, promotionTool } from "@emach/db/schema/promotions";
import { tool } from "@emach/db/schema/tools";
import { describe, expect, it } from "vitest";
import { disableGlobalPromos } from "@/lib/test-helpers";
import { autoPromoToolIdsFromMap, fetchAutoPromosByToolId } from "./auto-promo";

const ROLLBACK = Symbol("rollback");
async function withRollback(
	fn: (tx: typeof db) => Promise<void>
): Promise<void> {
	try {
		await db.transaction(async (tx) => {
			await disableGlobalPromos(tx as unknown as typeof db);
			await fn(tx as unknown as typeof db);
			throw ROLLBACK;
		});
	} catch (err) {
		if (err !== ROLLBACK) {
			throw err;
		}
	}
}
async function seedTool(tx: typeof db): Promise<string> {
	const id = crypto.randomUUID();
	await tx.insert(tool).values({
		id,
		name: `Tool ${id}`,
		weightKg: "1.000",
		lengthCm: "10.00",
		widthCm: "10.00",
		heightCm: "10.00",
	});
	return id;
}

describe("auto-promo helper", () => {
	it("autoPromoToolIdsFromMap deriva o set dos toolIds com promo", () => {
		const map = new Map([
			["a", [{ discountType: "percent", discountValue: "10.00" }]],
			["b", []],
		]);
		const set = autoPromoToolIdsFromMap(map);
		expect(set.has("a")).toBe(true);
		expect(set.has("b")).toBe(false);
	});

	it("fetchAutoPromosByToolId pega promo específica vigente", async () => {
		await withRollback(async (tx) => {
			const toolId = await seedTool(tx);
			const promoId = crypto.randomUUID();
			await tx.insert(promotion).values({
				id: promoId,
				title: "Auto",
				type: "promotion",
				discountType: "percent",
				discountValue: "15.00",
				appliesToAll: false,
				active: true,
			});
			await tx.insert(promotionTool).values({ promotionId: promoId, toolId });
			const map = await fetchAutoPromosByToolId(tx, [toolId], new Date());
			expect(map.get(toolId)?.length).toBe(1);
			expect(autoPromoToolIdsFromMap(map).has(toolId)).toBe(true);
		});
	});
});
