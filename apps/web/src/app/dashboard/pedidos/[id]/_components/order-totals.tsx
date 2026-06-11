import { AccountSection } from "@/app/dashboard/_components/account-section";
import { fmtNumericBRL } from "@/lib/format";

interface OrderTotalsProps {
	couponApplied?: boolean;
	discountAmount: string;
	itemCount: number;
	paymentMethod: string | null;
	shippingAmount: string;
	shippingMethod: string | null;
	subtotalAmount: string;
	totalAmount: string;
}

const PAYMENT_LABEL: Record<string, string> = {
	pix: "Pago via Pix",
	boleto: "Boleto bancário",
	credit_card: "Cartão de crédito",
};

const PAYMENT_BADGE: Record<string, string> = {
	pix: "PIX",
	boleto: "BOL",
	credit_card: "CRD",
};

function PriceRow({
	emphasis,
	label,
	value,
}: {
	emphasis?: "discount";
	label: string;
	value: string;
}) {
	const tone =
		emphasis === "discount" ? "text-emach-red-on-dark" : "text-white";
	return (
		<div className="flex items-center justify-between border-white/10 border-b border-dashed py-2.5 text-[14px] last:border-b-0">
			<span className={tone}>{label}</span>
			<span className={tone}>{value}</span>
		</div>
	);
}

export function OrderTotals({
	couponApplied,
	discountAmount,
	itemCount,
	paymentMethod,
	shippingAmount,
	shippingMethod,
	subtotalAmount,
	totalAmount,
}: OrderTotalsProps) {
	const hasDiscount = Number(discountAmount) > 0;
	const shippingFree = Number(shippingAmount) === 0;
	return (
		<AccountSection title="Valores">
			<PriceRow
				label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "itens"})`}
				value={fmtNumericBRL(subtotalAmount)}
			/>
			<PriceRow
				label={`Frete${shippingMethod ? ` (${shippingMethod})` : ""}`}
				value={shippingFree ? "Grátis" : fmtNumericBRL(shippingAmount)}
			/>
			{hasDiscount ? (
				<PriceRow
					emphasis="discount"
					label={couponApplied ? "Desconto (cupom)" : "Desconto"}
					value={`−${fmtNumericBRL(discountAmount)}`}
				/>
			) : null}
			<div className="mt-2 flex items-center justify-between border-white/30 border-t pt-3.5">
				<span className="font-display font-semibold text-[12px] text-white uppercase tracking-[0.16em]">
					Total
				</span>
				<span className="font-bold text-[22px] text-white">
					{fmtNumericBRL(totalAmount)}
				</span>
			</div>
			{paymentMethod ? (
				<div className="mt-3.5 flex items-center gap-2.5 border border-border-strong border-dashed bg-near-black px-3 py-2.5">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/30 font-bold font-display text-[10px] tracking-[0.06em]">
						{PAYMENT_BADGE[paymentMethod] ?? "CRD"}
					</div>
					<div className="text-[12px] leading-tight">
						<strong className="block text-[13px] text-white">
							{PAYMENT_LABEL[paymentMethod] ?? paymentMethod}
						</strong>
					</div>
				</div>
			) : null}
		</AccountSection>
	);
}
