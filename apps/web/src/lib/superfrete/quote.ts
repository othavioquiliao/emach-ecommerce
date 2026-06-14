import { db } from "@emach/db";
import { getShippingSettings } from "@emach/db/queries/store-settings";
import { tool } from "@emach/db/schema/tools";
import { inArray } from "drizzle-orm";

import { numericToCents } from "@/lib/format";
import { getOriginBranchCep } from "@/lib/origin-branch";

import { fetchSuperFreteQuote } from "./client";
import type { QuoteItem, ShippingOption } from "./types";

const SERVICES = "1,2"; // PAC, SEDEX (Correios)

// Teto do SuperFrete/Correios: acima disso o item sai da cotação automática e
// usa o frete fixo `tool.overweightShippingAmount` (ou "a combinar" se nulo).
const OVERWEIGHT_WEIGHT_KG = 30;
const OVERWEIGHT_DIM_CM = 100;
// serviceId sintético da opção de frete só com itens pesados (sem serviço real).
const OVERWEIGHT_SERVICE_ID = -1;

export interface QuoteShippingInput {
	/**
	 * Valor declarado do carrinho (centavos), usado quando a política de seguro
	 * de frete (`store_settings.shipping_insurance_policy`) é `cart_value`.
	 * Ignorado quando a política é `none`.
	 */
	declaredValueCents?: number;
	destinationCep: string;
	items: QuoteItem[];
}

export interface QuoteResult {
	/**
	 * True quando há item pesado sem `overweightShippingAmount` cadastrado →
	 * o frete não pode ser cotado automaticamente ("Frete a combinar").
	 */
	negotiate: boolean;
	/** Opções de frete selecionáveis. Vazio quando `negotiate` é true. */
	options: ShippingOption[];
}

/**
 * Monta as `options` de seguro do SuperFrete a partir da política de frete da
 * loja: `none` → sem seguro; `cart_value` → declara o valor do carrinho até o
 * teto (`insuranceCapAmount`).
 */
function buildInsuranceOptions(
	settings: Awaited<ReturnType<typeof getShippingSettings>>,
	declaredValueCents: number | undefined
): { insurance_value: number; use_insurance_value: boolean } {
	if (settings.insurancePolicy !== "cart_value") {
		return { insurance_value: 0, use_insurance_value: false };
	}
	const declared = (declaredValueCents ?? 0) / 100;
	const insured = Math.min(declared, settings.insuranceCapAmount);
	return { insurance_value: insured, use_insurance_value: insured > 0 };
}

export async function quoteShipping(
	input: QuoteShippingInput
): Promise<QuoteResult> {
	const toolIds = Array.from(new Set(input.items.map((i) => i.toolId)));
	const [settings, toolRows] = await Promise.all([
		getShippingSettings(db),
		db
			.select({
				id: tool.id,
				weightKg: tool.weightKg,
				lengthCm: tool.lengthCm,
				widthCm: tool.widthCm,
				heightCm: tool.heightCm,
				overweightShippingAmount: tool.overweightShippingAmount,
			})
			.from(tool)
			.where(inArray(tool.id, toolIds)),
	]);

	// Origem do despacho: filial configurada em store_settings; sem singleton
	// configurado (`originCep` nulo), mantém o fallback por env (DEFAULT_BRANCH_ID).
	const originCep = settings.originCep ?? (await getOriginBranchCep());

	const byId = new Map(toolRows.map((t) => [t.id, t]));

	// Particiona o carrinho: itens dentro do teto vão à cotação SuperFrete;
	// itens pesados somam o frete fixo `overweightShippingAmount` (× quantidade).
	const normalProducts: Array<{
		height: number;
		width: number;
		length: number;
		weight: number;
		quantity: number;
	}> = [];
	let overweightSurchargeCents = 0;
	for (const item of input.items) {
		const t = byId.get(item.toolId);
		if (!t) {
			throw new Error(`Ferramenta ${item.toolId} não encontrada`);
		}
		const weight = Number(t.weightKg);
		const maxDim = Math.max(
			Number(t.lengthCm),
			Number(t.widthCm),
			Number(t.heightCm)
		);
		const isOverweight =
			weight > OVERWEIGHT_WEIGHT_KG || maxDim > OVERWEIGHT_DIM_CM;
		if (!isOverweight) {
			normalProducts.push({
				height: Number(t.heightCm),
				width: Number(t.widthCm),
				length: Number(t.lengthCm),
				weight,
				quantity: item.quantity,
			});
			continue;
		}
		// Pesado sem valor fixo cadastrado → frete não cotável automaticamente.
		if (t.overweightShippingAmount == null) {
			return { options: [], negotiate: true };
		}
		overweightSurchargeCents +=
			numericToCents(t.overweightShippingAmount) * item.quantity;
	}

	// Só itens pesados: não há o que cotar no SuperFrete; devolve uma opção
	// sintética com o frete fixo somado.
	if (normalProducts.length === 0) {
		return {
			negotiate: false,
			options: [
				{
					serviceId: OVERWEIGHT_SERVICE_ID,
					name: "Frete de itens especiais",
					company: "",
					priceCents: overweightSurchargeCents,
					deliveryDays: 0,
				},
			],
		};
	}

	const raw = await fetchSuperFreteQuote({
		from: { postal_code: originCep },
		to: { postal_code: input.destinationCep },
		services: SERVICES,
		options: buildInsuranceOptions(settings, input.declaredValueCents),
		products: normalProducts,
	});

	const options = raw
		.filter((s) => typeof s.price === "number" && !s.error && !s.has_error)
		.map((s) => ({
			serviceId: s.id,
			name: s.name,
			company: s.company?.name ?? "",
			priceCents:
				Math.round((s.price as number) * 100) + overweightSurchargeCents,
			deliveryDays: s.delivery_time ?? 0,
		}))
		.sort((a, b) => a.priceCents - b.priceCents);

	return { negotiate: false, options };
}
