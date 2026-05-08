"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { getOrderCounts, getOrdersByTab } from "../../_lib/mock-orders";
import { ORDER_TAB_LABEL, ORDER_TABS, type OrderTab } from "../../_lib/types";
import { OrderCard } from "./order-card";
import { OrdersEmptyState } from "./orders-empty-state";

export function OrdersTabs() {
	const counts = getOrderCounts();

	return (
		<Tabs defaultValue="all">
			<TabsList variant="line">
				{ORDER_TABS.map((tab) => (
					<TabsTrigger
						className="h-auto flex-1 border-none px-0 py-3.5 font-semibold text-[13px]/[14px] data-active:text-near-black"
						key={tab}
						value={tab}
					>
						<span>{ORDER_TAB_LABEL[tab]}</span>
						<span className="ml-1.5 font-normal text-gray-50">
							{counts[tab]}
						</span>
					</TabsTrigger>
				))}
			</TabsList>

			{ORDER_TABS.map((tab) => (
				<TabsContent className="mt-6" key={tab} value={tab}>
					<OrdersList tab={tab} />
				</TabsContent>
			))}
		</Tabs>
	);
}

function OrdersList({ tab }: { tab: OrderTab }) {
	const orders = getOrdersByTab(tab);
	if (orders.length === 0) {
		return <OrdersEmptyState statusLabel={ORDER_TAB_LABEL[tab]} />;
	}
	return (
		<div>
			{orders.map((order) => (
				<OrderCard key={order.id} order={order} />
			))}
		</div>
	);
}
