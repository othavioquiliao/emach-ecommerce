"use client";

import type { ToolListItem } from "@emach/db/queries/catalog";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ProductCard } from "@/components/product-card";

interface ProductGridProps {
	tools: ToolListItem[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProductGrid({ tools }: ProductGridProps) {
	const reduceMotion = useReducedMotion() ?? false;

	const containerVariants: Variants = {
		hidden: {},
		visible: {
			transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
		},
	};

	const itemVariants: Variants = {
		hidden: {
			opacity: 0,
			scale: reduceMotion ? 1 : 0.97,
			y: reduceMotion ? 0 : 16,
		},
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { duration: 0.5, ease: EASE },
		},
	};

	return (
		<motion.div
			className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
			initial="hidden"
			variants={containerVariants}
			viewport={{ once: true, amount: 0.2 }}
			whileInView="visible"
		>
			{tools.map((tool) => (
				<motion.div key={tool.id} variants={itemVariants}>
					<ProductCard tool={tool} />
				</motion.div>
			))}
		</motion.div>
	);
}
