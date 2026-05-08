import { SectionLabel } from "@/components/section-label";
import { OrdersTabs } from "./_components/orders-tabs";

export default function PedidosPage() {
	return (
		<section>
			<SectionLabel>Minha conta</SectionLabel>
			<h1 className="mt-2 mb-7 font-display font-medium text-[36px] leading-none">
				Pedidos
			</h1>
			<OrdersTabs />
		</section>
	);
}
