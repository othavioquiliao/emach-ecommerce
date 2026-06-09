import type { RefundStatus } from "@emach/db/schema/orders";
import { Banknote, CircleCheck, FileText, Search } from "lucide-react";
import type { StepperStep } from "@/app/dashboard/_components/status-stepper";
import {
	REFUND_STEPPER_PHASES,
	type RefundStepperPhase,
	refundStepDisplayState,
} from "@/lib/refunds/status";

const PHASE_META: Record<
	RefundStepperPhase,
	{ Icon: StepperStep["Icon"]; label: string }
> = {
	requested: { Icon: FileText, label: "Solicitado" },
	under_review: { Icon: Search, label: "Em análise" },
	approved: { Icon: CircleCheck, label: "Aprovado" },
	refunded: { Icon: Banknote, label: "Reembolsado" },
};

export function buildRefundSteps(status: RefundStatus): StepperStep[] {
	return REFUND_STEPPER_PHASES.map((phase) => ({
		key: phase,
		label: PHASE_META[phase].label,
		Icon: PHASE_META[phase].Icon,
		state: refundStepDisplayState(status, phase),
	}));
}
