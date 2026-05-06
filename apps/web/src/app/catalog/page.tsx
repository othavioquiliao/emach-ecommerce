import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CatalogContent } from "./_components/catalog-content";

interface CatalogPageProps {
	searchParams: Promise<{
		cat?: string;
		q?: string;
	}>;
}

export async function generateMetadata({
	searchParams,
}: CatalogPageProps): Promise<Metadata> {
	const { cat, q } = await searchParams;
	if (q) {
		return {
			title: `“${q}” — Catálogo EMACH`,
			description: `Resultados de busca para “${q}” no catálogo EMACH.`,
		};
	}
	if (cat) {
		return {
			title: `${cat} — Catálogo EMACH`,
			description: `Explore produtos da categoria ${cat} no catálogo EMACH.`,
		};
	}
	return {
		title: "Catálogo — EMACH",
		description:
			"Explore ferramentas elétricas, manuais, equipamentos de medição e segurança EMACH.",
	};
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
	const { cat, q } = await searchParams;
	return (
		<>
			<SiteHeader />
			<CatalogContent initialCat={cat ?? null} initialQuery={q ?? ""} />
			<SiteFooter />
		</>
	);
}
