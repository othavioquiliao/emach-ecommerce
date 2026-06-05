import { beforeEach, describe, expect, it, vi } from "vitest";

import { quoteShipping } from "./quote";

const selectChain = {
	from: vi.fn().mockReturnThis(),
	where: vi.fn(),
};

vi.mock("@emach/db", () => ({ db: { select: vi.fn(() => selectChain) } }));
vi.mock("@/lib/origin-branch", () => ({
	getOriginBranchCep: vi.fn().mockResolvedValue("80010000"),
}));
vi.mock("./client", () => ({ fetchSuperFreteQuote: vi.fn() }));

import { fetchSuperFreteQuote } from "./client";

beforeEach(() => vi.clearAllMocks());

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

		expect(result).toEqual([
			{
				serviceId: 2,
				name: "SEDEX",
				company: "Correios",
				priceCents: 3596,
				deliveryDays: 1,
			},
		]);
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
});
