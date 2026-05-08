import type { Order, OrderStatus, OrderTab } from "./types";

export const mockOrders: Order[] = [
	{
		id: "EMACH-2026-0428-A91C",
		createdAt: new Date("2026-04-28T14:32:00"),
		status: "shipped",
		totalCents: 102_870,
		items: [
			{
				id: "i-1",
				name: "Furadeira de Impacto Profissional 850W",
				variant: "220V · Mandril 13mm",
				quantity: 1,
				unitPriceCents: 89_900,
				categorySlug: "eletricas",
			},
			{
				id: "i-2",
				name: "Kit de Brocas para Concreto 5 peças",
				variant: "Aço SDS",
				quantity: 1,
				unitPriceCents: 7990,
				categorySlug: "acessorios",
			},
			{
				id: "i-3",
				name: "Óculos de Proteção Antirrisco",
				variant: "Lente incolor",
				quantity: 2,
				unitPriceCents: 2490,
				categorySlug: "seguranca",
			},
		],
	},
	{
		id: "EMACH-2026-0427-D04F",
		createdAt: new Date("2026-04-27T09:15:00"),
		status: "pending_payment",
		totalCents: 45_800,
		items: [
			{
				id: "i-1",
				name: 'Esmerilhadeira Angular 4.1/2" 720W',
				variant: "220V",
				quantity: 2,
				unitPriceCents: 22_900,
				categorySlug: "eletricas",
			},
		],
	},
	{
		id: "EMACH-2026-0425-3E12",
		createdAt: new Date("2026-04-25T16:48:00"),
		status: "to_ship",
		totalCents: 36_790,
		items: [
			{
				id: "i-1",
				name: "Parafusadeira a Bateria 12V",
				variant: "Bivolt · 2 baterias",
				quantity: 1,
				unitPriceCents: 32_900,
				categorySlug: "eletricas",
			},
			{
				id: "i-2",
				name: "Bits de Impacto 10 peças",
				quantity: 1,
				unitPriceCents: 3890,
				categorySlug: "acessorios",
			},
		],
	},
	{
		id: "EMACH-2026-0422-7B22",
		createdAt: new Date("2026-04-22T11:02:00"),
		status: "to_ship",
		totalCents: 24_900,
		items: [
			{
				id: "i-1",
				name: "Trena Digital a Laser 40m",
				variant: "Bluetooth",
				quantity: 1,
				unitPriceCents: 24_900,
				categorySlug: "medicao",
			},
		],
	},
	{
		id: "EMACH-2026-0418-F88A",
		createdAt: new Date("2026-04-18T13:20:00"),
		status: "shipped",
		totalCents: 71_800,
		items: [
			{
				id: "i-1",
				name: "Serra Circular 7.1/4 1800W",
				variant: "220V",
				quantity: 1,
				unitPriceCents: 65_900,
				categorySlug: "eletricas",
			},
			{
				id: "i-2",
				name: "Disco de Corte para Madeira 60 dentes",
				quantity: 1,
				unitPriceCents: 5900,
				categorySlug: "acessorios",
			},
		],
	},
	{
		id: "EMACH-2026-0415-91CC",
		createdAt: new Date("2026-04-15T08:45:00"),
		status: "shipped",
		totalCents: 18_990,
		items: [
			{
				id: "i-1",
				name: "Nível Laser Auto-nivelador 2 Linhas",
				quantity: 1,
				unitPriceCents: 18_990,
				categorySlug: "medicao",
			},
		],
	},
	{
		id: "EMACH-2026-0410-7B22",
		createdAt: new Date("2026-04-10T10:30:00"),
		status: "completed",
		totalCents: 18_990,
		reviewed: false,
		items: [
			{
				id: "i-1",
				name: "Jogo de Chaves Combinadas 12 peças",
				variant: "Aço cromo-vanádio",
				quantity: 1,
				unitPriceCents: 18_990,
				categorySlug: "manuais",
			},
		],
	},
	{
		id: "EMACH-2026-0402-22A1",
		createdAt: new Date("2026-04-02T15:18:00"),
		status: "completed",
		totalCents: 51_780,
		reviewed: true,
		items: [
			{
				id: "i-1",
				name: 'Alicate Universal 8" Isolado',
				variant: "Cabo bicolor",
				quantity: 1,
				unitPriceCents: 8990,
				categorySlug: "manuais",
			},
			{
				id: "i-2",
				name: "Martelo de Unha 27mm Cabo Madeira",
				quantity: 1,
				unitPriceCents: 4490,
				categorySlug: "manuais",
			},
			{
				id: "i-3",
				name: "Trena de Bolso 5m",
				quantity: 2,
				unitPriceCents: 1990,
				categorySlug: "medicao",
			},
			{
				id: "i-4",
				name: "Luva de Segurança Tricotada",
				variant: "Tamanho M",
				quantity: 4,
				unitPriceCents: 1290,
				categorySlug: "seguranca",
			},
			{
				id: "i-5",
				name: "Caixa Organizadora 22 divisórias",
				quantity: 1,
				unitPriceCents: 26_400,
				categorySlug: "acessorios",
			},
		],
	},
	{
		id: "EMACH-2026-0325-4811",
		createdAt: new Date("2026-03-25T17:55:00"),
		status: "completed",
		totalCents: 12_900,
		reviewed: false,
		items: [
			{
				id: "i-1",
				name: "Paquímetro Digital 150mm",
				variant: "Inox",
				quantity: 1,
				unitPriceCents: 12_900,
				categorySlug: "medicao",
			},
		],
	},
	{
		id: "EMACH-2026-0312-9A0E",
		createdAt: new Date("2026-03-12T11:40:00"),
		status: "completed",
		totalCents: 39_800,
		reviewed: true,
		items: [
			{
				id: "i-1",
				name: "Protetor Auricular Tipo Concha",
				quantity: 2,
				unitPriceCents: 5900,
				categorySlug: "seguranca",
			},
			{
				id: "i-2",
				name: "Capacete de Segurança Classe B",
				variant: "Branco",
				quantity: 4,
				unitPriceCents: 7000,
				categorySlug: "seguranca",
			},
		],
	},
	{
		id: "EMACH-2026-0228-50D9",
		createdAt: new Date("2026-02-28T14:08:00"),
		status: "completed",
		totalCents: 84_900,
		reviewed: true,
		items: [
			{
				id: "i-1",
				name: "Lixadeira Orbital 250W",
				variant: "220V",
				quantity: 1,
				unitPriceCents: 28_900,
				categorySlug: "eletricas",
			},
			{
				id: "i-2",
				name: "Kit de Lixas Orbital 50 unidades",
				quantity: 2,
				unitPriceCents: 6000,
				categorySlug: "acessorios",
			},
			{
				id: "i-3",
				name: "Aspirador de Pó Industrial 1400W",
				variant: "20L",
				quantity: 1,
				unitPriceCents: 44_000,
				categorySlug: "eletricas",
			},
		],
	},
	{
		id: "EMACH-2026-0205-C12B",
		createdAt: new Date("2026-02-05T19:22:00"),
		status: "cancelled",
		totalCents: 14_990,
		items: [
			{
				id: "i-1",
				name: "Serrote Manual 22 polegadas",
				variant: "Cabo ergonômico",
				quantity: 1,
				unitPriceCents: 14_990,
				categorySlug: "manuais",
			},
		],
	},
];

export function getOrdersByTab(tab: OrderTab): Order[] {
	if (tab === "all") {
		return mockOrders;
	}
	return mockOrders.filter((order) => order.status === tab);
}

export function getOrderCounts(): Record<OrderTab, number> {
	const counts: Record<OrderTab, number> = {
		all: mockOrders.length,
		pending_payment: 0,
		to_ship: 0,
		shipped: 0,
		completed: 0,
		cancelled: 0,
	};
	for (const order of mockOrders) {
		counts[order.status as OrderStatus] += 1;
	}
	return counts;
}
