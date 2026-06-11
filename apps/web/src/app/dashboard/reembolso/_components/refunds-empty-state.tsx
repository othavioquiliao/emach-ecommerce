import { RotateCcw } from "lucide-react";

interface RefundsEmptyStateProps {
	tabLabel: string;
}

export function RefundsEmptyState({ tabLabel }: RefundsEmptyStateProps) {
	const text = `Você não tem devoluções em "${tabLabel}".`;
	return (
		<div className="flex flex-col items-center justify-center border border-black bg-near-black px-6 py-16 text-center">
			<RotateCcw className="mb-4 h-12 w-12 text-gray-50" strokeWidth={1.2} />
			<p className="mb-2 text-[15px] text-white/65">{text}</p>
			<p className="text-[13px] text-gray-50">
				Para solicitar, abra o pedido em "Pedidos" e clique em "Solicitar
				devolução".
			</p>
		</div>
	);
}
