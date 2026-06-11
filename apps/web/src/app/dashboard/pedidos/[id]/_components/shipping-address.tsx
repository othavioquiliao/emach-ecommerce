import { AccountSection } from "@/app/dashboard/_components/account-section";

interface AddressSnapshot {
	city?: string;
	complement?: string | null;
	country?: string;
	neighborhood?: string;
	number?: string;
	recipient?: string;
	state?: string;
	street?: string;
	zipCode?: string;
}

export function ShippingAddress({ address }: { address: unknown }) {
	const a = (address ?? {}) as AddressSnapshot;
	const streetLine = [a.street, a.number].filter(Boolean).join(", ");
	const localityLine = [a.neighborhood, a.city].filter(Boolean).join(", ");
	const stateSuffix = a.state ? ` — ${a.state}` : "";
	const zipLine = [a.zipCode ? `CEP ${a.zipCode}` : null, a.country]
		.filter(Boolean)
		.join(" · ");

	return (
		<AccountSection title="Endereço de entrega">
			<div className="text-[14px] text-white leading-[1.6]">
				{a.recipient ? (
					<div className="font-semibold">{a.recipient}</div>
				) : null}
				{streetLine ? (
					<div>
						{streetLine}
						{a.complement ? ` — ${a.complement}` : null}
					</div>
				) : null}
				{localityLine || a.state ? (
					<div>
						{localityLine}
						{stateSuffix}
					</div>
				) : null}
				{zipLine ? (
					<div className="text-[12px] text-white/65">{zipLine}</div>
				) : null}
			</div>
		</AccountSection>
	);
}
