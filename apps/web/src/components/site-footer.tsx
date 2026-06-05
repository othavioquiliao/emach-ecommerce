import { db } from "@emach/db";
import { branch as branchTable } from "@emach/db/schema/inventory";
import { asc, eq } from "drizzle-orm";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";

const placeholderHref = "#" as Route;

const linkClassName =
	"rounded-[2px] font-medium text-[13.5px] text-gray-20 no-underline transition-colors duration-150 ease-out hover:text-emach-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3";

const headingClassName =
	"mb-3.5 font-display font-semibold text-[12.5px] text-white uppercase tracking-[0.14em]";

const navLinks: { href: Route; label: string }[] = [
	{ href: "/catalog", label: "Catálogo" },
	{ href: "/catalog", label: "Categorias" },
	{ href: "/catalog?promo=1" as Route, label: "Ofertas" },
	{ href: "/catalog?sort=newest" as Route, label: "Novidades" },
];

const institutionalLinks: { href: Route; label: string }[] = [
	{ href: "/sobre", label: "Sobre a EMACH" },
	{ href: "/sobre#filiais" as Route, label: "Filiais" },
];

const socialLinks = [
	{ href: placeholderHref, Icon: Instagram, label: "Instagram" },
	{ href: placeholderHref, Icon: Linkedin, label: "LinkedIn" },
	{ href: placeholderHref, Icon: Youtube, label: "YouTube" },
];

function getFooterBranches() {
	return db
		.select({
			id: branchTable.id,
			name: branchTable.name,
			state: branchTable.state,
		})
		.from(branchTable)
		.where(eq(branchTable.status, "active"))
		.orderBy(asc(branchTable.createdAt), asc(branchTable.id))
		.limit(3);
}

export async function SiteFooter() {
	const branches = await getFooterBranches();

	return (
		<footer className="bg-cinema-3 text-gray-60" role="contentinfo">
			<PageContainer className="py-10">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.1fr] lg:gap-11">
					<div>
						<Link
							aria-label="EMACH"
							className="-ml-4 inline-flex rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
							href="/"
						>
							<Image
								alt="EMACH"
								className="h-7 w-auto"
								height={377}
								priority={false}
								src="/emach-logo-red.svg"
								width={2041}
							/>
						</Link>
						<p className="mt-3.5 max-w-62.5 text-[13px] text-gray-55 leading-relaxed">
							Ferramentas profissionais que não abandonam você no meio da obra.
						</p>
						<nav
							aria-label="Redes sociais"
							className="mt-4 flex items-center gap-4"
						>
							{socialLinks.map(({ href, Icon, label }) => (
								<Link
									aria-label={label}
									className="rounded-[2px] text-gray-20 transition-colors hover:text-emach-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
									href={href}
									key={label}
								>
									<Icon aria-hidden="true" size={20} strokeWidth={1.5} />
								</Link>
							))}
						</nav>
						<div className="mt-6 text-[12.5px] text-gray-55 leading-relaxed">
							<p className="font-medium text-gray-20">
								EMACH Ferramentas Gerais LTDA
							</p>
							<p>CNPJ 04.128.615/0001-59</p>
							<p>
								<span className="text-emach-red">©</span> 2026 EMACH. Todos os
								direitos reservados.
							</p>
						</div>
					</div>

					<nav aria-label="Navegar">
						<h4 className={headingClassName}>Navegar</h4>
						<ul className="flex flex-col gap-2.5">
							{navLinks.map((link) => (
								<li key={link.label}>
									<Link className={linkClassName} href={link.href}>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<nav aria-label="Institucional">
						<h4 className={headingClassName}>Institucional</h4>
						<ul className="flex flex-col gap-2.5">
							{institutionalLinks.map((link) => (
								<li key={link.label}>
									<Link className={linkClassName} href={link.href}>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<nav aria-label="Filiais">
						<h4 className={headingClassName}>Filiais</h4>
						<ul className="flex flex-col gap-2.5">
							{branches.map((branch) => (
								<li key={branch.id}>
									<Link
										className="flex flex-col rounded-[2px] no-underline transition-colors hover:text-emach-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
										href={"/sobre#filiais" as Route}
									>
										<span className="font-medium text-[13.5px] text-gray-20">
											{branch.name}
										</span>
										{branch.state && (
											<span className="font-display text-[11px] text-gray-55 uppercase tracking-[0.12em]">
												{branch.state}
											</span>
										)}
									</Link>
								</li>
							))}
							<li className="mt-1">
								<Link
									className="inline-flex items-center gap-1.5 rounded-[2px] font-display font-semibold text-[11px] text-emach-red uppercase tracking-[0.1em] no-underline transition-colors hover:text-emach-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
									href={"/sobre#filiais" as Route}
								>
									Ver todas →
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</PageContainer>
		</footer>
	);
}
