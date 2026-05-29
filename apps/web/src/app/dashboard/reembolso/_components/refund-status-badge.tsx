import type { RefundStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";
import {
	REFUND_BADGE_TONE_CLASS,
	REFUND_STATUS_BADGE,
} from "@/lib/refunds/status";

interface RefundStatusBadgeProps {
	className?: string;
	status: RefundStatus;
}

export function RefundStatusBadge({
	status,
	className,
}: RefundStatusBadgeProps) {
	const { label, tone } = REFUND_STATUS_BADGE[status];
	return (
		<span
			className={cn(
				"inline-flex items-center border px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em]",
				REFUND_BADGE_TONE_CLASS[tone],
				className
			)}
		>
			{label}
		</span>
	);
}
