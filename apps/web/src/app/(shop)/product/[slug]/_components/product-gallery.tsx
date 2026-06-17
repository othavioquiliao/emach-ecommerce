"use client";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@emach/ui/components/carousel";
import { cn } from "@emach/ui/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import { ProductImage } from "@/components/product-image";
import "react-inner-image-zoom/es/styles.min.css";
import "./product-gallery.css";
import { buildSlots, type GallerySlot, slotKey } from "./gallery-slots";

interface ProductGalleryProps {
	categorySlug: string;
	images: { url: string }[];
	name: string;
	video?: { url: string; poster: string | null } | null;
}

const MAX_STATIC_THUMBS = 5;

// Serve a imagem principal otimizada (AVIF/WebP, redimensionada) pelo otimizador
// do Next — o original em alta-res fica só no zoom. Corta o LCP do PDP, que era a
// <img> crua do Supabase em tamanho cheio.
const NEXT_IMG_WIDTHS = [640, 828, 1080, 1200] as const;
// A galeria é full-width no mobile e ~42vw no desktop (lg:w-1/2 → imagem ~5/6);
// o browser escolhe a largura do srcSet por este `sizes` (mobile pega 640w em vez
// de 1080w, baixando ainda mais o LCP no celular).
const GALLERY_SIZES = "(min-width: 1024px) 42vw, 100vw";

function optimizedSrc(url: string, w = 1080) {
	return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;
}

function optimizedSrcSet(url: string) {
	return NEXT_IMG_WIDTHS.map((w) => `${optimizedSrc(url, w)} ${w}w`).join(", ");
}

interface ThumbButtonProps {
	categorySlug: string;
	index: number;
	isActive: boolean;
	name: string;
	onClick: () => void;
	slot: GallerySlot;
}

function ThumbButton({
	categorySlug,
	index,
	isActive,
	name,
	onClick,
	slot,
}: ThumbButtonProps) {
	const isVideo = slot.kind === "video";
	const thumbSrc =
		slot.kind === "video" ? (slot.poster ?? undefined) : slot.url;
	const label = isVideo ? `${name} — vídeo` : `${name} — imagem ${index + 1}`;

	return (
		<button
			aria-label={label}
			className={cn(
				"relative aspect-square w-full cursor-pointer overflow-hidden border-2 bg-image-bg",
				isActive ? "border-emach-red" : "border-transparent"
			)}
			onClick={onClick}
			type="button"
		>
			<ProductImage
				alt={label}
				categorySlug={categorySlug}
				sizes="80px"
				src={thumbSrc}
			/>
			{isVideo && (
				<span
					aria-hidden="true"
					className="absolute inset-0 flex items-center justify-center bg-black/30"
				>
					<Play className="size-6 fill-white text-white drop-shadow" />
				</span>
			)}
		</button>
	);
}

export function ProductGallery({
	categorySlug,
	images,
	name,
	video,
}: ProductGalleryProps) {
	const slots = buildSlots(images, video);
	const [activeThumb, setActiveThumb] = useState(0);
	const activeSlot = slots[activeThumb] ?? slots[0];
	const needsCarousel = slots.length > MAX_STATIC_THUMBS;

	const renderThumb = (slot: GallerySlot, i: number) => (
		<ThumbButton
			categorySlug={categorySlug}
			index={i}
			isActive={activeThumb === i}
			key={slotKey(slot)}
			name={name}
			onClick={() => setActiveThumb(i)}
			slot={slot}
		/>
	);

	const renderMainSlot = () => {
		if (!activeSlot) {
			return <ProductImage alt={name} categorySlug={categorySlug} priority />;
		}
		if (activeSlot.kind === "video") {
			return (
				// biome-ignore lint/a11y/useMediaCaption: vídeo de produto sem legendas (v1 lean, issue #137)
				<video
					className="h-full w-full bg-image-bg object-contain"
					controls
					poster={activeSlot.poster ?? undefined}
					preload="metadata"
					src={activeSlot.url}
				/>
			);
		}
		return (
			<InnerImageZoom
				imgAttributes={{
					alt: name,
					fetchPriority: "high",
					sizes: GALLERY_SIZES,
					srcSet: optimizedSrcSet(activeSlot.url),
				}}
				src={optimizedSrc(activeSlot.url)}
				zoomScale={1}
				zoomSrc={activeSlot.url}
			/>
		);
	};

	return (
		<div className="flex w-full flex-col justify-center lg:w-1/2 lg:flex-row lg:gap-3">
			{slots.length > 1 && (
				<aside className="order-2 mt-3 md:order-1 md:mt-0 md:w-24">
					{/* Mobile: grid horizontal */}
					<div className="grid grid-cols-4 gap-2 lg:hidden">
						{slots.map((slot, i) => renderThumb(slot, i))}
					</div>

					{/* Desktop: coluna vertical — estática ou carrossel */}
					<div className="hidden lg:block">
						{needsCarousel ? (
							<Carousel
								className="relative w-full py-10"
								opts={{ align: "start", slidesToScroll: 1 }}
								orientation="vertical"
							>
								<CarouselContent className="-mt-2 h-[412px]">
									{slots.map((slot, i) => (
										<CarouselItem
											className="basis-1/5 pt-2"
											key={slotKey(slot)}
										>
											{renderThumb(slot, i)}
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="top-0 size-8" />
								<CarouselNext className="bottom-0 size-8" />
							</Carousel>
						) : (
							<div className="flex flex-col gap-2">
								{slots.map((slot, i) => renderThumb(slot, i))}
							</div>
						)}
					</div>
				</aside>
			)}

			<div className="order-1 lg:order-2 lg:flex-1">
				<div className="relative aspect-square w-full overflow-hidden bg-image-bg lg:w-5/6">
					{renderMainSlot()}
				</div>
			</div>
		</div>
	);
}
