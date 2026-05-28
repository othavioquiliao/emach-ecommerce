import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import { fmtNumericBRL } from "@/lib/format";
import type { OrderDetailData } from "@/lib/orders/queries";
import { SectionBlock } from "./section-block";

type Item = OrderDetailData["items"][number];

function ItemThumb({ url, alt }: { url: string | null; alt: string }) {
	if (!url) {
		return (
			<div className="emach-bg-placeholder flex h-16 w-16 shrink-0 items-center justify-center">
				<Package
					className="h-8 w-8 text-cinema-2 opacity-80"
					strokeWidth={1.2}
				/>
			</div>
		);
	}
	return (
		<Image
			alt={alt}
			className="h-16 w-16 shrink-0 object-cover"
			height={64}
			src={url}
			width={64}
		/>
	);
}

export function OrderItems({ items }: { items: Item[] }) {
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
						<ItemThumb alt={item.name} url={item.imageUrl} />
						<div className="min-w-0 flex-1">
							<div className="font-semibold text-[13px] text-near-black">
								{item.name}
							</div>
							{item.voltage ? (
								<div className="text-[11px] text-gray-60">{item.voltage}</div>
							) : null}
							<div className="mt-0.5 text-[11px] text-gray-50">
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="min-w-[100px] text-right font-semibold text-[13px] text-near-black">
							{fmtNumericBRL(item.lineTotal)}
						</div>
					</div>
				))}
			</div>
		</SectionBlock>
	);
}
