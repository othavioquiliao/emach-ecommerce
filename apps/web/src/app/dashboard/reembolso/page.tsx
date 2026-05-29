import { SectionLabel } from "@/components/section-label";
import { listClientRefunds } from "@/lib/refunds/queries";
import { requireCurrentClient } from "@/lib/session";
import { RefundsTabs } from "./_components/refunds-tabs";

export default async function ReembolsoPage() {
	const session = await requireCurrentClient();
	const refunds = await listClientRefunds(session.user.id);

	return (
		<section>
			<SectionLabel>Minha conta</SectionLabel>
			<h1 className="mt-2 mb-7 font-display font-medium text-[36px] leading-none">
				Devoluções e reembolso
			</h1>
			<RefundsTabs refunds={refunds} />
		</section>
	);
}
