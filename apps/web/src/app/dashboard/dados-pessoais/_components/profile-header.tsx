function initials(name: string): string {
	const parts = name.trim().split(/\s+/);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}

export function ProfileHeader({ name }: { name: string }) {
	return (
		<header className="emach-bg-diagonal flex items-center gap-[18px] border-emach-red border-b-[3px] bg-near-black px-6 py-8 text-white md:px-10">
			<div className="flex h-[58px] w-[58px] items-center justify-center bg-emach-red font-display font-semibold text-[25px] text-white">
				{initials(name)}
			</div>
			<div>
				<div className="font-display font-semibold text-[13px] text-gray-50 uppercase tracking-[0.18em]">
					Minha conta
				</div>
				<h1 className="mt-1.5 font-display font-medium text-[34px] leading-[0.95]">
					{name}
				</h1>
			</div>
		</header>
	);
}
