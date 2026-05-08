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
	document: string;
	email: string;
	name: string;
	phone: string;
}

export interface ShippingAddress {
	city: string;
	complement?: string;
	country: string;
	neighborhood: string;
	recipient: string;
	state: string;
	street: string;
	zip: string;
}

export interface OrderBreakdown {
	discountCents?: number;
	discountLabel?: string;
	shippingCents: number;
	shippingMethod: string;
	subtotalCents: number;
	totalCents: number;
}

export interface PaymentInfo {
	cardLast4?: string;
	detail?: string;
	kind: PaymentMethodKind;
	label: string;
}

export interface OrderTracking {
	carrier: string;
	code: string;
	service: string;
	updatedAt: Date;
	url?: string;
}

export interface OrderDetail extends Order {
	address: ShippingAddress;
	breakdown: OrderBreakdown;
	buyer: BuyerSnapshot;
	cancelledAt?: Date;
	deliveredAt?: Date;
	paidAt?: Date;
	payment: PaymentInfo;
	shippedAt?: Date;
	tracking?: OrderTracking;
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodKind, string> = {
	pix: "Pix",
	boleto: "Boleto bancário",
	credit_card: "Cartão de crédito",
};
