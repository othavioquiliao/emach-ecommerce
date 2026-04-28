export type OrderStatus =
	| "pending_payment"
	| "to_ship"
	| "shipped"
	| "completed"
	| "cancelled";

export type OrderTab = "all" | OrderStatus;

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

export interface Order {
	createdAt: Date;
	id: string;
	items: OrderItem[];
	reviewed?: boolean;
	status: OrderStatus;
	totalCents: number;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	pending_payment: "Pendente pagamento",
	to_ship: "A enviar",
	shipped: "Enviado",
	completed: "Finalizado",
	cancelled: "Cancelado",
};

export const ORDER_TAB_LABEL: Record<OrderTab, string> = {
	all: "Todos",
	pending_payment: "Pendente pagamento",
	to_ship: "A enviar",
	shipped: "Enviado",
	completed: "Finalizado",
	cancelled: "Cancelado",
};

export const ORDER_TABS: readonly OrderTab[] = [
	"all",
	"pending_payment",
	"to_ship",
	"shipped",
	"completed",
] as const;
