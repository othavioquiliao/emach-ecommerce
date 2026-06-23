import { describe, expect, it } from "vitest";
import { mapQuoteResult } from "./map";

describe("mapQuoteResult", () => {
	it("mapeia options para ShippingOption ordenado por preço", () => {
		const out = mapQuoteResult({
			options: [
				{ carrierId: "c2", carrierName: "Beta", amount: 50.5, deliveryDays: 3 },
				{
					carrierId: "c1",
					carrierName: "Alfa",
					amount: 30,
					deliveryDays: null,
				},
			],
			unquotable: [],
		});
		expect(out.negotiate).toBe(false);
		expect(out.options).toEqual([
			{
				carrierId: "c1",
				name: "Alfa",
				company: "Alfa",
				priceCents: 3000,
				deliveryDays: 0,
			},
			{
				carrierId: "c2",
				name: "Beta",
				company: "Beta",
				priceCents: 5050,
				deliveryDays: 3,
			},
		]);
	});

	it("negotiate=true quando não há options", () => {
		const out = mapQuoteResult({
			options: [],
			unquotable: [
				{ carrierId: "c1", carrierName: "Alfa", reason: "out_of_catalog" },
			],
		});
		expect(out).toEqual({ negotiate: true, options: [] });
	});
});
