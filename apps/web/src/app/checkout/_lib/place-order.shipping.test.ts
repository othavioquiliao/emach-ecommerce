import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/superfrete/quote", () => ({ quoteShipping: vi.fn() }));

import { quoteShipping } from "@/lib/superfrete/quote";
import { assertShippingQuoted } from "./place-order";

describe("assertShippingQuoted", () => {
	it("aceita shipping que bate com uma opção cotada", async () => {
		vi.mocked(quoteShipping).mockResolvedValue([
			{
				serviceId: 2,
				name: "SEDEX",
				company: "Correios",
				priceCents: 3596,
				deliveryDays: 1,
			},
		]);
		await expect(
			assertShippingQuoted({
				shippingCents: 3596,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).resolves.toBeUndefined();
	});

	it("rejeita shipping que não bate com nenhuma opção", async () => {
		vi.mocked(quoteShipping).mockResolvedValue([
			{
				serviceId: 2,
				name: "SEDEX",
				company: "Correios",
				priceCents: 3596,
				deliveryDays: 1,
			},
		]);
		await expect(
			assertShippingQuoted({
				shippingCents: 0,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).rejects.toThrow();
	});
});
