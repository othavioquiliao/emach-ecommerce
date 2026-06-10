import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/cart",
					"/checkout",
					"/dashboard",
					"/esqueci-senha",
					"/login",
					"/pedidos/",
					"/redefinir-senha",
					"/verificar-email",
				],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
