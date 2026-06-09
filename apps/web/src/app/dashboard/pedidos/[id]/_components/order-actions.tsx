import type { OrderStatus } from "@emach/db/schema/orders";
import type { Route } from "next";
import Link from "next/link";
import { emachButtonVariants } from "@/components/emach-button";
import { isTerminalNegative } from "@/lib/orders/status";
import { CancelOrderButton } from "./cancel-order-button";
import { RebuyButton } from "./rebuy-button";

export function OrderActions({
	orderId,
	status,
}: {
	orderId: string;
	status: OrderStatus;
}) {
	const pagarHref = `/dashboard/pedidos/${orderId}/pagar` as Route;
	const isPending = status === "pending_payment" || status === "payment_failed";
	const canRebuy = status === "delivered" || isTerminalNegative(status);

	const buttons: React.ReactNode[] = [];
	if (isPending) {
		buttons.push(<CancelOrderButton key="cancel" orderId={orderId} />);
		buttons.push(
			<Link
				className={emachButtonVariants({ variant: "primary", size: "sm" })}
				href={pagarHref}
				key="pay"
			>
				Pagar agora
			</Link>
		);
	} else if (canRebuy) {
		buttons.push(
			<RebuyButton key="rebuy" orderId={orderId} variant="primary" />
		);
	}

	if (buttons.length === 0) {
		return null;
	}
	return <div className="mt-6 flex flex-wrap justify-end gap-2">{buttons}</div>;
}
