import { requireCurrentClient } from "@/lib/session";
import { DashboardNavMobile } from "./dashboard-nav-mobile";
import { DashboardSidebar } from "./dashboard-sidebar";

// Guarda P0 (#98) sob Suspense (exigência do cacheComponents): a validação
// real da sessão (`requireCurrentClient` → getSession + redirect) roda AQUI,
// dentro do boundary, e `{children}` só renderiza DEPOIS dela resolver — o
// não-autenticado vê apenas o skeleton e é redirecionado, sem vazar dados.
export async function DashboardChrome({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireCurrentClient();

	return (
		<main
			className="grid h-[calc(100vh-3.5rem)] w-full grid-cols-1 md:grid-cols-[260px_1fr]"
			id="main-content"
		>
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
	);
}
