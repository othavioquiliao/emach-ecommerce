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

export type PaymentMethodKind = "pix" | "boleto" | "credit_card";

export interface BuyerSnapshot {
	name: string;
	email: string;
	phone: string;
	document: string;
}

export interface ShippingAddress {
	recipient: string;
	street: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export interface OrderBreakdown {
	subtotalCents: number;
	shippingCents: number;
	shippingMethod: string;
	discountCents?: number;
	discountLabel?: string;
	totalCents: number;
}

export interface PaymentInfo {
	kind: PaymentMethodKind;
	label: string;
	detail?: string;
	cardLast4?: string;
}

export interface OrderTracking {
	carrier: string;
	service: string;
	code: string;
	url?: string;
	updatedAt: Date;
}

export interface OrderDetail extends Order {
	buyer: BuyerSnapshot;
	address: ShippingAddress;
	breakdown: OrderBreakdown;
	payment: PaymentInfo;
	tracking?: OrderTracking;
	cancelledAt?: Date;
	paidAt?: Date;
	shippedAt?: Date;
	deliveredAt?: Date;
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodKind, string> = {
	pix: "Pix",
	boleto: "Boleto bancário",
	credit_card: "Cartão de crédito",
};
