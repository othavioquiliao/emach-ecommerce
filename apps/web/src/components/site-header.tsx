"use client";

import { cn } from "@emach/ui/lib/utils";
import { Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SearchOverlay } from "@/components/search-overlay";
import { useCart } from "@/lib/cart-context";

const navLinks = [
	{ href: "/catalog", label: "Catálogo" },
	{ href: "/catalog?cat=eletricas", label: "Elétricas" },
	{ href: "/catalog?cat=manuais", label: "Manuais" },
	{ href: "/catalog?cat=medicao", label: "Medição" },
	{ href: "/catalog?cat=seguranca", label: "Segurança" },
] as const;

export function SiteHeader() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentCat = searchParams.get("cat");
	const { totalCount } = useCart();
	const [searchOpen, setSearchOpen] = useState(false);
	const [pulse, setPulse] = useState(false);
	const prevCount = useRef(totalCount);

	useEffect(() => {
		if (totalCount > prevCount.current) {
			setPulse(true);
			const t = window.setTimeout(() => setPulse(false), 450);
			return () => window.clearTimeout(t);
		}
		prevCount.current = totalCount;
		return;
	}, [totalCount]);

	return (
		<>
			<header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-black px-10">
				<div className="flex items-center gap-8">
					<Link href="/">
						<Image
							alt="EMACH"
							height={16}
							priority
							src="/emach-logo.svg"
							width={87}
						/>
					</Link>
					<nav className="flex items-center gap-[22px]">
						{navLinks.map((link) => {
							const [linkPath, linkQuery] = link.href.split("?");
							const linkCat = linkQuery
								? new URLSearchParams(linkQuery).get("cat")
								: null;
							const active =
								pathname === linkPath &&
								(linkCat ? currentCat === linkCat : !currentCat);
							return (
								<Link
									className={cn(
										"relative inline-block pb-1 font-semibold text-[12px] tracking-[0.04em] transition-colors",
										"after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-(--emach-red) after:transition-transform after:duration-300 after:ease-out after:content-['']",
										"hover:after:scale-x-100",
										active
											? "text-white after:scale-x-100"
											: "text-white/75 hover:text-white"
									)}
									href={link.href}
									key={link.href}
								>
									{link.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className="flex items-center gap-[18px] text-white">
					<button
						aria-label="Buscar"
						className="text-white/80 hover:text-white"
						onClick={() => setSearchOpen(true)}
						type="button"
					>
						<Search className="size-[18px]" />
					</button>
					<Link
						aria-label="Conta"
						className="text-white/80 hover:text-white"
						href="/login"
					>
						<User className="size-[18px]" />
					</Link>
					<Link
						aria-label={`Carrinho com ${totalCount} itens`}
						className="relative text-white/80 hover:text-white"
						href="/cart"
					>
						<ShoppingBag className="size-[18px]" />
						{totalCount > 0 && (
							<span
								aria-hidden="true"
								className="emach-cart-badge absolute -top-1.5 -right-2 flex min-w-4 items-center justify-center rounded-none px-1 font-bold text-[10px] text-white"
								data-pulse={pulse ? "true" : undefined}
								style={{ background: "var(--emach-red)", height: 16 }}
							>
								{totalCount}
							</span>
						)}
					</Link>
				</div>
			</header>

			<SearchOverlay onClose={() => setSearchOpen(false)} open={searchOpen} />
		</>
	);
}
