"use client";

import { cn } from "@emach/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { NAV_ITEMS } from "./nav-items";

export function DashboardNavMobile() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegação da conta"
			className="flex gap-1 overflow-x-auto border-white/10 border-b bg-near-black px-3 md:hidden"
		>
			{NAV_ITEMS.map((item) => {
				if (item.kind === "link") {
					const active = pathname === item.href;
					return (
						<Link
							className={cn(
								"whitespace-nowrap border-transparent border-b-[3px] px-3 py-3.5 font-semibold text-[13px] tracking-[0.04em]",
								active
									? "border-b-emach-red text-white"
									: "text-gray-50 hover:text-white"
							)}
							href={item.href}
							key={item.label}
						>
							{item.label}
						</Link>
					);
				}
				return (
					<button
						className="whitespace-nowrap border-transparent border-b-[3px] px-3 py-3.5 font-semibold text-[13px] text-gray-50 tracking-[0.04em] hover:text-white"
						key={item.label}
						onClick={() => toast.info(`${item.label}: em breve`)}
						type="button"
					>
						{item.label}
					</button>
				);
			})}
		</nav>
	);
}
