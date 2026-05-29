"use client";

import type { RefundReason } from "@emach/db/schema/orders";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@emach/ui/components/sheet";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { EmachButton } from "@/components/emach-button";
import { fmtNumericBRL } from "@/lib/format";
import {
	REFUND_REASON_LABEL,
	REFUND_REASON_OPTIONS,
} from "@/lib/refunds/status";
import { requestRefundAction } from "../../_actions/refunds";

export function RefundSheet({
	open,
	onOpenChange,
	orderId,
	orderNumber,
	totalAmount,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	orderId: string;
	orderNumber: string;
	totalAmount: string;
}) {
	const [reason, setReason] = useState<RefundReason>("defeito");
	const [text, setText] = useState("");
	const [pending, startTransition] = useTransition();

	function reset() {
		setReason("defeito");
		setText("");
	}

	function handleOpenChange(next: boolean) {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	}

	function submit() {
		startTransition(async () => {
			const res = await requestRefundAction({
				orderId,
				reasonCategory: reason,
				reasonText: text,
			});
			if (res.ok) {
				toast.success("Solicitação de devolução enviada");
				handleOpenChange(false);
			} else {
				toast.error(res.error);
			}
		});
	}

	return (
		<Sheet onOpenChange={handleOpenChange} open={open}>
			<SheetContent className="flex flex-col gap-0" side="right">
				<SheetHeader>
					<SheetTitle className="font-display">Solicitar devolução</SheetTitle>
				</SheetHeader>
				<div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
					<div className="text-[13px] text-gray-60">
						Pedido{" "}
						<span className="font-semibold text-near-black">
							#{orderNumber}
						</span>{" "}
						· devolução do pedido inteiro
					</div>
					<label className="block">
						<span className="mb-1.5 block font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
							Motivo
						</span>
						<select
							className="h-10 w-full border border-border bg-white px-3 text-[14px] outline-none focus:border-near-black"
							disabled={pending}
							onChange={(e) => setReason(e.target.value as RefundReason)}
							value={reason}
						>
							{REFUND_REASON_OPTIONS.map((r) => (
								<option key={r} value={r}>
									{REFUND_REASON_LABEL[r]}
								</option>
							))}
						</select>
					</label>
					<label className="block">
						<span className="mb-1.5 block font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
							Detalhes (opcional)
						</span>
						<textarea
							className="min-h-[120px] w-full border border-border p-3 text-[14px] outline-none focus:border-near-black"
							disabled={pending}
							maxLength={2000}
							onChange={(e) => setText(e.target.value)}
							placeholder="Descreva o que aconteceu (opcional)"
							value={text}
						/>
					</label>
					<div className="flex items-baseline justify-between border-border border-t pt-4">
						<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
							Valor a reembolsar
						</span>
						<span className="font-bold text-[18px] text-near-black">
							{fmtNumericBRL(totalAmount)}
						</span>
					</div>
				</div>
				<SheetFooter className="flex-row gap-2">
					<EmachButton
						onClick={() => handleOpenChange(false)}
						size="md"
						variant="ghost"
					>
						Cancelar
					</EmachButton>
					<EmachButton
						disabled={pending}
						onClick={submit}
						size="md"
						variant="primary"
					>
						{pending ? "Enviando..." : "Solicitar devolução"}
					</EmachButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
