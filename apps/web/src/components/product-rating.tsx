import { cn } from "@emach/ui/lib/utils";
import { Star } from "lucide-react";

interface ProductRatingProps {
	average: number;
	className?: string;
	size?: number;
}

const STARS = [1, 2, 3, 4, 5] as const;

export function ProductRating({
	average,
	className,
	size = 14,
}: ProductRatingProps) {
	const filled = Math.round(average);

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
							className={
								isFilled ? "fill-foreground text-foreground" : "text-gray-30"
							}
							key={position}
							size={size}
							strokeWidth={1.5}
						/>
					);
				})}
			</div>
			<span className="font-semibold text-[13px] tabular-nums">
				{average.toFixed(1)}
			</span>
		</div>
	);
}
