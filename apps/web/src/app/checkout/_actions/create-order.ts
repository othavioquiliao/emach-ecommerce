"use server";

import { db } from "@emach/db";
import { headers } from "next/headers";

import { log } from "@/lib/evlog";
import { requireCurrentClient } from "@/lib/session";

import {
	type CreateOrderInput,
	type CreateOrderResult,
	inputSchema,
	OrderError,
	placeOrder,
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

	const reqHeaders = await headers();
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
	const userAgent = reqHeaders.get("user-agent") ?? null;

	try {
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
