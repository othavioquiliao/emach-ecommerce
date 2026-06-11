import { db } from "@emach/db";
import {
	getCategoryBySlug,
	getTools,
	type ToolListItem,
} from "@emach/db/queries/catalog";
import { ProductCard } from "@/components/product-card";

interface RelatedProductsProps {
	categoryPath: string | null;
	toolId: string;
}

const RELATED_LIMIT = 5;

export async function RelatedProducts({
	toolId,
	categoryPath,
}: RelatedProductsProps) {
	const picked: ToolListItem[] = [];
	const seen = new Set<string>([toolId]);

	function collect(tools: ToolListItem[]) {
		for (const tool of tools) {
			if (picked.length >= RELATED_LIMIT) {
				break;
			}
			if (!seen.has(tool.id)) {
				picked.push(tool);
				seen.add(tool.id);
			}
		}
	}

	const rootSlug = categoryPath?.split("/").filter(Boolean)[0];
	if (rootSlug) {
		const root = await getCategoryBySlug(db, rootSlug);
		if (root) {
			const { tools } = await getTools(db, {
				categoryId: root.id,
				excludeToolId: toolId,
				limit: RELATED_LIMIT,
				offset: 0,
				sort: "newest",
			});
			collect(tools);
		}
	}

	if (picked.length < RELATED_LIMIT) {
		const { tools } = await getTools(db, {
			excludeToolId: toolId,
			limit: RELATED_LIMIT + picked.length,
			offset: 0,
			sort: "newest",
		});
		collect(tools);
	}

	if (picked.length === 0) {
		return null;
	}

	return (
		<section className="px-20 pt-16 pb-20">
			<h2 className="mb-6 font-display font-medium text-[28px]">
				Você também pode gostar
			</h2>
			<div className="grid grid-cols-5 gap-6">
				{picked.map((tool) => (
					<ProductCard key={tool.id} tool={tool} />
				))}
			</div>
		</section>
	);
}
