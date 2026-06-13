"use client";

import { cn } from "@emach/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { signOut, useSession } from "@/lib/auth-client";

interface MobileMenuProps {
	onClose: () => void;
	open: boolean;
}

const NAV_LINKS: {
	href: "/catalog" | "/sobre" | "/sobre#filiais";
	label: string;
}[] = [
	{ href: "/catalog", label: "Catálogo" },
	{ href: "/sobre", label: "Sobre" },
	{ href: "/sobre#filiais", label: "Filiais" },
];

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function cycleFocus(container: HTMLElement, e: KeyboardEvent) {
	const focusables = Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
	);
	const first = focusables[0];
	const last = focusables.at(-1);
	if (!(first && last)) {
		return;
	}
	const active = document.activeElement as HTMLElement | null;
	if (e.shiftKey && active === first) {
		e.preventDefault();
		last.focus();
	} else if (!e.shiftKey && active === last) {
		e.preventDefault();
		first.focus();
	}
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
	const { data: session } = useSession();
	const pathname = usePathname();
	const panelRef = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	// Fecha ao navegar (troca de rota). Ref evita re-disparo ao abrir;
	// fechar quando já fechado é no-op. Backstop além do onClick de cada link.
	useEffect(() => {
		if (pathname) {
			onCloseRef.current();
		}
	}, [pathname]);

	// Esc fecha, Tab cicla foco, trava scroll do body e restaura foco ao sair.
	useEffect(() => {
		if (!open) {
			return;
		}
		previouslyFocused.current = document.activeElement as HTMLElement | null;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key === "Tab" && panelRef.current) {
				cycleFocus(panelRef.current, e);
			}
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const firstLink = panelRef.current?.querySelector<HTMLElement>("a[href]");
		firstLink?.focus();
		const toRestore = previouslyFocused.current;
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
			toRestore?.focus?.();
		};
	}, [open, onClose]);

	if (!open) {
		return null;
	}

	const isActive = (href: string) => {
		const [path, hash] = href.split("#");
		if (pathname !== path) {
			return false;
		}
		// Distingue /sobre de /sobre#filiais pelo hash atual da URL.
		const current = typeof window === "undefined" ? "" : window.location.hash;
		return hash ? current === `#${hash}` : current === "";
	};

	return (
		<div
			aria-label="Menu"
			aria-modal="true"
			className="fade-in fixed inset-0 z-[25] flex animate-in flex-col bg-black px-6 pt-20 pb-8 text-white duration-200 [color-scheme:dark] md:hidden"
			ref={panelRef}
			role="dialog"
		>
			<nav className="mt-2 flex flex-col">
				{NAV_LINKS.map((link, i) => {
					const active = isActive(link.href);
					return (
						<div
							className="fade-in slide-in-from-bottom-3 animate-in fill-mode-both duration-400 ease-out motion-reduce:animate-none"
							key={link.href}
							style={{ animationDelay: `${80 + i * 60}ms` }}
						>
							<Link
								className={cn(
									"relative block py-1 font-display font-semibold text-[clamp(40px,13vw,52px)] uppercase leading-[1.06] tracking-[0.01em] transition-colors",
									active ? "text-white" : "text-white/55 hover:text-white"
								)}
								href={link.href}
								onClick={onClose}
							>
								{active && (
									<span
										aria-hidden="true"
										className="absolute top-1/2 -left-6 size-2.5 -translate-y-1/2 bg-emach-red"
									/>
								)}
								{link.label}
							</Link>
						</div>
					);
				})}
			</nav>

			<div className="mt-auto">
				<div className="mb-5 h-px bg-white/12" />
				{session?.user ? (
					<div className="flex items-center gap-4 font-display text-[16px] uppercase tracking-[0.08em]">
						<Link
							className="text-white/80 transition-colors hover:text-white"
							href="/dashboard"
							onClick={onClose}
						>
							Minha conta
						</Link>
						<span aria-hidden="true" className="text-emach-red">
							·
						</span>
						<button
							className="cursor-pointer text-white/80 uppercase transition-colors hover:text-white"
							onClick={async () => {
								onClose();
								await signOut();
							}}
							type="button"
						>
							Sair
						</button>
					</div>
				) : (
					<div className="flex items-center gap-4 font-display text-[16px] uppercase tracking-[0.08em]">
						<Link
							className="text-white/80 transition-colors hover:text-white"
							href="/login"
							onClick={onClose}
						>
							Entrar
						</Link>
						<span aria-hidden="true" className="text-emach-red">
							·
						</span>
						<Link
							className="text-white/80 transition-colors hover:text-white"
							href="/login"
							onClick={onClose}
						>
							Criar conta
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
