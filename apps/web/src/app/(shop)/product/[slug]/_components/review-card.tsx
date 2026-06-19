import type { Review } from "@emach/db/schema/reviews";
import { cn } from "@emach/ui/lib/utils";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
	index: number;
	lastRowStart: number;
	review: Review & { clientName: string };
	total: number;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
	day: "2-digit",
	month: "short",
	year: "numeric",
});
const TRAILING_DOT = /\.$/u;

function formatReviewDate(date: Date): string {
	return DATE_FORMATTER.format(date).replace(TRAILING_DOT, "").toUpperCase();
}

export function ReviewCard({
	review,
	index,
	total,
	lastRowStart,
}: ReviewCardProps) {
	return (
		<article
			className={cn(
				"border-white/12 border-b px-6 py-6",
				index % 2 === 0 && "md:border-r",
				index >= lastRowStart && "md:border-b-0",
				index === total - 1 && "max-md:border-b-0"
			)}
		>
			<header className="mb-2.5 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<StarRating rating={review.rating} />
					<span className="font-semibold text-[13px] text-white">
						{review.clientName}
					</span>
				</div>
				<time
					className="font-display text-[11px] text-white/50 uppercase tracking-[0.08em]"
					dateTime={review.createdAt.toISOString()}
				>
					{formatReviewDate(review.createdAt)}
				</time>
			</header>
			{review.title && (
				<h3 className="mb-1 font-semibold text-[14px] text-white">
					{review.title}
				</h3>
			)}
			{review.body && (
				<p className="text-[13.5px] text-white/72 leading-relaxed">
					{review.body}
				</p>
			)}
		</article>
	);
}
