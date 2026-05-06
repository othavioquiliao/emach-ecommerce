"use client";

import type { CartItem, Product } from "@/lib/mock-data";

const STORAGE_KEY = "emach:cart";

export function loadCart(): CartItem[] {
	if (typeof window === "undefined") {
		return [];
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

export function saveCart(items: CartItem[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Ignore storage errors silently
	}
}

export function addToCart(
	items: CartItem[],
	product: Product,
	qty = 1
): CartItem[] {
	const existing = items.find((i) => i.product.id === product.id);
	const next = existing
		? items.map((i) =>
				i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
			)
		: [...items, { product, quantity: qty }];
	saveCart(next);
	return next;
}

export function updateQty(
	items: CartItem[],
	productId: string,
	qty: number
): CartItem[] {
	const next =
		qty < 1
			? items.filter((i) => i.product.id !== productId)
			: items.map((i) =>
					i.product.id === productId ? { ...i, quantity: qty } : i
				);
	saveCart(next);
	return next;
}

export function removeFromCart(
	items: CartItem[],
	productId: string
): CartItem[] {
	const next = items.filter((i) => i.product.id !== productId);
	saveCart(next);
	return next;
}
