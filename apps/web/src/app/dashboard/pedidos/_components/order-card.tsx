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
	const dark = isPending;

	return (
		<article
			className={cn(
				"mb-3.5 border",
				dark
					? "border-black bg-near-black text-white"
					: "border-border bg-gray-10",
				terminalNeg && "opacity-80"
			)}
		>
			<header
				className={cn(
					"flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-[18px] py-3.5",
					dark ? "border-white/12" : "border-border"
				)}
			>
				<MetaPair dark={dark} label="Pedido" value={`#${order.number}`} />
				<MetaPair
					dark={dark}
					label="Realizado em"
					value={DATE_FMT.format(order.createdAt)}
				/>
				<div className="flex-1" />
				<OrderStatusBadge
					status={order.status}
					tone={dark ? "dark" : "light"}
				/>
			</header>

			{order.preview.map((item, idx) => (
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

			{terminalNeg ? null : (
				<StatusStepper
					steps={buildOrderSteps(order.status)}
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
					{order.itemCount} {order.itemCount === 1 ? "item" : "itens"}
				</span>
				<div className="flex items-baseline gap-2">
					<span
						className={cn(
							"font-display font-semibold text-[12px] uppercase tracking-[0.12em]",
							dark ? "text-white/55" : "text-gray-60"
						)}
					>
						Total
					</span>
					<span
						className={cn(
							"font-bold text-[20px]",
							dark ? "text-white" : "text-near-black"
						)}
					>
						{fmtNumericBRL(order.totalAmount)}
					</span>
				</div>
			</div>

			<footer
				className={cn(
					"flex flex-wrap justify-end gap-2 border-t px-[18px] py-2.5",
					dark ? "border-white/12" : "border-border"
				)}
			>
				{isPending ? <CancelOrderButton orderId={order.id} /> : null}
				<Link
					className={emachButtonVariants({
						variant: dark ? "outline-light" : "outline",
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
				{canRebuy ? <RebuyButton orderId={order.id} /> : null}
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
