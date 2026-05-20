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
	removeFromCart,
	saveCart,
	updateQty,
} from "@/lib/cart-store";

interface CartCtx {
	add: (item: CartItemSnapshot, qty?: number) => void;
	clear: () => void;
	items: CartItem[];
	remove: (variantId: string) => void;
	setQty: (variantId: string, qty: number) => void;
	totalCount: number;
}

const CartContext = createContext<CartCtx>({
	items: [],
	totalCount: 0,
	add: () => undefined,
	setQty: () => undefined,
	remove: () => undefined,
	clear: () => undefined,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	useEffect(() => {
		setItems(loadCart());
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

	const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

	return (
		<CartContext.Provider
			value={{ items, totalCount, add, setQty, remove, clear }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartCtx {
	return useContext(CartContext);
}
