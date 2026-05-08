"use client";

import { cn } from "@emach/ui/lib/utils";
import { Disc3, Drill, Ruler, Shield, Wrench } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import { EmachButton, emachButtonVariants } from "@/components/emach-button";
import { fmtBRL } from "@/lib/format";
import type { CategorySlug, Order, OrderStatus } from "../../_lib/types";
import { OrderStatusBadge } from "./order-status-badge";

const CATEGORY_ICONS: Record<CategorySlug, React.ElementType> = {
	eletricas: Drill,
	manuais: Wrench,
	medicao: Ruler,
	seguranca: Shield,
	acessorios: Disc3,
};

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

function ItemThumb({ categorySlug }: { categorySlug: CategorySlug }) {
	const Icon = CATEGORY_ICONS[categorySlug];
	return (
		<div className="emach-bg-placeholder flex h-16 w-16 shrink-0 items-center justify-center">
			<Icon className="h-8 w-8 text-cinema-2 opacity-80" strokeWidth={1.2} />
		</div>
	);
}

const comingSoon = (label: string) => () => toast.info(`${label}: em breve`);

function ActionButtons({ order }: { order: Order }) {
	const buttons = renderActions(order);
	if (buttons.length === 0) {
		return null;
	}
	return (
		<footer className="flex justify-end gap-2 border-border border-t bg-white px-[18px] py-2.5">
			{buttons}
		</footer>
	);
}

function renderActions(order: Order): React.ReactNode[] {
	const detailsHref = `/dashboard/pedidos/${order.id}` as Route;
	const trackingHref = {
		pathname: `/dashboard/pedidos/${order.id}` as Route,
		hash: "rastreio",
	};
	const detailsBtn = (
		<Link
			className={cn(emachButtonVariants({ variant: "outline", size: "sm" }))}
			href={detailsHref}
			key="details"
		>
			Ver detalhes
		</Link>
	);

	switch (order.status) {
		case "pending_payment":
			return [
				<EmachButton
					key="cancel"
					onClick={comingSoon("Cancelar pedido")}
					size="sm"
					variant="ghost"
				>
					Cancelar pedido
				</EmachButton>,
				detailsBtn,
				<EmachButton
					key="pay"
					onClick={comingSoon("Pagar agora")}
					size="sm"
					variant="primary"
				>
					Pagar agora
				</EmachButton>,
			];
		case "to_ship":
			return [detailsBtn];
		case "shipped":
			return [
				<Link
					className={cn(emachButtonVariants({ variant: "ghost", size: "sm" }))}
					href={trackingHref}
					key="track"
				>
					Rastrear envio
				</Link>,
				detailsBtn,
			];
		case "completed": {
			const actions: React.ReactNode[] = [
				<EmachButton
					key="rebuy"
					onClick={comingSoon("Comprar novamente")}
					size="sm"
					variant="ghost"
				>
					Comprar novamente
				</EmachButton>,
				detailsBtn,
			];
			if (!order.reviewed) {
				actions.push(
					<EmachButton
						key="review"
						onClick={comingSoon("Avaliar")}
						size="sm"
						variant="primary"
					>
						Avaliar
					</EmachButton>
				);
			}
			return actions;
		}
		case "cancelled":
			return [detailsBtn];
		default: {
			const _exhaustive: never = order.status;
			return [_exhaustive];
		}
	}
}

interface OrderCardProps {
	order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
	const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
	const isCancelled: OrderStatus = "cancelled";

	return (
		<article
			className={cn(
				"mb-3.5 border border-border bg-white",
				order.status === isCancelled && "opacity-80"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-border border-b bg-gray-10 px-[18px] py-3">
				<MetaPair label="Pedido" value={`#${order.id}`} />
				<MetaPair
					label="Realizado em"
					value={DATE_FMT.format(order.createdAt)}
				/>
				<div className="flex-1" />
				<OrderStatusBadge status={order.status} />
			</header>

			<div>
				{order.items.map((item, idx) => (
					<div
						className={cn(
							"flex items-center gap-3.5 px-[18px] py-3.5",
							idx > 0 && "border-border/50 border-t"
						)}
						key={item.id}
					>
						<ItemThumb categorySlug={item.categorySlug} />
						<div className="min-w-0 flex-1">
							<div className="truncate font-semibold text-[13px] text-near-black">
								{item.name}
							</div>
							{item.variant ? (
								<div className="text-[11px] text-gray-60">{item.variant}</div>
							) : null}
							<div className="mt-0.5 text-[11px] text-gray-50">
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="min-w-[90px] text-right font-semibold text-[13px] text-near-black">
							{fmtBRL(item.unitPriceCents * item.quantity)}
						</div>
					</div>
				))}
			</div>

			<div className="flex items-center justify-between border-border border-t bg-[#fafafa] px-[18px] py-3.5">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{itemCount} {itemCount === 1 ? "item" : "itens"}
				</span>
				<div className="flex items-baseline gap-2">
					<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
						Total
					</span>
					<span className="font-bold text-[18px] text-near-black">
						{fmtBRL(order.totalCents)}
					</span>
				</div>
			</div>

			<ActionButtons order={order} />
		</article>
	);
}
