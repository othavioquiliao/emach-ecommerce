"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import {
	addToCart,
	type CartItem,
	type CartItemSnapshot,
	loadCart,
	reconcilePrices,
	removeFromCart,
	saveCart,
	updateQty,
} from "@/lib/cart-store";

interface CartCtx {
	add: (item: CartItemSnapshot, qty?: number) => void;
	clear: () => void;
	/** `false` até o carrinho ser carregado do localStorage (1º render no client). */
	hydrated: boolean;
	items: CartItem[];
	reconcile: (priceByVariantId: Map<string, string>) => void;
	remove: (variantId: string) => void;
	setQty: (variantId: string, qty: number) => void;
	totalCount: number;
}

const CartContext = createContext<CartCtx>({
	items: [],
	totalCount: 0,
	hydrated: false,
	add: () => undefined,
	setQty: () => undefined,
	remove: () => undefined,
	clear: () => undefined,
	reconcile: () => undefined,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setItems(loadCart());
		setHydrated(true);
	}, []);

	const add = useCallback((item: CartItemSnapshot, qty = 1) => {
		setItems((prev) => addToCart(prev, item, qty));
	}, []);

	const setQty = useCallback((variantId: string, qty: number) => {
		setItems((prev) => updateQty(prev, variantId, qty));
	}, []);

	const remove = useCallback((variantId: string) => {
		setItems((prev) => removeFromCart(prev, variantId));
	}, []);

	const clear = useCallback(() => {
		setItems([]);
		saveCart([]);
	}, []);

	const reconcile = useCallback((priceByVariantId: Map<string, string>) => {
		setItems((prev) => reconcilePrices(prev, priceByVariantId));
	}, []);

	const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				items,
				totalCount,
				hydrated,
				add,
				setQty,
				remove,
				clear,
				reconcile,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartCtx {
	return useContext(CartContext);
}
