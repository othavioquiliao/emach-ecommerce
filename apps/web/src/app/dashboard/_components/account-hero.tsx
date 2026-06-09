export function AccountHero({
	kicker = "Minha conta",
	title,
	subtitle,
	children,
}: {
	children?: React.ReactNode;
	kicker?: string;
	subtitle?: string;
	title: string;
}) {
	return (
		<header className="border-emach-red border-b-[3px] bg-near-black px-6 py-8 text-white md:px-10">
			<div className="font-display font-semibold text-[13px] text-gray-50 uppercase tracking-[0.18em]">
				{kicker}
			</div>
			<h1 className="mt-2 font-display font-medium text-[44px] leading-[0.95]">
				{title}
			</h1>
			{subtitle ? (
				<p className="mt-2.5 max-w-[480px] text-[15px] text-white/70">
					{subtitle}
				</p>
			) : null}
			{children}
		</header>
	);
}
