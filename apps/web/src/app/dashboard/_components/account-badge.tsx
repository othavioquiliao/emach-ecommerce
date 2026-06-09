import { cn } from "@emach/ui/lib/utils";

export type BadgeFamily = "amber" | "blue" | "green" | "red" | "gray";

const FAMILY_LIGHT: Record<BadgeFamily, string> = {
	amber: "text-amber-text border-amber/45 bg-amber/10",
	blue: "text-info border-info/45 bg-info/10",
	green: "text-success border-success/45 bg-success/10",
	red: "text-emach-red border-emach-red/50 bg-emach-red/8",
	gray: "text-gray-60 border-border bg-white",
};

const FAMILY_DARK: Record<BadgeFamily, string> = {
	amber: "text-[#F9C77E] border-[#F9C77E]/40 bg-amber/20",
	blue: "text-[#8FD0E8] border-[#8FD0E8]/35 bg-info/25",
	green: "text-[#7FDFA0] border-[#7FDFA0]/35 bg-success/20",
	red: "text-[#F39B92] border-[#F39B92]/40 bg-emach-red/20",
	gray: "text-gray-50 border-white/25 bg-white/5",
};

const DOT: Record<BadgeFamily, string> = {
	amber: "bg-amber",
	blue: "bg-info",
	green: "bg-success",
	red: "bg-emach-red",
	gray: "bg-gray-50",
};

export function AccountBadge({
	family,
	tone = "light",
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
	family: BadgeFamily;
	tone?: "light" | "dark";
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 border px-2.5 py-1 font-display font-semibold text-[12px] uppercase tracking-[0.08em]",
				tone === "dark" ? FAMILY_DARK[family] : FAMILY_LIGHT[family],
				className
			)}
		>
			<span className={cn("h-[6px] w-[6px] rounded-full", DOT[family])} />
			{children}
		</span>
	);
}
