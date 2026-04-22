import { cn } from "@emach/ui/lib/utils";

interface QuantityStepperProps {
	className?: string;
	compact?: boolean;
	max?: number;
	min?: number;
	onChange: (next: number) => void;
	value: number;
}

/**
 * Stepper de quantidade EMACH. Botão `+` sempre vermelho (brand rule).
 * `compact` reduz a escala para uso dentro de linhas de carrinho.
 */
export function QuantityStepper({
	value,
	onChange,
	min = 1,
	max = Number.POSITIVE_INFINITY,
	compact = false,
	className,
}: QuantityStepperProps) {
	const canDecrement = value > min;
	const canIncrement = value < max;

	return (
		<div
			className={cn(
				"emach-qty",
				compact && "origin-left scale-[0.85]",
				className
			)}
		>
			<button
				aria-label="Diminuir quantidade"
				className="emach-qty__btn"
				disabled={!canDecrement}
				onClick={() => canDecrement && onChange(value - 1)}
				type="button"
			>
				−
			</button>
			<div className="emach-qty__val">{value}</div>
			<button
				aria-label="Aumentar quantidade"
				className="emach-qty__btn emach-qty__btn--plus"
				disabled={!canIncrement}
				onClick={() => canIncrement && onChange(value + 1)}
				type="button"
			>
				+
			</button>
		</div>
	);
}
