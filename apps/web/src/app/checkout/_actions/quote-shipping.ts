"use server";

import { z } from "zod";

import { log } from "@/lib/evlog";
import { quoteShipping } from "@/lib/superfrete/quote";
import type { ShippingOption } from "@/lib/superfrete/types";

const inputSchema = z.object({
	destinationCep: z
		.string()
		.transform((v) => v.replace(/\D/g, ""))
		.refine((v) => v.length === 8, "CEP inválido"),
	items: z
		.array(
			z.object({
				toolId: z.string().min(1),
				quantity: z.number().int().positive(),
			})
		)
		.min(1, "Carrinho vazio"),
	declaredValueCents: z.number().int().nonnegative().optional(),
});

export type QuoteShippingResult =
	| { ok: true; options: ShippingOption[]; negotiate: boolean }
	| { ok: false; error: string };

export async function quoteShippingAction(
	rawInput: unknown
): Promise<QuoteShippingResult> {
	const parsed = inputSchema.safeParse(rawInput);
	if (!parsed.success) {
		return { ok: false, error: "Dados inválidos para cotação" };
	}
	try {
		const { options, negotiate } = await quoteShipping(parsed.data);
		return { ok: true, options, negotiate };
	} catch (err) {
		log.error({
			action: "quote_shipping_failed",
			error: err instanceof Error ? err.message : "erro inesperado",
		});
		return { ok: false, error: "Não foi possível calcular o frete." };
	}
}
