"use client";

import { useState } from "react";

import type { Product } from "@/lib/mock-data";

interface ProductTabsProps {
	product: Product;
}

type Tab = "specs" | "desc" | "shipping";

const TABS: { key: Tab; label: string }[] = [
	{ key: "specs", label: "Especificações" },
	{ key: "desc", label: "Descrição" },
	{ key: "shipping", label: "Entrega e Garantia" },
];

export function ProductTabs({ product }: ProductTabsProps) {
	const [tab, setTab] = useState<Tab>("specs");

	return (
		<section className="px-20 pt-20 pb-10">
			<div
				className="flex gap-8"
				style={{ borderBottom: "1px solid var(--border)" }}
			>
				{TABS.map((t) => (
					<button
						className="cursor-pointer border-0 bg-transparent pb-0"
						key={t.key}
						onClick={() => setTab(t.key)}
						style={{
							padding: "14px 0",
							fontSize: 13,
							fontWeight: 600,
							color: tab === t.key ? "var(--near-black)" : "var(--gray-50)",
							borderBottom:
								tab === t.key
									? "2px solid var(--emach-red)"
									: "2px solid transparent",
							marginBottom: -1,
						}}
						type="button"
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="max-w-[720px] py-7">
				{tab === "specs" && (
					<div>
						{Object.entries(product.specs).map(([k, v]) => (
							<div
								className="grid py-3 text-[14px]"
								key={k}
								style={{
									gridTemplateColumns: "220px 1fr",
									borderBottom: "1px solid var(--gray-10)",
								}}
							>
								<div style={{ color: "var(--gray-60)" }}>{k}</div>
								<div className="font-medium">{v}</div>
							</div>
						))}
					</div>
				)}

				{tab === "desc" && (
					<div
						className="text-[15px] leading-relaxed"
						style={{ color: "var(--gray-60)" }}
					>
						<p>{product.description}</p>
						<p className="mt-4">
							Projetada para uso profissional contínuo. Acompanha maleta,
							carregador e manual em português.
						</p>
					</div>
				)}

				{tab === "shipping" && (
					<div
						className="text-[15px] leading-relaxed"
						style={{ color: "var(--gray-60)" }}
					>
						<p>
							Entrega em todo o Brasil via transportadora parceira. Prazo de 3 a
							8 dias úteis.
						</p>
						<p className="mt-4">
							2 anos de garantia contra defeitos de fabricação. Assistência
							técnica autorizada em 50+ cidades.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
