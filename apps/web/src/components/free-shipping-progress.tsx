import { cn } from "@emach/ui/lib/utils";
import { CircleCheckBig } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { fmtBRL } from "@/lib/format";

interface FreeShippingProgressProps {
	className?: string;
	subtotal: number;
	threshold?: number;
}

/**
 * Indicador de progresso "faltam R$ X para frete grátis", reutilizado entre
 * `CartSheet` e `CartContent`. Exibe mensagem de sucesso quando o subtotal
 * atinge o limite, com barra de progresso animada baseada no percentual.
 */
export function FreeShippingProgress({
	subtotal,
	threshold = FREE_SHIPPING_THRESHOLD,
	className,
}: FreeShippingProgressProps) {
	const earned = subtotal >= threshold;
	const progress = Math.min(100, (subtotal / threshold) * 100);
	const missing = Math.max(0, threshold - subtotal);

	return (
		<div className={cn("bg-gray-10 p-4", className)}>
			{earned ? (
				<div className="flex min-h-9 items-center gap-2.5 font-semibold text-[13px]">
					<CircleCheckBig className="text-success" size={18} />
					Você ganhou frete grátis!
				</div>
			) : (
				<>
					<div className="mb-2 min-h-5 text-[13px]">
						Faltam <strong>{fmtBRL(missing)}</strong> para frete grátis.
					</div>
					<div className="h-1.5 overflow-hidden bg-white">
						<div
							className="h-full w-(--pct) bg-emach-red transition-[width] duration-300 ease-out"
							style={{ "--pct": `${progress}%` } as React.CSSProperties}
						/>
					</div>
				</>
			)}
		</div>
	);
}
