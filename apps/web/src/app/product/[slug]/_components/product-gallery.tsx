"use client";

import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
	const [zoomOpen, setZoomOpen] = useState(false);
	const activeSrc = slots[activeThumb] ?? slots[0];

	useEffect(() => {
		if (!zoomOpen) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setZoomOpen(false);
			}
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [zoomOpen]);

	return (
		<div className="flex-1">
			{/* Main image */}
			<button
				aria-label={`Ampliar imagem de ${name}`}
				className="group relative mb-3 block w-full overflow-hidden"
				onClick={() => activeSrc && setZoomOpen(true)}
				style={{ aspectRatio: "1/1", background: "#ECECEC", cursor: "zoom-in" }}
				type="button"
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
					className="absolute right-3 bottom-3 flex size-9 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
					style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}
				>
					<ZoomIn size={16} />
				</span>
			</button>

			{/* Thumbnails */}
			{slots.length > 1 && (
				<div className="grid grid-cols-4 gap-2">
					{slots.map((src, i) => (
						<button
							aria-label={`${name} — imagem ${i + 1}`}
							className="relative overflow-hidden"
							key={src ?? i}
							onClick={() => setActiveThumb(i)}
							style={{
								aspectRatio: "1/1",
								background: "#ECECEC",
								cursor: "pointer",
								border:
									activeThumb === i
										? "2px solid var(--emach-red)"
										: "2px solid transparent",
							}}
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

			{/* Zoom modal */}
			{zoomOpen && activeSrc && (
				<div
					aria-label="Visualização ampliada"
					aria-modal="true"
					className="fixed inset-0 z-[200] flex items-center justify-center p-4"
					role="dialog"
					style={{ background: "rgba(0,0,0,0.92)" }}
				>
					<button
						aria-label="Fechar visualização"
						className="absolute top-4 right-4 flex size-10 items-center justify-center text-white/80 hover:text-white"
						onClick={() => setZoomOpen(false)}
						type="button"
					>
						<X size={24} />
					</button>
					<button
						aria-label="Fechar visualização"
						className="absolute inset-0"
						onClick={() => setZoomOpen(false)}
						style={{ background: "transparent" }}
						type="button"
					/>
					<div className="relative h-[min(90vh,800px)] w-[min(90vw,800px)]">
						<Image
							alt={name}
							className="object-contain"
							fill
							sizes="90vw"
							src={activeSrc}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
