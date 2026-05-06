import { Lock } from "lucide-react";
import Link from "next/link";

export function CheckoutHeader({ children }: { children?: React.ReactNode }) {
	return (
		<header className="flex h-[52px] items-center justify-between border-border border-b bg-background px-10">
			<Link
				className="font-bold text-foreground text-lg tracking-[2px]"
				href="/"
			>
				EMACH
			</Link>
			{children}
			<div className="flex items-center gap-2 text-muted-foreground text-xs">
				<Lock className="size-3.5" />
				<span>Pagamento Seguro</span>
			</div>
		</header>
	);
}
