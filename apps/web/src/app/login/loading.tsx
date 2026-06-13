import { SiteHeader } from "@/components/site-header";

export default function Loading() {
	return (
		<>
			<SiteHeader />
			<div className="grid min-h-[calc(100vh-56px)] animate-pulse grid-cols-1 lg:grid-cols-2">
				<div className="hidden bg-[color:var(--near-black)] lg:block" />
				<div className="flex items-center justify-center bg-gray-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
					<div className="w-full max-w-[400px] space-y-4">
						<div className="flex border-[color:var(--border)] border-b">
							<div className="h-10 flex-1 bg-[color:var(--gray-10)]" />
							<div className="h-10 flex-1" />
						</div>
						<div className="h-11 w-full bg-[color:var(--gray-10)]" />
						<div className="h-11 w-full bg-[color:var(--gray-10)]" />
						<div className="mt-6 h-12 w-full bg-[color:var(--gray-10)]" />
						<div className="mt-8 h-11 w-full bg-[color:var(--gray-10)]" />
						<div className="h-11 w-full bg-[color:var(--gray-10)]" />
					</div>
				</div>
			</div>
		</>
	);
}
