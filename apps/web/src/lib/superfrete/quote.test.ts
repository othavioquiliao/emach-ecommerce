import { beforeEach, describe, expect, it, vi } from "vitest";

import { quoteShipping } from "./quote";

const selectChain = {
	from: vi.fn().mockReturnThis(),
	where: vi.fn(),
};

vi.mock("@emach/db", () => ({ db: { select: vi.fn(() => selectChain) } }));
vi.mock("@emach/db/queries/store-settings", () => ({
	getShippingSettings: vi.fn(),
}));
vi.mock("@/lib/origin-branch", () => ({
	getOriginBranchCep: vi.fn().mockResolvedValue("80010000"),
}));
vi.mock("./client", () => ({ fetchSuperFreteQuote: vi.fn() }));

import { getShippingSettings } from "@emach/db/queries/store-settings";
import { fetchSuperFreteQuote } from "./client";

const DEFAULT_SETTINGS = {
	originBranchId: null,
	originCep: null,
	insurancePolicy: "none" as const,
	insuranceCapAmount: 3000,
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(getShippingSettings).mockResolvedValue(DEFAULT_SETTINGS);
});

describe("quoteShipping", () => {
	it("monta products do DB e normaliza só serviços com price", async () => {
		selectChain.where.mockResolvedValue([
			{
				id: "tool-1",
				weightKg: "1.500",
				lengthCm: "20.00",
				widthCm: "15.00",
				heightCm: "10.00",
			},
		]);
		vi.mocked(fetchSuperFreteQuote).mockResolvedValue([
			{
				id: 1,
				name: "PAC",
				error: "444",
				company: { id: 1, name: "Correios" },
			},
			{
				id: 2,
				name: "SEDEX",
				price: 35.96,
				delivery_time: 1,
				company: { id: 1, name: "Correios" },
			},
		]);

		const result = await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-1", quantity: 2 }],
		});

		expect(result).toEqual({
			negotiate: false,
			options: [
				{
					serviceId: 2,
					name: "SEDEX",
					company: "Correios",
					priceCents: 3596,
					deliveryDays: 1,
				},
			],
		});
		const body = vi.mocked(fetchSuperFreteQuote).mock.calls[0][0];
		expect(body.from.postal_code).toBe("80010000");
		expect(body.products[0]).toMatchObject({
			weight: 1.5,
			height: 10,
			width: 15,
			length: 20,
			quantity: 2,
		});
	});

	it("lança se um toolId não existe no DB", async () => {
		selectChain.where.mockResolvedValue([]);
		await expect(
			quoteShipping({
				destinationCep: "01310100",
				items: [{ toolId: "missing", quantity: 1 }],
			})
		).rejects.toThrow();
	});

	it("usa o CEP de origem do store_settings quando configurado", async () => {
		vi.mocked(getShippingSettings).mockResolvedValue({
			...DEFAULT_SETTINGS,
			originBranchId: "branch-1",
			originCep: "01001000",
		});
		selectChain.where.mockResolvedValue([
			{
				id: "tool-1",
				weightKg: "1.000",
				lengthCm: "10.00",
				widthCm: "10.00",
				heightCm: "10.00",
			},
		]);
		vi.mocked(fetchSuperFreteQuote).mockResolvedValue([]);

		await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-1", quantity: 1 }],
		});

		const body = vi.mocked(fetchSuperFreteQuote).mock.calls[0][0];
		expect(body.from.postal_code).toBe("01001000");
	});

	it("sem seguro quando a política é none", async () => {
		selectChain.where.mockResolvedValue([
			{
				id: "tool-1",
				weightKg: "1.000",
				lengthCm: "10.00",
				widthCm: "10.00",
				heightCm: "10.00",
			},
		]);
		vi.mocked(fetchSuperFreteQuote).mockResolvedValue([]);

		await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-1", quantity: 1 }],
			declaredValueCents: 50_000,
		});

		const body = vi.mocked(fetchSuperFreteQuote).mock.calls[0][0];
		expect(body.options).toEqual({
			insurance_value: 0,
			use_insurance_value: false,
		});
	});

	it("declara o valor do carrinho até o teto quando a política é cart_value", async () => {
		vi.mocked(getShippingSettings).mockResolvedValue({
			...DEFAULT_SETTINGS,
			insurancePolicy: "cart_value",
			insuranceCapAmount: 3000,
		});
		selectChain.where.mockResolvedValue([
			{
				id: "tool-1",
				weightKg: "1.000",
				lengthCm: "10.00",
				widthCm: "10.00",
				heightCm: "10.00",
			},
		]);
		vi.mocked(fetchSuperFreteQuote).mockResolvedValue([]);

		// Carrinho R$ 500,00 (abaixo do teto R$ 3000) → declara 500.
		await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-1", quantity: 1 }],
			declaredValueCents: 50_000,
		});
		expect(vi.mocked(fetchSuperFreteQuote).mock.calls[0][0].options).toEqual({
			insurance_value: 500,
			use_insurance_value: true,
		});

		// Carrinho R$ 5.000,00 (acima do teto) → declara o teto 3000.
		vi.mocked(fetchSuperFreteQuote).mockClear();
		await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-1", quantity: 1 }],
			declaredValueCents: 500_000,
		});
		expect(vi.mocked(fetchSuperFreteQuote).mock.calls[0][0].options).toEqual({
			insurance_value: 3000,
			use_insurance_value: true,
		});
	});

	it("retorna negotiate quando há item pesado sem valor de frete cadastrado", async () => {
		selectChain.where.mockResolvedValue([
			{
				id: "tool-pesado",
				weightKg: "45.000",
				lengthCm: "60.00",
				widthCm: "40.00",
				heightCm: "40.00",
				overweightShippingAmount: null,
			},
		]);

		const result = await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-pesado", quantity: 1 }],
		});

		expect(result).toEqual({ options: [], negotiate: true });
		expect(fetchSuperFreteQuote).not.toHaveBeenCalled();
	});

	it("carrinho só com item pesado → opção sintética com o frete fixo × qtd", async () => {
		selectChain.where.mockResolvedValue([
			{
				id: "tool-pesado",
				weightKg: "45.000",
				lengthCm: "60.00",
				widthCm: "40.00",
				heightCm: "40.00",
				overweightShippingAmount: "150.00",
			},
		]);

		const result = await quoteShipping({
			destinationCep: "01310100",
			items: [{ toolId: "tool-pesado", quantity: 2 }],
		});

		expect(result.negotiate).toBe(false);
		expect(result.options).toEqual([
			{
				serviceId: -1,
				name: "Frete de itens especiais",
				company: "",
				priceCents: 30_000,
				deliveryDays: 0,
			},
		]);
		expect(fetchSuperFreteQuote).not.toHaveBeenCalled();
	});

	it("carrinho misto → cotação dos normais + frete fixo do pesado somado", async () => {
		selectChain.where.mockResolvedValue([
			{
				id: "tool-normal",
				weightKg: "2.000",
				lengthCm: "20.00",
				widthCm: "15.00",
				heightCm: "10.00",
				overweightShippingAmount: null,
			},
			{
				id: "tool-pesado",
				weightKg: "45.000",
				lengthCm: "60.00",
				widthCm: "40.00",
				heightCm: "40.00",
				overweightShippingAmount: "150.00",
			},
		]);
		vi.mocked(fetchSuperFreteQuote).mockResolvedValue([
			{
				id: 2,
				name: "SEDEX",
				price: 35.96,
				delivery_time: 1,
				company: { id: 1, name: "Correios" },
			},
		]);

		const result = await quoteShipping({
			destinationCep: "01310100",
			items: [
				{ toolId: "tool-normal", quantity: 1 },
				{ toolId: "tool-pesado", quantity: 1 },
			],
		});

		// Só o item normal vai ao SuperFrete; o pesado é tratado à parte.
		const body = vi.mocked(fetchSuperFreteQuote).mock.calls[0][0];
		expect(body.products).toHaveLength(1);
		expect(body.products[0]).toMatchObject({ weight: 2 });
		// 3596 (SEDEX) + 15000 (overweight) = 18596.
		expect(result.options).toEqual([
			{
				serviceId: 2,
				name: "SEDEX",
				company: "Correios",
				priceCents: 18_596,
				deliveryDays: 1,
			},
		]);
	});
});
