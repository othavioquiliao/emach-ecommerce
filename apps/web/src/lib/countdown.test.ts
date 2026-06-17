// apps/web/src/lib/countdown.test.ts
import { describe, expect, it } from "vitest";
import { formatCountdown } from "./countdown";

describe("formatCountdown", () => {
	const now = Date.UTC(2026, 0, 1, 0, 0, 0); // 2026-01-01T00:00:00Z

	it("formata dias/horas/min/seg restantes", () => {
		const target = new Date(now + (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000);
		expect(formatCountdown(target, now)).toBe("2d 3h 4m 5s");
	});

	it("zera os segmentos quando faltam menos de 1s", () => {
		const target = new Date(now + 500);
		expect(formatCountdown(target, now)).toBe("0d 0h 0m 0s");
	});

	it("retorna null quando já expirou", () => {
		expect(formatCountdown(new Date(now - 1000), now)).toBeNull();
	});

	it("retorna null no instante exato do alvo", () => {
		expect(formatCountdown(new Date(now), now)).toBeNull();
	});
});
