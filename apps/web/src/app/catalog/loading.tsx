import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<section className="bg-[color:var(--near-black)] px-10 py-12">
				<div className="mx-auto max-w-[1440px] animate-pulse">
					<div className="mb-3 h-3 w-40 bg-white/10" />
					<div className="h-10 w-80 bg-white/10" />
				</div>
			</section>
			<div className="mx-auto grid max-w-[1440px] animate-pulse grid-cols-[260px_1fr] gap-10 px-10 py-8">
				<aside className="space-y-4">
					<div className="h-3 w-24 bg-[color:var(--gray-10)]" />
					{[0, 1, 2, 3, 4].map((i) => (
						<div className="h-4 w-full bg-[color:var(--gray-10)]" key={i} />
					))}
				</aside>
				<div>
					<div className="mb-6 h-10 w-full bg-[color:var(--gray-10)]" />
					<div className="grid grid-cols-3 gap-6">
						{Array.from({ length: 9 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				</div>
			</div>
			<SiteFooter />
		</>
	);
}
