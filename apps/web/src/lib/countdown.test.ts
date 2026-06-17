import { describe, expect, it } from "vitest";
import { formatCountdown } from "./countdown";

describe("formatCountdown", () => {
	it("zera quando o alvo já passou", () => {
		expect(formatCountdown(-1000)).toEqual({
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			done: true,
		});
	});

	it("decompõe milissegundos em d/h/m/s", () => {
		const ms = 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5 * 1000; // 2d 3h 4m 5s
		expect(formatCountdown(ms)).toEqual({
			days: 2,
			hours: 3,
			minutes: 4,
			seconds: 5,
			done: false,
		});
	});

	it("trata o zero exato como concluído", () => {
		expect(formatCountdown(0)).toEqual({
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			done: true,
		});
	});
});
