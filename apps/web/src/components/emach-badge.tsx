import { cn } from "@emach/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const emachBadgeVariants = cva(
	"inline-flex h-[22px] items-center rounded-[2px] px-[10px] font-display font-semibold text-[11px] uppercase tracking-[0.12em]",
	{
		variants: {
			variant: {
				primary: "bg-emach-red text-white",
				dark: "bg-near-black text-white",
				promo: "bg-warning text-white",
				light: "bg-white text-near-black",
			},
		},
		defaultVariants: {
			variant: "primary",
		},
	}
);

interface EmachBadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof emachBadgeVariants> {}

export function EmachBadge({
	children,
	variant,
	className,
	...props
}: EmachBadgeProps) {
	return (
		<span className={cn(emachBadgeVariants({ variant }), className)} {...props}>
			{children}
		</span>
	);
}

export { emachBadgeVariants };
