import type { OrderStatus } from "@emach/db/schema/orders";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { type BadgeTone, ORDER_STATUS_BADGE } from "@/lib/orders/status";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const TONE_BG: Record<BadgeTone, string> = {
	neutral: "bg-gray-50 text-white",
	danger: "bg-emach-red text-white",
	info: "bg-info text-white",
	progress: "bg-near-black text-white",
	transit: "bg-near-black text-white",
	success: "bg-success text-white",
	muted: "bg-gray-50 text-white",
	warning: "bg-warning text-white",
};

export function OrderDetailHeader({
	createdAt,
	number,
	status,
}: {
	createdAt: Date;
	number: string;
	status: OrderStatus;
}) {
	const { label, tone } = ORDER_STATUS_BADGE[status];
	return (
		<header className="mb-7">
			<Link
				className="mb-6 flex w-fit items-center gap-1.5 font-semibold text-[12px] text-gray-60 tracking-[0.04em] hover:text-near-black"
				href="/dashboard/pedidos"
			>
				<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
				Voltar para Pedidos
			</Link>
			<SectionLabel>Pedido</SectionLabel>
			<h1 className="mt-1.5 mb-1.5 break-all font-display font-medium text-[36px] leading-none">
				#{number}
			</h1>
			<div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[12px] text-gray-60">
				<span>
					Realizado em{" "}
					<strong className="font-semibold text-near-black">
						{DATE_FMT.format(createdAt)}
					</strong>
				</span>
				<span aria-hidden="true">·</span>
				<span
					className={`inline-flex h-[22px] items-center gap-1.5 px-2.5 font-display font-semibold text-[11px] uppercase tracking-[0.12em] ${TONE_BG[tone]}`}
				>
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 rounded-full bg-current"
					/>
					{label}
				</span>
			</div>
		</header>
	);
}
