import { db } from "@emach/db";
import { branch } from "@emach/db/schema/inventory";
import { env } from "@emach/env/server";
import { eq } from "drizzle-orm";

const NON_DIGITS = /\D/g;

/** CEP (só dígitos) da filial de origem do despacho (Curitiba). */
export async function getOriginBranchCep(): Promise<string> {
	const rows = await db
		.select({ cep: branch.cep })
		.from(branch)
		.where(eq(branch.id, env.DEFAULT_BRANCH_ID))
		.limit(1);

	const cep = rows[0]?.cep?.replace(NON_DIGITS, "") ?? "";
	if (cep.length !== 8) {
		throw new Error(`Filial de origem ${env.DEFAULT_BRANCH_ID} sem CEP válido`);
	}
	return cep;
}
