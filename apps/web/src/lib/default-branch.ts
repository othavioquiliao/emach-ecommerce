import { db } from "@emach/db";
import { branch } from "@emach/db/schema/inventory";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getDefaultBranchId = unstable_cache(
	async (): Promise<string> => {
		const [row] = await db
			.select({ id: branch.id })
			.from(branch)
			.where(eq(branch.isDefault, true))
			.limit(1);
		if (!row) {
			throw new Error("Filial padrão não configurada no DB");
		}
		return row.id;
	},
	["default-branch"],
	{ revalidate: 3600 }
);
