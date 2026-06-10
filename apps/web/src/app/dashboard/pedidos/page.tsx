import { AccountHero } from "@/app/dashboard/_components/account-hero";
import { listClientOrders } from "@/lib/orders/queries";
import { requireCurrentClient } from "@/lib/session";
import { OrdersTabs } from "./_components/orders-tabs";

export default async function PedidosPage() {
	const session = await requireCurrentClient();
	const orders = await listClientOrders(session.user.id);

	return (
		<>
			<AccountHero title="Pedidos" />
			<div className="px-6 py-8 md:px-10">
				<OrdersTabs orders={orders} />
			</div>
		</>
	);
}
