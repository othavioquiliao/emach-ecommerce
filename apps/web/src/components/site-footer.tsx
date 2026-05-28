import { Instagram, Linkedin, Youtube } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";

const placeholderHref = "#" as Route;

const linkClassName =
	"rounded-[2px] no-underline transition-colors duration-150 ease-out hover:text-emach-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3";

const socialLinks = [
	{ href: placeholderHref, Icon: Instagram, label: "Instagram" },
	{ href: placeholderHref, Icon: Linkedin, label: "LinkedIn" },
	{ href: placeholderHref, Icon: Youtube, label: "YouTube" },
];

export function SiteFooter() {
	return (
		<footer className="bg-cinema-3 text-gray-60" role="contentinfo">
			<PageContainer className="py-8">
				<div className="flex flex-col items-center gap-6">
					<Link
						aria-label="EMACH"
						className="inline-flex rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emach-red focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-3"
						href="/"
					>
						<Image
							alt="EMACH"
							className="h-9 w-auto"
							height={377}
							priority={false}
							src="/emach-logo-red.svg"
							width={2041}
						/>
					</Link>
					<nav aria-label="Redes sociais" className="flex items-center gap-6">
						{socialLinks.map(({ href, Icon, label }) => (
							<Link
								aria-label={label}
								className={linkClassName}
								href={href}
								key={label}
							>
								<Icon aria-hidden="true" size={20} strokeWidth={1.5} />
							</Link>
						))}
					</nav>
				</div>
				<div className="mt-6 h-px w-full bg-cinema-1" />
				<div className="mt-6 flex flex-col items-center gap-2 text-center font-medium text-sm">
					<p>CNPJ 00.000.000/0001-00</p>
					<p className="text-emach-red">
						© 2026 EMACH Ferramentas Profissionais.
					</p>
				</div>
			</PageContainer>
		</footer>
	);
}
