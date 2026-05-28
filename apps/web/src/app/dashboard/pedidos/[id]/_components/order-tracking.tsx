"use client";

import type { OrderStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";
import { Check, ChevronDown, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderDetailData } from "@/lib/orders/queries";
import {
	isTerminalNegative,
	ORDER_STATUS_BADGE,
	STEPPER_PHASES,
	type StepperPhase,
	stepStateFor,
} from "@/lib/orders/status";
import { SectionBlock } from "./section-block";

const DATETIME_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

const PHASE_LABEL: Record<StepperPhase, string> = {
	paid: "Pago",
	preparing: "Preparação",
	shipped: "A caminho",
	delivered: "Recebido",
};

function phaseDate(
	order: OrderDetailData["order"],
	phase: StepperPhase
): string {
	const phaseDates: Record<StepperPhase, Date | null> = {
		paid: order.paidAt,
		preparing: order.preparingAt,
		shipped: order.shippedAt,
		delivered: order.deliveredAt,
	};
	const ts = phaseDates[phase];
	return ts ? DATETIME_FMT.format(ts) : "—";
}

function StepDot({
	index,
	state,
}: {
	index: number;
	state: "done" | "current" | "upcoming";
}) {
	const base =
		"relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 font-display font-bold text-[12px]";
	if (state === "done") {
		return (
			<div className={cn(base, "border-near-black bg-near-black text-white")}>
				<Check className="h-4 w-4" strokeWidth={2.5} />
			</div>
		);
	}
	if (state === "current") {
		return (
			<div
				className={cn(
					base,
					"border-emach-red bg-emach-red text-white shadow-[0_0_0_4px_rgba(218,41,28,0.18)]"
				)}
			>
				{index + 1}
			</div>
		);
	}
	return (
		<div className={cn(base, "border-border-strong bg-white text-gray-50")}>
			{index + 1}
		</div>
	);
}

function Stepper({ order }: { order: OrderDetailData["order"] }) {
	return (
		<ol
			aria-label="Etapas do envio"
			className="relative grid grid-cols-4 gap-2"
		>
			{STEPPER_PHASES.map((phase, idx) => {
				const state = stepStateFor(order.status, phase);
				const isLast = idx === STEPPER_PHASES.length - 1;
				return (
					<li
						aria-current={state === "current" ? "step" : undefined}
						className="flex flex-col items-center gap-2"
						key={phase}
					>
						<div className="relative flex w-full items-center justify-center">
							<StepDot index={idx} state={state} />
							{isLast ? null : (
								<span
									aria-hidden="true"
									className={cn(
										"absolute top-[17px] left-[calc(50%+18px)] z-0 h-[2px] w-[calc(100%-18px)]",
										state === "done" ? "bg-near-black" : "bg-border-strong"
									)}
								/>
							)}
						</div>
						<div
							className={cn(
								"text-center font-display font-semibold text-[11px] uppercase leading-tight tracking-[0.12em]",
								state === "upcoming" ? "text-gray-50" : "text-near-black"
							)}
						>
							{PHASE_LABEL[phase]}
						</div>
						<div className="-mt-1 text-[10px] text-gray-50">
							{phaseDate(order, phase)}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

function NegativeNotice({
	status,
	at,
}: {
	status: OrderStatus;
	at: Date | null;
}) {
	const { label } = ORDER_STATUS_BADGE[status];
	return (
		<div className="flex items-center gap-3 border border-warning bg-warning/5 px-4 py-4">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-warning bg-warning text-white">
				<X className="h-4 w-4" strokeWidth={2.5} />
			</div>
			<div>
				<div className="font-display font-semibold text-[12px] text-warning uppercase tracking-[0.14em]">
					{label}
				</div>
				{at ? (
					<div className="text-[12px] text-gray-60">
						{DATETIME_FMT.format(at)}
					</div>
				) : null}
			</div>
		</div>
	);
}

function TrackingCode({
	code,
	method,
}: {
	code: string;
	method: string | null;
}) {
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			toast.success("Código copiado");
		} catch {
			toast.error("Não foi possível copiar");
		}
	};
	return (
		<div className="mt-6 grid grid-cols-1 gap-4 border border-border bg-gray-10 px-4 py-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
			<div>
				{method ? (
					<div className="mb-1 font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
						{method}
					</div>
				) : null}
				<div className="font-mono font-semibold text-[16px] text-near-black tracking-[0.04em]">
					{code}
				</div>
			</div>
			<button
				aria-label="Copiar código de rastreio"
				className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border border-near-black bg-white px-3.5 font-sans font-semibold text-[12px] text-near-black tracking-[0.04em] transition-all duration-180 hover:bg-near-black hover:text-white"
				onClick={handleCopy}
				type="button"
			>
				<Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
				Copiar código
			</button>
		</div>
	);
}

function placeholderMessage(status: OrderStatus): string {
	if (status === "pending_payment" || status === "payment_failed") {
		return "Aguardando confirmação de pagamento. O código de rastreio aparece aqui quando o pedido for enviado.";
	}
	return "Pedido em preparação. O código de rastreio aparece aqui assim que sair para entrega.";
}

function HistoryTimeline({ history }: { history: OrderDetailData["history"] }) {
	if (history.length === 0) {
		return (
			<p className="text-[12px] text-gray-50">Sem histórico registrado.</p>
		);
	}
	return (
		<ol className="space-y-3">
			{history.map((h) => (
				<li className="flex gap-3 text-[12px]" key={h.id}>
					<div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-near-black" />
					<div>
						<div className="font-semibold text-near-black">
							{ORDER_STATUS_BADGE[h.toStatus].label}
						</div>
						<div className="text-gray-50">
							{DATETIME_FMT.format(h.createdAt)}
							{h.reason ? ` · ${h.reason}` : ""}
						</div>
					</div>
				</li>
			))}
		</ol>
	);
}

export function OrderTracking({
	order,
	history,
}: {
	history: OrderDetailData["history"];
	order: OrderDetailData["order"];
}) {
	const [open, setOpen] = useState(false);
	const negative = isTerminalNegative(order.status);
	const negativeAt =
		order.canceledAt ?? order.refundedAt ?? order.returnedAt ?? null;

	return (
		<SectionBlock id="rastreio" title="Rastreio do envio">
			{negative ? (
				<NegativeNotice at={negativeAt} status={order.status} />
			) : (
				<>
					<Stepper order={order} />
					{order.shippingTrackingCode ? (
						<TrackingCode
							code={order.shippingTrackingCode}
							method={order.shippingMethod}
						/>
					) : (
						<div className="mt-6 border border-border border-dashed bg-gray-10 px-4 py-3.5 text-[12px] text-gray-60">
							{placeholderMessage(order.status)}
						</div>
					)}
				</>
			)}

			<button
				className="mt-5 inline-flex items-center gap-1.5 font-semibold text-[12px] text-gray-60 hover:text-near-black"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<ChevronDown
					className={cn(
						"h-3.5 w-3.5 transition-transform",
						open && "rotate-180"
					)}
					strokeWidth={1.8}
				/>
				{open ? "Ocultar histórico" : "Ver histórico completo"}
			</button>
			{open ? (
				<div className="mt-3 border-border border-t pt-4">
					<HistoryTimeline history={history} />
				</div>
			) : null}
		</SectionBlock>
	);
}
