import type { RefundStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
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
				label="Reembolso"
				text={
					<>
						Estornado em <strong className="text-white">{date}</strong>
					</>
				}
				variant={variant}
			/>
		);
	}

	if (refund.status === "rejected") {
		return (
			<Row
				bg="bg-emach-red/15"
				label="Decisão"
				text={refund.rejectionReason ?? "Solicitação recusada."}
				tone="danger"
				variant={variant}
			/>
		);
	}

	// requested / under_review / approved
	const text =
		refund.status === "approved"
			? "Aprovada · estorno em processamento"
			: "Em andamento";
	return <Row label="Devolução" text={text} variant={variant} />;
}

function Row({
	label,
	text,
	bg,
	variant,
	tone = "default",
}: {
	bg?: string;
	label: string;
	text: React.ReactNode;
	tone?: "default" | "danger";
	variant: "card" | "page";
}) {
	const padding = variant === "page" ? "px-[18px] py-4" : "px-[18px] py-3";
	return (
		<div
			className={cn(
				"flex flex-wrap items-baseline gap-x-6 gap-y-1 border-white/12 border-t",
				bg,
				padding
			)}
		>
			<span
				className={cn(
					"font-display font-semibold text-[11px] uppercase tracking-[0.14em]",
					tone === "danger" ? "text-emach-red-on-dark" : "text-gray-50"
				)}
			>
				{label}
			</span>
			<span className="text-[13px] text-white/80 leading-relaxed">{text}</span>
		</div>
	);
}
