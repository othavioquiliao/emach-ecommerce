"use client";

import { cn } from "@emach/ui/lib/utils";
import { useState } from "react";
import type { BranchPin, StateShape } from "@/lib/branch-map/types";

type Props = {
	pins: BranchPin[];
	states: StateShape[];
	viewBox: string;
};

const REDUCE_MOTION =
	typeof window !== "undefined" &&
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function BranchMap({ pins, states, viewBox }: Props) {
	const [hovered, setHovered] = useState<string | null>(null);
	const hoveredUf = pins.find((p) => p.id === hovered)?.uf ?? null;

	function activate(id: string | null, scroll: boolean) {
		setHovered(id);
		if (id && scroll) {
			document.getElementById(`branch-row-${id}`)?.scrollIntoView({
				block: "nearest",
				behavior: REDUCE_MOTION ? "auto" : "smooth",
			});
		}
	}

	return (
		<div className="flex flex-1 flex-col gap-0 border-white/10 border-l max-md:border-t max-md:border-l-0 md:flex-row">
			{/* MAPA */}
			<div className="flex flex-[0_0_50%] items-center justify-center p-6">
				<svg
					aria-label="Mapa do Brasil com as filiais EMACH"
					className="h-auto max-h-[420px] w-full overflow-visible"
					viewBox={viewBox}
				>
					{states.map((s) => (
						<path
							className={cn(
								"stroke-black transition-[fill] duration-200 ease-out",
								hoveredUf === s.uf
									? "fill-emach-red/55"
									: s.highlighted
										? "fill-white/[0.13]"
										: "fill-white/[0.05]"
							)}
							d={s.path}
							fillRule="evenodd"
							key={s.uf}
							strokeWidth={0.8}
						/>
					))}
					{pins.map((p) => (
						<a
							aria-label={`EMACH ${p.name} — ${p.address}`}
							href={p.mapsUrl}
							key={p.id}
							onBlur={() => activate(null, false)}
							onFocus={() => activate(p.id, true)}
							onMouseEnter={() => activate(p.id, true)}
							onMouseLeave={() => activate(null, false)}
							rel="noopener"
							target="_blank"
						>
							<circle
								className={cn(
									"fill-emach-red transition-opacity duration-200",
									hovered === p.id ? "opacity-40" : "opacity-20"
								)}
								cx={p.x}
								cy={p.y}
								r={14}
							/>
							<circle
								className="fill-emach-red stroke-black transition-[r] duration-200"
								cx={p.x}
								cy={p.y}
								r={hovered === p.id ? 9 : 6}
								strokeWidth={1.2}
							/>
						</a>
					))}
				</svg>
			</div>

			{/* LISTA */}
			<div className="flex flex-1 flex-col p-6">
				<p className="mb-2 font-display text-[11px] text-white/40 uppercase tracking-[0.16em]">
					{pins.length} {pins.length === 1 ? "loja física" : "lojas físicas"}
				</p>
				<div className="max-h-[360px] flex-1 overflow-y-auto pr-1 [scroll-behavior:smooth] motion-reduce:[scroll-behavior:auto]">
					{pins.map((p) => (
						<a
							className={cn(
								"block border border-transparent border-white/10 border-b px-3 py-3.5 no-underline transition-colors duration-200",
								hovered === p.id &&
									"border-emach-red/45 bg-emach-red/10"
							)}
							href={p.mapsUrl}
							id={`branch-row-${p.id}`}
							key={p.id}
							onMouseEnter={() => activate(p.id, false)}
							onMouseLeave={() => activate(null, false)}
							rel="noopener"
							target="_blank"
						>
							<div className="flex items-baseline gap-2">
								<span className="font-display font-semibold text-[20px] text-white">
									{p.name}
								</span>
								<span className="font-display font-semibold text-[12px] text-emach-red uppercase tracking-[0.1em]">
									{p.uf}
								</span>
							</div>
							<div className="mt-1 text-[12px] text-white/55">{p.address}</div>
							<div className="mt-1.5 flex gap-3.5 text-[11.5px] text-white/40">
								{p.phone && <span className="text-white/70">{p.phone}</span>}
								{p.hours && <span>{p.hours}</span>}
								<span className="text-white">Como chegar →</span>
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	);
}
