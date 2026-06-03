/** Resposta crua de um serviço no POST /api/v0/calculator do SuperFrete. */
export interface SuperFreteServiceRaw {
	company?: { id: number; name: string; picture?: string };
	delivery_time?: number;
	error?: string;
	has_error?: boolean;
	id: number;
	name: string;
	price?: number;
}

/** Item do carrinho enviado para cotação (server resolve peso/dim no DB). */
export interface QuoteItem {
	quantity: number;
	toolId: string;
}

/** Opção de frete já normalizada para a UI. */
export interface ShippingOption {
	company: string;
	deliveryDays: number;
	name: string;
	priceCents: number;
	serviceId: number;
}
