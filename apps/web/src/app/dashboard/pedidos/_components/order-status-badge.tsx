import type { OrderStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";
import { BADGE_TONE_CLASS, ORDER_STATUS_BADGE } from "@/lib/orders/status";

export function OrderStatusBadge({
	status,
	className,
}: {
	className?: string;
	status: OrderStatus;
}) {
	const { label, tone } = ORDER_STATUS_BADGE[status];
	return (
		<span
			className={cn(
				"inline-flex items-center border px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em]",
				BADGE_TONE_CLASS[tone],
				tone === "muted" && "line-through",
				className
			)}
		>
			{label}
		</span>
	);
}
