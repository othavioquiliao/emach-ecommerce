import type { Review } from "@emach/db/schema/reviews";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
	review: Review & { clientName: string };
}

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});
const TRAILING_DOT = /\.$/u;

function formatReviewDate(date: Date): string {
	return DATE_FORMATTER.format(date).replace(TRAILING_DOT, "").toUpperCase();
}

export function ReviewCard({ review }: ReviewCardProps) {
	return (
		<article className="border-gray-20 border-b py-7 md:even:pl-8 md:odd:pr-8">
			<header className="mb-2.5 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<StarRating rating={review.rating} />
					<span className="font-semibold text-[13px] text-foreground">
						{review.clientName}
					</span>
				</div>
				<time
					className="font-display text-[11px] text-gray-50 uppercase tracking-[0.08em]"
					dateTime={review.createdAt.toISOString()}
				>
					{formatReviewDate(review.createdAt)}
				</time>
			</header>
			{review.title && (
				<h4 className="mb-1 font-semibold text-[14px] text-foreground">
					{review.title}
				</h4>
			)}
			{review.body && (
				<p className="text-[13.5px] text-gray-70 leading-relaxed">
					{review.body}
				</p>
			)}
		</article>
	);
}
