import { Disc3, Drill, Ruler, Shield, Wrench } from "lucide-react";
import Image from "next/image";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	eletricas: Drill,
	manuais: Wrench,
	medicao: Ruler,
	seguranca: Shield,
	acessorios: Disc3,
};

interface ProductImageProps {
	alt?: string;
	categorySlug: string;
	priority?: boolean;
	sizes?: string;
	src?: string;
	zoom?: boolean;
}

export function ProductImage({
	alt,
	categorySlug,
	priority = false,
	sizes = "25vw",
	src,
	zoom = false,
}: ProductImageProps) {
	if (src) {
		return (
			<div
				className="absolute inset-0 overflow-hidden"
				style={{
					transform: zoom ? "scale(1.06)" : "scale(1)",
					transition: "transform 400ms cubic-bezier(.2,.6,.2,1)",
				}}
			>
				<Image
					alt={alt ?? ""}
					className="object-cover"
					fill
					priority={priority}
					sizes={sizes}
					src={src}
				/>
			</div>
		);
	}

	const Icon = CATEGORY_ICONS[categorySlug] ?? Wrench;
	return (
		<div
			className="absolute inset-0 flex items-center justify-center"
			style={{
				background:
					"radial-gradient(ellipse at 50% 55%, #f6f6f6 0%, #d8d8d8 55%, #c8c8c8 100%)",
				transform: zoom ? "scale(1.06)" : "scale(1)",
				transition: "transform 400ms cubic-bezier(.2,.6,.2,1)",
			}}
		>
			<div
				className="flex items-center justify-center"
				style={{ width: "58%", height: "58%", color: "#1a1a1a", opacity: 0.82 }}
			>
				<Icon style={{ width: "100%", height: "100%", strokeWidth: 1.2 }} />
			</div>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					bottom: "8%",
					left: "20%",
					right: "20%",
					height: 16,
					background:
						"radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)",
					filter: "blur(8px)",
				}}
			/>
		</div>
	);
}
