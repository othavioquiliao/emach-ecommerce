import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { StatusStepper } from "@/app/dashboard/_components/status-stepper";
import { emachButtonVariants } from "@/components/emach-button";
import { fmtNumericBRL } from "@/lib/format";
import type { OrderListItem } from "@/lib/orders/queries";
import { isTerminalNegative } from "@/lib/orders/status";
import { CancelOrderButton } from "../[id]/_components/cancel-order-button";
import { RebuyButton } from "../[id]/_components/rebuy-button";
import { OrderStatusBadge } from "./order-status-badge";
import { buildOrderSteps } from "./order-steps";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

export function OrderCard({ order }: { order: OrderListItem }) {
	const detailsHref = `/dashboard/pedidos/${order.id}` as Route;
	const pagarHref = `/dashboard/pedidos/${order.id}/pagar` as Route;
	const isPending =
		order.status === "pending_payment" || order.status === "payment_failed";
	const terminalNeg = isTerminalNegative(order.status);
	const canRebuy = order.status === "delivered" || terminalNeg;

	return (
		<article
			className={cn(
				"mb-3.5 border border-black bg-near-black text-white",
				terminalNeg && "opacity-80"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-white/12 border-b px-[18px] py-3.5">
				<MetaPair label="Pedido" value={`#${order.number}`} />
				<MetaPair
					label="Realizado em"
					value={DATE_FMT.format(order.createdAt)}
				/>
				<div className="flex-1" />
				<OrderStatusBadge status={order.status} tone="dark" />
			</header>

			{order.preview.map((item, idx) => (
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

			{terminalNeg ? null : (
				<StatusStepper steps={buildOrderSteps(order.status)} tone="dark" />
			)}

			<div className="flex items-center justify-between border-white/12 border-t px-[18px] py-3.5">
				<span className="font-display font-semibold text-[12px] text-white/55 uppercase tracking-[0.12em]">
					{order.itemCount} {order.itemCount === 1 ? "item" : "itens"}
				</span>
				<div className="flex items-baseline gap-2">
					<span className="font-display font-semibold text-[12px] text-white/55 uppercase tracking-[0.12em]">
						Total
					</span>
					<span className="font-bold text-[20px] text-white">
						{fmtNumericBRL(order.totalAmount)}
					</span>
				</div>
			</div>

			<footer className="flex flex-wrap justify-end gap-2 border-white/12 border-t px-[18px] py-2.5">
				{isPending ? (
					<CancelOrderButton orderId={order.id} variant="outline-light" />
				) : null}
				<Link
					className={emachButtonVariants({
						variant: "outline-light",
						size: "sm",
					})}
					href={detailsHref}
				>
					Ver detalhes
				</Link>
				{isPending ? (
					<Link
						className={emachButtonVariants({ variant: "primary", size: "sm" })}
						href={pagarHref}
					>
						Pagar agora
					</Link>
				) : null}
				{canRebuy ? (
					<RebuyButton orderId={order.id} variant="outline-light" />
				) : null}
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
