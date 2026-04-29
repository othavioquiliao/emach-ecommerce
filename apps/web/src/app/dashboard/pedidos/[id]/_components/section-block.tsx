import type { ReactNode } from "react";

interface SectionBlockProps {
	children: ReactNode;
	id?: string;
	rightSlot?: ReactNode;
	title: string;
}

export function SectionBlock({
	children,
	id,
	rightSlot,
	title,
}: SectionBlockProps) {
	return (
		<section
			className="mb-3.5 scroll-mt-20 border border-border bg-white"
			id={id}
		>
			<div className="flex items-center justify-between border-border border-b bg-gray-10 px-[18px] py-3.5">
				<h2 className="font-display font-semibold text-[12px] text-near-black uppercase tracking-[0.16em]">
					{title}
				</h2>
				{rightSlot}
			</div>
			<div className="px-[18px] py-[18px]">{children}</div>
		</section>
	);
}
