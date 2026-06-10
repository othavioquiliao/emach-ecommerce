"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EmachButton } from "@/components/emach-button";
import { cancelOrderAction } from "../../_actions/orders";

export function CancelOrderButton({
	orderId,
	variant = "ghost",
}: {
	orderId: string;
	variant?: "outline" | "outline-light" | "ghost";
}) {
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
		<EmachButton
			disabled={pending}
			onBlur={() => setConfirming(false)}
			onClick={onClick}
			size="sm"
			variant={variant}
		>
			{confirming ? "Confirmar cancelamento?" : "Cancelar pedido"}
		</EmachButton>
	);
}
