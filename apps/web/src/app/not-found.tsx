import Link from "next/link";

import { EmachButton } from "@/components/emach-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-[1440px] flex-col items-center px-10 py-32 text-center">
				<div
					className="font-display font-semibold text-[11px] uppercase tracking-[0.14em]"
					style={{ color: "var(--emach-red)" }}
				>
					Erro 404
				</div>
				<h1
					className="mt-4 font-display font-medium text-[clamp(48px,7vw,96px)] leading-none tracking-[-0.01em]"
					style={{ color: "var(--near-black)" }}
				>
					Página não encontrada.
				</h1>
				<p
					className="mt-6 max-w-[440px] text-[15px] leading-[1.6]"
					style={{ color: "var(--gray-60)" }}
				>
					Essa página pode ter sido movida, renomeada ou ainda está na oficina.
					Volte ao catálogo para seguir explorando.
				</p>
				<div className="mt-8 flex gap-3">
					<Link href="/">
						<EmachButton size="lg" variant="primary">
							Página inicial
						</EmachButton>
					</Link>
					<Link href="/catalog">
						<EmachButton size="lg" variant="outline">
							Ver catálogo
						</EmachButton>
					</Link>
				</div>
			</main>
			<SiteFooter />
		</>
	);
}
