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
	loadCart,
	removeFromCart,
	updateQty,
} from "@/lib/cart-store";
import type { CartItem, Product } from "@/lib/mock-data";

interface CartCtx {
	add: (product: Product, qty?: number) => void;
	clear: () => void;
	items: CartItem[];
	remove: (productId: string) => void;
	setQty: (productId: string, qty: number) => void;
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

	const add = useCallback((product: Product, qty = 1) => {
		setItems((prev) => addToCart(prev, product, qty));
	}, []);

	const setQty = useCallback((productId: string, qty: number) => {
		setItems((prev) => updateQty(prev, productId, qty));
	}, []);

	const remove = useCallback((productId: string) => {
		setItems((prev) => removeFromCart(prev, productId));
	}, []);

	const clear = useCallback(() => {
		setItems([]);
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
