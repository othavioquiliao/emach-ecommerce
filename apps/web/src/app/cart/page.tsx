import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartContent } from "./_components/cart-content";

export const metadata: Metadata = {
	title: "Carrinho — EMACH",
	description: "Revise os itens do seu carrinho e finalize a compra.",
};

export default function CartPage() {
	return (
		<>
			<SiteHeader />
			<CartContent />
			<SiteFooter />
		</>
	);
}
