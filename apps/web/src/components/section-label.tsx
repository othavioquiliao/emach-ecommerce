type SectionLabelTone = "default" | "light" | "accent";

interface SectionLabelProps {
	children: React.ReactNode;
	className?: string;
	tone?: SectionLabelTone;
}

const TONE_COLORS: Record<SectionLabelTone, string> = {
	default: "text-[var(--gray-50)]",
	light: "text-white/72",
	accent: "text-[var(--emach-red)]",
};

export function SectionLabel({
	children,
	tone = "default",
	className,
}: SectionLabelProps) {
	return (
		<span
			className={`font-display font-semibold text-[12px] uppercase tracking-[0.14em] ${TONE_COLORS[tone]} ${className ?? ""}`}
		>
			{children}
		</span>
	);
}
