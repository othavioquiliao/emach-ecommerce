"use client";

import type { ToolListItem } from "@emach/db/queries/catalog";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@emach/ui/components/carousel";
import type { LinkProps } from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeader } from "@/components/section-header";

interface ProductCarouselProps {
	label?: string;
	link?: {
		href: LinkProps<string>["href"];
		label: string;
		variant?: "underline" | "arrow";
	};
	title: string;
	tools: ToolListItem[];
}

// Acima deste limite vira carrossel; até ele, grid estático com stagger.
const CAROUSEL_THRESHOLD = 4;

// Setas pretas de cantos retos (DESIGN.md: border-radius 0 em interativos).
const ARROW_CLASS =
	"static size-10 translate-y-0 rounded-none border-0 bg-foreground text-background hover:bg-foreground/85 disabled:opacity-30";

export function ProductCarousel({
	tools,
	label,
	title,
	link,
}: ProductCarouselProps) {
	const isCarousel = tools.length > CAROUSEL_THRESHOLD;

	if (!isCarousel) {
		return (
			<>
				<SectionHeader label={label} link={link} title={title} />
				<ProductGrid tools={tools} />
			</>
		);
	}

	return (
		<Carousel opts={{ loop: true, align: "start" }}>
			<SectionHeader
				actions={
					<div className="hidden items-center gap-2 md:flex">
						<CarouselPrevious className={ARROW_CLASS} />
						<CarouselNext className={ARROW_CLASS} />
					</div>
				}
				label={label}
				link={link}
				title={title}
			/>
			<CarouselContent className="-ml-5">
				{tools.map((tool) => (
					<CarouselItem
						className="pl-5 sm:basis-1/2 lg:basis-1/4"
						key={tool.id}
					>
						<ProductCard tool={tool} />
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}
