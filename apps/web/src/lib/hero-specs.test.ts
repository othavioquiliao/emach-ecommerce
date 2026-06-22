import { describe, expect, it } from "vitest";
import { resolveHeroSpecs } from "./hero-specs";

describe("resolveHeroSpecs", () => {
	it("retorna [] quando specs é null", () => {
		expect(resolveHeroSpecs(null)).toEqual([]);
	});

	it("retorna [] quando specs é vazio", () => {
		expect(resolveHeroSpecs([])).toEqual([]);
	});

	it("preserva valores não-vazios na ordem", () => {
		expect(resolveHeroSpecs(["1200W", "800 RPM", "Ø125mm"])).toEqual([
			"1200W",
			"800 RPM",
			"Ø125mm",
		]);
	});

	it("faz trim e remove entradas vazias/whitespace", () => {
		expect(resolveHeroSpecs([" 1200W ", "", "   ", "800 RPM"])).toEqual([
			"1200W",
			"800 RPM",
		]);
	});

	it("retorna [] quando só há entradas vazias", () => {
		expect(resolveHeroSpecs(["", "  "])).toEqual([]);
	});
});
