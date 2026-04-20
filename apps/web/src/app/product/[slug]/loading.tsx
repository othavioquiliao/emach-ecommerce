import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<div className="mx-auto max-w-[1440px] animate-pulse px-10 py-10">
				<div className="mb-6 h-3 w-64 bg-[color:var(--gray-10)]" />
				<div className="grid grid-cols-2 gap-16">
					<div>
						<div className="mb-3 aspect-square w-full bg-[color:var(--gray-10)]" />
						<div className="grid grid-cols-4 gap-2">
							{[0, 1, 2, 3].map((i) => (
								<div
									className="aspect-square bg-[color:var(--gray-10)]"
									key={i}
								/>
							))}
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-3 w-24 bg-[color:var(--gray-10)]" />
						<div className="h-8 w-3/4 bg-[color:var(--gray-10)]" />
						<div className="h-3 w-32 bg-[color:var(--gray-10)]" />
						<div className="mt-6 h-12 w-48 bg-[color:var(--gray-10)]" />
						<div className="h-4 w-56 bg-[color:var(--gray-10)]" />
						<div className="mt-8 space-y-2">
							<div className="h-3 w-full bg-[color:var(--gray-10)]" />
							<div className="h-3 w-5/6 bg-[color:var(--gray-10)]" />
						</div>
						<div className="mt-8 flex gap-3">
							<div className="h-11 w-32 bg-[color:var(--gray-10)]" />
							<div className="h-11 flex-1 bg-[color:var(--gray-10)]" />
						</div>
					</div>
				</div>
			</div>
			<SiteFooter />
		</>
	);
}
