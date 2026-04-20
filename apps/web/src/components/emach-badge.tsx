type BadgeVariant = "primary" | "dark" | "promo" | "light";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
	primary: "bg-[var(--emach-red)] text-white",
	dark: "bg-[var(--near-black)] text-white",
	promo: "bg-[#F13A2C] text-white",
	light: "bg-white text-[var(--near-black)]",
};

interface EmachBadgeProps {
	children: React.ReactNode;
	className?: string;
	variant?: BadgeVariant;
}

export function EmachBadge({
	children,
	variant = "primary",
	className,
}: EmachBadgeProps) {
	return (
		<span
			className={`inline-flex h-[22px] items-center rounded-[2px] px-[10px] font-display font-semibold text-[11px] uppercase tracking-[0.12em] ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
		>
			{children}
		</span>
	);
}
