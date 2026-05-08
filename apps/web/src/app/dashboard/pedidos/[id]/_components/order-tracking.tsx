"use client";

import { cn } from "@emach/ui/lib/utils";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import type { OrderDetail, OrderStatus } from "../../../_lib/types";
import { SectionBlock } from "./section-block";

const STEPS = [
	{ key: "awaiting", label: "Aguardando\npagamento" },
	{ key: "paid", label: "Pago" },
	{ key: "in_transit", label: "A caminho" },
	{ key: "delivered", label: "Recebido" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];
type StepState = "done" | "current" | "upcoming";

function stepStateFor(status: OrderStatus, step: StepKey): StepState {
	const order: StepKey[] = ["awaiting", "paid", "in_transit", "delivered"];
	const stepIdx = order.indexOf(step);
	const currentIdx = (() => {
		switch (status) {
			case "pending_payment":
				return 0;
			case "to_ship":
				return 1.5; // paid done, in_transit upcoming
			case "shipped":
				return 2;
			case "completed":
				return 4; // all done
			default:
				return -1;
		}
	})();

	if (currentIdx === -1) {
		return "upcoming";
	}
	if (stepIdx < Math.floor(currentIdx)) {
		return "done";
	}
	if (stepIdx === currentIdx) {
		return "current";
	}
	if (stepIdx < currentIdx) {
		return "done";
	}
	return "upcoming";
}

const DATETIME_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

function stepDateFor(detail: OrderDetail, step: StepKey): string {
	switch (step) {
		case "awaiting":
			return DATETIME_FMT.format(detail.createdAt);
		case "paid":
			return detail.paidAt ? DATETIME_FMT.format(detail.paidAt) : "—";
		case "in_transit":
			return detail.shippedAt ? DATETIME_FMT.format(detail.shippedAt) : "—";
		case "delivered":
			return detail.deliveredAt ? DATETIME_FMT.format(detail.deliveredAt) : "—";
		default:
			return "—";
	}
}

function StepDot({ index, state }: { index: number; state: StepState }) {
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

function CancelledStepper({ cancelledAt }: { cancelledAt?: Date }) {
	return (
		<div className="flex items-center gap-3 border border-warning bg-warning/5 px-4 py-4">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-warning bg-warning text-white">
				<X className="h-4 w-4" strokeWidth={2.5} />
			</div>
			<div>
				<div className="font-display font-semibold text-[12px] text-warning uppercase tracking-[0.14em]">
					Pedido cancelado
				</div>
				{cancelledAt ? (
					<div className="text-[12px] text-gray-60">
						Cancelado em {DATETIME_FMT.format(cancelledAt)}
					</div>
				) : null}
			</div>
		</div>
	);
}

function NormalStepper({ detail }: { detail: OrderDetail }) {
	return (
		<ol
			aria-label="Etapas do envio"
			className="relative grid grid-cols-4 gap-2"
		>
			{STEPS.map((step, idx) => {
				const state = stepStateFor(detail.status, step.key);
				const isLast = idx === STEPS.length - 1;
				return (
					<li
						aria-current={state === "current" ? "step" : undefined}
						className="flex flex-col items-center gap-2"
						key={step.key}
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
								"whitespace-pre-line text-center font-display font-semibold text-[11px] uppercase leading-tight tracking-[0.12em]",
								state === "upcoming" ? "text-gray-50" : "text-near-black"
							)}
						>
							{step.label}
						</div>
						<div className="-mt-1 text-[10px] text-gray-50">
							{stepDateFor(detail, step.key)}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

function TrackingCard({ tracking }: { tracking: OrderDetail["tracking"] }) {
	if (!tracking) {
		return null;
	}
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(tracking.code);
			toast.success("Código copiado");
		} catch {
			toast.error("Não foi possível copiar");
		}
	};
	return (
		<div className="mt-6 grid grid-cols-1 gap-4 border border-border bg-gray-10 px-4 py-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
			<div>
				<div className="mb-1 font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{tracking.carrier} · {tracking.service}
				</div>
				<div className="font-mono font-semibold text-[16px] text-near-black tracking-[0.04em]">
					{tracking.code}
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

function TrackingPlaceholder({ status }: { status: OrderStatus }) {
	const message =
		status === "pending_payment"
			? "Aguardando confirmação de pagamento. O código de rastreio aparecerá aqui assim que o pedido for enviado."
			: "Seu pedido está em preparação. O código de rastreio aparecerá aqui assim que sair para entrega.";
	return (
		<div className="mt-6 border border-border border-dashed bg-gray-10 px-4 py-3.5 text-[12px] text-gray-60">
			{message}
		</div>
	);
}

export function OrderTracking({ detail }: { detail: OrderDetail }) {
	const isCancelled = detail.status === "cancelled";
	return (
		<SectionBlock
			id="rastreio"
			rightSlot={
				detail.tracking ? (
					<span className="font-display font-semibold text-[10px] text-gray-50 uppercase tracking-[0.16em]">
						Atualizado em {DATETIME_FMT.format(detail.tracking.updatedAt)}
					</span>
				) : null
			}
			title="Rastreio do envio"
		>
			{isCancelled ? (
				<CancelledStepper cancelledAt={detail.cancelledAt} />
			) : (
				<>
					<NormalStepper detail={detail} />
					{detail.tracking ? (
						<TrackingCard tracking={detail.tracking} />
					) : (
						<TrackingPlaceholder status={detail.status} />
					)}
				</>
			)}
		</SectionBlock>
	);
}
