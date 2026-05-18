"use server";

import { db } from "@emach/db";
import { headers } from "next/headers";

import { getDefaultBranchId } from "@/lib/default-branch";
import { log } from "@/lib/evlog";
import { requireCurrentClient } from "@/lib/session";

import {
	type CreateOrderInput,
	type CreateOrderResult,
	inputSchema,
	placeOrder,
} from "../_lib/place-order";

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
	const branchId = await getDefaultBranchId();

	const reqHeaders = await headers();
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
	const userAgent = reqHeaders.get("user-agent") ?? null;

	try {
		const result = await db.transaction((tx) =>
			placeOrder(tx as unknown as typeof db, {
				clientId,
				branchId,
				input,
				ipAddress,
				userAgent,
			})
		);
		return { ok: true, ...result };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro inesperado";
		log.error({
			action: "create_order_failed",
			clientId,
			branchId,
			error: message,
		});
		return { ok: false, error: message };
	}
}
