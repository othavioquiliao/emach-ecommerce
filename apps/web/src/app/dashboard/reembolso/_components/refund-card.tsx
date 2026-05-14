"use client";

import { cn } from "@emach/ui/lib/utils";
import { Disc3, Drill, Ruler, Shield, Wrench } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import { EmachButton, emachButtonVariants } from "@/components/emach-button";
import { fmtBRL } from "@/lib/format";
import type { CategorySlug, Refund } from "../../_lib/types";
import { OrderRefundBlock } from "../../pedidos/[id]/_components/order-refund-block";
import { RefundStatusBadge } from "./refund-status-badge";

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

interface RefundCardProps {
	refund: Refund;
}

export function RefundCard({ refund }: RefundCardProps) {
	const detailsHref = `/dashboard/pedidos/${refund.orderId}` as Route;
	const isRefunded = refund.status === "reembolsado";
	const isDenied = refund.status === "recusado";

	const totalLabel = isDenied ? "Valor solicitado" : "A reembolsar";
	const totalClass = cn(
		"font-bold text-[18px]",
		isRefunded && "text-success",
		isDenied && "text-gray-60 line-through"
	);

	return (
		<article
			className={cn(
				"mb-3.5 border border-border bg-white",
				isDenied && "opacity-85"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-border border-b bg-gray-10 px-[18px] py-3">
				<MetaPair label="Devolução" value={`#${refund.id}`} />
				<MetaPair label="Pedido" value={`#${refund.orderId}`} />
				<MetaPair
					label="Solicitada em"
					value={DATE_FMT.format(refund.createdAt)}
				/>
				<div className="flex-1" />
				<RefundStatusBadge status={refund.status} />
			</header>

			<div>
				{refund.items.map((item, idx) => (
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

			<div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-border border-t bg-white px-[18px] py-3">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					Motivo
				</span>
				<span className="text-[13px] text-gray-60 leading-relaxed">
					{refund.reason}
				</span>
			</div>

			<OrderRefundBlock refund={refund} variant="card" />

			<div className="flex items-center justify-between border-border border-t bg-[#fafafa] px-[18px] py-3.5">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{totalLabel}
				</span>
				<span className={totalClass}>{fmtBRL(refund.amountCents)}</span>
			</div>

			<footer className="flex justify-end gap-2 border-border border-t bg-white px-[18px] py-2.5">
				{refund.status === "solicitado" ? (
					<EmachButton
						onClick={() => toast.info("Cancelar solicitação: em breve")}
						size="sm"
						variant="ghost"
					>
						Cancelar solicitação
					</EmachButton>
				) : null}
				<Link
					className={cn(
						emachButtonVariants({ variant: "outline", size: "sm" })
					)}
					href={detailsHref}
				>
					Ver detalhes
				</Link>
			</footer>
		</article>
	);
}
