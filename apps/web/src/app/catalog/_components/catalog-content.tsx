"use client";

import { Grid3x3, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { fmtBRL } from "@/lib/format";
import { categories, products } from "@/lib/mock-data";

type SortKey = "relevance" | "price-asc" | "price-desc" | "name";

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
					p.shortDescription.toLowerCase().includes(q)
			);
		}
		list = list.filter((p) => p.price <= priceMax);
		if (onlyPromo) {
			list = list.filter((p) => p.originalPrice != null);
		}
		if (sort === "price-asc") {
			list.sort((a, b) => a.price - b.price);
		} else if (sort === "price-desc") {
			list.sort((a, b) => b.price - a.price);
		} else if (sort === "name") {
			list.sort((a, b) => a.name.localeCompare(b.name));
		}
		return list;
	}, [category, priceMax, onlyPromo, sort, query]);

	const currentCategory = categories.find((c) => c.slug === category);

	return (
		<div>
			{/* Hero */}
			<section
				className="px-10 py-12 text-white"
				style={{ background: "var(--near-black)" }}
			>
				<div className="mx-auto" style={{ maxWidth: 1440 }}>
					<div
						className="mb-3 text-[12px] uppercase tracking-[0.1em]"
						style={{ color: "rgba(255,255,255,0.55)" }}
					>
						HOME / CATÁLOGO
						{currentCategory ? ` / ${currentCategory.name.toUpperCase()}` : ""}
					</div>
					<h1
						className="m-0 font-medium"
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(36px, 5vw, 60px)",
							letterSpacing: "-0.01em",
							textWrap: "balance",
						}}
					>
						{currentCategory ? currentCategory.name : "Catálogo completo"}
					</h1>
					{currentCategory && (
						<p
							className="mt-3 max-w-[600px] text-[16px]"
							style={{ color: "rgba(255,255,255,0.7)" }}
						>
							{currentCategory.description}
						</p>
					)}
					{query.trim() && (
						<div
							className="mt-4 inline-flex items-center gap-2 rounded-[2px] px-3 py-1.5 text-[12px]"
							style={{
								background: "rgba(255,255,255,0.08)",
								border: "1px solid rgba(255,255,255,0.18)",
								color: "#fff",
							}}
						>
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
				</div>
			</section>

			<div
				className="mx-auto grid grid-cols-[260px_1fr] gap-10 px-10 py-8"
				style={{ maxWidth: 1440 }}
			>
				{/* Sidebar filters */}
				<aside>
					<div className="pb-4 font-bold font-display text-[12px] uppercase tracking-[0.14em]">
						FILTROS
					</div>

					{/* Category */}
					<div className="mb-6">
						<div className="mb-2.5 font-semibold text-[13px]">Categoria</div>
						<label className="emach-radio-label">
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
							<label className="emach-radio-label" key={c.slug}>
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
						<div
							className="mt-1.5 text-[13px]"
							style={{ fontVariantNumeric: "tabular-nums" }}
						>
							Até <strong>{fmtBRL(priceMax)}</strong>
						</div>
					</div>

					{/* Only promo */}
					<div className="mb-6">
						<label className="emach-check-label">
							<input
								checked={onlyPromo}
								className="emach-check"
								onChange={(e) => setOnlyPromo(e.target.checked)}
								type="checkbox"
							/>
							Apenas em promoção
						</label>
					</div>
				</aside>

				{/* Results */}
				<div>
					<div
						className="mb-6 flex items-center justify-between py-3"
						style={{ borderBottom: "1px solid var(--border)" }}
					>
						<div className="text-[13px]" style={{ color: "var(--gray-60)" }}>
							<strong style={{ color: "var(--near-black)" }}>
								{filtered.length}
							</strong>{" "}
							produtos
						</div>

						<div className="flex items-center gap-4">
							<select
								className="emach-select emach-select--sm"
								onChange={(e) => setSort(e.target.value as SortKey)}
								style={{ width: 180 }}
								value={sort}
							>
								<option value="relevance">Relevância</option>
								<option value="price-asc">Menor preço</option>
								<option value="price-desc">Maior preço</option>
								<option value="name">A–Z</option>
							</select>

							<div
								className="flex"
								style={{ border: "1px solid var(--border)" }}
							>
								<button
									aria-label="Grade"
									onClick={() => setView("grid")}
									style={{
										width: 36,
										height: 36,
										background: view === "grid" ? "var(--near-black)" : "#fff",
										color: view === "grid" ? "#fff" : "var(--near-black)",
										border: "none",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
									type="button"
								>
									<Grid3x3 size={14} />
								</button>
								<button
									aria-label="Lista"
									onClick={() => setView("list")}
									style={{
										width: 36,
										height: 36,
										background: view === "list" ? "var(--near-black)" : "#fff",
										color: view === "list" ? "#fff" : "var(--near-black)",
										border: "none",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
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
									className="grid cursor-pointer items-center gap-6 py-5"
									href={`/product/${p.slug}`}
									key={p.id}
									style={{
										gridTemplateColumns: "140px 1fr auto",
										borderBottom: "1px solid var(--gray-10)",
									}}
								>
									<div
										className="relative overflow-hidden"
										style={{
											width: 140,
											aspectRatio: "1/1",
											background: "#ECECEC",
										}}
									>
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
										<div
											className="mt-1.5 text-[13px]"
											style={{ color: "var(--gray-60)" }}
										>
											{p.shortDescription}
										</div>
									</div>
									<div className="text-right">
										<div
											className="font-bold text-[20px]"
											style={{ fontVariantNumeric: "tabular-nums" }}
										>
											{fmtBRL(p.price)}
										</div>
									</div>
								</Link>
							))}
						</div>
					)}

					{filtered.length === 0 && (
						<div
							className="py-20 text-center"
							style={{ color: "var(--gray-60)" }}
						>
							<div className="font-medium text-[15px]">
								Nenhum produto encontrado
							</div>
							<div className="mt-1.5 text-[13px]">
								Ajuste os filtros para ver mais resultados.
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
