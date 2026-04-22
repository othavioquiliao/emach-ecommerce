"use client";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@emach/ui/components/dialog";
import { cn } from "@emach/ui/lib/utils";
import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";

interface ProductGalleryProps {
	categorySlug: string;
	images: string[];
	name: string;
}

export function ProductGallery({
	categorySlug,
	images,
	name,
}: ProductGalleryProps) {
	const slots = images.length > 0 ? images : [undefined];
	const [activeThumb, setActiveThumb] = useState(0);
	const activeSrc = slots[activeThumb] ?? slots[0];

	return (
		<div className="flex-1">
			{/* Main image */}
			<Dialog>
				<DialogTrigger
					aria-label={`Ampliar imagem de ${name}`}
					className="group relative mb-3 block aspect-square w-full cursor-zoom-in overflow-hidden bg-image-bg"
					disabled={!activeSrc}
				>
					<ProductImage
						alt={name}
						categorySlug={categorySlug}
						priority
						sizes="600px"
						src={activeSrc}
					/>
					<span
						aria-hidden="true"
						className="absolute right-3 bottom-3 flex size-9 items-center justify-center bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
					>
						<ZoomIn size={16} />
					</span>
				</DialogTrigger>

				{activeSrc && (
					<DialogContent className="max-w-[min(90vw,900px)] border-none bg-black/95 p-0 ring-0">
						<DialogTitle className="sr-only">{name}</DialogTitle>
						<div className="relative h-[min(90vh,800px)] w-full">
							<Image
								alt={name}
								className="object-contain"
								fill
								sizes="90vw"
								src={activeSrc}
							/>
						</div>
					</DialogContent>
				)}
			</Dialog>

			{/* Thumbnails */}
			{slots.length > 1 && (
				<div className="grid grid-cols-4 gap-2">
					{slots.map((src, i) => (
						<button
							aria-label={`${name} — imagem ${i + 1}`}
							className={cn(
								"relative aspect-square cursor-pointer overflow-hidden border-2 bg-image-bg",
								activeThumb === i ? "border-emach-red" : "border-transparent"
							)}
							key={src ?? i}
							onClick={() => setActiveThumb(i)}
							type="button"
						>
							<ProductImage
								alt={`${name} — miniatura ${i + 1}`}
								categorySlug={categorySlug}
								sizes="140px"
								src={src}
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
