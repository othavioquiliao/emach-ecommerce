"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import type { Product } from "@/lib/mock-data";

interface ProductTabsProps {
	product: Product;
}

const TRIGGER_CLASS =
	"h-auto flex-none whitespace-nowrap border-none px-0 py-3.5 font-semibold text-[13px] text-gray-50 hover:text-near-black data-active:text-near-black focus-visible:ring-0 focus-visible:border-transparent";

export function ProductTabs({ product }: ProductTabsProps) {
	return (
		<section className="px-20 pt-20 pb-10">
			<Tabs defaultValue="specs">
				<TabsList variant="line">
					<TabsTrigger className={TRIGGER_CLASS} value="specs">
						Especificações
					</TabsTrigger>
					<TabsTrigger className={TRIGGER_CLASS} value="desc">
						Descrição
					</TabsTrigger>
					<TabsTrigger className={TRIGGER_CLASS} value="shipping">
						Entrega e Garantia
					</TabsTrigger>
				</TabsList>

				<div className="max-w-[720px] py-7">
					<TabsContent value="specs">
						<div>
							{Object.entries(product.specs).map(([k, v]) => (
								<div
									className="grid grid-cols-[220px_1fr] border-gray-10 border-b py-3 text-[14px]"
									key={k}
								>
									<div className="text-gray-60">{k}</div>
									<div className="font-medium">{v}</div>
								</div>
							))}
						</div>
					</TabsContent>

					<TabsContent
						className="text-[15px] text-gray-60 leading-relaxed"
						value="desc"
					>
						<p>{product.description}</p>
						<p className="mt-4">
							Projetada para uso profissional contínuo. Acompanha maleta,
							carregador e manual em português.
						</p>
					</TabsContent>

					<TabsContent
						className="text-[15px] text-gray-60 leading-relaxed"
						value="shipping"
					>
						<p>
							Entrega em todo o Brasil via transportadora parceira. Prazo de 3 a
							8 dias úteis.
						</p>
						<p className="mt-4">
							2 anos de garantia contra defeitos de fabricação. Assistência
							técnica autorizada em 50+ cidades.
						</p>
					</TabsContent>
				</div>
			</Tabs>
		</section>
	);
}
