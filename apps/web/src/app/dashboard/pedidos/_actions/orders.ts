"use server";

import { db } from "@emach/db";
import { order, orderStatusHistory } from "@emach/db/schema/orders";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { log } from "@/lib/evlog";
import { requireCurrentClient } from "@/lib/session";

export type ActionResult<T = undefined> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const CANCELABLE = new Set(["pending_payment", "payment_failed"]);

const orderIdSchema = z.object({ orderId: z.string().min(1) });

export async function cancelOrderAction(raw: {
	orderId: string;
}): Promise<ActionResult> {
	const parsed = orderIdSchema.safeParse(raw);
	if (!parsed.success) {
		return { ok: false, error: "ID inválido" };
	}
	const session = await requireCurrentClient();
	const clientId = session.user.id;
	const { orderId } = parsed.data;

	try {
		const result = await db.transaction(async (tx) => {
			const [row] = await tx
				.select({ id: order.id, status: order.status })
				.from(order)
				.where(and(eq(order.id, orderId), eq(order.clientId, clientId)))
				.limit(1);
			if (!row) {
				return { ok: false as const, error: "Pedido não encontrado" };
			}
			if (!CANCELABLE.has(row.status)) {
				return {
					ok: false as const,
					error: "Este pedido não pode mais ser cancelado",
				};
			}

			await tx
				.update(order)
				.set({ status: "canceled", canceledAt: new Date() })
				.where(eq(order.id, orderId));

			await tx.insert(orderStatusHistory).values({
				id: crypto.randomUUID(),
				orderId,
				fromStatus: row.status,
				toStatus: "canceled",
				actorType: "system",
				actorUserId: null,
				reason: "Cancelado pelo cliente",
			});

			return { ok: true as const, data: undefined };
		});

		if (result.ok) {
			revalidatePath("/dashboard/pedidos");
			revalidatePath(`/dashboard/pedidos/${orderId}`);
		}
		return result;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro inesperado";
		log.error({
			action: "cancel_order_failed",
			clientId,
			orderId,
			error: message,
		});
		return { ok: false, error: "Não foi possível cancelar o pedido" };
	}
}
