import Link from "next/link";

import { EmachButton } from "@/components/emach-button";
import { PageContainer } from "@/components/page-container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ProductNotFound() {
	return (
		<>
			<SiteHeader />
			<PageContainer
				as="main"
				className="flex flex-col items-center py-32 text-center"
			>
				<div className="font-display font-semibold text-[11px] text-emach-red uppercase tracking-[0.14em]">
					Produto indisponível
				</div>
				<h1 className="mt-4 font-display font-medium text-[clamp(36px,5vw,60px)] text-near-black leading-tight tracking-[-0.01em]">
					Esse produto saiu da bancada.
				</h1>
				<p className="mt-6 max-w-[440px] text-[15px] text-gray-60 leading-[1.6]">
					Pode ter sido descontinuado ou movido para outra categoria. Explore o
					catálogo completo para encontrar alternativas.
				</p>
				<div className="mt-8 flex gap-3">
					<Link href="/catalog">
						<EmachButton size="lg" variant="primary">
							Ver catálogo
						</EmachButton>
					</Link>
					<Link href="/">
						<EmachButton size="lg" variant="outline">
							Página inicial
						</EmachButton>
					</Link>
				</div>
			</PageContainer>
			<SiteFooter />
		</>
	);
}
