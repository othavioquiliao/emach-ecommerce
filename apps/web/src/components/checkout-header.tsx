import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CheckoutHeader() {
	return (
		<header className="flex h-14 items-center justify-between bg-black px-4 sm:px-6 lg:px-10">
			<Link aria-label="EMACH — voltar à home" href="/">
				<Image
					alt="EMACH"
					className="h-[26px] w-[140px]"
					height={37}
					priority
					src="/emach-logo.svg"
					width={200}
				/>
			</Link>
			<div className="flex items-center gap-2 text-white/70">
				<Lock aria-hidden="true" className="size-4 shrink-0" />
				<span className="hidden font-display text-[11px] uppercase tracking-[0.16em] sm:inline">
					Pagamento Seguro
				</span>
			</div>
		</header>
	);
}
