import { REFUND_STATUS_BY_TAB, type Refund, type RefundTab } from "./types";

export const mockRefunds: Refund[] = [
	{
		id: "DEV-2026-00128",
		orderId: "EMACH-2026-0410-7B22",
		createdAt: new Date("2026-05-10T10:12:00"),
		status: "solicitado",
		reason: "Produto chegou com defeito (botão de reversão travado).",
		amountCents: 74_900,
		items: [
			{
				id: "i-1",
				name: "Furadeira de Impacto Profissional 850W",
				variant: "220V · Mandril 13mm",
				quantity: 1,
				unitPriceCents: 74_900,
				categorySlug: "eletricas",
			},
		],
	},
	{
		id: "DEV-2026-00121",
		orderId: "EMACH-2026-0402-22A1",
		createdAt: new Date("2026-05-04T15:30:00"),
		status: "em_analise",
		reason: "Recebi o tamanho errado (10-22mm em vez de 8-22mm).",
		amountCents: 35_800,
		items: [
			{
				id: "i-1",
				name: "Jogo de Chaves Combinadas 8-22mm (12 peças)",
				variant: "Aço cromo-vanádio",
				quantity: 2,
				unitPriceCents: 17_900,
				categorySlug: "manuais",
			},
		],
	},
	{
		id: "DEV-2026-00115",
		orderId: "EMACH-2026-0325-4811",
		createdAt: new Date("2026-04-28T09:48:00"),
		status: "solicitado",
		reason: "Comprei na voltagem errada, preciso devolver os dois itens.",
		amountCents: 35_890,
		items: [
			{
				id: "i-1",
				name: "Trena Digital a Laser 40m",
				variant: "Bivolt · IP54",
				quantity: 1,
				unitPriceCents: 28_900,
				categorySlug: "medicao",
			},
			{
				id: "i-2",
				name: 'Disco de Corte para Metal 4.1/2" (10 unidades)',
				variant: "115mm × 1.6mm",
				quantity: 1,
				unitPriceCents: 6990,
				categorySlug: "acessorios",
			},
		],
	},
	{
		id: "DEV-2026-00098",
		orderId: "EMACH-2026-0228-50D9",
		createdAt: new Date("2026-04-12T11:00:00"),
		status: "reembolsado",
		reason: "Produto chegou riscado e com a embalagem violada.",
		amountCents: 45_900,
		items: [
			{
				id: "i-1",
				name: 'Esmerilhadeira Angular 720W 4.1/2"',
				variant: "220V",
				quantity: 1,
				unitPriceCents: 45_900,
				categorySlug: "eletricas",
			},
		],
		resolution: {
			refundedAt: new Date("2026-04-22T09:15:00"),
			method: "pix",
			etaLabel: "1-2 dias úteis",
		},
	},
	{
		id: "DEV-2026-00076",
		orderId: "EMACH-2026-0205-C12B",
		createdAt: new Date("2026-03-28T16:20:00"),
		status: "recusado",
		reason: "Não gostei do peso, queria mais leve.",
		amountCents: 13_200,
		items: [
			{
				id: "i-1",
				name: 'Alicate Universal 8"',
				variant: "Cabo isolado",
				quantity: 3,
				unitPriceCents: 4400,
				categorySlug: "manuais",
			},
		],
		resolution: {
			deniedReason:
				"Solicitação fora do prazo de arrependimento (7 dias) e produto sem defeito.",
		},
	},
];

export function getRefundsByTab(tab: RefundTab): Refund[] {
	const allowed = REFUND_STATUS_BY_TAB[tab];
	return mockRefunds.filter((r) => allowed.includes(r.status));
}

export function getRefundCounts(): Record<RefundTab, number> {
	const counts: Record<RefundTab, number> = { open: 0, closed: 0 };
	for (const refund of mockRefunds) {
		if (REFUND_STATUS_BY_TAB.open.includes(refund.status)) {
			counts.open += 1;
		} else if (REFUND_STATUS_BY_TAB.closed.includes(refund.status)) {
			counts.closed += 1;
		}
	}
	return counts;
}

export function getRefundById(id: string): Refund | undefined {
	return mockRefunds.find((r) => r.id === id);
}

export function getRefundByOrderId(orderId: string): Refund | undefined {
	return mockRefunds.find((r) => r.orderId === orderId);
}
