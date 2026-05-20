import { db } from "@emach/db";
import type { ToolListItem } from "@emach/db/queries/catalog";
import { getActivePromotions, getRecentTools } from "@emach/db/queries/catalog";
import { category } from "@emach/db/schema/categories";
import { cn } from "@emach/ui/lib/utils";
import { and, asc, eq, isNull } from "drizzle-orm";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { CategoryTile } from "@/components/category-tile";
import { EmachButton } from "@/components/emach-button";
import { HeroCarousel } from "@/components/hero-carousel";
import { PageContainer } from "@/components/page-container";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const revalidate = 600;

const TRUST_ITEMS = [
	{ icon: Truck, title: "Frete grátis", sub: "Acima de R$ 299" },
	{
		icon: ShieldCheck,
		title: "2 anos de garantia",
		sub: "Toda linha profissional",
	},
	{ icon: CreditCard, title: "12× sem juros", sub: "No cartão" },
	{ icon: RotateCcw, title: "30 dias para troca", sub: "Sem burocracia" },
];

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
		.limit(5);
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

	const promoTools = flattenPromoTools(activePromotions, 4);
	const tile0 = rootCategories[0];
	const tile1 = rootCategories[1];
	const tile2 = rootCategories[2];
	const tile3 = rootCategories[3];
	const tile4 = rootCategories[4];

	return (
		<>
			<SiteHeader overlay />

			<main>
				<HeroCarousel />

				<div className="border-border border-b bg-white">
					<PageContainer className="grid grid-cols-4 gap-6 py-[22px]">
						{TRUST_ITEMS.map((f) => (
							<div className="flex items-center gap-3" key={f.title}>
								<div className="flex size-9 items-center justify-center bg-gray-10">
									<f.icon size={18} />
								</div>
								<div>
									<div className="font-semibold text-[13px]">{f.title}</div>
									<div className="text-[12px] text-gray-60">{f.sub}</div>
								</div>
							</div>
						))}
					</PageContainer>
				</div>

				{rootCategories.length > 0 && (
					<PageContainer as="section" className="px-[56px] py-[72px]">
						<SectionHeader
							label="01 · Categorias"
							link={{ href: "/catalog", label: "Ver todas" }}
							title="Explorar por categoria"
						/>

						<div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-6">
							{tile0 && (
								<div className="row-span-2">
									<CategoryTile category={tile0} index={0} size="full" />
								</div>
							)}
							{tile1 && <CategoryTile category={tile1} index={1} />}
							{tile2 && <CategoryTile category={tile2} index={2} />}
							{tile3 && <CategoryTile category={tile3} index={3} />}
							{tile4 && <CategoryTile category={tile4} index={4} />}
						</div>
					</PageContainer>
				)}

				{promoTools.length > 0 && (
					<section className="bg-gray-10 px-[56px] py-[72px]">
						<PageContainer>
							<SectionHeader
								label="02 · Ofertas"
								link={{ href: "/catalog?promo=1", label: "Ver todas" }}
								title="Promoções ativas"
							/>
							<div className="grid grid-cols-4 gap-6">
								{promoTools.map((tool) => (
									<ProductCard key={tool.id} tool={tool} />
								))}
							</div>
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
