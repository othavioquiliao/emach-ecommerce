import { CircleCheckBig } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmachButton } from "@/components/emach-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
	title: "Pedido confirmado — EMACH",
	description: "Seu pedido EMACH foi confirmado com sucesso.",
	robots: { index: false, follow: false },
};

interface SuccessPageProps {
	searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({
	searchParams,
}: SuccessPageProps) {
	const { order } = await searchParams;
	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-[1440px] flex-col items-center px-10 py-28 text-center">
				<div
					className="flex items-center justify-center rounded-full"
					style={{
						width: 72,
						height: 72,
						background: "rgba(22,163,74,0.1)",
					}}
				>
					<CircleCheckBig size={32} style={{ color: "var(--success)" }} />
				</div>
				<div
					className="mt-6 font-display font-semibold text-[11px] uppercase tracking-[0.14em]"
					style={{ color: "var(--emach-red)" }}
				>
					Pedido confirmado
				</div>
				<h1
					className="mt-3 font-display font-medium text-[clamp(36px,5vw,56px)] leading-tight tracking-[-0.01em]"
					style={{ color: "var(--near-black)" }}
				>
					Obrigado pela compra.
				</h1>
				<p
					className="mt-5 max-w-[440px] text-[15px] leading-[1.6]"
					style={{ color: "var(--gray-60)" }}
				>
					Enviamos a confirmação por e-mail com todos os detalhes da entrega e
					nota fiscal. Você pode acompanhar o status pelo seu painel.
				</p>
				{order && (
					<div
						className="mt-6 font-display text-[13px] uppercase tracking-[0.14em]"
						style={{ color: "var(--near-black)" }}
					>
						Pedido #{order}
					</div>
				)}
				<div className="mt-8 flex gap-3">
					<Link href="/catalog">
						<EmachButton size="lg" variant="primary">
							Continuar comprando
						</EmachButton>
					</Link>
					<Link href="/">
						<EmachButton size="lg" variant="outline">
							Página inicial
						</EmachButton>
					</Link>
				</div>
			</main>
			<SiteFooter />
		</>
	);
}
