import type { PromotionWithTools } from "@emach/db/queries/catalog";
import Link from "next/link";
import { emachButtonVariants } from "@/components/emach-button";
import { PageContainer } from "@/components/page-container";
import { ProductGrid } from "@/components/product-grid";
import { PromoCountdown } from "@/components/promo-countdown";
import { SectionLabel } from "@/components/section-label";

interface PromoHighlightProps {
	promotion: PromotionWithTools;
}

export function PromoHighlight({ promotion }: PromoHighlightProps) {
	return (
		<section className="bg-black text-white">
			<PageContainer className="px-14 py-18">
				<div className="flex flex-col gap-8 border-white/10 border-b pb-8 md:flex-row md:items-end md:justify-between">
					<div className="flex flex-col gap-3">
						<SectionLabel tone="accent">Ofertas</SectionLabel>
						<h2 className="font-display font-medium text-[44px] text-white leading-[1.02] tracking-[-0.01em]">
							{promotion.title}
						</h2>
					</div>
					{promotion.endsAt && (
						<PromoCountdown endsAt={promotion.endsAt.toISOString()} />
					)}
				</div>

				<div className="pt-10">
					<ProductGrid tools={promotion.tools} />
				</div>

				<div className="mt-10 flex justify-center">
					<Link
						className={emachButtonVariants({
							size: "lg",
							variant: "outline-light",
						})}
						href="/catalog?promo=1"
					>
						Ver todas as ofertas
					</Link>
				</div>
			</PageContainer>
		</section>
	);
}
