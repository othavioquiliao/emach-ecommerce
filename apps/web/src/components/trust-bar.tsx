import { cn } from "@emach/ui/lib/utils";
import {
	CreditCard,
	type LucideIcon,
	RotateCcw,
	ShieldCheck,
	Truck,
} from "lucide-react";
import { PageContainer } from "@/components/page-container";

interface TrustItem {
	description: string;
	icon: LucideIcon;
	title: string;
}

const TRUST_ITEMS: TrustItem[] = [
	{ icon: Truck, title: "Frete grátis", description: "Acima de R$ 299" },
	{
		icon: ShieldCheck,
		title: "2 anos de garantia",
		description: "Toda linha profissional",
	},
	{ icon: CreditCard, title: "12× sem juros", description: "No cartão" },
	{
		icon: RotateCcw,
		title: "30 dias para troca",
		description: "Sem burocracia",
	},
];

export function TrustBar() {
	return (
		<div className="border-emach-red border-t-2 bg-cinema-3">
			<PageContainer>
				<ul className="grid grid-cols-2 md:grid-cols-4">
					{TRUST_ITEMS.map((item, idx) => {
						const Icon = item.icon;
						return (
							<li
								className={cn(
									"flex items-center gap-4 px-5 py-7 md:py-8",
									idx % 2 === 1 && "border-[#2a2a2a] border-l",
									idx >= 2 && "border-[#2a2a2a] border-t md:border-t-0",
									idx !== 0 && "md:border-[#2a2a2a] md:border-l"
								)}
								key={item.title}
							>
								<Icon
									aria-hidden="true"
									className="shrink-0 text-emach-red"
									size={30}
									strokeWidth={1.5}
								/>
								<div className="flex flex-col gap-1">
									<span className="font-bold font-display text-[16px] text-white uppercase leading-tight tracking-[0.04em] md:text-[17px]">
										{item.title}
									</span>
									<span className="text-[#8c8c8c] text-[13px] leading-snug">
										{item.description}
									</span>
								</div>
							</li>
						);
					})}
				</ul>
			</PageContainer>
		</div>
	);
}
