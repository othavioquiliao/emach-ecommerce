import { cn } from "@emach/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

interface CategoryTileCategory {
	description: string | null;
	name: string;
	slug: string;
}

interface CategoryTileProps {
	category: CategoryTileCategory;
	index: number;
	size?: "sm" | "md" | "lg" | "full";
}

const SIZE_CLASS: Record<NonNullable<CategoryTileProps["size"]>, string> = {
	sm: "h-[240px]",
	md: "h-[320px]",
	lg: "h-[400px]",
	full: "h-full min-h-[664px]",
};

export function CategoryTile({
	category,
	index,
	size = "md",
}: CategoryTileProps) {
	const indexLabel = String(index + 1).padStart(2, "0");

	return (
		<Link
			className={cn(
				"group relative block overflow-hidden rounded-[2px] bg-near-black",
				SIZE_CLASS[size]
			)}
			href={`/catalog?cat=${category.slug}`}
		>
			{/* Gradient fallback */}
			<div
				aria-hidden="true"
				className="emach-bg-category-fallback pointer-events-none absolute inset-0"
			/>

			{/* Texture overlay */}
			<div
				aria-hidden="true"
				className="emach-bg-diagonal-2 pointer-events-none absolute inset-0"
			/>

			{/* Bottom vignette */}
			<div
				aria-hidden="true"
				className="emach-bg-vignette-bottom pointer-events-none absolute inset-0"
			/>

			{/* Ghost index number */}
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute -top-[0.14em] -right-[0.02em] font-display text-white/[0.05] leading-none",
					size === "full" ? "text-[200px]" : "text-[120px]"
				)}
			>
				{indexLabel}
			</span>

			{/* Red accent bar on hover */}
			<div
				aria-hidden="true"
				className="absolute bottom-0 left-0 h-[3px] w-0 bg-emach-red transition-[width] duration-300 ease-out group-hover:w-full"
			/>

			{/* Content */}
			<div className="absolute right-6 bottom-6 left-6 flex flex-col gap-1.5 text-white">
				<SectionLabel tone="light">{`${indexLabel} · ${category.slug}`}</SectionLabel>
				<div className="font-medium text-[24px]">{category.name}</div>
				<div className="max-w-[320px] text-[13px] text-white/70 leading-relaxed">
					{category.description}
				</div>
				<div className="mt-2.5 flex items-end gap-2 font-semibold text-white text-xs">
					<span>Explorar</span>
					<ArrowRight
						className="text-white transition-[color,transform] duration-200 ease-out group-hover:translate-x-1 group-hover:text-emach-red"
						size={14}
						strokeWidth={2}
					/>
				</div>
			</div>
		</Link>
	);
}
