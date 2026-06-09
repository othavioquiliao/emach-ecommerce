import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export function QuickActionCard({
	href,
	Icon,
	title,
	description,
	flag,
}: {
	Icon: LucideIcon;
	description: string;
	flag?: React.ReactNode;
	href: Route;
	title: string;
}) {
	return (
		<Link
			className="flex flex-col gap-2.5 border border-border bg-gray-10 p-5 transition-colors hover:border-near-black"
			href={href}
		>
			<span className="flex h-[42px] w-[42px] items-center justify-center border border-near-black">
				<Icon className="h-5 w-5 text-near-black" strokeWidth={1.6} />
			</span>
			<span className="font-display font-semibold text-[19px] text-near-black">
				{title}
			</span>
			<span className="text-[13px] text-gray-50">{description}</span>
			{flag ? <span className="mt-1">{flag}</span> : null}
		</Link>
	);
}
