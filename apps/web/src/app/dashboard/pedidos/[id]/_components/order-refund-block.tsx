import type { RefundStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

interface RefundSummary {
	rejectionReason: string | null;
	resolvedAt: Date | null;
	status: RefundStatus;
}

interface OrderRefundBlockProps {
	refund: RefundSummary;
	variant?: "card" | "page";
}

export function OrderRefundBlock({
	refund,
	variant = "card",
}: OrderRefundBlockProps) {
	if (refund.status === "refunded") {
		const date = refund.resolvedAt ? DATE_FMT.format(refund.resolvedAt) : "—";
		return (
			<Row
				bg="bg-gray-10"
				label="Reembolso"
				text={
					<>
						Estornado em <strong className="text-near-black">{date}</strong>
					</>
				}
				variant={variant}
			/>
		);
	}

	if (refund.status === "rejected") {
		return (
			<Row
				bg="bg-[#FFF5F5]"
				label="Decisão"
				text={refund.rejectionReason ?? "Solicitação recusada."}
				variant={variant}
			/>
		);
	}

	// requested / under_review / approved
	const text =
		refund.status === "approved"
			? "Aprovada · estorno em processamento"
			: "Em andamento";
	return (
		<Row bg="bg-gray-10" label="Devolução" text={text} variant={variant} />
	);
}

function Row({
	label,
	text,
	bg,
	variant,
}: {
	bg: string;
	label: string;
	text: React.ReactNode;
	variant: "card" | "page";
}) {
	const padding = variant === "page" ? "px-[18px] py-4" : "px-[18px] py-3";
	return (
		<div
			className={cn(
				"flex flex-wrap items-baseline gap-x-6 gap-y-1 border-border border-t",
				bg,
				padding
			)}
		>
			<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
				{label}
			</span>
			<span className="text-[13px] text-gray-60 leading-relaxed">{text}</span>
		</div>
	);
}
