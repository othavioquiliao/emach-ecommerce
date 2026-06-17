"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryTile } from "@/components/category-tile";

interface CategoryGridCategory {
	description: string | null;
	id: string;
	imageUrl: string | null;
	name: string;
	slug: string;
}

interface CategoryGridProps {
	categories: CategoryGridCategory[];
}

// Intervalo do auto-cycle do destaque (revela a interação sem o usuário agir).
const CYCLE_MS = 2600;

export function CategoryGrid({ categories }: CategoryGridProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);

	// Detecta prefers-reduced-motion via media query (substitui useReducedMotion do framer).
	const [reduceMotion, setReduceMotion] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduceMotion(mq.matches);
		const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Auto-cycle: avança o destaque enquanto não pausado nem reduced-motion.
	useEffect(() => {
		if (reduceMotion || paused || categories.length < 2) {
			return;
		}
		const id = setInterval(() => {
			setActiveIndex((i) => (i + 1) % categories.length);
		}, CYCLE_MS);
		return () => clearInterval(id);
	}, [reduceMotion, paused, categories.length]);

	// Pausa o auto-cycle no hover via listeners (não handlers JSX num div estático,
	// que violariam a11y) — o :hover real assume enquanto o mouse está sobre o grid.
	useEffect(() => {
		const el = gridRef.current;
		if (!el) {
			return;
		}
		const enter = () => setPaused(true);
		const leave = () => setPaused(false);
		el.addEventListener("mouseenter", enter);
		el.addEventListener("mouseleave", leave);
		return () => {
			el.removeEventListener("mouseenter", enter);
			el.removeEventListener("mouseleave", leave);
		};
	}, []);

	return (
		<div
			className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
			ref={gridRef}
		>
			{categories.map((cat, idx) => (
				<div
					className="emach-reveal-item"
					key={cat.id}
					style={{ "--i": idx } as React.CSSProperties}
				>
					<CategoryTile
						active={!(reduceMotion || paused) && idx === activeIndex}
						category={cat}
						index={idx}
					/>
				</div>
			))}
		</div>
	);
}
