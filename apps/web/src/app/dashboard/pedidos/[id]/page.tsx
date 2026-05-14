import { notFound } from "next/navigation";
import { getOrderDetail } from "../../_lib/mock-order-detail";
import { BuyerInfo } from "./_components/buyer-info";
import { OrderActions } from "./_components/order-actions";
import { OrderDetailHeader } from "./_components/order-detail-header";
import { OrderItems } from "./_components/order-items";
import { OrderRefundBlock } from "./_components/order-refund-block";
import { OrderTotals } from "./_components/order-totals";
import { OrderTracking } from "./_components/order-tracking";
import { ShippingAddress } from "./_components/shipping-address";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
	const { id } = await params;
	const detail = getOrderDetail(id);

	if (!detail) {
		notFound();
	}

	const itemCount = detail.items.reduce((sum, i) => sum + i.quantity, 0);

	return (
		<div className="mx-auto max-w-[920px]">
			<OrderDetailHeader
				createdAt={detail.createdAt}
				id={detail.id}
				status={detail.status}
			/>

			<BuyerInfo buyer={detail.buyer} />
			<ShippingAddress address={detail.address} />
			<OrderTotals
				breakdown={detail.breakdown}
				itemCount={itemCount}
				payment={detail.payment}
			/>

			{detail.refund ? (
				<section className="mb-3.5 border border-border bg-white">
					<div className="flex items-center justify-between border-border border-b bg-gray-10 px-[18px] py-3.5">
						<h2 className="font-display font-semibold text-[12px] text-near-black uppercase tracking-[0.16em]">
							Devolução #{detail.refund.id}
						</h2>
					</div>
					<OrderRefundBlock refund={detail.refund} variant="page" />
				</section>
			) : null}

			<OrderItems items={detail.items} />
			<OrderTracking detail={detail} />

			<OrderActions order={detail} />
		</div>
	);
}
