// Fallback estático do Suspense da guarda (cacheComponents): mantém o frame
// sidebar+conteúdo sem dados sensíveis enquanto a sessão é validada. Para o
// não-autenticado é só isto que renderiza antes do redirect — nunca dados.
export function DashboardChromeSkeleton() {
	return (
		<main className="grid h-[calc(100vh-3.5rem)] w-full grid-cols-1 md:grid-cols-[260px_1fr]">
			<div className="hidden bg-near-black md:block" />
			<div className="flex min-w-0 flex-col overflow-y-auto" />
		</main>
	);
}
