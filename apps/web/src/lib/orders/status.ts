import type { OrderStatus } from "@emach/db/schema/orders";

export type BadgeTone =
	| "neutral"
	| "danger"
	| "info"
	| "progress"
	| "transit"
	| "success"
	| "muted"
	| "warning";

export const ORDER_STATUS_BADGE: Record<
	OrderStatus,
	{ label: string; tone: BadgeTone }
> = {
	pending_payment: { label: "Aguardando pagamento", tone: "neutral" },
	payment_failed: { label: "Pagamento falhou", tone: "danger" },
	paid: { label: "Pagamento confirmado", tone: "info" },
	preparing: { label: "Em preparação", tone: "progress" },
	shipped: { label: "A caminho", tone: "transit" },
	delivered: { label: "Entregue", tone: "success" },
	canceled: { label: "Cancelado", tone: "muted" },
	refunded: { label: "Reembolsado", tone: "warning" },
	returned: { label: "Devolvido", tone: "warning" },
};

export const ORDER_TABS = [
	"all",
	"a_pagar",
	"em_preparacao",
	"a_caminho",
	"concluidos",
] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export const ORDER_TAB_LABEL: Record<OrderTab, string> = {
	all: "Todos",
	a_pagar: "A pagar",
	em_preparacao: "Em preparação",
	a_caminho: "A caminho",
	concluidos: "Concluídos",
};

const STATUS_TO_TAB: Record<OrderStatus, Exclude<OrderTab, "all"> | null> = {
	pending_payment: "a_pagar",
	payment_failed: "a_pagar",
	paid: "em_preparacao",
	preparing: "em_preparacao",
	shipped: "a_caminho",
	delivered: "concluidos",
	canceled: null,
	refunded: null,
	returned: null,
};

export function statusToTab(
	status: OrderStatus
): Exclude<OrderTab, "all"> | null {
	return STATUS_TO_TAB[status];
}

export function countByTab(statuses: OrderStatus[]): Record<OrderTab, number> {
	const counts: Record<OrderTab, number> = {
		all: statuses.length,
		a_pagar: 0,
		em_preparacao: 0,
		a_caminho: 0,
		concluidos: 0,
	};
	for (const s of statuses) {
		const tab = STATUS_TO_TAB[s];
		if (tab) {
			counts[tab] += 1;
		}
	}
	return counts;
}

// Stepper híbrido: 4 fases visíveis no topo.
export const STEPPER_PHASES = [
	"paid",
	"preparing",
	"shipped",
	"delivered",
] as const;
export type StepperPhase = (typeof STEPPER_PHASES)[number];
export type StepState = "done" | "current" | "upcoming";

const PHASE_RANK: Record<OrderStatus, number> = {
	pending_payment: 0,
	payment_failed: 0,
	paid: 1,
	preparing: 2,
	shipped: 3,
	delivered: 4,
	canceled: -1,
	refunded: -1,
	returned: -1,
};

export function stepStateFor(
	status: OrderStatus,
	phase: StepperPhase
): StepState {
	const rank = PHASE_RANK[status];
	if (rank < 0) {
		return "upcoming"; // cancelado/devolvido: stepper substituído por aviso
	}
	const phaseRank = STEPPER_PHASES.indexOf(phase) + 1;
	if (rank > phaseRank) {
		return "done";
	}
	if (rank === phaseRank) {
		return "current";
	}
	return "upcoming";
}

export function isTerminalNegative(status: OrderStatus): boolean {
	return (
		status === "canceled" || status === "refunded" || status === "returned"
	);
}

// `text-info` e `border-info` são válidos: --color-info mapeado em @theme inline
// via --info: #4c98b9 em globals.css — token confirmado antes de escrever.
export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
	neutral: "text-gray-60 border-border",
	danger: "text-emach-red border-emach-red",
	info: "text-info border-info",
	progress: "text-near-black border-near-black",
	transit: "text-near-black border-near-black",
	success: "text-success border-success",
	muted: "text-gray-50 border-border bg-gray-10",
	warning: "text-warning border-warning",
};
