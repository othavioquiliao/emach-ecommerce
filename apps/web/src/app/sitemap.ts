import { db } from "@emach/db";
import {
	getAllCategorySlugs,
	getAllToolSlugs,
} from "@emach/db/queries/catalog";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: `${BASE_URL}/`, lastModified: now, priority: 1 },
		{ url: `${BASE_URL}/catalog`, lastModified: now, priority: 0.9 },
		{ url: `${BASE_URL}/cart`, lastModified: now, priority: 0.4 },
		{ url: `${BASE_URL}/login`, lastModified: now, priority: 0.4 },
	];

	const [toolSlugs, categorySlugs] = await Promise.all([
		getAllToolSlugs(db),
		getAllCategorySlugs(db),
	]);

	const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
		url: `${BASE_URL}/catalog?cat=${slug}`,
		lastModified: now,
		priority: 0.8,
	}));

	const productRoutes: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
		url: `${BASE_URL}/product/${slug}`,
		lastModified: now,
		priority: 0.7,
	}));

	return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
