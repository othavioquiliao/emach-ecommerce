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
  OrderError,
  placeOrder,
} from "../_lib/place-order";

const GENERIC_ORDER_ERROR =
  "Não foi possível concluir o pedido. Tente novamente.";

export type { CreateOrderInput, CreateOrderResult } from "../_lib/place-order";

export async function createOrderAction(
  rawInput: CreateOrderInput,
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
    const result = await db.transaction(async (tx) => {
      await tx
        .update(client)
        .set({
          name: input.name,
          phone: input.phone,
          document: input.document,
        })
        .where(eq(client.id, clientId));

      const { snapshot } = await buildAddressSnapshot({
        clientId,
        addressId: input.addressId,
        newAddress: input.newAddress,
        recipient: input.name,
        tx: tx as unknown as typeof db,
      });

      const consentVersion = "1.0";
      const consentRows = [
        { kind: "tos" as const, granted: true },
        { kind: "privacy" as const, granted: true },
        {
          kind: "marketing_email" as const,
          granted: input.acceptMarketing,
        },
      ];
      await tx.insert(consentLog).values(
        consentRows.map((c) => ({
          id: crypto.randomUUID(),
          clientId,
          kind: c.kind,
          granted: c.granted,
          version: consentVersion,
          ipAddress,
          userAgent,
        })),
      );

      const seqRow = await tx.execute(
        sql`SELECT nextval('order_number_seq')::int AS seq`,
      );
      const seq = Number(
        (seqRow as unknown as { rows: Array<{ seq: number }> }).rows[0]?.seq ??
          (seqRow as unknown as Array<{ seq: number }>)[0]?.seq,
      );
      if (!Number.isFinite(seq)) {
        throw new Error("Falha ao gerar número do pedido");
      }
      const orderNumber = formatOrderNumber(seq);

      const orderId = crypto.randomUUID();
      const subtotalAmount = (subtotalCents / 100).toFixed(2);
      const totalAmount = (totalCents / 100).toFixed(2);

      await tx.insert(order).values({
        id: orderId,
        number: orderNumber,
        clientId,
        branchId,
        status: "pending_payment",
        subtotalAmount,
        discountAmount: "0",
        shippingAmount: input.shippingAmount,
        totalAmount,
        shippingAddress: snapshot,
      });

      for (const line of lines) {
        const orderItemId = crypto.randomUUID();
        const unitPrice = (line.finalPriceCents / 100).toFixed(2);
        const lineTotal = (line.lineTotalCents / 100).toFixed(2);

        await tx.insert(orderItem).values({
          id: orderItemId,
          orderId,
          toolId: line.tool.id,
          variantId: line.variant.id,
          sku: line.variant.sku,
          name: line.tool.name,
          model: line.tool.model,
          voltage: line.variant.voltage,
          unitPrice,
          quantity: line.cartItem.quantity,
          lineTotal,
          discountAmount: "0",
          cost: line.variant.costAmount ?? null,
          ncm: line.tool.ncm,
          cest: line.tool.cest,
          manufacturerName: line.tool.manufacturerName,
          weightKg: line.tool.weightKg,
          lengthCm: line.tool.lengthCm,
          widthCm: line.tool.widthCm,
          heightCm: line.tool.heightCm,
        });

        const updated = await tx
          .update(stockLevel)
          .set({
            quantity: sql`${stockLevel.quantity} - ${line.cartItem.quantity}`,
          })
          .where(
            and(
              eq(stockLevel.variantId, line.variant.id),
              eq(stockLevel.branchId, branchId),
              gte(stockLevel.quantity, line.cartItem.quantity),
            ),
          )
          .returning({
            quantity: stockLevel.quantity,
          });
        const after = updated[0];
        if (!after) {
          throw new Error(`Stock insuficiente para ${line.tool.name}`);
        }
        const previousQty = after.quantity + line.cartItem.quantity;

        await tx.insert(stockMovement).values({
          id: crypto.randomUUID(),
          variantId: line.variant.id,
          branchId,
          previousQty,
          newQty: after.quantity,
          delta: -line.cartItem.quantity,
          reason: "saida_venda",
          orderId,
          orderItemId,
          actorType: "system",
        });
      }

      return { orderId, orderNumber };
    });

    return { ok: true, ...result };
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : "Erro inesperado";
    log.error({
      action: "create_order_failed",
      clientId,
      branchId,
      error: rawMessage,
    });
    // Só erros de negócio (OrderError) têm mensagem segura para o cliente;
    // qualquer outra falha vira mensagem genérica para não vazar detalhe.
    const userError =
      err instanceof OrderError ? err.message : GENERIC_ORDER_ERROR;
    return { ok: false, error: userError };
  }
}
