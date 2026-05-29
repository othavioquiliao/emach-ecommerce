import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { emachButtonVariants } from "@/components/emach-button";
import { fmtNumericBRL } from "@/lib/format";
import type { RefundListItem } from "@/lib/refunds/queries";
import { REFUND_REASON_LABEL } from "@/lib/refunds/status";
import { OrderRefundBlock } from "../../pedidos/[id]/_components/order-refund-block";
import { RefundStatusBadge } from "./refund-status-badge";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function MetaPair({ label, value }: { label: string; value: string }) {
	return (
		<>
			<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
				{label}
			</span>
			<span className="font-semibold text-[12px] text-near-black">{value}</span>
		</>
	);
}

function ItemThumb({ url, alt }: { url: string | null; alt: string }) {
	if (!url) {
		return (
			<div className="emach-bg-placeholder flex h-16 w-16 shrink-0 items-center justify-center">
				<Package
					className="h-8 w-8 text-cinema-2 opacity-80"
					strokeWidth={1.2}
				/>
			</div>
		);
	}
	return (
		<Image
			alt={alt}
			className="h-16 w-16 shrink-0 object-cover"
			height={64}
			src={url}
			width={64}
		/>
	);
}

export function RefundCard({ refund }: { refund: RefundListItem }) {
	const detailsHref = `/dashboard/pedidos/${refund.orderId}` as Route;
	const isRefunded = refund.status === "refunded";
	const isRejected = refund.status === "rejected";

	const totalLabel = isRejected ? "Valor solicitado" : "A reembolsar";
	const totalClass = cn(
		"font-bold text-[18px]",
		isRefunded && "text-success",
		isRejected && "text-gray-60 line-through"
	);
	const reasonText =
		refund.reasonText || REFUND_REASON_LABEL[refund.reasonCategory];

	return (
		<article
			className={cn(
				"mb-3.5 border border-border bg-white",
				isRejected && "opacity-85"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-border border-b bg-gray-10 px-[18px] py-3">
				<MetaPair label="Devolução" value={`#${refund.id.slice(0, 8)}`} />
				<MetaPair label="Pedido" value={`#${refund.orderNumber}`} />
				<MetaPair
					label="Solicitada em"
					value={DATE_FMT.format(refund.requestedAt)}
				/>
				<div className="flex-1" />
				<RefundStatusBadge status={refund.status} />
			</header>

			<div>
				{refund.preview.map((item, idx) => (
					<div
						className={cn(
							"flex items-center gap-3.5 px-[18px] py-3.5",
							idx > 0 && "border-border/50 border-t"
						)}
						key={item.id}
					>
						<ItemThumb alt={item.name} url={item.imageUrl} />
						<div className="min-w-0 flex-1">
							<div className="truncate font-semibold text-[13px] text-near-black">
								{item.name}
							</div>
							{item.voltage ? (
								<div className="text-[11px] text-gray-60">{item.voltage}</div>
							) : null}
							<div className="mt-0.5 text-[11px] text-gray-50">
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="min-w-[90px] text-right font-semibold text-[13px] text-near-black">
							{fmtNumericBRL(item.unitPrice)}
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-border border-t bg-white px-[18px] py-3">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					Motivo
				</span>
				<span className="text-[13px] text-gray-60 leading-relaxed">
					{reasonText}
				</span>
			</div>

			<OrderRefundBlock
				refund={{
					status: refund.status,
					rejectionReason: refund.rejectionReason,
					resolvedAt: refund.resolvedAt,
				}}
				variant="card"
			/>

			<div className="flex items-center justify-between border-border border-t bg-[#fafafa] px-[18px] py-3.5">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{totalLabel}
				</span>
				<span className={totalClass}>{fmtNumericBRL(refund.amount)}</span>
			</div>

			<footer className="flex justify-end gap-2 border-border border-t bg-white px-[18px] py-2.5">
				<Link
					className={emachButtonVariants({ variant: "outline", size: "sm" })}
					href={detailsHref}
				>
					Ver pedido
				</Link>
			</footer>
		</article>
	);
}
