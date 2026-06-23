import { db } from "@emach/db";
import {
	getActiveBoxes,
	getActiveCarriersWithTables,
} from "@emach/db/queries/shipping";
import { quoteShipping as quoteByTables } from "@emach/db/queries/shipping-quote";
import { tool } from "@emach/db/schema/tools";
import { inArray } from "drizzle-orm";

import { buildQuoteItems } from "./build-items";
import { mapQuoteResult } from "./map";
import type { ShippingOption } from "./types";

export interface QuoteShippingInput {
	declaredValueCents?: number;
	destinationCep: string;
	items: { toolId: string; quantity: number }[];
}

// Cotação por tabelas próprias (substitui SuperFrete). declaredValue = subtotal
// do carrinho (centavos→reais); GRIS/ad valorem vêm do carrier. Sem cobertura
// (sem zona/faixa/caixa) → negotiate=true.
export async function quoteShipping(
	input: QuoteShippingInput
): Promise<{ negotiate: boolean; options: ShippingOption[] }> {
	const toolIds = Array.from(new Set(input.items.map((i) => i.toolId)));
	const [carriers, boxes, toolRows] = await Promise.all([
		getActiveCarriersWithTables(db),
		getActiveBoxes(db),
		db
			.select({
				id: tool.id,
				weightKg: tool.weightKg,
				lengthCm: tool.lengthCm,
				widthCm: tool.widthCm,
				heightCm: tool.heightCm,
				packagingWeightKg: tool.packagingWeightKg,
				stackable: tool.stackable,
				shipsInOwnBox: tool.shipsInOwnBox,
			})
			.from(tool)
			.where(inArray(tool.id, toolIds)),
	]);

	const items = buildQuoteItems(toolRows, input.items);
	const result = quoteByTables({
		items,
		destinationCep: input.destinationCep,
		declaredValue: (input.declaredValueCents ?? 0) / 100,
		carriers,
		boxes,
	});
	return mapQuoteResult(result);
}
