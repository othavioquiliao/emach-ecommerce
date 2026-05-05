"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@emach/ui/components/sheet";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CartItemRow } from "@/components/cart-item-row";
import { EmachButton } from "@/components/emach-button";
import { FreeShippingProgress } from "@/components/free-shipping-progress";
import { useCart } from "@/lib/cart-context";
import { fmtBRL, numericToCents } from "@/lib/format";

interface CartSheetProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
	const { items, setQty, remove } = useCart();
	const [removing, setRemoving] = useState<string | null>(null);

	function handleRemove(id: string) {
		setRemoving(id);
		window.setTimeout(() => {
			remove(id);
			setRemoving(null);
		}, 220);
	}

	const totalItems = items.reduce((s, i) => s + i.quantity, 0);
	const subtotal = items.reduce(
		(s, i) => s + numericToCents(i.priceAmount) * i.quantity,
		0
	);
	const close = () => onOpenChange(false);

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent
				className="flex w-full flex-col p-0 sm:max-w-md"
				side="right"
			>
				<SheetHeader className="gap-0 border-b px-5 py-4">
					<SheetTitle className="flex items-center gap-2 font-bold font-display text-[15px] uppercase tracking-[0.14em]">
						Carrinho
						{totalItems > 0 && (
							<span className="font-medium text-[13px] text-gray-60 tracking-[0.08em]">
								· {totalItems} {totalItems === 1 ? "item" : "itens"}
							</span>
						)}
					</SheetTitle>
				</SheetHeader>

				{items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
						<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-10">
							<ShoppingBag className="text-gray-50" size={28} />
						</div>
						<h2 className="font-display font-semibold text-[24px]">
							Carrinho vazio
						</h2>
						<p className="mt-2 max-w-[260px] text-[13px] text-gray-60">
							Explore nosso catálogo e encontre as ferramentas certas para o seu
							trabalho.
						</p>
						<Link
							className="mt-6 w-full max-w-[220px]"
							href="/catalog"
							onClick={close}
						>
							<EmachButton full size="md" variant="primary">
								Ver catálogo
							</EmachButton>
						</Link>
					</div>
				) : (
					<>
						<FreeShippingProgress className="px-5 py-3.5" subtotal={subtotal} />

						<div className="flex-1 overflow-y-auto px-5">
							{items.map((item) => (
								<CartItemRow
									item={item}
									key={item.variantId}
									leaving={removing === item.variantId}
									onLinkClick={close}
									onQuantityChange={(next) => setQty(item.variantId, next)}
									onRemove={() => handleRemove(item.variantId)}
									variant="compact"
								/>
							))}
						</div>

						<div className="border-gray-10 border-t px-5 pt-4 pb-5">
							<div className="flex items-baseline justify-between">
								<span className="font-bold font-display text-[13px] uppercase tracking-[0.12em]">
									Subtotal
								</span>
								<span className="font-bold font-display text-[24px] tabular-nums">
									{fmtBRL(subtotal)}
								</span>
							</div>
							<div className="mb-3.5 text-right text-[11px] text-gray-60">
								ou 12× de {fmtBRL(subtotal / 12)} sem juros
							</div>

							<Link className="mb-2 block" href="/checkout" onClick={close}>
								<EmachButton full size="lg" variant="primary">
									Finalizar compra
								</EmachButton>
							</Link>
							<Link className="block" href="/cart" onClick={close}>
								<EmachButton full size="md" variant="ghost">
									Ver carrinho
								</EmachButton>
							</Link>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
