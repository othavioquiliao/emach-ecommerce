import { cn } from "@emach/ui/lib/utils";
import { Star } from "lucide-react";

interface ProductRatingProps {
	average: number;
	className?: string;
	size?: number;
	tone?: "default" | "light";
}

const STARS = [1, 2, 3, 4, 5] as const;

export function ProductRating({
	average,
	className,
	size = 14,
	tone = "default",
}: ProductRatingProps) {
	const filled = Math.round(average);
	const filledClass =
		tone === "light"
			? "fill-white text-white"
			: "fill-foreground text-foreground";
	const emptyClass = tone === "light" ? "text-white/30" : "text-gray-20";

	return (
		<div
			aria-label={`Avaliação ${average.toFixed(1)} de 5`}
			className={cn("flex items-center gap-2", className)}
			role="img"
		>
			<div aria-hidden className="flex items-center gap-0.5">
				{STARS.map((position) => {
					const isFilled = position <= filled;
					return (
						<Star
							className={isFilled ? filledClass : emptyClass}
							key={position}
							size={size}
							strokeWidth={1.5}
						/>
					);
				})}
			</div>
			<span
				className={cn(
					"font-semibold text-[13px] tabular-nums",
					tone === "light" && "text-white"
				)}
			>
				{average.toFixed(1)}
			</span>
		</div>
	);
}
