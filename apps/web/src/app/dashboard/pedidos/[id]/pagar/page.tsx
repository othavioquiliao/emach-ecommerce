import { notFound, redirect } from "next/navigation";
import { getClientOrderDetail } from "@/lib/orders/queries";
import { requireCurrentClient } from "@/lib/session";
import { PaymentMethods } from "./_components/payment-methods";

export default async function PagarPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await requireCurrentClient();
	const detail = await getClientOrderDetail(session.user.id, id);
	if (!detail) {
		notFound();
	}
	const { order } = detail;
	if (order.status !== "pending_payment" && order.status !== "payment_failed") {
		redirect(`/dashboard/pedidos/${id}`);
	}
	return (
		<div className="mx-auto max-w-[760px]">
			<h1 className="mb-1 font-display font-medium text-[32px] leading-none">
				Pagamento
			</h1>
			<p className="mb-7 text-[13px] text-gray-60">Pedido #{order.number}</p>
			<PaymentMethods
				orderNumber={order.number}
				shipping={order.shippingAmount}
				subtotal={order.subtotalAmount}
				total={order.totalAmount}
			/>
		</div>
	);
}
