import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { requireCurrentClient } from "@/lib/session";
import { DashboardNavMobile } from "./_components/dashboard-nav-mobile";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

export const metadata: Metadata = {
	title: "Minha conta",
	robots: { index: false, follow: false },
};

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
				<DashboardSidebar
					userEmail={session.user.email}
					userImage={session.user.image}
					userName={session.user.name}
				/>
				<div className="flex min-w-0 flex-col overflow-y-auto">
					<DashboardNavMobile />
					<div className="min-w-0">{children}</div>
				</div>
			</main>
		</>
	);
}
