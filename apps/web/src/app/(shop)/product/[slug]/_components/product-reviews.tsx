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
	const totalReviews =
		stats.distribution[1] +
		stats.distribution[2] +
		stats.distribution[3] +
		stats.distribution[4] +
		stats.distribution[5];
	const bars = ([5, 4, 3, 2, 1] as const).map((star) => ({
		star,
		pct:
			totalReviews > 0
				? Math.round((stats.distribution[star] / totalReviews) * 100)
				: 0,
	}));

	return (
		<section className="emach-bg-cinema text-white [color-scheme:dark]">
			<div className="px-20 pt-12 pb-2">
				<SectionLabel tone="accent">O que dizem os clientes</SectionLabel>
			</div>
			<div className="grid grid-cols-1 border-white/15 border-y md:grid-cols-[300px_1fr]">
				<div className="flex flex-col justify-center gap-2 border-white/15 px-20 py-6 md:border-r md:px-10">
					<div className="flex items-baseline gap-2 font-display font-medium text-[56px] tabular-nums leading-none">
						{avg.toFixed(1).replace(".", ",")}
						<span className="text-[20px] text-white/50">/ 5</span>
					</div>
					<StarRating rating={avg} size={16} />
					<div className="text-[13.5px] text-white/70">
						<strong className="text-white">{stats.count}</strong> avaliações ·{" "}
						<strong className="text-white">{recommend}%</strong> recomendam
					</div>
				</div>
				<div className="flex flex-col justify-center gap-2 px-20 py-6 md:px-10">
					{bars.map((b) => (
						<div className="flex items-center gap-3 text-[13px]" key={b.star}>
							<span className="w-9 flex-none font-semibold">{b.star} ★</span>
							<span className="h-[7px] flex-1 bg-white/10">
								<span
									className="block h-full bg-emach-red"
									style={{ width: `${b.pct}%` }}
								/>
							</span>
							<span className="w-10 text-right tabular-nums">{b.pct}%</span>
						</div>
					))}
				</div>
			</div>
			<div className="border-white/12 border-b px-20 py-3.5 md:px-10">
				<span className="font-display font-semibold text-[11px] text-white/60 uppercase tracking-[0.12em]">
					{totalReviews} avaliações
				</span>
			</div>
			<ReviewList
				currentSearchParams={currentSearchParams}
				gridCols2
				page={page}
				pageSize={pageSize}
				pathname={pathname}
				reviews={reviews}
				sort={sort}
				total={total}
			/>
		</section>
	);
}
