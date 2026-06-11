import { Package, RotateCcw, UserRound } from "lucide-react";
import { listClientOrders } from "@/lib/orders/queries";
import { requireCurrentClient } from "@/lib/session";
import { AccountBadge } from "./_components/account-badge";
import { AccountHero } from "./_components/account-hero";
import { QuickActionCard } from "./_components/quick-action-card";
import { OrderCard } from "./pedidos/_components/order-card";

export default async function DashboardPage() {
	const session = await requireCurrentClient();
	const orders = await listClientOrders(session.user.id);
	const toPay = orders.filter(
		(o) => o.status === "pending_payment" || o.status === "payment_failed"
	);
	const highlight = toPay[0] ?? orders[0] ?? null;

	return (
		<>
			<AccountHero
				subtitle="Acompanhe seus pedidos, devoluções e dados de cadastro num só lugar."
				title="Visão geral"
			/>
			<div className="space-y-8 px-6 py-8 md:px-10">
				{highlight ? (
					<section>
						<div className="mb-2.5 font-display font-semibold text-[12px] text-gray-50 uppercase tracking-[0.16em]">
							{toPay.length > 0
								? "Precisa da sua atenção"
								: "Seu último pedido"}
						</div>
						<OrderCard order={highlight} />
					</section>
				) : null}

				<section>
					<div className="mb-2.5 font-display font-semibold text-[12px] text-gray-50 uppercase tracking-[0.16em]">
						Sua conta
					</div>
					<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
						<QuickActionCard
							description="Acompanhe e pague seus pedidos."
							flag={
								toPay.length > 0 ? (
									<AccountBadge family="amber" tone="dark">
										{toPay.length} a pagar
									</AccountBadge>
								) : null
							}
							href="/dashboard/pedidos"
							Icon={Package}
							title="Pedidos"
						/>
						<QuickActionCard
							description="Solicite e acompanhe reembolsos."
							href="/dashboard/reembolso"
							Icon={RotateCcw}
							title="Devoluções"
						/>
						<QuickActionCard
							description="Endereços e dados de cadastro."
							href="/dashboard/dados-pessoais"
							Icon={UserRound}
							title="Meus dados"
						/>
					</div>
				</section>
			</div>
		</>
	);
}
