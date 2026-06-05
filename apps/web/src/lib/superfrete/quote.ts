import { db } from "@emach/db";
import { tool } from "@emach/db/schema/tools";
import { inArray } from "drizzle-orm";

import { getOriginBranchCep } from "@/lib/origin-branch";

import { fetchSuperFreteQuote } from "./client";
import type { QuoteItem, ShippingOption } from "./types";

const SERVICES = "1,2,17,3"; // PAC, SEDEX, Mini, Jadlog

export interface QuoteShippingInput {
	destinationCep: string;
	items: QuoteItem[];
}

export async function quoteShipping(
	input: QuoteShippingInput
): Promise<ShippingOption[]> {
	const toolIds = Array.from(new Set(input.items.map((i) => i.toolId)));
	const [originCep, toolRows] = await Promise.all([
		getOriginBranchCep(),
		db
			.select({
				id: tool.id,
				weightKg: tool.weightKg,
				lengthCm: tool.lengthCm,
				widthCm: tool.widthCm,
				heightCm: tool.heightCm,
			})
			.from(tool)
			.where(inArray(tool.id, toolIds)),
	]);

	const byId = new Map(toolRows.map((t) => [t.id, t]));
	const products = input.items.map((item) => {
		const t = byId.get(item.toolId);
		if (!t) {
			throw new Error(`Ferramenta ${item.toolId} não encontrada`);
		}
		return {
			height: Number(t.heightCm),
			width: Number(t.widthCm),
			length: Number(t.lengthCm),
			weight: Number(t.weightKg),
			quantity: item.quantity,
		};
	});

	const raw = await fetchSuperFreteQuote({
		from: { postal_code: originCep },
		to: { postal_code: input.destinationCep },
		services: SERVICES,
		options: { insurance_value: 0, use_insurance_value: false },
		products,
	});

	return raw
		.filter((s) => typeof s.price === "number" && !s.error && !s.has_error)
		.map((s) => ({
			serviceId: s.id,
			name: s.name,
			company: s.company?.name ?? "",
			priceCents: Math.round((s.price as number) * 100),
			deliveryDays: s.delivery_time ?? 0,
		}))
		.sort((a, b) => a.priceCents - b.priceCents);
}
