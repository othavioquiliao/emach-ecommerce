import { cn } from "@emach/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const emachButtonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[2px] border border-transparent font-sans font-semibold tracking-[0.04em] transition-all duration-180 focus-visible:outline-2 focus-visible:outline-emach-red focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
	{
		variants: {
			variant: {
				primary: "bg-emach-red text-white hover:bg-emach-red-hover",
				outline:
					"border-near-black bg-transparent text-near-black hover:bg-near-black hover:text-white",
				"outline-light":
					"border-white/70 bg-transparent text-white hover:border-white hover:bg-white hover:text-near-black",
				ghost: "bg-transparent text-near-black hover:bg-gray-10",
				"ghost-light": "bg-transparent text-white hover:bg-white/10",
				dark: "bg-near-black text-white hover:bg-black",
			},
			size: {
				sm: "h-9 px-4 text-xs",
				md: "h-11 px-[22px] text-[13px]",
				lg: "h-13 px-[30px] text-sm",
			},
			full: {
				true: "w-full",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

interface EmachButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof emachButtonVariants> {
	icon?: React.ReactNode;
}

export function EmachButton({
	children,
	variant,
	size,
	full,
	icon,
	className,
	...props
}: EmachButtonProps) {
	return (
		<button
			{...props}
			className={cn(emachButtonVariants({ variant, size, full }), className)}
			type={props.type ?? "button"}
		>
			{icon}
			{children}
		</button>
	);
}

export { emachButtonVariants };
