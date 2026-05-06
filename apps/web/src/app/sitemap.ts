import type { MetadataRoute } from "next";

import { categories, products } from "@/lib/mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: `${BASE_URL}/`, lastModified: now, priority: 1 },
		{ url: `${BASE_URL}/catalog`, lastModified: now, priority: 0.9 },
		{ url: `${BASE_URL}/cart`, lastModified: now, priority: 0.4 },
		{ url: `${BASE_URL}/login`, lastModified: now, priority: 0.4 },
	];

	const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
		url: `${BASE_URL}/catalog?cat=${c.slug}`,
		lastModified: now,
		priority: 0.8,
	}));

	const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
		url: `${BASE_URL}/product/${p.slug}`,
		lastModified: now,
		priority: 0.7,
	}));

	return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
