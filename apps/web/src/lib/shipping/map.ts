import type { QuoteResult } from "@emach/db/queries/shipping-quote";
import type { ShippingOption } from "./types";

// Mapeia o resultado do motor de tabelas para o contrato da UI (ShippingOption).
// Sem options cotáveis (todos unquotable / out_of_catalog) → "Frete a combinar".
export function mapQuoteResult(result: QuoteResult): {
	negotiate: boolean;
	options: ShippingOption[];
} {
	const options = result.options
		.map((o) => ({
			carrierId: o.carrierId,
			name: o.carrierName,
			company: o.carrierName,
			priceCents: Math.round(o.amount * 100),
			deliveryDays: o.deliveryDays ?? 0,
		}))
		.sort((a, b) => a.priceCents - b.priceCents);
	return { negotiate: options.length === 0, options };
}
