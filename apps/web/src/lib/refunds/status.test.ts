import { describe, expect, it } from "vitest";
import {
	countRefundsByTab,
	REFUND_REASON_OPTIONS,
	REFUND_STATUS_BADGE,
	statusToRefundTab,
} from "./status";

describe("statusToRefundTab", () => {
	it("agrupa requested/under_review/approved em 'em_andamento'", () => {
		expect(statusToRefundTab("requested")).toBe("em_andamento");
		expect(statusToRefundTab("under_review")).toBe("em_andamento");
		expect(statusToRefundTab("approved")).toBe("em_andamento");
	});

	it("agrupa refunded/rejected em finalizado", () => {
		expect(statusToRefundTab("refunded")).toBe("finalizado");
		expect(statusToRefundTab("rejected")).toBe("finalizado");
	});
});

describe("countRefundsByTab", () => {
	it("conta por tab", () => {
		const counts = countRefundsByTab([
			"requested",
			"approved",
			"refunded",
			"rejected",
			"rejected",
		]);
		expect(counts.em_andamento).toBe(2);
		expect(counts.finalizado).toBe(3);
	});

	it("zera com lista vazia", () => {
		expect(countRefundsByTab([])).toEqual({ em_andamento: 0, finalizado: 0 });
	});
});

describe("REFUND_STATUS_BADGE / REFUND_REASON_OPTIONS", () => {
	it("cobre os 5 status com label e tone", () => {
		for (const s of [
			"requested",
			"under_review",
			"approved",
			"refunded",
			"rejected",
		] as const) {
			expect(REFUND_STATUS_BADGE[s].label.length).toBeGreaterThan(0);
			expect(REFUND_STATUS_BADGE[s].tone.length).toBeGreaterThan(0);
		}
		// spot-check de valor: pega swap acidental de label
		expect(REFUND_STATUS_BADGE.requested.label).toBe("Solicitado");
		expect(REFUND_STATUS_BADGE.rejected.label).toBe("Recusado");
	});

	it("expõe 5 opções de motivo na ordem do select", () => {
		expect(REFUND_REASON_OPTIONS).toHaveLength(5);
		expect(REFUND_REASON_OPTIONS[0]).toBe("defeito");
		expect(REFUND_REASON_OPTIONS.at(-1)).toBe("outro");
	});
});
