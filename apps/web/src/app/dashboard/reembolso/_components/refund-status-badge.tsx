import type { RefundStatus } from "@emach/db/schema/orders";
import {
	AccountBadge,
	type BadgeFamily,
} from "@/app/dashboard/_components/account-badge";
import {
	REFUND_STATUS_BADGE,
	type RefundBadgeTone,
} from "@/lib/refunds/status";

const TONE_TO_FAMILY: Record<RefundBadgeTone, BadgeFamily> = {
	info: "blue",
	warning: "amber",
	progress: "blue",
	success: "green",
	muted: "gray",
};

export function RefundStatusBadge({
	status,
	tone = "light",
}: {
	status: RefundStatus;
	tone?: "light" | "dark";
}) {
	const { label, tone: badgeTone } = REFUND_STATUS_BADGE[status];
	return (
		<AccountBadge family={TONE_TO_FAMILY[badgeTone]} tone={tone}>
			{label}
		</AccountBadge>
	);
}
