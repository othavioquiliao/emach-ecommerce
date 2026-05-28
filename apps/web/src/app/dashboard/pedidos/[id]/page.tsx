import { notFound } from "next/navigation";
import { getClientOrderDetail } from "@/lib/orders/queries";
import { requireCurrentClient } from "@/lib/session";
import { BuyerInfo } from "./_components/buyer-info";
import { OrderDetailHeader } from "./_components/order-detail-header";
import { OrderItems } from "./_components/order-items";
import { OrderTotals } from "./_components/order-totals";
import { ShippingAddress } from "./_components/shipping-address";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
	const { id } = await params;
	const session = await requireCurrentClient();
	const detail = await getClientOrderDetail(session.user.id, id);

	if (!detail) {
		notFound();
	}

	const { order, items } = detail;
	const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

	const u = session.user as { phone?: string | null; document?: string | null };
	const buyer = {
		name: session.user.name,
		email: session.user.email,
		phone: u.phone ?? null,
		document: u.document ?? null,
	};

	return (
		<div className="mx-auto max-w-[920px]">
			<OrderDetailHeader
				createdAt={order.createdAt}
				number={order.number}
				status={order.status}
			/>
			<BuyerInfo buyer={buyer} />
			<ShippingAddress address={order.shippingAddress} />
			<OrderTotals
				discountAmount={order.discountAmount}
				itemCount={itemCount}
				paymentMethod={order.paymentMethod}
				shippingAmount={order.shippingAmount}
				shippingMethod={order.shippingMethod}
				subtotalAmount={order.subtotalAmount}
				totalAmount={order.totalAmount}
			/>
			<OrderItems items={items} />
		</div>
	);
}
