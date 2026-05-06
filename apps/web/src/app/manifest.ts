import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "EMACH — Ferramentas Profissionais",
		short_name: "EMACH",
		description:
			"Ferramentas elétricas e manuais de alta performance para profissionais.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		lang: "pt-BR",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
		],
	};
}
