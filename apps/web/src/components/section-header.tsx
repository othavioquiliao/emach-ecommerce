import { cn } from "@emach/ui/lib/utils";
import Link, { type LinkProps } from "next/link";
import { SectionLabel } from "@/components/section-label";

type AnyLinkProps = LinkProps<string>;

interface SectionHeaderProps {
	className?: string;
	label?: string;
	link?: {
		href: AnyLinkProps["href"];
		label: string;
	};
	title: string;
	titleSize?: "md" | "lg";
	tone?: "default" | "accent";
}

const TITLE_SIZE: Record<
	NonNullable<SectionHeaderProps["titleSize"]>,
	string
> = {
	md: "text-[28px]",
	lg: "text-[44px] tracking-[-0.01em]",
};

/**
 * Header editorial reusado em listagens de produto/categoria.
 * Combina SectionLabel, título e link "ver mais" opcional no padrão
 * chiaroscuro das vinhetas EMACH.
 */
export function SectionHeader({
	label,
	title,
	link,
	titleSize = "lg",
	tone = "accent",
	className,
}: SectionHeaderProps) {
	return (
		<div className={cn("mb-8 flex items-end justify-between", className)}>
			<div>
				{label && <SectionLabel tone={tone}>{label}</SectionLabel>}
				<h2
					className={cn(
						"mt-2.5 font-display font-medium",
						TITLE_SIZE[titleSize]
					)}
				>
					{title}
				</h2>
			</div>
			{link && (
				<Link
					className="border-emach-red border-b-2 pb-0.5 font-semibold text-[13px]"
					href={link.href}
				>
					{link.label}
				</Link>
			)}
		</div>
	);
}
