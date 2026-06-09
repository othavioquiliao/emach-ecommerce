import { db } from "@emach/db";
import {
	getFeaturedPromotion,
	getRecentTools,
} from "@emach/db/queries/catalog";
import { category } from "@emach/db/schema/categories";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { BranchMapSection } from "@/components/branch-map-section";
import { CategoryGrid } from "@/components/category-grid";
import { HeroCarousel } from "@/components/hero-carousel";
import { PageContainer } from "@/components/page-container";
import { ProductCarousel } from "@/components/product-carousel";
import { PromoHighlight } from "@/components/promo-highlight";
import { SectionHeader } from "@/components/section-header";
import { SiteHeader } from "@/components/site-header";
import { getVoltagesByTool } from "@/lib/variant-voltages";

export const revalidate = 600;

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

export default async function HomePage() {
	const [rootCategories, featuredPromotion, recentTools] = await Promise.all([
		getRootCategories(),
		getFeaturedPromotion(db),
		getRecentTools(db, 8),
	]);

	const categoryImages = await getCategoryImages(
		rootCategories.map((c) => c.slug)
	);
	const rootCategoriesWithImages = rootCategories.map((c) => ({
		...c,
		imageUrl: categoryImages.get(c.slug) ?? null,
	}));

	const voltagesByTool = await getVoltagesByTool([
		...recentTools.map((t) => t.id),
		...(featuredPromotion?.tools.map((t) => t.id) ?? []),
	]);

	return (
		<>
			<SiteHeader overlay />

			<main>
				<HeroCarousel />

				{rootCategories.length > 0 && (
					<section className="bg-gray-10">
						<PageContainer className="px-14 py-18">
							<SectionHeader
								label="Categorias"
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

				{featuredPromotion && (
					<PromoHighlight
						promotion={featuredPromotion}
						voltagesByTool={voltagesByTool}
					/>
				)}

				{recentTools.length > 0 && (
					<section className="bg-gray-10 px-14 py-18">
						<PageContainer>
							<ProductCarousel
								label="Novidades"
								title="Recém-chegadas"
								tools={recentTools}
								voltagesByTool={voltagesByTool}
							/>
						</PageContainer>
					</section>
				)}

				<BranchMapSection />
			</main>
		</>
	);
}
