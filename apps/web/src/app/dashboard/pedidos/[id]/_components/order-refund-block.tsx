import { cn } from "@emach/ui/lib/utils";
import {
	REFUND_METHOD_LABEL,
	REFUND_STATUS_BY_TAB,
	type Refund,
} from "../../../_lib/types";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

interface OrderRefundBlockProps {
	refund: Refund;
	variant?: "card" | "page";
}

export function OrderRefundBlock({
	refund,
	variant = "card",
}: OrderRefundBlockProps) {
	const isOpen = REFUND_STATUS_BY_TAB.open.includes(refund.status);
	const isReembolsado = refund.status === "reembolsado";
	const isRecusado = refund.status === "recusado";

	if (isOpen) {
		return (
			<Row
				bg="bg-white"
				label="Devolução"
				text={`Em andamento · #${refund.id}`}
				variant={variant}
			/>
		);
	}

	if (isReembolsado) {
		const r = refund.resolution;
		const date = r?.refundedAt ? DATE_FMT.format(r.refundedAt) : "—";
		const method = r?.method ? REFUND_METHOD_LABEL[r.method] : "—";
		const eta = r?.etaLabel ? ` · ${r.etaLabel}` : "";
		return (
			<Row
				bg="bg-[#fafafa]"
				label="Reembolso"
				text={
					<>
						Estornado em <strong className="text-near-black">{date}</strong> ·{" "}
						{method}
						{eta}
					</>
				}
				variant={variant}
			/>
		);
	}

	if (isRecusado) {
		return (
			<Row
				bg="bg-[#FFF5F5]"
				label="Decisão"
				text={refund.resolution?.deniedReason ?? "Solicitação recusada."}
				variant={variant}
			/>
		);
	}

	return null;
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
