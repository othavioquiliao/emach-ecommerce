import { db } from "@emach/db";
import { branch } from "@emach/db/schema/inventory";
import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Hotfix: branch.is_default foi removida no dashboard (issue #28).
// Preserva o comportamento atual (pedidos para uma única filial) via env var
// com fallback para a filial mais antiga. Fix definitivo: distribuir por
// estoque real entre filiais — ver discussão no issue #28.
export const getDefaultBranchId = unstable_cache(
	async (): Promise<string> => {
		const fromEnv = process.env.ECOMMERCE_DEFAULT_BRANCH_ID?.trim();
		if (fromEnv) {
			return fromEnv;
		}
		const [row] = await db
			.select({ id: branch.id })
			.from(branch)
			.orderBy(asc(branch.createdAt))
			.limit(1);
		if (!row) {
			throw new Error("Nenhuma filial cadastrada no DB");
		}
		return row.id;
	},
	["default-branch"],
	{ revalidate: 3600 }
);
