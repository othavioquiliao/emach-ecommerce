import { db } from "@emach/db";
import { getTools } from "@emach/db/queries/catalog";
import { Separator } from "@emach/ui/components/separator";
import { ProductCard } from "@/components/product-card";

interface RelatedProductsProps {
	categoryId: string | null;
	toolId: string;
}

export async function RelatedProducts({
	toolId,
	categoryId,
}: RelatedProductsProps) {
	if (!categoryId) {
		return null;
	}

	const { tools } = await getTools(db, {
		categoryId,
		excludeToolId: toolId,
		limit: 5,
		offset: 0,
		sort: "newest",
	});

	if (tools.length === 0) {
		return null;
	}

	return (
		<>
			<Separator className="" />
			<section className="px-20 pt-16 pb-20">
				<h2 className="mb-6 font-display font-medium text-[28px]">
					Você também pode gostar
				</h2>
				<div className="grid grid-cols-5 gap-6">
					{tools.map((tool) => (
						<ProductCard key={tool.id} tool={tool} />
					))}
				</div>
			</section>
		</>
	);
}
