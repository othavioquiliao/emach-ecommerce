import { cn } from "@emach/ui/lib/utils";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../../_lib/types";

const VARIANT: Record<OrderStatus, string> = {
	pending_payment: "text-emach-red border-emach-red",
	to_ship: "text-success border-success",
	shipped: "text-near-black border-near-black",
	completed: "text-gray-60 border-border",
	cancelled: "text-gray-50 border-border bg-gray-10 line-through",
};

interface OrderStatusBadgeProps {
	className?: string;
	status: OrderStatus;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center border px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em]",
				VARIANT[status],
				className
			)}
		>
			{ORDER_STATUS_LABEL[status]}
		</span>
	);
}
