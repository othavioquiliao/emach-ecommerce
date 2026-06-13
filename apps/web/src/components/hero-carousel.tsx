"use client";

import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@emach/ui/components/carousel";
import { cn } from "@emach/ui/lib/utils";
import {
	AnimatePresence,
	type MotionValue,
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmachButton } from "@/components/emach-button";

interface HeroSlide {
	alt: string;
	bg: string;
	product: string;
}

const HERO_SLIDES: HeroSlide[] = [
	{
		bg: "/images/hero-imagens/emach_hero_01_bg.png",
		product: "/images/hero-imagens/emach_hero_01_product.png",
		alt: "EMACH — Potência redefinida",
	},
	{
		bg: "/images/hero-imagens/emach_hero_02_bg.png",
		product: "/images/hero-imagens/emach_hero_02_product.png",
		alt: "EMACH — Linha profissional",
	},
	{
		bg: "/images/hero-imagens/emach_hero_03_bg.png",
		product: "/images/hero-imagens/emach_hero_03_product.png",
		alt: "EMACH — Engenharia EMACH",
	},
];

const AUTOPLAY_INTERVAL = 9000;

interface HeroSlideContentProps {
	isActive: boolean;
	parallaxX: MotionValue<number>;
	parallaxY: MotionValue<number>;
	reduceMotion: boolean;
	slide: HeroSlide;
}

function HeroSlideContent({
	slide,
	isActive,
	reduceMotion,
	parallaxX,
	parallaxY,
}: HeroSlideContentProps) {
	const entranceInitial = reduceMotion
		? { opacity: 0 }
		: { opacity: 0, scale: 1.15, filter: "blur(20px)" };
	const entranceAnimate = reduceMotion
		? { opacity: 1 }
		: { opacity: 1, scale: 1, filter: "blur(0px)" };

	const floatAnimate = reduceMotion ? undefined : { y: [0, -15, 0] };
	const floatTransition = reduceMotion
		? undefined
		: ({
				duration: 5,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			} as const);

	const glowAnimate = reduceMotion
		? undefined
		: { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] };
	const glowTransition = reduceMotion
		? undefined
		: ({
				duration: 4,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			} as const);

	return (
		<div className="absolute inset-0">
			<div className="absolute inset-0 z-0">
				<Image
					alt={slide.alt}
					className="object-cover"
					fill
					priority
					quality={100}
					sizes="100vw"
					src={slide.bg}
				/>
			</div>

			<motion.div
				animate={glowAnimate}
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 left-1/2 z-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
				style={{
					width: "clamp(400px, 70vw, 900px)",
					height: "clamp(400px, 70vw, 900px)",
					background:
						"radial-gradient(circle, rgba(230,0,18,0.25) 0%, rgba(230,0,18,0.08) 40%, transparent 70%)",
					filter: "blur(40px)",
				}}
				transition={glowTransition}
			/>

			<AnimatePresence>
				{isActive && (
					<motion.div
						animate={entranceAnimate}
						className="pointer-events-none absolute inset-0 z-10"
						initial={entranceInitial}
						style={{
							willChange: "opacity, filter",
							x: parallaxX,
							y: parallaxY,
						}}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
					>
						<motion.div
							animate={floatAnimate}
							className="absolute inset-0 drop-shadow-[0_30px_20px_rgba(0,0,0,0.55)] md:drop-shadow-[0_60px_40px_rgba(0,0,0,0.6)]"
							style={{ willChange: "transform" }}
							transition={floatTransition}
						>
							<Image
								alt=""
								className="object-contain"
								fill
								priority
								quality={100}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 2400px"
								src={slide.product}
								unoptimized
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const PARALLAX_MAX = 15;
const PARALLAX_SPRING = { stiffness: 80, damping: 20, mass: 0.5 } as const;

export function HeroCarousel() {
	const [api, setApi] = useState<CarouselApi>();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const reduceMotion = useReducedMotion() ?? false;

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const parallaxX = useSpring(mouseX, PARALLAX_SPRING);
	const parallaxY = useSpring(mouseY, PARALLAX_SPRING);

	useEffect(() => {
		if (!api) {
			return;
		}
		setSelectedIndex(api.selectedScrollSnap());
		const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	useEffect(() => {
		if (!api) {
			return;
		}
		const id = window.setInterval(() => {
			api.scrollNext();
		}, AUTOPLAY_INTERVAL);
		return () => window.clearInterval(id);
	}, [api]);

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		if (reduceMotion) {
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		const relX = (e.clientX - rect.left) / rect.width - 0.5;
		const relY = (e.clientY - rect.top) / rect.height - 0.5;
		mouseX.set(relX * PARALLAX_MAX * 2);
		mouseY.set(relY * PARALLAX_MAX * 2);
	};

	const handleMouseLeave = () => {
		mouseX.set(0);
		mouseY.set(0);
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: parallax decorativo (mouse-only), sem semântica interativa
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: idem — efeito visual, teclado/toque não dependem disto
		<section
			className="relative h-[88svh] w-full overflow-hidden bg-black lg:h-svh"
			onMouseLeave={handleMouseLeave}
			onMouseMove={handleMouseMove}
		>
			<Carousel
				className="h-full w-full"
				opts={{ loop: true, align: "start" }}
				setApi={setApi}
			>
				<CarouselContent className="ml-0 h-[88svh] lg:h-svh">
					{HERO_SLIDES.map((slide, index) => (
						<CarouselItem
							className="relative h-[88svh] pl-0 lg:h-svh"
							key={slide.bg}
						>
							<HeroSlideContent
								isActive={index === selectedIndex}
								parallaxX={parallaxX}
								parallaxY={parallaxY}
								reduceMotion={reduceMotion}
								slide={slide}
							/>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			<div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:bottom-10">
				{HERO_SLIDES.map((slide, index) => (
					<button
						aria-label={`Ir para slide ${index + 1}`}
						className={cn(
							"relative h-[4px] w-8 cursor-pointer transition-colors duration-200 after:absolute after:-inset-y-3 after:right-0 after:left-0 after:content-[''] sm:w-10",
							index === selectedIndex ? "bg-emach-red" : "bg-white/30"
						)}
						key={slide.bg}
						onClick={() => api?.scrollTo(index)}
						type="button"
					/>
				))}
			</div>

			<Link
				className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 lg:right-24 lg:bottom-20 lg:left-auto lg:translate-x-0"
				href="/catalog"
			>
				<EmachButton
					className="h-11 text-sm sm:h-12 sm:text-base lg:h-14 lg:text-xl"
					icon={<ArrowRight className="size-4" />}
					size="lg"
					variant="primary"
				>
					Ver Catálogo
				</EmachButton>
			</Link>
		</section>
	);
}
