import { SectionLabel } from "@/components/section-label";
import type { Product } from "@/lib/mock-data";
import { getReviewsByProductId } from "@/lib/mock-data";
import { ReviewList } from "./review-list";
import { StarRating } from "./star-rating";

interface ProductReviewsProps {
	product: Product;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW_DAYS = 30;

function computeStats(reviews: { rating: number; date: string }[]) {
	const count = reviews.length;
	const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
	const average = count > 0 ? sum / count : 0;

	const positive = reviews.filter((r) => r.rating >= 4).length;
	const recommendPct = count > 0 ? Math.round((positive / count) * 100) : 0;

	const cutoff = Date.now() - RECENT_WINDOW_DAYS * DAY_MS;
	const recent = reviews.filter(
		(r) => new Date(`${r.date}T00:00:00`).getTime() >= cutoff
	);
	const recentAvg =
		recent.length > 0
			? recent.reduce((acc, r) => acc + r.rating, 0) / recent.length
			: average;

	return { average, count, recommendPct, recentAvg };
}

export function ProductReviews({ product }: ProductReviewsProps) {
	const reviews = getReviewsByProductId(product.id);
	const stats = computeStats(reviews);

	return (
		<section className="w-full py-10">
			<div className="mx-auto mb-5 max-w-7xl">
				<SectionLabel tone="accent">O que dizem os clientes</SectionLabel>
			</div>
			<div className="mt-5 flex flex-col items-start gap-5 border-gray-20 border-b pb-6 md:flex-row md:items-center md:gap-8">
				<div className="mx-auto flex max-w-7xl items-center justify-center gap-5">
					<div className="flex max-w-7xl items-baseline justify-center gap-1.5">
						<span className="font-display font-medium text-[40px] text-foreground tabular-nums leading-none tracking-[-0.02em]">
							{stats.average.toFixed(1)}
						</span>
						<span className="text-gray-50 text-sm">/5</span>
					</div>

					<StarRating rating={stats.average} size={16} />

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
							{stats.recommendPct}%
						</span>
						<span className="font-display text-[10px] text-gray-50 uppercase tracking-[0.14em]">
							recomendam
						</span>
					</div>

					<div className="flex items-baseline gap-1.5">
						<span className="font-display font-medium text-[15px] text-foreground tabular-nums">
							{stats.recentAvg.toFixed(1)}
						</span>
						<span className="font-display text-[10px] text-gray-50 uppercase tracking-[0.14em]">
							últimos 30 dias
						</span>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl">
				<ReviewList reviews={reviews} />
			</div>
		</section>
	);
}
