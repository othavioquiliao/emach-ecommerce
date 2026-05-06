import { cn } from "@emach/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

interface CategoryTileCategory {
	description: string | null;
	imageUrl: string | null;
	name: string;
	slug: string;
}

interface CategoryTileProps {
	category: CategoryTileCategory;
	size?: "sm" | "md" | "lg" | "full";
}

const SIZE_CLASS: Record<NonNullable<CategoryTileProps["size"]>, string> = {
	sm: "h-[240px]",
	md: "h-[320px]",
	lg: "h-[400px]",
	full: "h-full min-h-[664px]",
};

const OVERLAY_BASE =
	"pointer-events-none absolute inset-0 transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]";

export function CategoryTile({ category, size = "md" }: CategoryTileProps) {
	return (
		<Link
			className={cn(
				"group relative block overflow-hidden rounded-[2px] bg-near-black",
				SIZE_CLASS[size]
			)}
			href={`/catalog?cat=${category.slug}`}
		>
			{/* Background image */}
			{category.imageUrl && (
				<div aria-hidden="true" className={OVERLAY_BASE}>
					<Image
						alt=""
						className="object-cover"
						fill
						sizes={size === "full" ? "50vw" : "25vw"}
						src={category.imageUrl}
					/>
				</div>
			)}

			{/* Gradient darken / fallback */}
			<div
				aria-hidden="true"
				className={cn(
					OVERLAY_BASE,
					category.imageUrl
						? "emach-bg-category-overlay"
						: "emach-bg-category-fallback"
				)}
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

			{/* Red accent bar on hover */}
			<div
				aria-hidden="true"
				className="absolute bottom-0 left-0 h-[3px] w-0 bg-emach-red transition-[width] duration-300 ease-out group-hover:w-full"
			/>

			{/* Content */}
			<div className="absolute right-6 bottom-6 left-6 flex flex-col gap-1.5 text-white">
				<SectionLabel tone="light">{category.slug}</SectionLabel>
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
