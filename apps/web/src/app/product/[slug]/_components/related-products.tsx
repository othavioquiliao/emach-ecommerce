import { Separator } from "@emach/ui/components/separator";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/mock-data";

interface RelatedProductsProps {
	products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
	if (products.length === 0) {
		return null;
	}

	return (
		<>
			<Separator className="mt-[60px]" />
			<section className="px-20 pt-16 pb-20">
				<h2 className="mb-6 font-display font-medium text-[28px]">
					Você também pode gostar
				</h2>
				<div className="grid grid-cols-4 gap-6">
					{products.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</section>
		</>
	);
}
