"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";

import { applyCouponAction } from "@/app/checkout/_actions/apply-coupon";

interface CouponCartItem {
	quantity: number;
	toolId: string;
	variantId: string;
}

interface CouponFieldProps {
	applied: { code: string; discountCents: number } | null;
	cartItems: CouponCartItem[];
	onApplied: (value: { code: string; discountCents: number }) => void;
	onRemoved: () => void;
}

export function CouponField({
	applied,
	cartItems,
	onApplied,
	onRemoved,
}: CouponFieldProps) {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const apply = async () => {
		const trimmed = code.trim();
		if (!trimmed) {
			return;
		}
		setLoading(true);
		setError(null);
		const result = await applyCouponAction({ code: trimmed, cartItems });
		setLoading(false);
		if (result.ok) {
			onApplied({
				code: trimmed.toUpperCase(),
				discountCents: result.discountCents,
			});
			setCode("");
		} else {
			setError(result.error);
		}
	};

	if (applied) {
		return (
			<div className="flex items-center justify-between border border-border bg-gray-10 px-3 py-2 text-sm">
				<span>
					Cupom <strong>{applied.code}</strong> aplicado
				</span>
				<button
					aria-label="Remover cupom"
					className="inline-flex items-center gap-1 text-gray-60 hover:text-near-black"
					onClick={onRemoved}
					type="button"
				>
					<X className="h-3.5 w-3.5" /> Remover
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			<span className="font-display text-[11px] text-gray-60 uppercase tracking-[0.12em]">
				Cupom de desconto
			</span>
			<div className="flex gap-2">
				<input
					className="h-10 min-w-0 flex-1 border border-border px-3 text-sm uppercase"
					onChange={(e) => setCode(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							apply();
						}
					}}
					placeholder="Inserir código"
					value={code}
				/>
				<button
					className="inline-flex items-center gap-1.5 border border-near-black px-4 text-sm hover:bg-near-black hover:text-white disabled:opacity-50"
					disabled={loading || code.trim().length === 0}
					onClick={apply}
					type="button"
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
				</button>
			</div>
			{error ? <p className="text-[12px] text-red-600">{error}</p> : null}
		</div>
	);
}
