"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import type { CartItemSnapshot } from "@/lib/cart-store";

interface QuickAddButtonProps {
	className?: string;
	item: CartItemSnapshot;
}

/**
 * Quick-add do ProductCard. Fica acima do "stretched link" do card (z maior) e
 * para a propagação pra não navegar ao adicionar. Mantém a confirmação por toast,
 * igual ao fluxo da página de produto.
 */
export function QuickAddButton({ className, item }: QuickAddButtonProps) {
	const { add } = useCart();

	return (
		<button
			className={className}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				add(item, 1);
				toast.success(`${item.name} adicionado ao carrinho`);
			}}
			type="button"
		>
			<Plus aria-hidden="true" size={15} strokeWidth={2.5} />
			Adicionar ao carrinho
		</button>
	);
}
