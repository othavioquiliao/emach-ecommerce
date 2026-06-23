import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/shipping/quote", () => ({ quoteShipping: vi.fn() }));

import { quoteShipping } from "@/lib/shipping/quote";
import { assertShippingQuoted } from "./place-order";

describe("assertShippingQuoted", () => {
	it("aceita shipping que bate com uma opção cotada (verificado)", async () => {
		vi.mocked(quoteShipping).mockResolvedValue({
			negotiate: false,
			options: [
				{
					carrierId: "carrier-1",
					name: "SEDEX",
					company: "Correios",
					priceCents: 3596,
					deliveryDays: 1,
				},
			],
		});
		await expect(
			assertShippingQuoted({
				shippingCents: 3596,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).resolves.toEqual({ shippingUnverified: false });
	});

	it("fail-open: API indisponível não bloqueia, marca shippingUnverified (#97)", async () => {
		vi.mocked(quoteShipping).mockRejectedValue(new Error("Shipping API 503"));
		await expect(
			assertShippingQuoted({
				shippingCents: 9999,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).resolves.toEqual({ shippingUnverified: true });
	});

	it("rejeita shipping que não bate com nenhuma opção", async () => {
		vi.mocked(quoteShipping).mockResolvedValue({
			negotiate: false,
			options: [
				{
					carrierId: "carrier-1",
					name: "SEDEX",
					company: "Correios",
					priceCents: 3596,
					deliveryDays: 1,
				},
			],
		});
		await expect(
			assertShippingQuoted({
				shippingCents: 0,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).rejects.toThrow();
	});

	it("rejeita quando o frete é a combinar (item pesado sem valor)", async () => {
		vi.mocked(quoteShipping).mockResolvedValue({
			negotiate: true,
			options: [],
		});
		await expect(
			assertShippingQuoted({
				shippingCents: 1000,
				destinationCep: "01310100",
				items: [{ toolId: "t1", quantity: 1 }],
			})
		).rejects.toThrow();
	});
});
