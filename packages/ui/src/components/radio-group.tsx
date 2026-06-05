"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "@emach/ui/lib/utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
	return (
		<RadioGroupPrimitive
			className={cn("grid gap-2", className)}
			data-slot="radio-group"
			{...props}
		/>
	);
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
	return (
		<RadioPrimitive.Root
			className={cn(
				"relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary",
				className
			)}
			data-slot="radio-group-item"
			{...props}
		>
			<RadioPrimitive.Indicator
				className="flex items-center justify-center"
				data-slot="radio-group-indicator"
			>
				<span className="size-1.5 rounded-full bg-primary-foreground" />
			</RadioPrimitive.Indicator>
		</RadioPrimitive.Root>
	);
}

export { RadioGroup, RadioGroupItem };
