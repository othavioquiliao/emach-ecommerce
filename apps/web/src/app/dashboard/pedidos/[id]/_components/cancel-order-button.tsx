"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EmachButton } from "@/components/emach-button";
import { cancelOrderAction } from "../../_actions/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
	const [confirming, setConfirming] = useState(false);
	const [pending, start] = useTransition();
	const router = useRouter();

	function onClick() {
		if (!confirming) {
			setConfirming(true);
			return;
		}
		start(async () => {
			const res = await cancelOrderAction({ orderId });
			if (res.ok) {
				toast.success("Pedido cancelado");
				router.refresh();
			} else {
				toast.error(res.error);
				setConfirming(false);
			}
		});
	}

	return (
		<EmachButton disabled={pending} onClick={onClick} size="sm" variant="ghost">
			{confirming ? "Confirmar cancelamento?" : "Cancelar pedido"}
		</EmachButton>
	);
}
