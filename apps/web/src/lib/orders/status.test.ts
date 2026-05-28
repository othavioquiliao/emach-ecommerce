import { describe, expect, it } from "vitest";
import {
	countByTab,
	ORDER_STATUS_BADGE,
	ORDER_TABS,
	statusToTab,
} from "./status";

describe("statusToTab", () => {
	it("agrupa pagamento pendente e falho em 'a_pagar'", () => {
		expect(statusToTab("pending_payment")).toBe("a_pagar");
		expect(statusToTab("payment_failed")).toBe("a_pagar");
	});
	it("agrupa paid e preparing em 'em_preparacao'", () => {
		expect(statusToTab("paid")).toBe("em_preparacao");
		expect(statusToTab("preparing")).toBe("em_preparacao");
	});
	it("shipped -> a_caminho, delivered -> concluidos", () => {
		expect(statusToTab("shipped")).toBe("a_caminho");
		expect(statusToTab("delivered")).toBe("concluidos");
	});
	it("cancelados/devolvidos não têm tab própria (só 'all')", () => {
		expect(statusToTab("canceled")).toBe(null);
		expect(statusToTab("refunded")).toBe(null);
		expect(statusToTab("returned")).toBe(null);
	});
});

describe("ORDER_STATUS_BADGE", () => {
	it("cobre os 9 status com label e tone", () => {
		for (const s of [
			"pending_payment",
			"paid",
			"preparing",
			"shipped",
			"delivered",
			"canceled",
			"refunded",
			"payment_failed",
			"returned",
		] as const) {
			expect(ORDER_STATUS_BADGE[s].label).toBeTruthy();
			expect(ORDER_STATUS_BADGE[s].tone).toBeTruthy();
		}
	});
	it("payment_failed usa tone 'danger'", () => {
		expect(ORDER_STATUS_BADGE.payment_failed.tone).toBe("danger");
	});
});

describe("countByTab", () => {
	it("conta 'all' como total e agrupa por tab", () => {
		const counts = countByTab([
			"pending_payment",
			"paid",
			"shipped",
			"delivered",
			"canceled",
		]);
		expect(counts.all).toBe(5);
		expect(counts.a_pagar).toBe(1);
		expect(counts.em_preparacao).toBe(1);
		expect(counts.a_caminho).toBe(1);
		expect(counts.concluidos).toBe(1);
	});
});
