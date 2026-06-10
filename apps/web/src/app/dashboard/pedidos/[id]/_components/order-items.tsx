import type { OrderStatus } from "@emach/db/schema/orders";
import { cn } from "@emach/ui/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import { AccountSection } from "@/app/dashboard/_components/account-section";
import { fmtNumericBRL } from "@/lib/format";
import type { OrderDetailData } from "@/lib/orders/queries";
import { ReviewItemButton } from "./review-item-button";

type Item = OrderDetailData["items"][number];

function ItemThumb({ url, alt }: { url: string | null; alt: string }) {
	if (!url) {
		return (
			<div className="emach-bg-placeholder flex h-[72px] w-[72px] shrink-0 items-center justify-center">
				<Package
					className="h-9 w-9 text-cinema-2 opacity-80"
					strokeWidth={1.2}
				/>
			</div>
		);
	}
	return (
		<Image
			alt={alt}
			className="h-[72px] w-[72px] shrink-0 object-cover"
			height={72}
			src={url}
			width={72}
		/>
	);
}

function MetaChips({ item }: { item: Item }) {
	const chips = [
		{ key: "voltage", value: item.voltage },
		{ key: "model", value: item.model },
		{ key: "manufacturer", value: item.manufacturerName },
	].filter((c) => Boolean(c.value));
	if (chips.length === 0) {
		return null;
	}
	return (
		<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-60">
			{chips.map((chip, idx) => (
				<span className="flex items-center gap-x-2" key={chip.key}>
					{idx > 0 ? (
						<span aria-hidden="true" className="text-gray-50">
							·
						</span>
					) : null}
					{chip.value}
				</span>
			))}
		</div>
	);
}

export function OrderItems({
	items,
	orderId,
	reviewedToolIds,
	status,
}: {
	items: Item[];
	orderId: string;
	reviewedToolIds: string[];
	status: OrderStatus;
}) {
	return (
		<AccountSection title="Itens do pedido">
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
							<div className="font-semibold text-[15px] text-near-black leading-snug">
								{item.name}
							</div>
							<MetaChips item={item} />
							<div className="mt-1 text-[12px] text-gray-50">
								{item.sku ? (
									<span className="font-mono">{item.sku} · </span>
								) : null}
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="flex min-w-[100px] flex-col items-end gap-1.5">
							<span className="font-semibold text-[15px] text-near-black">
								{fmtNumericBRL(item.lineTotal)}
							</span>
							{status === "delivered" ? (
								<ReviewItemButton
									orderId={orderId}
									productName={item.name}
									reviewed={reviewedToolIds.includes(item.toolId)}
									toolId={item.toolId}
								/>
							) : null}
						</div>
					</div>
				))}
			</div>
		</AccountSection>
	);
}
