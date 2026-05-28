"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { EmachButton } from "@/components/emach-button";
import { useCart } from "@/lib/cart-context";
import { rebuyAction } from "../../_actions/orders";

export function RebuyButton({
	orderId,
	variant = "outline",
}: {
	orderId: string;
	variant?: "outline" | "primary" | "ghost";
}) {
	const { add } = useCart();
	const [pending, start] = useTransition();
	const router = useRouter();

	function onClick() {
		start(async () => {
			const res = await rebuyAction({ orderId });
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			for (const item of res.data.items) {
				const { quantity, ...snapshot } = item;
				add(snapshot, quantity);
			}
			if (res.data.skipped > 0) {
				toast.info(
					`${res.data.skipped} item(ns) indisponível(is) não foram adicionados`
				);
			}
			toast.success("Itens adicionados ao carrinho");
			router.push("/cart");
		});
	}

	return (
		<EmachButton
			disabled={pending}
			onClick={onClick}
			size="sm"
			variant={variant}
		>
			Comprar novamente
		</EmachButton>
	);
}
