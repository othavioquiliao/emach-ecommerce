"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { getRefundCounts, getRefundsByTab } from "../../_lib/mock-refunds";
import {
	REFUND_TAB_LABEL,
	REFUND_TABS,
	type RefundTab,
} from "../../_lib/types";
import { RefundCard } from "./refund-card";
import { RefundsEmptyState } from "./refunds-empty-state";

export function RefundsTabs() {
	const counts = getRefundCounts();

	return (
		<Tabs defaultValue="open">
			<TabsList variant="line">
				{REFUND_TABS.map((tab) => (
					<TabsTrigger
						className="h-auto flex-1 border-none px-0 py-3.5 font-semibold text-[13px]/[14px] data-active:text-near-black"
						key={tab}
						value={tab}
					>
						<span>{REFUND_TAB_LABEL[tab]}</span>
						<span className="ml-1.5 font-normal text-gray-50">
							{counts[tab]}
						</span>
					</TabsTrigger>
				))}
			</TabsList>

			{REFUND_TABS.map((tab) => (
				<TabsContent className="mt-6" key={tab} value={tab}>
					<RefundsList tab={tab} />
				</TabsContent>
			))}
		</Tabs>
	);
}

function RefundsList({ tab }: { tab: RefundTab }) {
	const refunds = getRefundsByTab(tab);
	if (refunds.length === 0) {
		return <RefundsEmptyState tabLabel={REFUND_TAB_LABEL[tab]} />;
	}
	return (
		<div>
			{refunds.map((refund) => (
				<RefundCard key={refund.id} refund={refund} />
			))}
		</div>
	);
}
