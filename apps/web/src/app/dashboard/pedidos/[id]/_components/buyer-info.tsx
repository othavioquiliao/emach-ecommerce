import type { BuyerSnapshot } from "../../../_lib/types";
import { SectionBlock } from "./section-block";

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<div className="mb-1 font-display font-semibold text-[10px] text-gray-50 uppercase tracking-[0.14em]">
				{label}
			</div>
			<div className="break-words font-medium text-[13px] text-near-black">
				{value}
			</div>
		</div>
	);
}

export function BuyerInfo({ buyer }: { buyer: BuyerSnapshot }) {
	return (
		<SectionBlock title="Comprador">
			<div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
				<Field label="Nome" value={buyer.name} />
				<Field label="E-mail" value={buyer.email} />
				<Field label="Telefone" value={buyer.phone} />
				<Field label="CPF / CNPJ" value={buyer.document} />
			</div>
		</SectionBlock>
	);
}
