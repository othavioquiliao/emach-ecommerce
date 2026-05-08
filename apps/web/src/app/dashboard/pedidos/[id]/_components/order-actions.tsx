"use client";

import { toast } from "sonner";
import { EmachButton } from "@/components/emach-button";
import type { Order } from "../../../_lib/types";

const comingSoon = (label: string) => () => toast.info(`${label}: em breve`);

export function OrderActions({ order }: { order: Order }) {
	const buttons: React.ReactNode[] = [];

	switch (order.status) {
		case "pending_payment":
			buttons.push(
				<EmachButton
					key="cancel"
					onClick={comingSoon("Cancelar pedido")}
					size="md"
					variant="ghost"
				>
					Cancelar pedido
				</EmachButton>,
				<EmachButton
					key="pay"
					onClick={comingSoon("Pagar agora")}
					size="md"
					variant="primary"
				>
					Pagar agora
				</EmachButton>
			);
			break;
		case "to_ship":
			buttons.push(
				<EmachButton
					key="rebuy"
					onClick={comingSoon("Comprar novamente")}
					size="md"
					variant="primary"
				>
					Comprar novamente
				</EmachButton>
			);
			break;
		case "shipped":
			buttons.push(
				<EmachButton
					className="border-border"
					key="rebuy"
					onClick={comingSoon("Comprar novamente")}
					size="md"
					variant="ghost"
				>
					Comprar novamente
				</EmachButton>
			);
			break;
		case "completed":
			buttons.push(
				<EmachButton
					key="rebuy"
					onClick={comingSoon("Comprar novamente")}
					size="md"
					variant="outline"
				>
					Comprar novamente
				</EmachButton>
			);
			if (!order.reviewed) {
				buttons.push(
					<EmachButton
						key="review"
						onClick={comingSoon("Avaliar")}
						size="md"
						variant="primary"
					>
						Avaliar
					</EmachButton>
				);
			}
			break;
		case "cancelled":
			buttons.push(
				<EmachButton
					key="rebuy"
					onClick={comingSoon("Comprar novamente")}
					size="md"
					variant="outline"
				>
					Comprar novamente
				</EmachButton>
			);
			break;
		default: {
			const _exhaustive: never = order.status;
			return _exhaustive;
		}
	}

	if (buttons.length === 0) {
		return null;
	}

	return <div className="mt-6 flex flex-wrap justify-end gap-2">{buttons}</div>;
}
