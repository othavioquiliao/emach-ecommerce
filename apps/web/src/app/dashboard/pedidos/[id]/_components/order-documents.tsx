import type { LucideIcon } from "lucide-react";
import { Download, FileText, Receipt } from "lucide-react";
import { AccountSection } from "@/app/dashboard/_components/account-section";

interface OrderDocumentsProps {
	nfeNumber: string | null;
	nfeStatus: string | null;
	nfeUrl: string | null;
	nfeXmlUrl: string | null;
	paymentReceiptUrl: string | null;
}

export function OrderDocuments({
	nfeNumber,
	nfeStatus,
	nfeUrl,
	nfeXmlUrl,
	paymentReceiptUrl,
}: OrderDocumentsProps) {
	const hasNfe = Boolean(nfeNumber || nfeUrl || nfeXmlUrl);
	if (!(hasNfe || paymentReceiptUrl)) {
		return null;
	}

	return (
		<AccountSection title="Documentos">
			<div className="flex flex-col gap-2.5">
				{hasNfe ? (
					<DocRow
						Icon={FileText}
						subtitle={nfeStatus ? `Status: ${nfeStatus}` : undefined}
						title={
							nfeNumber ? `Nota fiscal · NF-e ${nfeNumber}` : "Nota fiscal"
						}
					>
						{nfeUrl ? <DocLink href={nfeUrl} label="DANFE (PDF)" /> : null}
						{nfeXmlUrl ? <DocLink href={nfeXmlUrl} label="XML" /> : null}
					</DocRow>
				) : null}
				{paymentReceiptUrl ? (
					<DocRow Icon={Receipt} title="Comprovante de pagamento">
						<DocLink href={paymentReceiptUrl} label="Baixar" />
					</DocRow>
				) : null}
			</div>
		</AccountSection>
	);
}

function DocRow({
	Icon,
	title,
	subtitle,
	children,
}: {
	children: React.ReactNode;
	Icon: LucideIcon;
	subtitle?: string;
	title: string;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3.5 border border-border bg-white px-4 py-3.5">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center border border-near-black text-near-black">
				<Icon className="h-5 w-5" strokeWidth={1.6} />
			</span>
			<div className="min-w-0 flex-1">
				<div className="font-semibold text-[14px] text-near-black">{title}</div>
				{subtitle ? (
					<div className="text-[12px] text-gray-50">{subtitle}</div>
				) : null}
			</div>
			<div className="flex flex-wrap items-center gap-2">{children}</div>
		</div>
	);
}

function DocLink({ href, label }: { href: string; label: string }) {
	return (
		<a
			className="inline-flex h-9 items-center justify-center gap-1.5 border border-near-black bg-white px-3.5 font-sans font-semibold text-[13px] text-near-black tracking-[0.04em] transition-all duration-180 hover:bg-near-black hover:text-white"
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Download className="h-3.5 w-3.5" strokeWidth={1.8} />
			{label}
		</a>
	);
}
