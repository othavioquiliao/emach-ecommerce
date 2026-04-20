import Link from "next/link";

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
		<footer
			className="px-10 pt-16 pb-7 text-white"
			style={{ background: "var(--gray-90)" }}
		>
			<div
				className="mx-auto grid grid-cols-4 gap-10"
				style={{ maxWidth: 1440 }}
			>
				{footerColumns.map((col) => (
					<div key={col.title}>
						<h4 className="mb-4 font-bold font-display text-xs uppercase tracking-[0.14em]">
							{col.title}
						</h4>
						<ul className="flex flex-col gap-[10px]">
							{col.links.map((link) => (
								<li key={link.label}>
									<Link
										className="text-[13px] transition-colors hover:text-white"
										href={link.href}
										style={{ color: "rgba(255,255,255,0.65)" }}
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
					<p
						className="mb-[14px] text-[13px] leading-relaxed"
						style={{ color: "rgba(255,255,255,0.65)" }}
					>
						Receba novidades e ofertas exclusivas.
					</p>
					<div className="flex gap-0">
						<input
							aria-label="Seu e-mail"
							className="emach-input emach-input--dark flex-1"
							placeholder="seu@email.com"
							style={{ borderRadius: 0 }}
							type="email"
						/>
						<button
							className="h-11 px-5 font-semibold text-sm text-white"
							style={{ background: "var(--emach-red)" }}
							type="button"
						>
							Cadastrar
						</button>
					</div>
				</div>
			</div>

			<hr className="emach-hr--dark mx-auto mt-12" style={{ maxWidth: 1440 }} />

			<div
				className="mx-auto mt-5 flex flex-row justify-between gap-3 text-[12px]"
				style={{ maxWidth: 1440, color: "rgba(255,255,255,0.45)" }}
			>
				<div>© 2026 EMACH Ferramentas Profissionais.</div>
				<div className="flex gap-5">
					<span>Termos</span>
					<span>Privacidade</span>
				</div>
			</div>
		</footer>
	);
}
