"use client";

import { usePathname } from "next/navigation";

const tickerItems = [
	{ text: "Frete grátis acima de R$ 299" },
	{ text: "12× sem juros no cartão" },
	{ text: "Garantia 2 anos em toda linha profissional" },
	{ text: "30 dias para troca sem burocracia" },
	{ text: "Suporte 24/7" },
	{ text: "Entrega em todo o Brasil" },
];

function TickerContent() {
	return (
		<>
			{tickerItems.map((item) => (
				<span key={item.text}>
					{item.text}
					<span aria-hidden="true" className="dot" />
				</span>
			))}
		</>
	);
}

export function Ticker() {
	const pathname = usePathname();
	if (pathname.startsWith("/dashboard") || pathname === "/") {
		return null;
	}
	return (
		<div
			aria-label="Informações da loja"
			className="emach-ticker"
			role="marquee"
		>
			<div aria-hidden="true" className="emach-marquee">
				<TickerContent />
				<TickerContent />
			</div>
		</div>
	);
}
