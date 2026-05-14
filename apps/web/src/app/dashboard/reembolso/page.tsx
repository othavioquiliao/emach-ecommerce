import { SectionLabel } from "@/components/section-label";
import { RefundsTabs } from "./_components/refunds-tabs";

export default function ReembolsoPage() {
	return (
		<section>
			<SectionLabel>Minha conta</SectionLabel>
			<h1 className="mt-2 mb-7 font-display font-medium text-[36px] leading-none">
				Devoluções e reembolso
			</h1>
			<RefundsTabs />
		</section>
	);
}
