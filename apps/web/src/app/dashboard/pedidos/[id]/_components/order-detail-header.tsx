import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../../../_lib/types";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const STATUS_TONE: Record<OrderStatus, string> = {
	pending_payment: "bg-warning text-white",
	to_ship: "bg-near-black text-white",
	shipped: "bg-near-black text-white",
	completed: "bg-success text-white",
	cancelled: "bg-gray-50 text-white",
};

interface OrderDetailHeaderProps {
	createdAt: Date;
	id: string;
	status: OrderStatus;
}

export function OrderDetailHeader({
	createdAt,
	id,
	status,
}: OrderDetailHeaderProps) {
	return (
		<header className="mb-7">
			<Link
				className="mb-6 inline-flex items-center gap-1.5 font-semibold text-[12px] text-gray-60 tracking-[0.04em] hover:text-near-black"
				href="/dashboard/pedidos"
			>
				<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
				Voltar para Pedidos
			</Link>

			<SectionLabel>Pedido</SectionLabel>
			<h1 className="mt-1.5 mb-1.5 break-all font-display font-medium text-[36px] leading-none">
				#{id}
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
					className={`inline-flex h-[22px] items-center gap-1.5 px-2.5 font-display font-semibold text-[11px] uppercase tracking-[0.12em] ${STATUS_TONE[status]}`}
				>
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 rounded-full bg-current"
					/>
					{ORDER_STATUS_LABEL[status]}
				</span>
			</div>
		</header>
	);
}
