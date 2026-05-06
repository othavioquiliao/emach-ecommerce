"use client";

import { cn } from "@emach/ui/lib/utils";
import { Grid3x3, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/page-container";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { fmtBRL } from "@/lib/format";
import { categories, products } from "@/lib/mock-data";

type SortKey = "relevance" | "price-asc" | "price-desc" | "name" | "rating";
type VoltageFilter = "110V" | "220V" | "Bivolt" | null;

interface CatalogContentProps {
	initialCat: string | null;
	initialQuery: string;
}

export function CatalogContent({
	initialCat,
	initialQuery,
}: CatalogContentProps) {
	const [category, setCategory] = useState<string | null>(initialCat);
	const [priceMax, setPriceMax] = useState(150_000);
	const [onlyPromo, setOnlyPromo] = useState(false);
	const [sort, setSort] = useState<SortKey>("relevance");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [query, setQuery] = useState(initialQuery);
	const [voltage, setVoltage] = useState<VoltageFilter>(null);

	useEffect(() => {
		setCategory(initialCat);
	}, [initialCat]);

	useEffect(() => {
		setQuery(initialQuery);
	}, [initialQuery]);

	const filtered = useMemo(() => {
		let list = [...products];
		if (category) {
			list = list.filter((p) => p.categorySlug === category);
		}
		const q = query.trim().toLowerCase();
		if (q) {
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q) ||
					p.sku.toLowerCase().includes(q) ||
					p.shortDescription.some((s) => s.toLowerCase().includes(q))
			);
		}
		list = list.filter((p) => p.price <= priceMax);
		if (onlyPromo) {
			list = list.filter((p) => p.originalPrice != null);
		}
		if (voltage) {
			list = list.filter((p) => {
				if (voltage === "Bivolt") {
					return p.voltage?.includes("110V") && p.voltage?.includes("220V");
				}
				return p.voltage?.includes(voltage) ?? false;
			});
		}
		if (sort === "price-asc") {
			list.sort((a, b) => a.price - b.price);
		} else if (sort === "price-desc") {
			list.sort((a, b) => b.price - a.price);
		} else if (sort === "name") {
			list.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sort === "rating") {
			// TODO: ordenar por avaliação (decrescente)
			// - product.rating é { average: number; count: number } OPCIONAL
			// - Produtos sem rating devem ficar no fim (use ?? 0)
		}
		return list;
	}, [category, priceMax, onlyPromo, sort, query, voltage]);

	const currentCategory = categories.find((c) => c.slug === category);

	return (
		<div>
			{/* Hero */}
			<section className="bg-near-black py-12 text-white">
				<PageContainer>
					<div className="mb-3 text-[12px] text-white/55 uppercase tracking-widest">
						HOME / CATÁLOGO
						{currentCategory ? ` / ${currentCategory.name.toUpperCase()}` : ""}
					</div>
					<h1 className="text-balance font-display font-medium text-[clamp(36px,5vw,60px)] tracking-[-0.01em]">
						{currentCategory ? currentCategory.name : "Catálogo completo"}
					</h1>
					{currentCategory && (
						<p className="mt-3 max-w-[600px] text-[16px] text-white/70">
							{currentCategory.description}
						</p>
					)}
					{query.trim() && (
						<div className="mt-4 inline-flex items-center gap-2 rounded-[2px] border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] text-white">
							Busca: <strong>“{query}”</strong>
							<button
								aria-label="Limpar busca"
								className="ml-1 text-white/60 hover:text-white"
								onClick={() => setQuery("")}
								type="button"
							>
								×
							</button>
						</div>
					)}
				</PageContainer>
			</section>

			<PageContainer className="grid grid-cols-[260px_1fr] gap-10 py-8">
				{/* Sidebar filters */}
				<aside>
					<div className="pb-4 font-bold font-display text-[12px] uppercase tracking-[0.14em]">
						FILTROS
					</div>

					{/* Category */}
					<div className="mb-6 flex flex-col gap-1">
						<div className="mb-2.5 font-semibold text-[13px]">Categoria</div>
						<label className="flex items-center gap-2">
							<input
								checked={category === null}
								className="emach-radio"
								name="cat"
								onChange={() => setCategory(null)}
								type="radio"
							/>
							Todas
						</label>
						{categories.map((c) => (
							<label className="flex items-center gap-2" key={c.slug}>
								<input
									checked={category === c.slug}
									className="emach-radio"
									name="cat"
									onChange={() => setCategory(c.slug)}
									type="radio"
								/>
								{c.name}
							</label>
						))}
					</div>

					{/* Price range */}
					<div className="mb-6">
						<div className="mb-2.5 font-semibold text-[13px]">Preço máximo</div>
						<input
							className="emach-range"
							max={150_000}
							min={5000}
							onChange={(e) => setPriceMax(Number(e.target.value))}
							step={5000}
							type="range"
							value={priceMax}
						/>
						<div className="mt-1.5 text-[13px] tabular-nums">
							Até <strong>{fmtBRL(priceMax)}</strong>
						</div>
					</div>

					{/* Only promo */}
					<div className="mb-6">
						<label className="flex items-center gap-2">
							<input
								checked={onlyPromo}
								className="emach-check"
								onChange={(e) => setOnlyPromo(e.target.checked)}
								type="checkbox"
							/>
							Apenas em promoção
						</label>
					</div>
					<div className="mb-6 flex flex-col gap-1">
						<div className="mb-2.5 font-semibold text-[13px]">Voltagem</div>
						<label className="flex items-center gap-2">
							<input
								checked={voltage === null}
								className="emach-radio"
								name="voltage"
								onChange={() => setVoltage(null)}
								type="radio"
							/>
							Todas
						</label>
						<label className="flex items-center gap-2">
							<input
								checked={voltage === "110V"}
								className="emach-radio"
								name="voltage"
								onChange={() => setVoltage("110V")}
								type="radio"
							/>
							110V
						</label>
						<label className="flex items-center gap-2">
							<input
								checked={voltage === "220V"}
								className="emach-radio"
								name="voltage"
								onChange={() => setVoltage("220V")}
								type="radio"
							/>
							220V
						</label>
						<label className="flex items-center gap-2">
							<input
								checked={voltage === "Bivolt"}
								className="emach-radio"
								name="voltage"
								onChange={() => setVoltage("Bivolt")}
								type="radio"
							/>
							Bivolt
						</label>
					</div>
				</aside>

				{/* Results */}
				<div>
					<div className="mb-6 flex items-center justify-between border-border border-b py-3">
						<div className="text-[13px] text-gray-60">
							<strong className="text-near-black">{filtered.length}</strong>{" "}
							produtos
						</div>

						<div className="flex items-center gap-4">
							<select
								className="emach-select emach-select--sm w-[180px]"
								onChange={(e) => setSort(e.target.value as SortKey)}
								value={sort}
							>
								<option value="relevance">Relevância</option>
								<option value="price-asc">Menor preço</option>
								<option value="price-desc">Maior preço</option>
								<option value="name">A–Z</option>
								<option value="rating">Melhor avaliados</option>
							</select>

							<div className="flex border border-border">
								<button
									aria-label="Grade"
									className={cn(
										"flex size-9 cursor-pointer items-center justify-center border-none",
										view === "grid"
											? "bg-near-black text-white"
											: "bg-white text-near-black"
									)}
									onClick={() => setView("grid")}
									type="button"
								>
									<Grid3x3 size={14} />
								</button>
								<button
									aria-label="Lista"
									className={cn(
										"flex size-9 cursor-pointer items-center justify-center border-none",
										view === "list"
											? "bg-near-black text-white"
											: "bg-white text-near-black"
									)}
									onClick={() => setView("list")}
									type="button"
								>
									<List size={14} />
								</button>
							</div>
						</div>
					</div>

					{view === "grid" ? (
						<div className="grid grid-cols-3 gap-6">
							{filtered.map((p) => (
								<ProductCard key={p.id} product={p} />
							))}
						</div>
					) : (
						<div className="flex flex-col">
							{filtered.map((p) => (
								<Link
									className="grid cursor-pointer grid-cols-[140px_1fr_auto] items-center gap-6 border-gray-10 border-b py-5"
									href={`/product/${p.slug}`}
									key={p.id}
								>
									<div className="relative aspect-square w-[140px] overflow-hidden bg-image-bg">
										<ProductImage
											alt={p.name}
											categorySlug={p.categorySlug}
											sizes="140px"
											src={p.images[0]}
										/>
									</div>
									<div>
										<SectionLabel>{p.category}</SectionLabel>
										<div className="mt-1 font-medium text-[18px]">{p.name}</div>
										<div className="mt-1.5 text-[13px] text-gray-60">
											{p.shortDescription.join(" · ")}
										</div>
									</div>
									<div className="text-right">
										<div className="font-bold text-[20px] tabular-nums">
											{fmtBRL(p.price)}
										</div>
									</div>
								</Link>
							))}
						</div>
					)}

					{filtered.length === 0 && (
						<div className="py-20 text-center text-gray-60">
							<div className="font-medium text-[15px]">
								Nenhum produto encontrado
							</div>
							<div className="mt-1.5 text-[13px]">
								Ajuste os filtros para ver mais resultados.
							</div>
						</div>
					)}
				</div>
			</PageContainer>
		</div>
	);
}
