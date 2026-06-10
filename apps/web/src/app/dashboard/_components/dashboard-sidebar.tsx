"use client";

import { cn } from "@emach/ui/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { NAV_ITEMS } from "./nav-items";

interface DashboardSidebarProps {
	userName: string;
}

export function DashboardSidebar({ userName }: DashboardSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	return (
		<aside className="hidden h-full flex-col bg-near-black pt-8 text-white md:flex">
			<div className="border-white/10 border-b px-[22px] pb-[22px]">
				<div className="mb-1.5 font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
					Olá,
				</div>
				<div className="font-semibold text-[16px]">{userName}</div>
			</div>

			<nav aria-label="Navegação da conta" className="flex flex-1 flex-col">
				{NAV_ITEMS.map((item) => {
					if (item.kind === "link") {
						const active = pathname === item.href;
						return (
							<Link
								className={cn(
									"block border-transparent border-l-[3px] px-[22px] py-3 font-semibold text-[13px] tracking-[0.04em]",
									active
										? "border-l-emach-red bg-white/5 text-white"
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
							className="block w-full border-transparent border-l-[3px] px-[22px] py-3 text-left font-semibold text-[13px] text-gray-50 tracking-[0.04em] hover:text-white"
							key={item.label}
							onClick={() => toast.info(`${item.label}: em breve`)}
							type="button"
						>
							{item.label}
						</button>
					);
				})}

				<div className="mt-auto py-2">
					<div className="mb-2 h-px bg-white/8" />
					<button
						className="flex w-full items-center gap-2 border-transparent border-l-[3px] px-[22px] py-3 text-left font-semibold text-[13px] text-gray-50 tracking-[0.04em] hover:text-white"
						onClick={handleSignOut}
						type="button"
					>
						<LogOut className="h-4 w-4" strokeWidth={1.6} />
						Sair
					</button>
				</div>
			</nav>
		</aside>
	);
}
