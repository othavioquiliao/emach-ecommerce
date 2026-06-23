"use client";

import { cn } from "@emach/ui/lib/utils";
import { Truck } from "lucide-react";
import { useState } from "react";
import { quoteShippingAction } from "@/app/checkout/_actions/quote-shipping";
import { EmachButton } from "@/components/emach-button";
import { fmtBRL } from "@/lib/format";
import type { ShippingOption } from "@/lib/shipping/types";

interface FreightCalculatorProps {
	className?: string;
	/** Quantidade selecionada na página de produto. */
	quantity: number;
	/** Subtotal (centavos) — valor declarado p/ a política de seguro. */
	subtotal: number;
	/** Tool-pai cujo frete será cotado. */
	toolId: string;
}

function maskCep(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 5) {
		return digits;
	}
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

type FreightState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "negotiate" }
	| { status: "ready"; options: ShippingOption[] };

export function FreightCalculator({
	toolId,
	quantity,
	subtotal,
	className,
}: FreightCalculatorProps) {
	const [cep, setCep] = useState("");
	const [state, setState] = useState<FreightState>({ status: "idle" });

	const isValidCep = cep.replace(/\D/g, "").length === 8;

	async function handleCalculate() {
		if (!isValidCep) {
			setState({ status: "error", message: "Informe um CEP válido" });
			return;
		}
		setState({ status: "loading" });
		const result = await quoteShippingAction({
			destinationCep: cep.replace(/\D/g, ""),
			items: [{ toolId, quantity }],
			declaredValueCents: subtotal,
		});
		if (!result.ok) {
			setState({
				status: "error",
				message: "Não foi possível calcular o frete",
			});
			return;
		}
		if (result.negotiate) {
			setState({ status: "negotiate" });
			return;
		}
		if (result.options.length === 0) {
			setState({
				status: "error",
				message: "Nenhuma opção de frete para este CEP",
			});
			return;
		}
		setState({ status: "ready", options: result.options });
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			event.preventDefault();
			handleCalculate();
		}
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center gap-2 font-semibold text-[13px] uppercase tracking-wider">
				<Truck size={14} />
				Calcular frete
			</div>

			<div className="flex items-stretch gap-2">
				<input
					aria-label="CEP"
					className="emach-input"
					inputMode="numeric"
					maxLength={9}
					onChange={(event) => {
						setCep(maskCep(event.target.value));
						if (state.status === "error") {
							setState({ status: "idle" });
						}
					}}
					onKeyDown={handleKeyDown}
					placeholder="00000-000"
					type="text"
					value={cep}
				/>
				<EmachButton
					disabled={state.status === "loading" || !isValidCep}
					onClick={handleCalculate}
					size="md"
					variant="outline"
				>
					{state.status === "loading" ? "Calculando…" : "Calcular"}
				</EmachButton>
			</div>

			{state.status === "error" && (
				<div className="text-[12px] text-destructive" role="alert">
					{state.message}
				</div>
			)}

			{state.status === "negotiate" && (
				<div className="text-[12px] text-gray-60">
					Item de transporte especial — o frete será combinado diretamente.
					Finalize a compra para entrarmos em contato.
				</div>
			)}

			{state.status === "ready" && (
				<ul className="divide-y divide-border border-border border-y">
					{state.options.map((option) => (
						<li
							className="flex items-center justify-between py-2.5"
							key={option.carrierId}
						>
							<div>
								<div className="font-semibold text-[13px]">{option.name}</div>
								<div className="text-[12px] text-gray-60">
									{option.deliveryDays > 0
										? `${option.deliveryDays} dia(s) úteis`
										: "Prazo a confirmar"}
								</div>
							</div>
							<div className="font-semibold text-[14px] tabular-nums">
								{fmtBRL(option.priceCents)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
