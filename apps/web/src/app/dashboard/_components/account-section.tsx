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
 * Seção da conta do cliente: barra de título com borda + corpo escuro
 * (`near-black`) — mesma família visual do card de pedido, para que o conteúdo
 * "salte" sobre o fundo claro `gray-10` da página. Compartilhada entre o
 * detalhe do pedido (`pedidos/[id]`) e `dados-pessoais` para unificar o ritmo
 * visual das telas. Ver DESIGN.md § "Conta do cliente".
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
			className="mb-3.5 scroll-mt-20 border border-black bg-near-black text-white"
			id={id}
		>
			<div className="flex items-center justify-between border-white/12 border-b px-5 py-3.5">
				<h2 className="font-display font-semibold text-[13px] text-white uppercase tracking-[0.16em]">
					{title}
				</h2>
				{rightSlot}
			</div>
			<div className={cn("px-5 py-5", bodyClassName)}>{children}</div>
		</section>
	);
}
