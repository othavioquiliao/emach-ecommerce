import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { CartContent } from "./_components/cart-content";

export const metadata: Metadata = {
	title: "Carrinho",
	description: "Revise os itens do seu carrinho e siga para o pagamento.",
	robots: { index: false, follow: false },
};

export default function CartPage() {
	return (
		<>
			<SiteHeader />
			<CartContent />
		</>
	);
}
