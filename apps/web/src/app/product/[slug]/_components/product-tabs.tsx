"use client";

import type { ToolDetail } from "@emach/db/queries/catalog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { SectionLabel } from "@/components/section-label";

interface ProductTabsProps {
	attributes: ToolDetail["attributes"];
	tool: ToolDetail["tool"];
}

const RAIL_ITEMS = [
	{
		value: "specs",
		num: "01",
		title: "Especificações",
		subtitle: "Motor, dimensões, materiais",
	},
	{
		value: "desc",
		num: "02",
		title: "Descrição",
		subtitle: "Como a ferramenta trabalha",
	},
	{
		value: "shipping",
		num: "03",
		title: "Entrega e Garantia",
		subtitle: "Prazos, cobertura e suporte",
	},
] as const;

const TRIGGER_CLASS =
	"group/rail w-full flex h-auto flex-1 items-start justify-start gap-3.5 whitespace-normal border-l-[3px] border-transparent px-8 py-5 text-left transition-colors hover:bg-background/60 focus-visible:ring-0 data-active:border-l-emach-red data-active:bg-background";

const PANEL_HEADING_CLASS =
	"mt-3 mb-7 font-display font-medium text-[28px] leading-[1.1] tracking-[-0.01em]";

const PANEL_PROSE_CLASS = "space-y-4 text-[15px] text-gray-60 leading-relaxed";

function withUnit(value: string, unit: string): string {
	return unit ? `${value} ${unit}` : value;
}

function formatBoolean(item: ToolDetail["attributes"][number]): string {
	const v = item.value.valueBool;
	if (v === null) {
		return "—";
	}
	return v ? "Sim" : "Não";
}

function formatRange(item: ToolDetail["attributes"][number]): string {
	const unit = item.definition.unit ?? "";
	const min = item.value.valueNumeric;
	const max = item.value.valueNumericMax;
	if (min == null) {
		return "—";
	}
	if (max == null) {
		return withUnit(String(min), unit);
	}
	return withUnit(`${min} – ${max}`, unit);
}

function formatNumber(item: ToolDetail["attributes"][number]): string {
	const unit = item.definition.unit ?? "";
	const v = item.value.valueNumeric;
	if (v == null) {
		return "—";
	}
	return withUnit(String(v), unit);
}

function formatAttribute(item: ToolDetail["attributes"][number]): string {
	switch (item.definition.inputType) {
		case "boolean":
			return formatBoolean(item);
		case "numeric_range":
			return formatRange(item);
		case "number":
			return formatNumber(item);
		default:
			return item.value.valueText ?? "—";
	}
}

export function ProductTabs({ tool, attributes }: ProductTabsProps) {
	return (
		<section>
			<div className="flex items-end justify-between gap-6 px-20 pt-12">
				<div>
					<SectionLabel tone="accent">Ficha da ferramenta</SectionLabel>
					<h2 className="mt-3 max-w-[560px] font-display font-medium text-[36px] leading-[1.05] tracking-[-0.01em]">
						Tudo sobre a {tool.name}.
					</h2>
				</div>
			</div>

			<Tabs
				className="mt-9 grid min-h-[520px] grid-cols-[280px_1fr] gap-0 border-gray-20 border-y"
				defaultValue="specs"
				orientation="vertical"
			>
				<div className="flex flex-col border-gray-20 border-r bg-gray-10">
					<span className="border-gray-20 border-b px-8 pt-8 pb-4 font-display font-semibold text-[12px] text-gray-50 uppercase tracking-[0.14em]">
						Informações
					</span>
					<TabsList
						className="h-auto w-full flex-col items-stretch gap-0 border-0 bg-transparent p-0"
						variant="line"
					>
						{RAIL_ITEMS.map((item) => (
							<TabsTrigger
								className={TRIGGER_CLASS}
								key={item.value}
								value={item.value}
							>
								<span className="mt-1 font-display font-semibold text-[11px] text-gray-50 tracking-[0.14em] group-data-active/rail:text-emach-red">
									{item.num}
								</span>
								<span className="flex flex-col">
									<span className="font-semibold text-[15px] text-gray-60 group-data-active/rail:text-foreground">
										{item.title}
									</span>
									<span className="mt-0.5 font-normal text-[12px] text-gray-50">
										{item.subtitle}
									</span>
								</span>
							</TabsTrigger>
						))}
					</TabsList>
					<div className="mt-auto border-gray-20 border-t p-8 text-[12px] text-gray-60">
						<strong className="mb-1 block font-semibold text-[13px] text-foreground">
							Precisa de ajuda?
						</strong>
						Fale com nossos técnicos pelo chat.
					</div>
				</div>

				<div className="px-16 py-12">
					<TabsContent className="block" value="specs">
						<SectionLabel tone="accent">01 · Especificações</SectionLabel>
						<h3 className={`${PANEL_HEADING_CLASS} max-w-[620px]`}>
							Engenharia em cada parâmetro.
						</h3>
						{attributes.length === 0 ? (
							<p className={PANEL_PROSE_CLASS}>
								Nenhuma especificação cadastrada.
							</p>
						) : (
							<div className="grid max-w-[920px] grid-cols-2 gap-x-14 gap-y-7">
								{attributes.map((attr) => (
									<div
										className="border-gray-20 border-b pb-2.5"
										key={attr.definition.id}
									>
										<span className="mb-1.5 block font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.12em]">
											{attr.definition.label}
										</span>
										<div className="font-semibold text-[17px] tracking-[-0.005em]">
											{formatAttribute(attr)}
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent className="block max-w-[720px]" value="desc">
						<SectionLabel tone="accent">02 · Descrição</SectionLabel>
						<h3 className={PANEL_HEADING_CLASS}>
							Projetada para uso profissional contínuo.
						</h3>
						<div className={PANEL_PROSE_CLASS}>
							{tool.description ? (
								<p>{tool.description}</p>
							) : (
								<p>Descrição não disponível.</p>
							)}
						</div>
					</TabsContent>

					<TabsContent className="block max-w-[720px]" value="shipping">
						<SectionLabel tone="accent">03 · Entrega e Garantia</SectionLabel>
						<h3 className={PANEL_HEADING_CLASS}>
							Cobertura nacional, suporte direto com a marca.
						</h3>
						<div className={PANEL_PROSE_CLASS}>
							<p>
								Entrega em todo o Brasil via transportadora parceira. Prazo de 3
								a 8 dias úteis.
							</p>
							<p>
								2 anos de garantia contra defeitos de fabricação. Assistência
								técnica autorizada em 50+ cidades.
							</p>
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</section>
	);
}
