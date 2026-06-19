"use client";

import { Button } from "@emach/ui/components/button";
import { cn } from "@emach/ui/lib/utils";
import { MinusIcon, PlusIcon } from "lucide-react";

interface QuantityPickerProps {
	className?: string;
	max?: number;
	min?: number;
	onChange: (next: number) => void;
	size?: "default" | "sm";
	value: number;
}

export const QuantityPicker = ({
	value,
	onChange,
	min = 1,
	max = 99,
	size = "default",
	className,
}: QuantityPickerProps) => {
	const decrement = () => onChange(Math.max(min, value - 1));
	const increment = () => onChange(Math.min(max, value + 1));
	// Touch target ≥44px (WCAG 2.5.5 / padrão do projeto p/ mobile). `sm` (drawer)
	// fica em 40px por densidade — acima do piso WCAG 2.2 AA (24px).
	const cell = size === "sm" ? "size-10" : "size-11";

	return (
		<div className={cn("flex items-center", className)}>
			<Button
				aria-label="Diminuir quantidade"
				className={cell}
				disabled={value <= min}
				onClick={decrement}
				size="sm"
				variant="outline"
			>
				<MinusIcon />
			</Button>
			<div
				aria-live="polite"
				className={cn(
					"flex items-center justify-center border-y tabular-nums",
					cell
				)}
			>
				{value}
			</div>
			<Button
				aria-label="Aumentar quantidade"
				className={cn(cell, "bg-emach-red hover:bg-emach-red-hover")}
				disabled={value >= max}
				onClick={increment}
				size="sm"
				variant="outline"
			>
				<PlusIcon className="text-white" />
			</Button>
		</div>
	);
};
