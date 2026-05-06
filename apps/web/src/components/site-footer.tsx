import { Separator } from "@emach/ui/components/separator";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";

const footerColumns = [
	{
		title: "PRODUTOS",
		links: [
			{ label: "Ferramentas Elétricas", href: "/catalog?cat=eletricas" },
			{ label: "Ferramentas Manuais", href: "/catalog?cat=manuais" },
			{ label: "Medição", href: "/catalog?cat=medicao" },
			{ label: "Segurança", href: "/catalog?cat=seguranca" },
			{ label: "Acessórios", href: "/catalog?cat=acessorios" },
		],
	},
	{
		title: "SUPORTE",
		links: [
			{ label: "Central de Ajuda", href: "#" },
			{ label: "Garantia", href: "#" },
			{ label: "Assistência Técnica", href: "#" },
			{ label: "Rastrear Pedido", href: "#" },
		],
	},
	{
		title: "EMPRESA",
		links: [
			{ label: "Sobre a EMACH", href: "#" },
			{ label: "Trabalhe Conosco", href: "#" },
			{ label: "Imprensa", href: "#" },
			{ label: "Contato", href: "#" },
		],
	},
] as const;

export function SiteFooter() {
	return (
		<footer className="bg-gray-90 pt-16 pb-7 text-white">
			<PageContainer className="grid grid-cols-4 gap-10">
				{footerColumns.map((col) => (
					<div key={col.title}>
						<h4 className="mb-4 font-bold font-display text-xs uppercase tracking-[0.14em]">
							{col.title}
						</h4>
						<ul className="flex flex-col gap-[10px]">
							{col.links.map((link) => (
								<li key={link.label}>
									<Link
										className="text-[13px] text-white/65 transition-colors hover:text-white"
										href={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}

				<div>
					<h4 className="mb-4 font-bold font-display text-xs uppercase tracking-[0.14em]">
						NEWSLETTER
					</h4>
					<p className="mb-[14px] text-[13px] text-white/65 leading-relaxed">
						Receba novidades e ofertas exclusivas.
					</p>
					<div className="flex gap-0">
						<input
							aria-label="Seu e-mail"
							className="emach-input emach-input--dark min-w-0 flex-1 rounded-none"
							placeholder="seu@email.com"
							type="email"
						/>
						<button
							className="h-11 bg-emach-red px-5 font-semibold text-sm text-white"
							type="button"
						>
							Cadastrar
						</button>
					</div>
				</div>
			</PageContainer>

			<PageContainer className="mt-12">
				<Separator className="bg-white/10" />
			</PageContainer>

			<PageContainer className="mt-5 flex flex-row justify-between gap-3 text-[12px] text-white/45">
				<div>© 2026 EMACH Ferramentas Profissionais.</div>
				<div className="flex gap-5">
					<span>Termos</span>
					<span>Privacidade</span>
				</div>
			</PageContainer>
		</footer>
	);
}
