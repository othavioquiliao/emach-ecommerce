import { PageContainer } from "@/components/page-container";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<section className="bg-near-black py-12">
				<PageContainer className="animate-pulse">
					<div className="mb-3 h-3 w-40 bg-white/10" />
					<div className="h-10 w-64 bg-white/10 sm:w-80" />
				</PageContainer>
			</section>
			<PageContainer className="grid animate-pulse grid-cols-1 gap-0 py-8 lg:grid-cols-[260px_1fr] lg:gap-10">
				<aside className="hidden space-y-4 lg:block">
					<div className="h-3 w-24 bg-gray-10" />
					{[0, 1, 2, 3, 4].map((i) => (
						<div className="h-4 w-full bg-gray-10" key={i} />
					))}
				</aside>
				<div>
					<div className="mb-6 h-10 w-full bg-gray-10" />
					<div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
						{Array.from({ length: 9 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				</div>
			</PageContainer>
		</>
	);
}
