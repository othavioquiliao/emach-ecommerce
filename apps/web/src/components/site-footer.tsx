"use client";

import { Separator } from "@emach/ui/components/separator";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/page-container";
import { SectionLabel } from "@/components/section-label";

interface FooterLink {
	featured?: boolean;
	href: Route;
	label: string;
}

interface FooterColumn {
	links: FooterLink[];
	title: string;
}

const footerColumns = [
	{
		title: "PRODUTOS",
		links: [
			{
				label: "Ferramentas Elétricas",
				href: "/catalog?cat=eletricas" as Route,
			},
			{
				label: "Ferramentas Manuais",
				href: "/catalog?cat=manuais" as Route,
			},
			{ label: "Acessórios", href: "/catalog?cat=acessorios" as Route },
			{
				label: "Ver Catálogo Completo",
				href: "/catalog",
				featured: true,
			},
		],
	},
	{
		title: "SUPORTE",
		links: [
			{ label: "Central de Ajuda", href: "#" as Route },
			{ label: "Garantia", href: "#" as Route },
			{ label: "Rastrear Pedido", href: "#" as Route },
			{ label: "Assistência Técnica", href: "#" as Route },
		],
	},
	{
		title: "EMPRESA",
		links: [
			{ label: "Sobre a EMACH", href: "/sobre" },
			{ label: "Trabalhe Conosco", href: "#" as Route },
			{ label: "Contato", href: "#" as Route },
		],
	},
] satisfies FooterColumn[];

const placeholderHref = "#" as Route;

const linkClassName =
	"rounded-[2px] text-[13px]/[2.1] text-gray-50 no-underline transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3";

const legalLinkClassName =
	"rounded-[2px] text-gray-60 no-underline transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3";

export function SiteFooter() {
	const footerRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		if (mediaQuery.matches) {
			setIsVisible(true);
			return;
		}

		const footer = footerRef.current;

		if (!footer) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(footer);

		return () => observer.disconnect();
	}, []);

	return (
		<footer
			className={`bg-cinema-3 pt-20 pb-10 text-white transition-opacity duration-600 ease-out motion-reduce:transition-none ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
			ref={footerRef}
			role="contentinfo"
		>
			<PageContainer>
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-20">
					<Image
						alt="EMACH"
						className="h-14 w-auto md:h-16 lg:h-24"
						height={377}
						src="/emach-logo-red.svg"
						width={2041}
					/>
					<p className="max-w-[560px] font-display font-medium text-[24px]/[1.15] text-white md:text-[28px]/[1.1]">
						Ferramentas profissionais. Engenharia de alta performance.
					</p>
				</div>

				<div className="mt-12 h-px w-full bg-emach-red" />

				<nav
					aria-label="Footer"
					className="mt-16 grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-8 lg:gap-16"
				>
					{footerColumns.map((col) => (
						<div key={col.title}>
							<SectionLabel className="text-[12px]/none" tone="accent">
								{col.title}
							</SectionLabel>
							<ul className="mt-6 space-y-3">
								{col.links.map((link) => (
									<li key={link.label}>
										{link.featured ? (
											<Link
												className="group inline-flex items-center rounded-[2px] text-[13px]/[2.1] text-white no-underline transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
												href={link.href}
											>
												<span>{link.label}</span>
												<ArrowRight
													aria-hidden="true"
													className="ml-1 transition-transform duration-200 ease-out group-hover:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
													size={12}
													strokeWidth={2}
												/>
											</Link>
										) : (
											<Link className={linkClassName} href={link.href}>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				<div className="mt-20 lg:mt-24">
					<Separator className="bg-cinema-1" />
					<div className="mt-7 flex flex-col gap-3 font-sans text-[11px]/[1.5] text-gray-60 md:flex-row md:items-center md:justify-between">
						<p>
							© 2026 EMACH Ferramentas Profissionais. Todos os direitos
							reservados.
						</p>
						<div className="flex items-center gap-4">
							<Link className={legalLinkClassName} href={placeholderHref}>
								Termos
							</Link>
							<span aria-hidden="true" className="text-[#3A3A3A]">
								·
							</span>
							<Link className={legalLinkClassName} href={placeholderHref}>
								Privacidade
							</Link>
						</div>
					</div>
				</div>
			</PageContainer>
		</footer>
	);
}
