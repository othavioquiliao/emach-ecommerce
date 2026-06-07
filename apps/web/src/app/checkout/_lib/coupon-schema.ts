import { z } from "zod";

/**
 * Shape do item de carrinho aceito pela aplicação de cupom. Vive num módulo
 * neutro (não `"use server"`) porque arquivos `"use server"` só podem exportar
 * funções async — exportar este schema/objeto de `apply-coupon.ts` quebra o
 * checkout em runtime. Consumido pelo action (`apply-coupon`) e pelo componente
 * (`coupon-field`).
 */
export const couponCartItemSchema = z.object({
	toolId: z.string().min(1),
	variantId: z.string().min(1),
	quantity: z.number().int().positive(),
});

export type CouponCartItem = z.infer<typeof couponCartItemSchema>;
