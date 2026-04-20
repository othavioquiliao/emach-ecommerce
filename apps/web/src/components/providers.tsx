"use client";

import { Toaster } from "@emach/ui/components/sonner";

import { CartProvider } from "@/lib/cart-context";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<CartProvider>
			{children}
			<Toaster
				position="bottom-right"
				toastOptions={{
					classNames: {
						toast: "emach-toast",
						title: "emach-toast__title",
					},
				}}
			/>
		</CartProvider>
	);
}
