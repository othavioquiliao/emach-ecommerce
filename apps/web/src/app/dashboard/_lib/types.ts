// Tipos do subsistema de DEVOLUÇÃO (ainda mockado — vira real no Plano 3,
// quando a tabela refund_request chegar via sync do dashboard).
// Os tipos de PEDIDO migraram para @/lib/orders/* (dados reais).

export type CategorySlug =
	| "eletricas"
	| "manuais"
	| "medicao"
	| "seguranca"
	| "acessorios";

export interface OrderItem {
	categorySlug: CategorySlug;
	id: string;
	name: string;
	quantity: number;
	unitPriceCents: number;
	variant?: string;
}

export type RefundStatus =
	| "solicitado"
	| "em_analise"
	| "reembolsado"
	| "recusado";

export type RefundTab = "open" | "closed";

export type RefundMethod = "pix" | "credit_card" | "boleto" | "store_credit";

export interface RefundResolution {
	deniedReason?: string;
	etaLabel?: string;
	method?: RefundMethod;
	refundedAt?: Date;
}

export interface Refund {
	amountCents: number;
	createdAt: Date;
	id: string;
	items: OrderItem[];
	orderId: string;
	reason: string;
	resolution?: RefundResolution;
	status: RefundStatus;
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
	solicitado: "Solicitado",
	em_analise: "Em análise",
	reembolsado: "Reembolsado",
	recusado: "Recusado",
};

export const REFUND_TAB_LABEL: Record<RefundTab, string> = {
	open: "Em andamento",
	closed: "Finalizado",
};

export const REFUND_TABS: readonly RefundTab[] = ["open", "closed"] as const;

export const REFUND_STATUS_BY_TAB: Record<RefundTab, readonly RefundStatus[]> =
	{
		open: ["solicitado", "em_analise"],
		closed: ["reembolsado", "recusado"],
	};

export const REFUND_METHOD_LABEL: Record<RefundMethod, string> = {
	pix: "Pix",
	credit_card: "Cartão de crédito",
	boleto: "Boleto bancário",
	store_credit: "Crédito na loja",
};
