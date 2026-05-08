import { cn } from "@emach/ui/lib/utils";
import { Disc3, Drill, Ruler, Shield, Wrench } from "lucide-react";
import { fmtBRL } from "@/lib/format";
import type { CategorySlug, OrderItem } from "../../../_lib/types";
import { SectionBlock } from "./section-block";

const CATEGORY_ICONS: Record<CategorySlug, React.ElementType> = {
	eletricas: Drill,
	manuais: Wrench,
	medicao: Ruler,
	seguranca: Shield,
	acessorios: Disc3,
};

function ItemThumb({ categorySlug }: { categorySlug: CategorySlug }) {
	const Icon = CATEGORY_ICONS[categorySlug];
	return (
		<div className="emach-bg-placeholder flex h-16 w-16 shrink-0 items-center justify-center">
			<Icon className="h-8 w-8 text-cinema-2 opacity-80" strokeWidth={1.2} />
		</div>
	);
}

export function OrderItems({ items }: { items: OrderItem[] }) {
	return (
		<SectionBlock title="Itens do pedido">
			<div>
				{items.map((item, idx) => (
					<div
						className={cn(
							"flex items-center gap-3.5 py-3.5",
							idx > 0 && "border-border border-t",
							idx === 0 && "pt-0",
							idx === items.length - 1 && "pb-0"
						)}
						key={item.id}
					>
						<ItemThumb categorySlug={item.categorySlug} />
						<div className="min-w-0 flex-1">
							<div className="font-semibold text-[13px] text-near-black">
								{item.name}
							</div>
							{item.variant ? (
								<div className="text-[11px] text-gray-60">{item.variant}</div>
							) : null}
							<div className="mt-0.5 text-[11px] text-gray-50">
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="min-w-[100px] text-right font-semibold text-[13px] text-near-black">
							{fmtBRL(item.unitPriceCents * item.quantity)}
						</div>
					</div>
				))}
			</div>
		</SectionBlock>
	);
}
