"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import { SectionLabel } from "@/components/section-label";
import { fmtBRL } from "@/lib/format";
import { products } from "@/lib/mock-data";

interface SearchOverlayProps {
	onClose: () => void;
	open: boolean;
}

const SUGGESTIONS = ["Furadeira", "Serra", "Nível Laser", "Chaves"];
const RECENT_KEY = "emach:recent-searches";
const RECENT_MAX = 5;

function loadRecent(): string[] {
	if (typeof window === "undefined") {
		return [];
	}
	try {
		const raw = window.localStorage.getItem(RECENT_KEY);
		if (!raw) {
			return [];
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((v): v is string => typeof v === "string")
			: [];
	} catch {
		return [];
	}
}

function saveRecent(list: string[]) {
	try {
		window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
	} catch {
		// noop — storage unavailable
	}
}

function highlightMatch(text: string, query: string) {
	const q = query.trim();
	if (!q) {
		return text;
	}
	const lowerText = text.toLowerCase();
	const lowerQ = q.toLowerCase();
	const idx = lowerText.indexOf(lowerQ);
	if (idx === -1) {
		return text;
	}
	return (
		<>
			{text.slice(0, idx)}
			<mark
				style={{
					background: "rgba(218,41,28,0.15)",
					color: "var(--near-black)",
					padding: 0,
				}}
			>
				{text.slice(idx, idx + q.length)}
			</mark>
			{text.slice(idx + q.length)}
		</>
	);
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function cycleFocus(container: HTMLElement, e: KeyboardEvent) {
	const focusables = Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
	);
	if (focusables.length === 0) {
		return;
	}
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

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [highlight, setHighlight] = useState(0);
	const [recent, setRecent] = useState<string[]>([]);
	const dialogRef = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (open) {
			setRecent(loadRecent());
		}
	}, [open]);

	function addRecent(term: string) {
		const t = term.trim();
		if (!t) {
			return;
		}
		const next = [
			t,
			...recent.filter((r) => r.toLowerCase() !== t.toLowerCase()),
		].slice(0, RECENT_MAX);
		setRecent(next);
		saveRecent(next);
	}

	function clearRecent() {
		setRecent([]);
		saveRecent([]);
	}

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
			if (e.key === "Tab" && dialogRef.current) {
				cycleFocus(dialogRef.current, e);
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

	useEffect(() => {
		if (!open) {
			setQuery("");
			setHighlight(0);
		}
	}, [open]);

	const results = useMemo(() => {
		if (!query.trim()) {
			return [];
		}
		const q = query.toLowerCase();
		return products
			.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q) ||
					p.sku.toLowerCase().includes(q)
			)
			.slice(0, 6);
	}, [query]);

	useEffect(() => {
		setHighlight(0);
	}, []);

	function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "ArrowDown" && results.length > 0) {
			e.preventDefault();
			setHighlight((h) => (h + 1) % results.length);
		} else if (e.key === "ArrowUp" && results.length > 0) {
			e.preventDefault();
			setHighlight((h) => (h - 1 + results.length) % results.length);
		} else if (e.key === "Enter" && results.length > 0) {
			e.preventDefault();
			const picked = results[highlight];
			if (picked) {
				addRecent(query);
				router.push(`/product/${picked.slug}`);
				onClose();
			}
		} else if (e.key === "Enter" && query.trim() && results.length === 0) {
			e.preventDefault();
			addRecent(query);
			router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
			onClose();
		}
	}

	function handleResultClick() {
		addRecent(query);
		onClose();
	}

	if (!open) {
		return null;
	}

	const showEmpty = Boolean(query.trim()) && results.length === 0;

	return (
		<div
			aria-modal="true"
			className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
			role="dialog"
			style={{ background: "rgba(0,0,0,0.6)" }}
		>
			<button
				aria-label="Fechar busca"
				className="absolute inset-0"
				onClick={onClose}
				style={{ background: "transparent", border: "none", cursor: "default" }}
				type="button"
			/>
			<div
				className="relative w-[720px] max-w-[90%] rounded-[2px] bg-white p-7"
				ref={dialogRef}
			>
				<div
					className="flex items-center gap-3 pb-3"
					style={{ borderBottom: "1px solid var(--border)" }}
				>
					<Search size={20} style={{ color: "var(--near-black)" }} />
					<input
						aria-label="Busca"
						autoFocus
						className="flex-1 border-none font-normal text-[18px] outline-none"
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleInputKey}
						placeholder="Buscar por produto, categoria ou SKU…"
						value={query}
					/>
					<button
						className="emach-ghost-btn font-semibold text-[11px] uppercase tracking-[0.14em]"
						onClick={onClose}
						style={{ color: "var(--gray-60)" }}
						type="button"
					>
						FECHAR
					</button>
				</div>

				<div className="mt-4">
					{results.length === 0 && !query && (
						<div className="space-y-5">
							{recent.length > 0 && (
								<div>
									<div className="flex items-center justify-between">
										<SectionLabel>Recentes</SectionLabel>
										<button
											className="text-[11px] uppercase tracking-[0.12em]"
											onClick={clearRecent}
											style={{ color: "var(--gray-60)" }}
											type="button"
										>
											Limpar
										</button>
									</div>
									<div className="mt-2.5 flex flex-wrap gap-2">
										{recent.map((r) => (
											<button
												className="emach-chip"
												key={r}
												onClick={() => setQuery(r)}
												type="button"
											>
												{r}
											</button>
										))}
									</div>
								</div>
							)}
							<div>
								<SectionLabel>Sugestões</SectionLabel>
								<div className="mt-2.5 flex flex-wrap gap-2">
									{SUGGESTIONS.map((s) => (
										<button
											className="emach-chip"
											key={s}
											onClick={() => setQuery(s)}
											type="button"
										>
											{s}
										</button>
									))}
								</div>
							</div>
						</div>
					)}

					{showEmpty && (
						<div className="py-10 text-center">
							<div
								className="font-display font-semibold text-[11px] uppercase tracking-[0.14em]"
								style={{ color: "var(--emach-red)" }}
							>
								Sem resultados
							</div>
							<div
								className="mt-2 text-[15px]"
								style={{ color: "var(--near-black)" }}
							>
								Nada encontrado para <b>“{query}”</b>.
							</div>
							<div
								className="mt-1 text-[13px]"
								style={{ color: "var(--gray-60)" }}
							>
								Pressione Enter para buscar no catálogo completo.
							</div>
						</div>
					)}

					{results.map((p, i) => {
						const active = i === highlight;
						return (
							<Link
								className="grid cursor-pointer items-center gap-4 rounded-[2px] py-3 transition-colors"
								href={`/product/${p.slug}`}
								key={p.id}
								onClick={handleResultClick}
								onMouseEnter={() => setHighlight(i)}
								style={{
									gridTemplateColumns: "60px 1fr auto",
									borderBottom: "1px solid var(--gray-10)",
									background: active ? "var(--gray-10)" : "transparent",
									paddingLeft: 8,
									paddingRight: 8,
								}}
							>
								<div
									className="relative overflow-hidden rounded-[2px]"
									style={{ width: 60, height: 60, background: "#ECECEC" }}
								>
									<ProductImage
										alt={p.name}
										categorySlug={p.categorySlug}
										sizes="60px"
										src={p.images[0]}
									/>
								</div>
								<div>
									<SectionLabel>{p.category}</SectionLabel>
									<div className="mt-0.5 font-medium text-[14px]">
										{highlightMatch(p.name, query)}
									</div>
								</div>
								<div
									className="font-bold"
									style={{ fontVariantNumeric: "tabular-nums" }}
								>
									{fmtBRL(p.price)}
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
