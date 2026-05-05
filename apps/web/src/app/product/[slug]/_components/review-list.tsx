import type { Review } from "@emach/db/schema/reviews";
import type { Route } from "next";
import Link from "next/link";
import { ReviewCard } from "./review-card";
import { ReviewSort, type ReviewSortKey } from "./review-sort";

interface ReviewListProps {
	currentSearchParams: Record<string, string | string[] | undefined>;
	page: number;
	pageSize: number;
	pathname: string;
	reviews: Array<Review & { clientName: string }>;
	sort: ReviewSortKey;
	total: number;
}

function pickSort(
	currentParams: Record<string, string | string[] | undefined>,
	updates: { reviewSort?: ReviewSortKey | null }
): ReviewSortKey | null {
	if ("reviewSort" in updates) {
		return updates.reviewSort ?? null;
	}
	const raw = currentParams.reviewSort;
	return typeof raw === "string" ? (raw as ReviewSortKey) : null;
}

function pickPage(
	currentParams: Record<string, string | string[] | undefined>,
	updates: { reviewPage?: number | null }
): number | null {
	if ("reviewPage" in updates) {
		return updates.reviewPage ?? null;
	}
	const raw = currentParams.reviewPage;
	return typeof raw === "string" ? Number(raw) : null;
}

function buildHref(
	pathname: string,
	currentParams: Record<string, string | string[] | undefined>,
	updates: { reviewPage?: number | null; reviewSort?: ReviewSortKey | null }
): Route {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(currentParams)) {
		if (key === "reviewPage" || key === "reviewSort") {
			continue;
		}
		if (Array.isArray(value)) {
			for (const v of value) {
				params.append(key, v);
			}
		} else if (typeof value === "string") {
			params.set(key, value);
		}
	}

	const sort = pickSort(currentParams, updates);
	const page = pickPage(currentParams, updates);

	if (sort && sort !== "newest") {
		params.set("reviewSort", sort);
	}
	if (page && page > 1) {
		params.set("reviewPage", String(page));
	}

	const qs = params.toString();
	return (qs ? `${pathname}?${qs}` : pathname) as Route;
}

export function ReviewList({
	reviews,
	total,
	page,
	pageSize,
	sort,
	pathname,
	currentSearchParams,
}: ReviewListProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const prevHref =
		page > 1
			? buildHref(pathname, currentSearchParams, { reviewPage: page - 1 })
			: null;
	const nextHref =
		page < totalPages
			? buildHref(pathname, currentSearchParams, { reviewPage: page + 1 })
			: null;

	return (
		<>
			<ReviewSort current={sort} />

			{reviews.length === 0 ? (
				<div className="py-12 text-center text-[14px] text-gray-60">
					Nenhuma avaliação aprovada ainda.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2">
					{reviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</div>
			)}

			{totalPages > 1 && (
				<nav
					aria-label="Paginação de avaliações"
					className="mt-8 flex items-center justify-center gap-3"
				>
					{prevHref ? (
						<Link
							className="border border-foreground bg-background px-5 py-2 font-display font-semibold text-[11px] text-foreground uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
							href={prevHref}
							scroll={false}
						>
							Anterior
						</Link>
					) : (
						<span className="border border-gray-20 bg-background px-5 py-2 font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
							Anterior
						</span>
					)}
					<span className="font-display text-[11px] text-gray-60 uppercase tracking-[0.14em]">
						Página {page} de {totalPages}
					</span>
					{nextHref ? (
						<Link
							className="border border-foreground bg-background px-5 py-2 font-display font-semibold text-[11px] text-foreground uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
							href={nextHref}
							scroll={false}
						>
							Próxima
						</Link>
					) : (
						<span className="border border-gray-20 bg-background px-5 py-2 font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
							Próxima
						</span>
					)}
				</nav>
			)}
		</>
	);
}
