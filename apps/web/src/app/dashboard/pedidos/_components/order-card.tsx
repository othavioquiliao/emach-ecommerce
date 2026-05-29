import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { emachButtonVariants } from "@/components/emach-button";
import { fmtNumericBRL } from "@/lib/format";
import type { OrderListItem } from "@/lib/orders/queries";
import { isTerminalNegative } from "@/lib/orders/status";
import { CancelOrderButton } from "../[id]/_components/cancel-order-button";
import { RebuyButton } from "../[id]/_components/rebuy-button";
import { OrderStatusBadge } from "./order-status-badge";

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

export function OrderCard({ order }: { order: OrderListItem }) {
	const detailsHref = `/dashboard/pedidos/${order.id}` as Route;
	const pagarHref = `/dashboard/pedidos/${order.id}/pagar` as Route;
	const isPending =
		order.status === "pending_payment" || order.status === "payment_failed";
	const canRebuy =
		order.status === "delivered" || isTerminalNegative(order.status);

	return (
		<article
			className={cn(
				"mb-3.5 border border-border bg-white",
				isTerminalNegative(order.status) && "opacity-80"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-border border-b bg-gray-10 px-[18px] py-3">
				<MetaPair label="Pedido" value={`#${order.number}`} />
				<MetaPair
					label="Realizado em"
					value={DATE_FMT.format(order.createdAt)}
				/>
				<div className="flex-1" />
				<OrderStatusBadge status={order.status} />
			</header>

			<div>
				{order.preview.map((item, idx) => (
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

			<div className="flex items-center justify-between border-border border-t bg-[#fafafa] px-[18px] py-3.5">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{order.itemCount} {order.itemCount === 1 ? "item" : "itens"}
				</span>
				<div className="flex items-baseline gap-2">
					<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
						Total
					</span>
					<span className="font-bold text-[18px] text-near-black">
						{fmtNumericBRL(order.totalAmount)}
					</span>
				</div>
			</div>

			<footer className="flex flex-wrap justify-end gap-2 border-border border-t bg-white px-[18px] py-2.5">
				{isPending ? <CancelOrderButton orderId={order.id} /> : null}
				<Link
					className={emachButtonVariants({ variant: "outline", size: "sm" })}
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
				{canRebuy ? <RebuyButton orderId={order.id} /> : null}
			</footer>
		</article>
	);
}
