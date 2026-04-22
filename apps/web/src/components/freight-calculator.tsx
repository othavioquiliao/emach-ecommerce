"use client";

import { cn } from "@emach/ui/lib/utils";
import { Truck } from "lucide-react";
import { useState } from "react";
import { EmachButton } from "@/components/emach-button";
import { fmtBRL } from "@/lib/format";

const FREE_SHIPPING_MIN = 29_900;

interface FreightCalculatorProps {
	className?: string;
	subtotal: number;
}

interface FreightOption {
	eta: string;
	label: string;
	price: number;
}

function maskCep(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 5) {
		return digits;
	}
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function calculate(cep: string, subtotal: number): FreightOption[] {
	const firstDigit = Number(cep[0]);
	const isNearby = firstDigit <= 4;
	const standardPrice = isNearby ? 2990 : 4990;
	const expressPrice = isNearby ? 4990 : 7990;
	const qualifiesForFree = subtotal >= FREE_SHIPPING_MIN;

	return [
		{
			label: "Padrão",
			eta: isNearby ? "5–8 dias úteis" : "8–12 dias úteis",
			price: qualifiesForFree ? 0 : standardPrice,
		},
		{
			label: "Expresso",
			eta: isNearby ? "2–3 dias úteis" : "4–5 dias úteis",
			price: expressPrice,
		},
	];
}

export function FreightCalculator({
	subtotal,
	className,
}: FreightCalculatorProps) {
	const [cep, setCep] = useState("");
	const [options, setOptions] = useState<FreightOption[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isValidCep = cep.replace(/\D/g, "").length === 8;

	function handleCalculate() {
		if (!isValidCep) {
			setError("Informe um CEP válido");
			setOptions(null);
			return;
		}
		setError(null);
		setLoading(true);
		setOptions(null);
		window.setTimeout(() => {
			setOptions(calculate(cep, subtotal));
			setLoading(false);
		}, 450);
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
						setError(null);
					}}
					onKeyDown={handleKeyDown}
					placeholder="00000-000"
					type="text"
					value={cep}
				/>
				<EmachButton
					disabled={loading || !isValidCep}
					onClick={handleCalculate}
					size="md"
					variant="outline"
				>
					{loading ? "Calculando…" : "Calcular"}
				</EmachButton>
			</div>

			{error && (
				<div className="text-[12px] text-destructive" role="alert">
					{error}
				</div>
			)}

			{options && (
				<ul className="divide-y divide-border border-border border-y">
					{options.map((option) => (
						<li
							className="flex items-center justify-between py-2.5"
							key={option.label}
						>
							<div>
								<div className="font-semibold text-[13px]">{option.label}</div>
								<div className="text-[12px] text-gray-60">{option.eta}</div>
							</div>
							<div className="font-semibold text-[14px] tabular-nums">
								{option.price === 0 ? (
									<span className="text-success">Grátis</span>
								) : (
									fmtBRL(option.price)
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
