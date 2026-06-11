import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { StatusStepper } from "@/app/dashboard/_components/status-stepper";
import { emachButtonVariants } from "@/components/emach-button";
import { fmtNumericBRL } from "@/lib/format";
import type { RefundListItem } from "@/lib/refunds/queries";
import { REFUND_REASON_LABEL } from "@/lib/refunds/status";
import { OrderRefundBlock } from "../../pedidos/[id]/_components/order-refund-block";
import { RefundStatusBadge } from "./refund-status-badge";
import { buildRefundSteps } from "./refund-steps";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function totalLabelFor(isRejected: boolean, isRefunded: boolean): string {
	if (isRejected) {
		return "Valor solicitado";
	}
	if (isRefunded) {
		return "Reembolsado";
	}
	return "A reembolsar";
}

export function RefundCard({ refund }: { refund: RefundListItem }) {
	const detailsHref = `/dashboard/pedidos/${refund.orderId}` as Route;
	const isRefunded = refund.status === "refunded";
	const isRejected = refund.status === "rejected";

	const totalLabel = totalLabelFor(isRejected, isRefunded);
	const reasonText =
		refund.reasonText || REFUND_REASON_LABEL[refund.reasonCategory];

	return (
		<article
			className={cn(
				"mb-3.5 border border-black bg-near-black text-white",
				isRejected && "opacity-85"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-white/12 border-b px-[18px] py-3.5">
				<MetaPair label="Devolução" value={`#${refund.id.slice(0, 8)}`} />
				<MetaPair label="Pedido" value={`#${refund.orderNumber}`} />
				<MetaPair
					label="Solicitada em"
					value={DATE_FMT.format(refund.requestedAt)}
				/>
				<div className="flex-1" />
				<RefundStatusBadge status={refund.status} tone="dark" />
			</header>

			{refund.preview.map((item, idx) => (
				<div
					className={cn(
						"flex items-center gap-3.5 px-[18px] py-3.5",
						idx > 0 && "border-white/10 border-t"
					)}
					key={item.id}
				>
					<ItemThumb alt={item.name} url={item.imageUrl} />
					<div className="min-w-0 flex-1">
						<div className="truncate font-semibold text-[15px] text-white">
							{item.name}
						</div>
						<div className="mt-1 text-[13px] text-white/55">
							{[item.voltage, `Qtd: ${item.quantity}`]
								.filter(Boolean)
								.join(" · ")}
						</div>
					</div>
					<div className="min-w-[90px] text-right font-semibold text-[15px] text-white">
						{fmtNumericBRL(item.unitPrice)}
					</div>
				</div>
			))}

			<div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-white/12 border-t px-[18px] py-3">
				<span className="font-display font-semibold text-[12px] text-white/55 uppercase tracking-[0.12em]">
					Motivo
				</span>
				<span className="text-[14px] text-white/80 leading-relaxed">
					{reasonText}
				</span>
			</div>

			{isRejected ? (
				<OrderRefundBlock
					refund={{
						status: refund.status,
						rejectionReason: refund.rejectionReason,
						resolvedAt: refund.resolvedAt,
					}}
					variant="card"
				/>
			) : (
				<StatusStepper steps={buildRefundSteps(refund.status)} tone="dark" />
			)}

			<div className="flex items-center justify-between border-white/12 border-t px-[18px] py-3.5">
				<span className="font-display font-semibold text-[12px] text-white/55 uppercase tracking-[0.12em]">
					{totalLabel}
				</span>
				<span
					className={cn(
						"font-bold text-[20px]",
						isRefunded && "text-success-on-dark",
						isRejected && "text-white/40 line-through",
						!(isRefunded || isRejected) && "text-white"
					)}
				>
					{fmtNumericBRL(refund.amount)}
				</span>
			</div>

			<footer className="flex justify-end gap-2 border-white/12 border-t px-[18px] py-2.5">
				<Link
					className={emachButtonVariants({
						variant: "outline-light",
						size: "sm",
					})}
					href={detailsHref}
				>
					Ver pedido
				</Link>
			</footer>
		</article>
	);
}

function MetaPair({ label, value }: { label: string; value: string }) {
	return (
		<>
			<span className="font-display font-semibold text-[12px] text-gray-50 uppercase tracking-[0.12em]">
				{label}
			</span>
			<span className="font-semibold text-[13px] text-white">{value}</span>
		</>
	);
}

function ItemThumb({ url, alt }: { url: string | null; alt: string }) {
	if (!url) {
		return (
			<div className="emach-bg-placeholder flex h-[54px] w-[54px] shrink-0 items-center justify-center">
				<Package
					className="h-7 w-7 text-cinema-2 opacity-80"
					strokeWidth={1.2}
				/>
			</div>
		);
	}
	return (
		<Image
			alt={alt}
			className="h-[54px] w-[54px] shrink-0 object-cover"
			height={54}
			src={url}
			width={54}
		/>
	);
}
