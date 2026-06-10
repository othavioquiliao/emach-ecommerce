import type { OrderStatus } from "@emach/db/schema/orders";
import {
	AccountBadge,
	type BadgeFamily,
} from "@/app/dashboard/_components/account-badge";
import type { BadgeTone } from "@/lib/orders/status";
import { ORDER_STATUS_BADGE } from "@/lib/orders/status";

const TONE_TO_FAMILY: Record<BadgeTone, BadgeFamily> = {
	neutral: "amber",
	danger: "red",
	info: "blue",
	progress: "blue",
	transit: "blue",
	success: "green",
	muted: "gray",
	// refunded/returned são terminais (encerrados), não "atenção" — cinza os
	// distingue do âmbar de pending_payment.
	warning: "gray",
};

export function OrderStatusBadge({
	status,
	tone = "light",
}: {
	status: OrderStatus;
	tone?: "light" | "dark";
}) {
	const { label, tone: badgeTone } = ORDER_STATUS_BADGE[status];
	return (
		<AccountBadge
			className={badgeTone === "muted" ? "line-through" : undefined}
			family={TONE_TO_FAMILY[badgeTone]}
			tone={tone}
		>
			{label}
		</AccountBadge>
	);
}
