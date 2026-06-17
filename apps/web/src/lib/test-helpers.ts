import type { db } from "@emach/db";
import { promotion } from "@emach/db/schema/promotions";
import { eq } from "drizzle-orm";

/**
 * Desativa promoções globais (`applies_to_all`) dentro da transação de teste.
 *
 * Os testes de integração de checkout rodam contra o banco Supabase compartilhado
 * (via `withRollback`) e montam o carrinho com o preço cheio da variante. Uma
 * campanha "X% em tudo" ativa (ex.: PROMO COPA, ou uma Black Friday real) aplica
 * desconto a TODO produto via `fetchAutoPromosByToolId`, então o preço calculado
 * deixa de bater com o submetido e `placeOrder` lança "Preços atualizados".
 *
 * Chamar no início de cada `withRollback`: isola o teste do estado global de
 * promoções de forma determinística. O ROLLBACK reverte — nada toca o banco.
 */
export async function disableGlobalPromos(tx: typeof db): Promise<void> {
	await tx
		.update(promotion)
		.set({ active: false })
		.where(eq(promotion.appliesToAll, true));
}
