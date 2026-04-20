"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
			<header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#000] px-10">
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
							const active =
								pathname === link.href ||
								pathname?.startsWith(link.href.split("?")[0] ?? "");
							return (
								<Link
									className="font-semibold text-[12px] tracking-[0.04em] transition-colors"
									href={link.href}
									key={link.href}
									style={{
										color: active ? "#fff" : "rgba(255,255,255,0.75)",
										borderBottom: active
											? "2px solid var(--emach-red)"
											: "2px solid transparent",
										paddingBottom: 4,
									}}
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
