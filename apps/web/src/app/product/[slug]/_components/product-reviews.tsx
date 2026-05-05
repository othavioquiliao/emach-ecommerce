import type { ToolDetail } from "@emach/db/queries/catalog";
import type { Review } from "@emach/db/schema/reviews";
import { SectionLabel } from "@/components/section-label";
import { ReviewList } from "./review-list";
import type { ReviewSortKey } from "./review-sort";
import { StarRating } from "./star-rating";

interface ProductReviewsProps {
	currentSearchParams: Record<string, string | string[] | undefined>;
	page: number;
	pageSize: number;
	pathname: string;
	reviews: Array<Review & { clientName: string }>;
	sort: ReviewSortKey;
	stats: ToolDetail["reviewStats"];
	total: number;
}

function recommendPct(distribution: ToolDetail["reviewStats"]["distribution"]) {
	const positive = distribution[4] + distribution[5];
	const total =
		distribution[1] +
		distribution[2] +
		distribution[3] +
		distribution[4] +
		distribution[5];
	if (total === 0) {
		return 0;
	}
	return Math.round((positive / total) * 100);
}

export function ProductReviews({
	stats,
	reviews,
	total,
	page,
	pageSize,
	sort,
	pathname,
	currentSearchParams,
}: ProductReviewsProps) {
	const avg = stats.avg ?? 0;
	const recommend = recommendPct(stats.distribution);

	return (
		<section className="w-full py-10">
			<div className="mx-auto mb-5 max-w-7xl">
				<SectionLabel tone="accent">O que dizem os clientes</SectionLabel>
			</div>
			<div className="mt-5 flex flex-col items-start gap-5 border-gray-20 border-b pb-6 md:flex-row md:items-center md:gap-8">
				<div className="mx-auto flex max-w-7xl items-center justify-center gap-5">
					<div className="flex max-w-7xl items-baseline justify-center gap-1.5">
						<span className="font-display font-medium text-[40px] text-foreground tabular-nums leading-none tracking-[-0.02em]">
							{avg.toFixed(1)}
						</span>
						<span className="text-gray-50 text-sm">/5</span>
					</div>

					<StarRating rating={avg} size={16} />

					<div className="flex items-baseline gap-1.5">
						<span className="font-display font-medium text-[15px] text-foreground tabular-nums">
							{stats.count}
						</span>
						<span className="font-display text-[10px] text-gray-50 uppercase tracking-[0.14em]">
							avaliações
						</span>
					</div>

					<div className="flex items-baseline gap-1.5">
						<span className="font-display font-medium text-[15px] text-foreground tabular-nums">
							{recommend}%
						</span>
						<span className="font-display text-[10px] text-gray-50 uppercase tracking-[0.14em]">
							recomendam
						</span>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl">
				<ReviewList
					currentSearchParams={currentSearchParams}
					page={page}
					pageSize={pageSize}
					pathname={pathname}
					reviews={reviews}
					sort={sort}
					total={total}
				/>
			</div>
		</section>
	);
}
