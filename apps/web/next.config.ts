import path from "node:path";
import "@emach/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	// Cache Components (sucessor do PPR) — chave top-level no Next 16.
	// Torna o app dynamic-by-default: shells estáticos/cacheados + buracos
	// dinâmicos (cookies/headers/searchParams) sob Suspense.
	cacheComponents: true,
	experimental: {
		appNewScrollHandler: true,
		// lucide-react: tree-shaking de ícones. framer-motion fica de fora
		// de propósito — o tree-shaking dele vem do LazyMotion (ver Fase 2).
		optimizePackageImports: ["lucide-react"],
	},
	// Monorepo: aponta a raiz do workspace para o Turbopack resolver node_modules
	// corretamente (sem isto o Next 16 falha ao inferir a raiz a partir de src/app).
	turbopack: {
		root: path.join(import.meta.dirname, "../.."),
	},
	images: {
		formats: ["image/avif", "image/webp"],
		qualities: [75, 85],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "wrxohbzepoyscsacjzvd.supabase.co",
				pathname: "/storage/v1/object/public/tool-images/**",
			},
			{
				protocol: "https",
				hostname: "wrxohbzepoyscsacjzvd.supabase.co",
				pathname: "/storage/v1/object/public/banner-images/**",
			},
			{
				protocol: "https",
				hostname: "wrxohbzepoyscsacjzvd.supabase.co",
				pathname: "/storage/v1/object/public/tool-videos/**",
			},
		],
	},
};

export default nextConfig;
