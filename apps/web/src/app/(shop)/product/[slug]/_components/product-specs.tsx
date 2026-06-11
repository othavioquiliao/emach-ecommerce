import type { ToolDetail } from "@emach/db/queries/catalog";
import { SectionLabel } from "@/components/section-label";
import { fmtSpecNumber, fmtSpecRange } from "@/lib/format";

interface ProductSpecsProps {
	attributes: ToolDetail["attributes"];
	tool: ToolDetail["tool"];
}

const HERO_COUNT = 3;

function fmtAttr(item: ToolDetail["attributes"][number]): string {
	const { definition, value } = item;
	const unit = definition.unit ?? "";
	switch (definition.inputType) {
		case "boolean":
			return value.valueBool == null ? "—" : value.valueBool ? "Sim" : "Não";
		case "numeric_range":
			return fmtSpecRange(value.valueNumeric, value.valueNumericMax, unit);
		case "number":
			return fmtSpecNumber(value.valueNumeric, unit);
		default:
			return value.valueText ?? "—";
	}
}

export function ProductSpecs({ attributes, tool }: ProductSpecsProps) {
	const sorted = [...attributes].sort((a, b) => a.sortOrder - b.sortOrder);
	const hero = sorted.slice(0, HERO_COUNT);
	const rest = sorted.slice(HERO_COUNT);

	return (
		<section className="emach-bg-cinema text-white [color-scheme:dark]">
			<div className="px-20 pt-12 pb-2">
				<SectionLabel tone="accent">Ficha da ferramenta</SectionLabel>
			</div>
			<div className="grid grid-cols-1 border-white/15 border-y md:grid-cols-[36%_1fr]">
				<div className="flex flex-col border-white/15 md:border-r">
					<div className="border-white/12 border-b px-20 py-5 md:px-10">
						<span className="font-display font-semibold text-[11px] text-white/60 uppercase tracking-[0.12em]">
							A ferramenta
						</span>
						<p className="mt-2.5 text-[15px] text-white/80 leading-relaxed">
							{tool.description ?? "Descrição não disponível."}
						</p>
					</div>
					<div className="flex items-start gap-3.5 border-white/12 border-b px-20 py-4 md:px-10">
						<span className="flex size-7 flex-none items-center justify-center border border-emach-red text-[13px] text-emach-red">
							✓
						</span>
						<div>
							<div className="font-semibold text-[15px]">
								Garantia de 2 anos
							</div>
							<div className="mt-0.5 text-[13px] text-white/60">
								Direto com a marca, assistência em 50+ cidades
							</div>
						</div>
					</div>
					<div className="flex items-start gap-3.5 border-white/12 border-b px-20 py-4 md:px-10">
						<span className="flex size-7 flex-none items-center justify-center border border-emach-red text-[13px] text-emach-red">
							⊕
						</span>
						<div>
							<div className="font-semibold text-[15px]">
								Frete para todo o Brasil
							</div>
							<div className="mt-0.5 text-[13px] text-white/60">
								Calculado pelo seu CEP · 3 a 8 dias úteis
							</div>
						</div>
					</div>
					<div className="px-20 py-5 text-[13px] text-white/60 md:px-10">
						<strong className="mb-0.5 block font-semibold text-[15px] text-white">
							Precisa de ajuda?
						</strong>
						Fale com nossos técnicos pelo chat.
					</div>
				</div>

				<div className="flex flex-col">
					<div className="flex items-center justify-between px-10 py-4">
						<span className="font-display font-semibold text-[11px] text-white/60 uppercase tracking-[0.12em]">
							{rest.length > 0 ? "Destaques" : "Especificações"}
						</span>
						<span className="border border-white/25 px-2.5 py-0.5 font-display text-[11px] text-white/60 uppercase tracking-[0.12em]">
							{attributes.length} {attributes.length === 1 ? "spec" : "specs"}
						</span>
					</div>
					{attributes.length === 0 ? (
						<p className="px-10 pb-10 text-[15px] text-white/60">
							Nenhuma especificação cadastrada.
						</p>
					) : (
						<>
							<div className="flex border-white/15 border-y">
								{hero.map((attr) => (
									<div
										className="flex-1 border-white/12 border-r px-6 py-4 last:border-r-0"
										key={attr.definition.id}
									>
										<span className="font-display font-semibold text-[10px] text-white/60 uppercase tracking-[0.12em]">
											{attr.definition.label}
										</span>
										<div className="mt-1.5 font-display font-medium text-[34px] leading-none">
											{fmtAttr(attr)}
										</div>
									</div>
								))}
							</div>
							{rest.length > 0 && (
								<>
									<div className="px-10 pt-4 pb-2">
										<span className="font-display font-semibold text-[11px] text-white/60 uppercase tracking-[0.12em]">
											Especificações completas
										</span>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2">
										{rest.map((attr, i) => (
											<div
												className={`flex items-baseline justify-between gap-3 border-white/12 border-b px-10 py-3 ${
													i % 2 === 0 ? "sm:border-r" : ""
												}`}
												key={attr.definition.id}
											>
												<span className="text-[14.5px] text-white/72">
													{attr.definition.label}
												</span>
												<span className="font-semibold text-[15px]">
													{fmtAttr(attr)}
												</span>
											</div>
										))}
									</div>
								</>
							)}
						</>
					)}
				</div>
			</div>
		</section>
	);
}
