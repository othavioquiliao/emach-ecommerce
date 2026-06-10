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

export function RefundCard({ refund }: { refund: RefundListItem }) {
	const detailsHref = `/dashboard/pedidos/${refund.orderId}` as Route;
	const isRefunded = refund.status === "refunded";
	const isRejected = refund.status === "rejected";
	// Todos os cards escuros, menos o recusado — que fica claro por causa do
	// bloco de recusa (OrderRefundBlock) em fundo claro.
	const dark = !isRejected;

	const totalLabel = isRejected
		? "Valor solicitado"
		: isRefunded
			? "Reembolsado"
			: "A reembolsar";
	const reasonText =
		refund.reasonText || REFUND_REASON_LABEL[refund.reasonCategory];

	return (
		<article
			className={cn(
				"mb-3.5 border",
				dark
					? "border-black bg-near-black text-white"
					: "border-border bg-gray-10",
				isRejected && "opacity-85"
			)}
		>
			<header
				className={cn(
					"flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-[18px] py-3.5",
					dark ? "border-white/12" : "border-border"
				)}
			>
				<MetaPair
					dark={dark}
					label="Devolução"
					value={`#${refund.id.slice(0, 8)}`}
				/>
				<MetaPair dark={dark} label="Pedido" value={`#${refund.orderNumber}`} />
				<MetaPair
					dark={dark}
					label="Solicitada em"
					value={DATE_FMT.format(refund.requestedAt)}
				/>
				<div className="flex-1" />
				<RefundStatusBadge
					status={refund.status}
					tone={dark ? "dark" : "light"}
				/>
			</header>

			{refund.preview.map((item, idx) => (
				<div
					className={cn(
						"flex items-center gap-3.5 px-[18px] py-3.5",
						idx > 0 &&
							(dark ? "border-white/10 border-t" : "border-border/50 border-t")
					)}
					key={item.id}
				>
					<ItemThumb alt={item.name} url={item.imageUrl} />
					<div className="min-w-0 flex-1">
						<div
							className={cn(
								"truncate font-semibold text-[15px]",
								dark ? "text-white" : "text-near-black"
							)}
						>
							{item.name}
						</div>
						<div
							className={cn(
								"mt-1 text-[13px]",
								dark ? "text-white/55" : "text-gray-50"
							)}
						>
							{[item.voltage, `Qtd: ${item.quantity}`]
								.filter(Boolean)
								.join(" · ")}
						</div>
					</div>
					<div
						className={cn(
							"min-w-[90px] text-right font-semibold text-[15px]",
							dark ? "text-white" : "text-near-black"
						)}
					>
						{fmtNumericBRL(item.unitPrice)}
					</div>
				</div>
			))}

			<div
				className={cn(
					"flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t px-[18px] py-3",
					dark ? "border-white/12" : "border-border"
				)}
			>
				<span
					className={cn(
						"font-display font-semibold text-[12px] uppercase tracking-[0.12em]",
						dark ? "text-white/55" : "text-gray-60"
					)}
				>
					Motivo
				</span>
				<span
					className={cn(
						"text-[14px] leading-relaxed",
						dark ? "text-white/80" : "text-gray-60"
					)}
				>
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
				<StatusStepper
					steps={buildRefundSteps(refund.status)}
					tone={dark ? "dark" : "light"}
				/>
			)}

			<div
				className={cn(
					"flex items-center justify-between border-t px-[18px] py-3.5",
					dark ? "border-white/12" : "border-border"
				)}
			>
				<span
					className={cn(
						"font-display font-semibold text-[12px] uppercase tracking-[0.12em]",
						dark ? "text-white/55" : "text-gray-60"
					)}
				>
					{totalLabel}
				</span>
				<span
					className={cn(
						"font-bold text-[20px]",
						isRefunded && "text-success",
						isRejected && "text-gray-60 line-through",
						!(isRefunded || isRejected) &&
							(dark ? "text-white" : "text-near-black")
					)}
				>
					{fmtNumericBRL(refund.amount)}
				</span>
			</div>

			<footer
				className={cn(
					"flex justify-end gap-2 border-t px-[18px] py-2.5",
					dark ? "border-white/12" : "border-border"
				)}
			>
				<Link
					className={emachButtonVariants({
						variant: dark ? "outline-light" : "outline",
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

function MetaPair({
	dark,
	label,
	value,
}: {
	dark: boolean;
	label: string;
	value: string;
}) {
	return (
		<>
			<span
				className={cn(
					"font-display font-semibold text-[12px] uppercase tracking-[0.12em]",
					dark ? "text-gray-50" : "text-gray-60"
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"font-semibold text-[13px]",
					dark ? "text-white" : "text-near-black"
				)}
			>
				{value}
			</span>
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
