import { describe, expect, it } from "vitest";
import { effectiveAutoDiscountCents } from "./promotions";

describe("effectiveAutoDiscountCents", () => {
	it("aplica percentual", () => {
		expect(effectiveAutoDiscountCents(10_000, "percent", "10.00")).toBe(9000);
	});
	it("aplica desconto fixo em reais", () => {
		expect(effectiveAutoDiscountCents(10_000, "fixed", "30.00")).toBe(7000);
	});
	it("faz clamp do fixo em zero", () => {
		expect(effectiveAutoDiscountCents(2000, "fixed", "30.00")).toBe(0);
	});
	it("ignora valor inválido ou não-positivo (retorna base)", () => {
		expect(effectiveAutoDiscountCents(10_000, "percent", "0")).toBe(10_000);
		expect(effectiveAutoDiscountCents(10_000, "percent", "abc")).toBe(10_000);
	});
});
