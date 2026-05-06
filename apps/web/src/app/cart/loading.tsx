import { PageContainer } from "@/components/page-container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<PageContainer className="animate-pulse py-10">
				<div className="mb-8 h-10 w-40 bg-gray-10" />
				<div className="grid grid-cols-[1fr_400px] gap-8">
					<div className="space-y-4">
						{[0, 1, 2].map((i) => (
							<div
								className="grid grid-cols-[120px_1fr_auto] items-center gap-4 border-gray-10 border-b py-4"
								key={i}
							>
								<div className="aspect-square w-[120px] bg-gray-10" />
								<div className="space-y-2">
									<div className="h-3 w-20 bg-gray-10" />
									<div className="h-4 w-60 bg-gray-10" />
									<div className="h-9 w-28 bg-gray-10" />
								</div>
								<div className="h-4 w-20 bg-gray-10" />
							</div>
						))}
					</div>
					<div className="space-y-3 bg-gray-10 p-7">
						<div className="h-3 w-32 bg-white" />
						<div className="h-11 w-full bg-white" />
						<div className="mt-6 h-3 w-full bg-white" />
						<div className="h-3 w-full bg-white" />
						<div className="mt-6 h-12 w-full bg-white" />
					</div>
				</div>
			</PageContainer>
			<SiteFooter />
		</>
	);
}
