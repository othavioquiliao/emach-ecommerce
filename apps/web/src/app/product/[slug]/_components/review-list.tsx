"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@emach/ui/components/select";
import { useMemo, useState } from "react";
import type { Review } from "@/lib/mock-data";
import { ReviewCard } from "./review-card";

interface ReviewListProps {
	reviews: Review[];
}

type SortMode = "recent" | "best" | "worst";

const SORT_LABELS: Record<SortMode, string> = {
	recent: "Mais recentes",
	best: "Melhor avaliadas",
	worst: "Pior avaliadas",
};

const PAGE_SIZE = 6;

export function ReviewList({ reviews }: ReviewListProps) {
	const [sort, setSort] = useState<SortMode>("recent");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const sortedReviews = useMemo(() => {
		const sorted = [...reviews];
		if (sort === "recent") {
			sorted.sort((a, b) => b.date.localeCompare(a.date));
		} else if (sort === "best") {
			sorted.sort(
				(a, b) => b.rating - a.rating || b.date.localeCompare(a.date)
			);
		} else {
			sorted.sort(
				(a, b) => a.rating - b.rating || b.date.localeCompare(a.date)
			);
		}
		return sorted;
	}, [reviews, sort]);

	const visibleReviews = sortedReviews.slice(0, visibleCount);
	const remaining = sortedReviews.length - visibleReviews.length;

	const handleSort = (next: SortMode) => {
		setSort(next);
		setVisibleCount(PAGE_SIZE);
	};

	return (
		<>
			<div className="flex items-center justify-end gap-2 py-4">
				<span className="font-display text-[10px] text-gray-50 uppercase tracking-[0.14em]">
					Ordenar
				</span>
				<Select
					onValueChange={(value) => handleSort(value as SortMode)}
					value={sort}
				>
					<SelectTrigger className="h-8 min-w-[160px] border-gray-20">
						<SelectValue>
							{(value) => SORT_LABELS[value as SortMode]}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="recent">Mais recentes</SelectItem>
						<SelectItem value="best">Melhor avaliadas</SelectItem>
						<SelectItem value="worst">Pior avaliadas</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2">
				{visibleReviews.map((review) => (
					<ReviewCard key={review.id} review={review} />
				))}
			</div>

			{remaining > 0 && (
				<div className="mt-8 flex justify-center">
					<button
						className="border border-foreground bg-background px-6 py-2.5 font-display font-semibold text-[11px] text-foreground uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
						onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
						type="button"
					>
						Ver mais · {remaining} restantes
					</button>
				</div>
			)}
		</>
	);
}
