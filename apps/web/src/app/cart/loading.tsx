import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<div className="mx-auto max-w-[1440px] animate-pulse px-10 py-10">
				<div className="mb-8 h-10 w-40 bg-[color:var(--gray-10)]" />
				<div className="grid grid-cols-[1fr_400px] gap-8">
					<div className="space-y-4">
						{[0, 1, 2].map((i) => (
							<div
								className="grid grid-cols-[120px_1fr_auto] items-center gap-4 border-[color:var(--gray-10)] border-b py-4"
								key={i}
							>
								<div className="aspect-square w-[120px] bg-[color:var(--gray-10)]" />
								<div className="space-y-2">
									<div className="h-3 w-20 bg-[color:var(--gray-10)]" />
									<div className="h-4 w-60 bg-[color:var(--gray-10)]" />
									<div className="h-9 w-28 bg-[color:var(--gray-10)]" />
								</div>
								<div className="h-4 w-20 bg-[color:var(--gray-10)]" />
							</div>
						))}
					</div>
					<div className="space-y-3 bg-[color:var(--gray-10)] p-7">
						<div className="h-3 w-32 bg-white" />
						<div className="h-11 w-full bg-white" />
						<div className="mt-6 h-3 w-full bg-white" />
						<div className="h-3 w-full bg-white" />
						<div className="mt-6 h-12 w-full bg-white" />
					</div>
				</div>
			</div>
			<SiteFooter />
		</>
	);
}
