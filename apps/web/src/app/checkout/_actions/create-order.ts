"use server";

import { db } from "@emach/db";
import { headers } from "next/headers";

import { getClientIp } from "@/lib/client-ip";
import { log } from "@/lib/evlog";
import { numericToCents } from "@/lib/format";
import { orderLimiter, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { requireCurrentClient } from "@/lib/session";

import {
	assertShippingQuoted,
	type CreateOrderInput,
	type CreateOrderResult,
	inputSchema,
	OrderError,
	placeOrder,
	resolveDestinationCep,
} from "../_lib/place-order";

const GENERIC_ORDER_ERROR =
	"Não foi possível concluir o pedido. Tente novamente.";

export type { CreateOrderInput, CreateOrderResult } from "../_lib/place-order";

export async function createOrderAction(
	rawInput: CreateOrderInput
): Promise<CreateOrderResult> {
	const parsed = inputSchema.safeParse(rawInput);
	if (!parsed.success) {
		return { ok: false, error: "Dados inválidos" };
	}
	const input = parsed.data;

	const session = await requireCurrentClient();
	const clientId = session.user.id;

	const { success } = await orderLimiter.limit(`order:${clientId}`);
	if (!success) {
		return { ok: false, error: RATE_LIMIT_MESSAGE };
	}

	const reqHeaders = await headers();
	const ipAddress = getClientIp(reqHeaders);
	const userAgent = reqHeaders.get("user-agent") ?? null;

	try {
		// Anti-fraude do frete roda FORA da transação (chamada externa não pode
		// segurar a transação aberta). Mismatch lança OrderError; API fora não bloqueia.
		const destinationCep = await resolveDestinationCep(db, input);
		if (destinationCep) {
			// Valor declarado p/ o seguro de frete = subtotal dos itens submetidos
			// (consistente com a cotação do cliente). O preço em si é revalidado
			// contra o DB dentro do placeOrder.
			const declaredValueCents = input.cartItems.reduce(
				(sum, i) => sum + numericToCents(i.priceAmount) * i.quantity,
				0
			);
			await assertShippingQuoted({
				shippingCents: numericToCents(input.shippingAmount),
				destinationCep,
				items: input.cartItems.map((i) => ({
					toolId: i.toolId,
					quantity: i.quantity,
				})),
				declaredValueCents,
			});
		}

		const result = await db.transaction((tx) =>
			placeOrder(tx as unknown as typeof db, {
				clientId,
				input,
				ipAddress,
				userAgent,
			})
		);
		return { ok: true, ...result };
	} catch (err) {
		const rawMessage = err instanceof Error ? err.message : "Erro inesperado";
		log.error({
			action: "create_order_failed",
			clientId,
			error: rawMessage,
		});
		const userError =
			err instanceof OrderError ? err.message : GENERIC_ORDER_ERROR;
		return { ok: false, error: userError };
	}
}
