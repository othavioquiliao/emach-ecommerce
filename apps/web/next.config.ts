import path from "node:path";
import "@emach/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	experimental: {
		appNewScrollHandler: true,
	},
	// Monorepo: aponta a raiz do workspace para o Turbopack resolver node_modules
	// corretamente (sem isto o Next 16 falha ao inferir a raiz a partir de src/app).
	turbopack: {
		root: path.join(import.meta.dirname, "../.."),
	},
	images: {
		qualities: [75, 100],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "wrxohbzepoyscsacjzvd.supabase.co",
				pathname: "/storage/v1/object/public/tool-images/**",
			},
		],
	},
};

export default nextConfig;
