import { PageContainer } from "@/components/page-container";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<PageContainer className="animate-pulse py-10">
				<div className="mb-6 h-3 w-64 bg-gray-20" />
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
					<div>
						<div className="mb-3 aspect-square w-full bg-gray-20" />
						<div className="grid grid-cols-4 gap-2">
							{[0, 1, 2, 3].map((i) => (
								<div className="aspect-square bg-gray-20" key={i} />
							))}
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-3 w-24 bg-gray-20" />
						<div className="h-8 w-3/4 bg-gray-20" />
						<div className="h-3 w-32 bg-gray-20" />
						<div className="mt-6 h-12 w-48 bg-gray-20" />
						<div className="h-4 w-56 bg-gray-20" />
						<div className="mt-8 space-y-2">
							<div className="h-3 w-full bg-gray-20" />
							<div className="h-3 w-5/6 bg-gray-20" />
						</div>
						<div className="mt-8 flex gap-3">
							<div className="h-11 w-32 bg-gray-20" />
							<div className="h-11 flex-1 bg-gray-20" />
						</div>
					</div>
				</div>
			</PageContainer>
		</>
	);
}
