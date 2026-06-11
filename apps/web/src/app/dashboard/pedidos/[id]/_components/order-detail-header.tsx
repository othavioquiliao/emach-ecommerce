import type { OrderStatus } from "@emach/db/schema/orders";
import { ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";
import { StatusStepper } from "@/app/dashboard/_components/status-stepper";
import { isTerminalNegative, ORDER_STATUS_BADGE } from "@/lib/orders/status";
import { OrderStatusBadge } from "../../_components/order-status-badge";
import { buildOrderSteps } from "../../_components/order-steps";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const DATETIME_FMT = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

export function OrderDetailHeader({
	createdAt,
	number,
	status,
	negativeAt,
}: {
	createdAt: Date;
	negativeAt: Date | null;
	number: string;
	status: OrderStatus;
}) {
	const negative = isTerminalNegative(status);

	return (
		<header className="border-emach-red border-b-[3px] bg-near-black px-6 py-8 text-white md:px-10">
			<Link
				className="mb-6 inline-flex w-fit items-center gap-1.5 font-semibold text-[13px] text-white/55 tracking-[0.04em] transition-colors hover:text-white"
				href="/dashboard/pedidos"
			>
				<ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
				Voltar para Pedidos
			</Link>

			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
				<div className="min-w-0">
					<div className="font-display font-semibold text-[13px] text-gray-50 uppercase tracking-[0.18em]">
						Pedido
					</div>
					<h1 className="mt-1.5 break-all font-display font-medium text-[44px] leading-[0.95]">
						#{number}
					</h1>
					<p className="mt-2.5 text-[14px] text-white/65">
						Realizado em{" "}
						<strong className="font-semibold text-white">
							{DATE_FMT.format(createdAt)}
						</strong>
					</p>
				</div>
				<OrderStatusBadge status={status} tone="dark" />
			</div>

			<div className="mt-7 border border-white/12">
				{negative ? (
					<NegativeNotice at={negativeAt} status={status} />
				) : (
					<StatusStepper steps={buildOrderSteps(status)} tone="dark" />
				)}
			</div>
		</header>
	);
}

function NegativeNotice({
	status,
	at,
}: {
	at: Date | null;
	status: OrderStatus;
}) {
	const { label } = ORDER_STATUS_BADGE[status];
	return (
		<div className="flex items-center gap-3.5 px-[18px] py-4">
			<span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-white/25 text-white/70">
				<Ban className="h-[19px] w-[19px]" strokeWidth={1.8} />
			</span>
			<div>
				<div className="font-display font-semibold text-[14px] text-white uppercase tracking-[0.08em]">
					{label}
				</div>
				{at ? (
					<div className="text-[13px] text-white/55">
						{DATETIME_FMT.format(at)}
					</div>
				) : null}
			</div>
		</div>
	);
}
