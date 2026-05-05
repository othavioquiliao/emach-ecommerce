"use client";

import type { CategoryNode, ToolListItem } from "@emach/db/queries/catalog";
import { cn } from "@emach/ui/lib/utils";
import { Grid3x3, List } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PageContainer } from "@/components/page-container";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { fmtNumericBRL } from "@/lib/format";

type SortKey = "relevance" | "price-asc" | "price-desc" | "name-asc" | "newest";
type VoltageKey = "127V" | "220V" | "Bivolt" | "380V";

const VOLTAGE_OPTIONS: VoltageKey[] = ["127V", "220V", "Bivolt", "380V"];

interface CatalogContentProps {
	categoryTree: CategoryNode[];
	currentCategoryDescription: string | null;
	currentCategoryName: string | null;
	currentCategorySlug: string | null;
	onlyPromo: boolean;
	page: number;
	pageSize: number;
	priceMax: number | null;
	priceMin: number | null;
	query: string;
	sort: SortKey;
	tools: ToolListItem[];
	total: number;
	voltages: VoltageKey[];
}

interface FilterUpdate {
	cat?: string | null;
	page?: number | null;
	pmax?: number | null;
	pmin?: number | null;
	promo?: boolean | null;
	q?: string | null;
	sort?: SortKey | null;
	voltage?: VoltageKey[] | null;
}

interface FilterCurrent {
	currentCategorySlug: string | null;
	onlyPromo: boolean;
	page: number;
	priceMax: number | null;
	priceMin: number | null;
	query: string;
	sort: SortKey;
	voltages: VoltageKey[];
}

function buildHref(current: FilterCurrent, updates: FilterUpdate): string {
	const params = new URLSearchParams();
	const cat = "cat" in updates ? updates.cat : current.currentCategorySlug;
	const q = "q" in updates ? updates.q : current.query;
	const sort = "sort" in updates ? updates.sort : current.sort;
	const voltage = "voltage" in updates ? updates.voltage : current.voltages;
	const pmin = "pmin" in updates ? updates.pmin : current.priceMin;
	const pmax = "pmax" in updates ? updates.pmax : current.priceMax;
	const promo = "promo" in updates ? updates.promo : current.onlyPromo;
	const page = "page" in updates ? updates.page : current.page;

	if (cat) {
		params.set("cat", cat);
	}
	if (q) {
		params.set("q", q);
	}
	if (sort && sort !== "relevance") {
		params.set("sort", sort);
	}
	if (voltage && voltage.length > 0) {
		params.set("voltage", voltage.join(","));
	}
	if (pmin != null) {
		params.set("pmin", String(pmin));
	}
	if (pmax != null) {
		params.set("pmax", String(pmax));
	}
	if (promo) {
		params.set("promo", "1");
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
	const out: CategoryNode[] = [];
	function walk(list: CategoryNode[]) {
		for (const node of list) {
			out.push(node);
			if (node.children.length > 0) {
				walk(node.children);
			}
		}
	}
	walk(nodes);
	return out;
}

export function CatalogContent({
	tools,
	total,
	currentCategorySlug,
	currentCategoryName,
	currentCategoryDescription,
	categoryTree,
	query,
	sort,
	voltages,
	priceMin,
	priceMax,
	onlyPromo,
	page,
	pageSize,
}: CatalogContentProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const [view, setView] = useState<"grid" | "list">("grid");
	const [pminLocal, setPminLocal] = useState<string>(
		priceMin == null ? "" : String(priceMin)
	);
	const [pmaxLocal, setPmaxLocal] = useState<string>(
		priceMax == null ? "" : String(priceMax)
	);

	const current: FilterCurrent = {
		currentCategorySlug,
		query,
		sort,
		voltages,
		priceMin,
		priceMax,
		onlyPromo,
		page,
	};

	function navigate(updates: FilterUpdate) {
		const href =
			`${pathname}${buildHref(current, { ...updates, page: null })}` as Route;
		startTransition(() => {
			router.replace(href, { scroll: false });
		});
	}

	function navigatePage(nextPage: number) {
		const href =
			`${pathname}${buildHref(current, { page: nextPage })}` as Route;
		startTransition(() => {
			router.replace(href, { scroll: true });
		});
	}

	function toggleVoltage(v: VoltageKey) {
		const next = voltages.includes(v)
			? voltages.filter((x) => x !== v)
			: [...voltages, v];
		navigate({ voltage: next.length > 0 ? next : null });
	}

	function applyPriceFilters() {
		const minN = pminLocal.trim() ? Number(pminLocal) : Number.NaN;
		const maxN = pmaxLocal.trim() ? Number(pmaxLocal) : Number.NaN;
		navigate({
			pmin: Number.isFinite(minN) && minN >= 0 ? minN : null,
			pmax: Number.isFinite(maxN) && maxN >= 0 ? maxN : null,
		});
	}

	const flatCategories = flattenTree(categoryTree);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const showFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const showTo = Math.min(page * pageSize, total);

	return (
		<div>
			<section className="bg-near-black py-12 text-white">
				<PageContainer>
					<div className="mb-3 text-[12px] text-white/55 uppercase tracking-widest">
						HOME / CATÁLOGO
						{currentCategoryName
							? ` / ${currentCategoryName.toUpperCase()}`
							: ""}
					</div>
					<h1 className="text-balance font-display font-medium text-[clamp(36px,5vw,60px)] tracking-[-0.01em]">
						{currentCategoryName ?? "Catálogo completo"}
					</h1>
					{currentCategoryDescription && (
						<p className="mt-3 max-w-[600px] text-[16px] text-white/70">
							{currentCategoryDescription}
						</p>
					)}
					{query.trim() && (
						<div className="mt-4 inline-flex items-center gap-2 rounded-[2px] border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] text-white">
							Busca: <strong>“{query}”</strong>
							<button
								aria-label="Limpar busca"
								className="ml-1 text-white/60 hover:text-white"
								onClick={() => navigate({ q: null })}
								type="button"
							>
								×
							</button>
						</div>
					)}
				</PageContainer>
			</section>

			<PageContainer className="grid grid-cols-[260px_1fr] gap-10 py-8">
				<aside>
					<div className="pb-4 font-bold font-display text-[12px] uppercase tracking-[0.14em]">
						FILTROS
					</div>

					<div className="mb-6 flex flex-col gap-1">
						<div className="mb-2.5 font-semibold text-[13px]">Categoria</div>
						<label className="flex items-center gap-2">
							<input
								checked={currentCategorySlug === null}
								className="emach-radio"
								name="cat"
								onChange={() => navigate({ cat: null })}
								type="radio"
							/>
							Todas
						</label>
						{flatCategories.map((c) => (
							<label
								className="flex items-center gap-2"
								key={c.id}
								style={{ paddingLeft: `${c.depth * 12}px` }}
							>
								<input
									checked={currentCategorySlug === c.slug}
									className="emach-radio"
									name="cat"
									onChange={() => navigate({ cat: c.slug })}
									type="radio"
								/>
								{c.name}
							</label>
						))}
					</div>

					<div className="mb-6">
						<div className="mb-2.5 font-semibold text-[13px]">
							Faixa de preço
						</div>
						<div className="flex items-center gap-2">
							<input
								className="emach-input emach-input--sm w-full"
								inputMode="numeric"
								onBlur={applyPriceFilters}
								onChange={(e) => setPminLocal(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										applyPriceFilters();
									}
								}}
								placeholder="Mín"
								type="number"
								value={pminLocal}
							/>
							<span className="text-[13px] text-gray-60">—</span>
							<input
								className="emach-input emach-input--sm w-full"
								inputMode="numeric"
								onBlur={applyPriceFilters}
								onChange={(e) => setPmaxLocal(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										applyPriceFilters();
									}
								}}
								placeholder="Máx"
								type="number"
								value={pmaxLocal}
							/>
						</div>
						<div className="mt-1.5 text-[11px] text-gray-60">Em reais</div>
					</div>

					<div className="mb-6">
						<label className="flex items-center gap-2">
							<input
								checked={onlyPromo}
								className="emach-check"
								onChange={(e) =>
									navigate({ promo: e.target.checked ? true : null })
								}
								type="checkbox"
							/>
							Apenas em promoção
						</label>
					</div>

					<div className="mb-6 flex flex-col gap-1">
						<div className="mb-2.5 font-semibold text-[13px]">Voltagem</div>
						{VOLTAGE_OPTIONS.map((v) => (
							<label className="flex items-center gap-2" key={v}>
								<input
									checked={voltages.includes(v)}
									className="emach-check"
									onChange={() => toggleVoltage(v)}
									type="checkbox"
								/>
								{v}
							</label>
						))}
					</div>
				</aside>

				<div>
					<div className="mb-6 flex items-center justify-between border-border border-b py-3">
						<div className="text-[13px] text-gray-60">
							<strong className="text-near-black">{total}</strong> produto
							{total === 1 ? "" : "s"}
							{total > 0 && (
								<span className="ml-2">
									({showFrom}–{showTo})
								</span>
							)}
						</div>

						<div className="flex items-center gap-4">
							<select
								className="emach-select emach-select--sm w-[180px]"
								onChange={(e) => navigate({ sort: e.target.value as SortKey })}
								value={sort}
							>
								<option value="relevance">Relevância</option>
								<option value="price-asc">Menor preço</option>
								<option value="price-desc">Maior preço</option>
								<option value="name-asc">A–Z</option>
								<option value="newest">Mais recentes</option>
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

					<div
						aria-busy={isPending}
						className={cn(isPending && "pointer-events-none opacity-60")}
					>
						{view === "grid" ? (
							<div className="grid grid-cols-3 gap-6">
								{tools.map((t) => (
									<ProductCard key={t.id} tool={t} />
								))}
							</div>
						) : (
							<div className="flex flex-col">
								{tools.map((t) => (
									<Link
										className="grid cursor-pointer grid-cols-[140px_1fr_auto] items-center gap-6 border-gray-10 border-b py-5"
										href={`/product/${t.slug}`}
										key={t.id}
									>
										<div className="relative aspect-square w-[140px] overflow-hidden bg-image-bg">
											<ProductImage
												alt={t.name}
												categorySlug={t.primaryCategory?.slug ?? ""}
												sizes="140px"
												src={t.primaryImage?.url}
											/>
										</div>
										<div>
											<SectionLabel>
												{t.primaryCategory?.name ?? ""}
											</SectionLabel>
											<div className="mt-1 font-medium text-[18px]">
												{t.name}
											</div>
											<div className="mt-1.5 text-[13px] text-gray-60">
												SKU {t.defaultVariant.sku}
												{t.defaultVariant.voltage
													? ` · ${t.defaultVariant.voltage}`
													: ""}
												{t.hasOtherVariants ? " · mais opções" : ""}
											</div>
										</div>
										<div className="text-right">
											<div className="font-bold text-[20px] tabular-nums">
												{fmtNumericBRL(
													t.defaultVariant.discountedAmount ??
														t.defaultVariant.priceAmount
												)}
											</div>
											{t.defaultVariant.discountedAmount && (
												<div className="text-[12px] text-gray-50 tabular-nums line-through">
													{fmtNumericBRL(t.defaultVariant.priceAmount)}
												</div>
											)}
										</div>
									</Link>
								))}
							</div>
						)}
					</div>

					{tools.length === 0 && (
						<div className="py-20 text-center text-gray-60">
							<div className="font-medium text-[15px]">
								Nenhum produto encontrado
							</div>
							<div className="mt-1.5 text-[13px]">
								Ajuste os filtros para ver mais resultados.
							</div>
						</div>
					)}

					{totalPages > 1 && (
						<div className="mt-8 flex items-center justify-center gap-2">
							<button
								className="emach-btn emach-btn--ghost emach-btn--sm"
								disabled={page <= 1}
								onClick={() => navigatePage(page - 1)}
								type="button"
							>
								Anterior
							</button>
							<span className="px-3 text-[13px] tabular-nums">
								Página <strong>{page}</strong> de {totalPages}
							</span>
							<button
								className="emach-btn emach-btn--ghost emach-btn--sm"
								disabled={page >= totalPages}
								onClick={() => navigatePage(page + 1)}
								type="button"
							>
								Próxima
							</button>
						</div>
					)}
				</div>
			</PageContainer>
		</div>
	);
}
