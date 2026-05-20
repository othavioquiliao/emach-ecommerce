import { db } from "@emach/db";
import type { ToolListItem } from "@emach/db/queries/catalog";
import { getActivePromotions, getRecentTools } from "@emach/db/queries/catalog";
import { category } from "@emach/db/schema/categories";
import { cn } from "@emach/ui/lib/utils";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { CategoryGrid } from "@/components/category-grid";
import { EmachButton } from "@/components/emach-button";
import { HeroCarousel } from "@/components/hero-carousel";
import { PageContainer } from "@/components/page-container";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeader } from "@/components/section-header";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";

export const revalidate = 600;

const STATS = [
	{ n: "200+", l: "Horas de teste" },
	{ n: "2 anos", l: "Garantia total" },
	{ n: "98%", l: "Aprovação" },
	{ n: "50+", l: "Cidades" },
	{ n: "24/7", l: "Suporte" },
	{ n: "12×", l: "Sem juros" },
];

async function getRootCategories() {
	return db
		.select({
			id: category.id,
			slug: category.slug,
			name: category.name,
			description: category.description,
		})
		.from(category)
		.where(and(isNull(category.parentId), eq(category.isActive, true)))
		.orderBy(asc(category.sortOrder))
		.limit(4);
}

// Postgres ARRAY[$1, $2, ...]::T[] — drizzle-orm interpola arrays como tupla
// `($1, $2)`, que Postgres recusa em ANY()/= ANY().
function arrayLiteral<T>(values: T[], castType: string) {
	return sql`ARRAY[${sql.join(
		values.map((v) => sql`${v}`),
		sql`, `
	)}]::${sql.raw(castType)}`;
}

async function getCategoryImages(
	slugs: string[]
): Promise<Map<string, string>> {
	if (slugs.length === 0) {
		return new Map();
	}

	const owned = await db.execute<{ slug: string; url: string }>(sql`
		WITH roots AS (
			SELECT id, slug FROM category WHERE slug = ANY(${arrayLiteral(slugs, "text[]")})
		),
		candidates AS (
			SELECT r.slug, ti.url,
			       ROW_NUMBER() OVER (
			         PARTITION BY r.slug
			         ORDER BY ti.sort_order ASC, ti.created_at DESC
			       ) AS rn
			FROM roots r
			JOIN category c
			  ON c.path = '/' || r.slug
			  OR c.path LIKE '/' || r.slug || '/%'
			JOIN tool_category tc ON tc.category_id = c.id
			JOIN tool_image ti ON ti.tool_id = tc.tool_id
		)
		SELECT slug, url FROM candidates WHERE rn = 1
	`);

	const map = new Map<string, string>();
	for (const row of owned.rows) {
		map.set(row.slug, row.url);
	}

	const missing = slugs.filter((s) => !map.has(s));
	if (missing.length > 0) {
		const usedUrls = Array.from(map.values());
		const exclusion =
			usedUrls.length > 0
				? sql`WHERE url <> ALL(${arrayLiteral(usedUrls, "text[]")})`
				: sql``;
		const fallbacks = await db.execute<{ url: string }>(sql`
			SELECT DISTINCT ON (url) url
			FROM tool_image
			${exclusion}
			ORDER BY url, created_at DESC
			LIMIT ${missing.length}
		`);
		for (const [i, slug] of missing.entries()) {
			const fallback = fallbacks.rows[i]?.url;
			if (fallback) {
				map.set(slug, fallback);
			}
		}
	}

	return map;
}

function flattenPromoTools(
	promotions: Awaited<ReturnType<typeof getActivePromotions>>,
	limit: number
): ToolListItem[] {
	const seen = new Map<string, ToolListItem>();
	for (const promo of promotions) {
		for (const tool of promo.tools) {
			if (!seen.has(tool.id)) {
				seen.set(tool.id, tool);
			}
			if (seen.size >= limit) {
				break;
			}
		}
		if (seen.size >= limit) {
			break;
		}
	}
	return Array.from(seen.values());
}

export default async function HomePage() {
	const [rootCategories, activePromotions, recentTools] = await Promise.all([
		getRootCategories(),
		getActivePromotions(db, 4),
		getRecentTools(db, 4),
	]);

	const categoryImages = await getCategoryImages(
		rootCategories.map((c) => c.slug)
	);
	const rootCategoriesWithImages = rootCategories.map((c) => ({
		...c,
		imageUrl: categoryImages.get(c.slug) ?? null,
	}));

	const promoTools = flattenPromoTools(activePromotions, 4);

	return (
		<>
			<SiteHeader overlay />

			<main>
				<HeroCarousel />

				<TrustBar />

				{rootCategories.length > 0 && (
					<section className="bg-gray-10">
						<PageContainer className="px-[56px] py-[72px]">
							<SectionHeader
								label="01 · Categorias"
								link={{
									href: "/catalog",
									label: "Ver todas",
									variant: "arrow",
								}}
								title="Explorar por categoria"
							/>
							<CategoryGrid categories={rootCategoriesWithImages} />
						</PageContainer>
					</section>
				)}

				{promoTools.length > 0 && (
					<section className="bg-white">
						<PageContainer className="px-[56px] py-[72px]">
							<SectionHeader
								label="02 · Ofertas"
								link={{
									href: "/catalog?promo=1",
									label: "Ver todas",
									variant: "arrow",
								}}
								title="Promoções ativas"
							/>
							<ProductGrid tools={promoTools} />
						</PageContainer>
					</section>
				)}

				<section className="bg-black text-white">
					<PageContainer className="grid min-h-[440px] grid-cols-2 px-0">
						<div className="flex flex-col justify-center gap-5 px-20 py-20">
							<SectionLabel tone="accent">Feito para durar</SectionLabel>
							<h2 className="font-display font-medium text-[48px] leading-[1.02] tracking-[-0.01em]">
								Engenharia que
								<br />
								não abandona você
								<br />
								no meio da obra.
							</h2>
							<p className="max-w-[440px] text-[16px] text-white/70 leading-relaxed">
								Cada ferramenta EMACH passa por 200+ horas de testes em campo
								antes de chegar ao catálogo.
							</p>
							<div>
								<EmachButton size="lg" variant="outline-light">
									Conheça a marca
								</EmachButton>
							</div>
						</div>

						<div className="emach-bg-stats relative border-emach-red border-l-[3px]">
							<div className="absolute inset-0 grid grid-cols-3 content-center p-10">
								{STATS.map((s, i) => (
									<div
										className={cn(
											"p-5",
											i > 2 && "border-white/10 border-t",
											i % 3 < 2 && "border-white/10 border-r"
										)}
										key={s.n}
									>
										<div className="font-display font-medium text-[32px] text-white">
											{s.n}
										</div>
										<div className="mt-1 text-[11px] text-white/55 uppercase tracking-[0.14em]">
											{s.l}
										</div>
									</div>
								))}
							</div>
						</div>
					</PageContainer>
				</section>

				{recentTools.length > 0 && (
					<section className="bg-gray-10 px-[56px] py-[72px]">
						<PageContainer>
							<SectionHeader
								label="03 · Novidades"
								link={{ href: "/catalog?sort=newest", label: "Ver todas" }}
								title="Recém-chegadas"
							/>
							<div className="grid grid-cols-4 gap-6">
								{recentTools.map((tool) => (
									<ProductCard key={tool.id} tool={tool} />
								))}
							</div>
						</PageContainer>
					</section>
				)}
			</main>

			<SiteFooter />
		</>
	);
}
