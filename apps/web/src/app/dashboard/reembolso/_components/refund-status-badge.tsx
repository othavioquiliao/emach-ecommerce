import { cn } from "@emach/ui/lib/utils";
import { REFUND_STATUS_LABEL, type RefundStatus } from "../../_lib/types";

const VARIANT: Record<RefundStatus, string> = {
	solicitado: "text-link-hover border-link-hover",
	em_analise: "text-[#B45309] border-[#B45309]",
	reembolsado: "text-success border-success",
	recusado: "text-gray-50 border-border bg-gray-10",
};

interface RefundStatusBadgeProps {
	className?: string;
	status: RefundStatus;
}

export function RefundStatusBadge({
	status,
	className,
}: RefundStatusBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center border px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em]",
				VARIANT[status],
				className
			)}
		>
			{REFUND_STATUS_LABEL[status]}
		</span>
	);
}
