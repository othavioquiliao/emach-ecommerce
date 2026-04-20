import { cn } from "@emach/ui/lib/utils";
import type { Metadata } from "next";
import { Fragment } from "react";

import { CheckoutHeader } from "@/components/checkout-header";
import { CheckoutContent } from "./_components/checkout-content";

export const metadata: Metadata = {
	title: "Checkout — EMACH",
	description: "Finalize seu pedido EMACH com segurança.",
};

export default function CheckoutPage() {
	return (
		<>
			<CheckoutHeader>
				<StepIndicator currentStep={1} />
			</CheckoutHeader>
			<CheckoutContent />
			<footer className="dark bg-background py-5 text-center text-muted-foreground text-xs">
				© 2026 EMACH. Todos os direitos reservados.
			</footer>
		</>
	);
}

function StepIndicator({ currentStep }: { currentStep: number }) {
	const steps = ["Dados", "Entrega", "Pagamento"];
	return (
		<div className="flex items-center gap-2">
			{steps.map((step, i) => (
				<Fragment key={step}>
					{i > 0 && <span className="text-muted-foreground text-xs">—</span>}
					<span
						className={cn(
							"font-display text-xs uppercase tracking-wider",
							i + 1 === currentStep
								? "font-semibold text-foreground"
								: "text-muted-foreground"
						)}
					>
						{i + 1}. {step}
					</span>
				</Fragment>
			))}
		</div>
	);
}
