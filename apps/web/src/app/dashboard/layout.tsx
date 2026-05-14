import { SiteHeader } from "@/components/site-header";
import { requireCurrentClient } from "@/lib/session";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireCurrentClient();

	return (
		<>
			<SiteHeader />
			<main className="grid h-[calc(100vh-3.5rem)] w-full grid-cols-1 md:grid-cols-[260px_1fr]">
				<DashboardSidebar userName={session.user.name} />
				<div className="min-w-0 overflow-y-auto px-6 py-10 md:px-10">
					{children}
				</div>
			</main>
		</>
	);
}
