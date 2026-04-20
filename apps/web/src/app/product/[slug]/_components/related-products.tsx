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
		<section
			className="px-20 py-16"
			style={{
				borderTop: "1px solid var(--border)",
				marginTop: 60,
				paddingBottom: 80,
			}}
		>
			<h2
				className="mb-6 font-medium"
				style={{ fontFamily: "var(--font-display)", fontSize: 28 }}
			>
				Você também pode gostar
			</h2>
			<div className="grid grid-cols-4 gap-6">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}
