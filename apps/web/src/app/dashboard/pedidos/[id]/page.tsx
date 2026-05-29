import { notFound } from "next/navigation";
import { getClientOrderDetail } from "@/lib/orders/queries";
import { requireCurrentClient } from "@/lib/session";
import { BuyerInfo } from "./_components/buyer-info";
import { OrderActions } from "./_components/order-actions";
import { OrderDetailHeader } from "./_components/order-detail-header";
import { OrderItems } from "./_components/order-items";
import { OrderTotals } from "./_components/order-totals";
import { OrderTracking } from "./_components/order-tracking";
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

	const { order, items, history, reviewedToolIds } = detail;
	const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

	// phone/document são additionalFields do Better Auth, não inferidos no tipo
	// da sessão — cast necessário (mesmo padrão de dashboard/dados-pessoais).
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
			<OrderItems
				items={items}
				orderId={order.id}
				reviewedToolIds={reviewedToolIds}
				status={order.status}
			/>
			<OrderTracking history={history} order={order} />
			<OrderActions
				nfeUrl={order.nfeUrl}
				orderId={order.id}
				status={order.status}
			/>
		</div>
	);
}
