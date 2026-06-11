import { describe, expect, it } from "vitest";
import { fmtSpecNumber, fmtSpecRange } from "./format";

describe("fmtSpecNumber", () => {
	it("remove zeros à direita de numeric do Postgres", () => {
		expect(fmtSpecNumber("650.0000", "W")).toBe("650 W");
	});
	it("mantém casas decimais significativas com vírgula PT-BR", () => {
		expect(fmtSpecNumber("1.8000", "kg")).toBe("1,8 kg");
	});
	it("agrupa milhares", () => {
		expect(fmtSpecNumber("44800.0000", "")).toBe("44.800");
	});
	it("retorna travessão quando null", () => {
		expect(fmtSpecNumber(null, "W")).toBe("—");
	});
});

describe("fmtSpecRange", () => {
	it("monta faixa min–max", () => {
		expect(fmtSpecRange("100.0000", "2800.0000", "RPM")).toBe(
			"100 – 2.800 RPM"
		);
	});
	it("usa 'até' quando min é zero", () => {
		expect(fmtSpecRange("0.0000", "2800.0000", "RPM")).toBe("até 2.800 RPM");
	});
	it("sem max mostra só o min", () => {
		expect(fmtSpecRange("650.0000", null, "W")).toBe("650 W");
	});
});
