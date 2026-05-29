"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { fmtNumericBRL } from "@/lib/format";

// TODO(asaas): substituir os dados mock por cobrança real gerada via Asaas
// (Pix copia-e-cola + QR, linha digitável do boleto, tokenização do cartão).
// O webhook do Asaas confirma o pagamento e muda o status do pedido para "paid".
const MOCK_PIX =
	"00020126580014br.gov.bcb.pix0136mock-emach-asaas-pendente5204000053039865802BR";
const MOCK_BOLETO = "23793.38128 60007.827136 42000.063305 9 00000000000000";

export function PaymentMethods({
	orderNumber,
	subtotal,
	shipping,
	total,
}: {
	orderNumber: string;
	shipping: string;
	subtotal: string;
	total: string;
}) {
	const copy = (text: string, label: string) => async () => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${label} copiado`);
		} catch {
			toast.error("Não foi possível copiar");
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-[1fr_260px]">
			<Tabs defaultValue="pix">
				<TabsList variant="line">
					<TabsTrigger value="pix">Pix</TabsTrigger>
					<TabsTrigger value="boleto">Boleto</TabsTrigger>
					<TabsTrigger value="cartao">Cartão</TabsTrigger>
				</TabsList>

				<TabsContent className="pt-5" value="pix">
					<div className="flex flex-col items-center gap-4 border border-border p-6">
						<div
							aria-label="QR Code Pix (demonstração)"
							className="emach-bg-placeholder h-40 w-40"
							role="img"
						/>
						<p className="text-center text-[12px] text-gray-60">
							Escaneie o QR ou copie o código abaixo
						</p>
						<div className="flex w-full gap-2">
							<code className="min-w-0 flex-1 truncate border border-border bg-gray-10 px-3 py-2 font-mono text-[11px]">
								{MOCK_PIX}
							</code>
							<button
								aria-label="Copiar código Pix"
								className="inline-flex items-center gap-1.5 border border-near-black px-3 text-[12px] hover:bg-near-black hover:text-white"
								onClick={copy(MOCK_PIX, "Código Pix")}
								type="button"
							>
								<Copy className="h-3.5 w-3.5" /> Copiar
							</button>
						</div>
					</div>
				</TabsContent>

				<TabsContent className="pt-5" value="boleto">
					<div className="space-y-4 border border-border p-6">
						<p className="text-[12px] text-gray-60">
							Linha digitável (compensação em 1-2 dias úteis):
						</p>
						<div className="flex gap-2">
							<code className="min-w-0 flex-1 truncate border border-border bg-gray-10 px-3 py-2 font-mono text-[12px]">
								{MOCK_BOLETO}
							</code>
							<button
								aria-label="Copiar linha digitável do boleto"
								className="inline-flex items-center gap-1.5 border border-near-black px-3 text-[12px] hover:bg-near-black hover:text-white"
								onClick={copy(MOCK_BOLETO, "Linha digitável")}
								type="button"
							>
								<Copy className="h-3.5 w-3.5" /> Copiar
							</button>
						</div>
					</div>
				</TabsContent>

				<TabsContent className="pt-5" value="cartao">
					<div className="space-y-3 border border-border p-6">
						<input
							className="h-10 w-full border border-border px-3 text-[14px]"
							disabled
							placeholder="Número do cartão"
						/>
						<div className="flex gap-3">
							<input
								className="h-10 w-full border border-border px-3 text-[14px]"
								disabled
								placeholder="Validade"
							/>
							<input
								className="h-10 w-full border border-border px-3 text-[14px]"
								disabled
								placeholder="CVV"
							/>
						</div>
						<p className="text-[12px] text-gray-50">
							Pagamento com cartão estará disponível em breve.
						</p>
					</div>
				</TabsContent>
			</Tabs>

			<aside className="h-fit border border-border bg-gray-10 p-4 text-[13px]">
				<div className="mb-3 font-display font-semibold text-[11px] uppercase tracking-[0.12em]">
					Resumo
				</div>
				<div className="flex justify-between py-1">
					<span className="text-gray-60">Pedido</span>
					<span>#{orderNumber}</span>
				</div>
				<div className="flex justify-between py-1">
					<span className="text-gray-60">Subtotal</span>
					<span>{fmtNumericBRL(subtotal)}</span>
				</div>
				<div className="flex justify-between py-1">
					<span className="text-gray-60">Frete</span>
					<span>
						{Number(shipping) === 0 ? "Grátis" : fmtNumericBRL(shipping)}
					</span>
				</div>
				<div className="mt-2 flex justify-between border-near-black border-t pt-2 font-bold">
					<span>Total</span>
					<span>{fmtNumericBRL(total)}</span>
				</div>
			</aside>
		</div>
	);
}
