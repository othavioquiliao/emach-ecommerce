import type { Metadata } from "next";
import { AccountHero } from "@/app/dashboard/_components/account-hero";
import { listClientRefunds } from "@/lib/refunds/queries";
import { requireCurrentClient } from "@/lib/session";
import { RefundsTabs } from "./_components/refunds-tabs";

export const metadata: Metadata = {
	title: "Devoluções e reembolso",
};

export default async function ReembolsoPage() {
	const session = await requireCurrentClient();
	const refunds = await listClientRefunds(session.user.id);

	return (
		<>
			<AccountHero title="Devoluções e reembolso" />
			<div className="px-6 py-8 md:px-10">
				<RefundsTabs refunds={refunds} />
			</div>
		</>
	);
}
