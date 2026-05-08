import type { ShippingAddress as ShippingAddressType } from "../../../_lib/types";
import { SectionBlock } from "./section-block";

export function ShippingAddress({ address }: { address: ShippingAddressType }) {
	return (
		<SectionBlock title="Endereço de entrega">
			<div className="text-[13px] text-near-black leading-[1.6]">
				<div className="font-semibold">{address.recipient}</div>
				<div>
					{address.street}
					{address.complement ? ` — ${address.complement}` : null}
				</div>
				<div>
					{address.neighborhood}, {address.city} — {address.state}
				</div>
				<div className="text-[12px] text-gray-60">
					CEP {address.zip} · {address.country}
				</div>
			</div>
		</SectionBlock>
	);
}
