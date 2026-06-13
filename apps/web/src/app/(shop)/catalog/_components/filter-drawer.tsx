"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EmachButton } from "@/components/emach-button";

interface FilterDrawerProps {
	activeCount: number;
	children: React.ReactNode;
	onClearAll: () => void;
	onClose: () => void;
	open: boolean;
	total: number;
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

/**
 * Drawer de filtros mobile. Overlay próprio (não Base UI Sheet) por controle
 * total do ciclo abrir/fechar e do scroll-lock — evita o conflito do React
 * Compiler com a gestão de transição/unmount da Base UI. Mesma mecânica do
 * MobileMenu: Esc, focus-trap, trava de scroll e restauração de foco.
 */
export function FilterDrawer({
	open,
	onClose,
	total,
	activeCount,
	onClearAll,
	children,
}: FilterDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);

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

	return (
		<div className="fade-in fixed inset-0 z-50 animate-in duration-150 lg:hidden">
			<button
				aria-label="Fechar filtros"
				className="absolute inset-0 cursor-default border-none bg-black/50"
				onClick={onClose}
				type="button"
			/>
			<div
				aria-label="Filtros"
				aria-modal="true"
				className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-gray-10 text-near-black"
				ref={panelRef}
				role="dialog"
			>
				<div className="flex items-center justify-between gap-2 border-emach-red border-b-2 bg-near-black px-5 py-4">
					<span className="font-bold font-display text-[15px] text-white uppercase tracking-[0.14em]">
						Filtros
					</span>
					<button
						aria-label="Fechar filtros"
						className="-mr-1.5 flex size-9 cursor-pointer items-center justify-center text-white/70 hover:text-white"
						onClick={onClose}
						type="button"
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

				<div className="flex items-center gap-3 border-border border-t bg-gray-10 p-4">
					{activeCount > 0 && (
						<button
							className="cursor-pointer font-display font-semibold text-[12px] text-emach-red-deep uppercase tracking-[0.08em]"
							onClick={onClearAll}
							type="button"
						>
							Limpar
						</button>
					)}
					<EmachButton className="flex-1" onClick={onClose} variant="primary">
						Ver {total} produto{total === 1 ? "" : "s"}
					</EmachButton>
				</div>
			</div>
		</div>
	);
}
