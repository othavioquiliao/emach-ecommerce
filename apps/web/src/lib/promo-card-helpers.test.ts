import { describe, expect, it } from "vitest";
import {
	computeDiscountPercent,
	computeSavings,
	selectPromoLayout,
} from "./promo-card-helpers";

describe("selectPromoLayout", () => {
	it("esconde a seção com menos de 2 produtos", () => {
		expect(selectPromoLayout(0)).toBe("hidden");
		expect(selectPromoLayout(1)).toBe("hidden");
	});
	it("usa 'pair' com 2 produtos", () => {
		expect(selectPromoLayout(2)).toBe("pair");
	});
	it("usa 'trio' com 3 produtos", () => {
		expect(selectPromoLayout(3)).toBe("trio");
	});
	it("usa 'grid' com 4 ou mais", () => {
		expect(selectPromoLayout(4)).toBe("grid");
		expect(selectPromoLayout(5)).toBe("grid");
	});
	it("trata contagem negativa como hidden", () => {
		expect(selectPromoLayout(-1)).toBe("hidden");
	});
});

describe("computeDiscountPercent", () => {
	it("calcula o percentual arredondado", () => {
		expect(computeDiscountPercent("559", "449")).toBe(20);
	});
	it("retorna null sem desconto", () => {
		expect(computeDiscountPercent("559", null)).toBeNull();
	});
	it("retorna null quando discounted >= price", () => {
		expect(computeDiscountPercent("100", "120")).toBeNull();
	});
});

describe("computeSavings", () => {
	it("calcula a economia em reais", () => {
		expect(computeSavings("559", "449")).toBe(110);
	});
	it("retorna null sem desconto", () => {
		expect(computeSavings("559", null)).toBeNull();
	});
	it("preserva centavos", () => {
		expect(computeSavings("100.50", "90.25")).toBe(10.25);
	});
	it("retorna null quando discounted é igual ao price", () => {
		expect(computeSavings("100", "100")).toBeNull();
	});
});
