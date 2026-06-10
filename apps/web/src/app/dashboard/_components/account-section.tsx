import { cn } from "@emach/ui/lib/utils";
import type { ReactNode } from "react";

interface AccountSectionProps {
	bodyClassName?: string;
	children: ReactNode;
	id?: string;
	rightSlot?: ReactNode;
	title: string;
}

/**
 * Seção da conta do cliente: barra de título com borda + corpo claro
 * (`gray-10`). Compartilhada entre o detalhe do pedido (`pedidos/[id]`) e
 * `dados-pessoais` para unificar o ritmo visual das telas. Ver DESIGN.md §
 * "Conta do cliente".
 */
export function AccountSection({
	bodyClassName,
	children,
	id,
	rightSlot,
	title,
}: AccountSectionProps) {
	return (
		<section
			className="mb-3.5 scroll-mt-20 border border-border bg-gray-10"
			id={id}
		>
			<div className="flex items-center justify-between border-border border-b bg-gray-10 px-[18px] py-3.5">
				<h2 className="font-display font-semibold text-[12px] text-near-black uppercase tracking-[0.16em]">
					{title}
				</h2>
				{rightSlot}
			</div>
			<div className={cn("px-[18px] py-[18px]", bodyClassName)}>{children}</div>
		</section>
	);
}
