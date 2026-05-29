import { db } from "@emach/db";
import type { BranchBusinessHours } from "@emach/db/schema/inventory";
import { branch as branchTable } from "@emach/db/schema/inventory";
import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { PageContainer } from "@/components/page-container";
import { SectionLabel } from "@/components/section-label";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
	title: "Sobre a EMACH — Ferramentas Profissionais",
	description:
		"Conheça a EMACH, nossa curadoria de ferramentas profissionais e nossas filiais.",
};

const aboutPillars = [
	{
		id: "curadoria",
		label: "Curadoria",
		title: "Desenvolvidas para uso profissional.",
		description:
			"Projetadas para atender às demandas de aplicação industrial e construtiva.",
		tone: "light",
	},
	{
		id: "atendimento",
		label: "Atendimento",
		title: "Suporte antes e depois da compra.",
		description:
			"Equipe especializada para auxiliar na escolha técnica, acionamento de garantia e resolução de ocorrências.",
		tone: "dark",
	},
] as const;

const sideNotes = [
	{
		id: "linha-profissional",
		label: "Linha profissional",
		text: "Ferramentas dimensionadas para rotina profissional.",
	},
	{
		id: "presenca-fisica",
		label: "Presença física",
		text: "Unidades físicas para retirada, atendimento técnico presencial e suporte pós-venda.",
	},
	{
		id: "garantia",
		label: "Garantia",
		text: "Cobertura técnica realizada pela própria Emach, com responsabilidade direta sobre projeto, peças e mão de obra.",
	},
] as const;

interface BranchCardData {
	accent: "red" | "dark";
	address: string;
	hours: string | null;
	id: string;
	kicker: string;
	locality: string;
	mapEmbedUrl: string | null;
	mapsUrl: string | null;
	name: string;
	phone: string | null;
}

function formatCep(cep: string | null) {
	if (!cep) {
		return null;
	}

	const digits = cep.replace(/\D/g, "");
	if (digits.length !== 8) {
		return cep;
	}

	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(phone: string | null) {
	if (!phone) {
		return null;
	}

	const digits = phone.replace(/\D/g, "");
	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}

	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}

	return phone;
}

function formatBusinessHours(hours: BranchBusinessHours | null) {
	if (!hours) {
		return null;
	}

	const formatPeriod = (
		label: string,
		period: BranchBusinessHours[keyof BranchBusinessHours]
	) => {
		if (!period?.isOpen) {
			return `${label}: fechado`;
		}

		if (!(period.opensAt && period.closesAt)) {
			return `${label}: aberto`;
		}

		return `${label}: ${period.opensAt}-${period.closesAt}`;
	};

	return [
		formatPeriod("Seg-sex", hours.weekdays),
		formatPeriod("Sáb", hours.saturday),
		formatPeriod("Feriados", hours.holidays),
	].join(" | ");
}

function formatBranchAddress(row: {
	cep: string | null;
	city: string | null;
	neighborhood: string | null;
	state: string | null;
	street: string | null;
	streetNumber: string | null;
}) {
	const streetLine = [row.street, row.streetNumber].filter(Boolean).join(", ");
	const cityLine = [row.city, row.state].filter(Boolean).join("/");
	const cep = formatCep(row.cep);

	return [streetLine, row.neighborhood, cityLine, cep ? `CEP ${cep}` : null]
		.filter(Boolean)
		.join(" - ");
}

function buildMapsEmbedUrl(query: string) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;

	if (apiKey) {
		const params = new URLSearchParams({
			key: apiKey,
			q: query,
			zoom: "15",
			language: "pt-BR",
			region: "BR",
		});

		return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
	}

	const fallbackParams = new URLSearchParams({
		q: query,
		output: "embed",
	});

	return `https://www.google.com/maps?${fallbackParams.toString()}`;
}

async function getBranches(): Promise<BranchCardData[]> {
	const rows = await db
		.select({
			id: branchTable.id,
			name: branchTable.name,
			phone: branchTable.phone,
			businessHours: branchTable.businessHours,
			cep: branchTable.cep,
			street: branchTable.street,
			streetNumber: branchTable.streetNumber,
			neighborhood: branchTable.neighborhood,
			city: branchTable.city,
			state: branchTable.state,
		})
		.from(branchTable)
		.where(eq(branchTable.status, "active"))
		.orderBy(asc(branchTable.createdAt), asc(branchTable.id));

	return rows.map((row, index) => {
		const address = formatBranchAddress(row);
		const locality = [row.city, row.state].filter(Boolean).join("/");
		const mapsQuery = [row.street, row.streetNumber, row.neighborhood, locality]
			.filter(Boolean)
			.join(", ");

		return {
			id: row.id,
			kicker: `Filial ${String(index + 1).padStart(2, "0")}`,
			name: row.name,
			locality,
			address,
			phone: formatPhone(row.phone),
			hours: formatBusinessHours(row.businessHours),
			mapEmbedUrl: mapsQuery ? buildMapsEmbedUrl(mapsQuery) : null,
			mapsUrl: mapsQuery
				? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
				: null,
			accent: index % 2 === 0 ? "red" : "dark",
		};
	});
}

function pluralizeBranches(count: number) {
	return count === 1 ? "filial" : "filiais";
}

export default async function AboutPage() {
	const branches = await getBranches();
	const branchCount = branches.length;
	const branchLabel = pluralizeBranches(branchCount);

	return (
		<>
			<SiteHeader />

			<main className="bg-white">
				<section className="relative min-h-[calc(100svh-56px)] overflow-hidden bg-black text-white">
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-[radial-gradient(circle_at_66%_28%,rgba(218,41,28,0.19),transparent_24%),linear-gradient(128deg,rgba(255,255,255,0.065)_0_1px,transparent_1px_34px)]"
					/>
					<div
						aria-hidden="true"
						className="absolute top-10 right-[-0.08em] font-bold font-display text-[clamp(86px,14vw,190px)] text-white/8 leading-[0.75] tracking-[-0.055em]"
					>
						EMACH
					</div>

					<PageContainer className="relative grid min-h-[calc(100svh-56px)] grid-cols-1 gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_360px_minmax(0,0.9fr)] lg:px-12 lg:py-14 xl:gap-10">
						<div className="flex flex-col justify-between gap-10">
							<div>
								<div className="mb-5 flex items-center gap-3">
									<div className="h-0.5 w-10 bg-emach-red" />
									<SectionLabel tone="light">Sobre a EMACH</SectionLabel>
								</div>
								<h1 className="max-w-180 text-balance font-bold font-display text-[clamp(46px,8vw,82px)] leading-[0.88] tracking-[-0.02em]">
									Equipamento profissional, suporte especializado.
								</h1>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								{aboutPillars.map((pillar) => (
									<article
										className={
											pillar.tone === "light"
												? "bg-white p-5 text-near-black"
												: "border border-white/20 bg-white/[0.035] p-5 text-white"
										}
										key={pillar.id}
									>
										<div
											className={
												pillar.tone === "light"
													? "font-bold font-display text-[11px] text-gray-60 uppercase tracking-[0.16em]"
													: "font-bold font-display text-[11px] text-gray-50 uppercase tracking-[0.16em]"
											}
										>
											{pillar.label}
										</div>
										<h2 className="mt-2 font-bold text-[21px] leading-[1.05]">
											{pillar.title}
										</h2>
										<p
											className={
												pillar.tone === "light"
													? "mt-2 text-[13px] text-gray-60 leading-relaxed"
													: "mt-2 text-[13px] text-white/62 leading-relaxed"
											}
										>
											{pillar.description}
										</p>
									</article>
								))}
							</div>
						</div>

						<div className="relative flex items-center justify-center py-4">
							<div
								aria-hidden="true"
								className="absolute inset-x-0 top-12 bottom-12 hidden -skew-x-12 border border-white/15 lg:block"
							/>
							<div className="relative flex min-h-80 w-full flex-col justify-between bg-emach-red p-7 text-white sm:min-h-95">
								<div className="font-bold font-display text-[11px] uppercase tracking-[0.18em]">
									Presença local
								</div>
								<div>
									<div className="font-bold font-display text-[clamp(112px,17vw,168px)] leading-[0.72] tracking-[-0.08em]">
										{branchCount}
									</div>
									<div className="mt-3 font-bold font-display text-[clamp(38px,5vw,48px)] leading-[0.86] tracking-[-0.03em]">
										{branchLabel}
									</div>
								</div>
								<p className="max-w-62.5 text-[13px] text-white/85 leading-relaxed">
									{branchCount} {branchLabel} para retirada, atendimento técnico
									presencial e suporte pós-venda.
								</p>
							</div>
						</div>

						<div className="flex flex-col justify-end gap-3 lg:pb-8">
							{sideNotes.map((note) => (
								<article
									className="border border-white/20 bg-white/[0.035] p-5"
									key={note.id}
								>
									<div className="font-bold font-display text-[11px] text-gray-50 uppercase tracking-[0.16em]">
										{note.label}
									</div>
									<p className="mt-2 font-bold text-[18px] leading-[1.12]">
										{note.text}
									</p>
								</article>
							))}
						</div>

						<div
							aria-hidden="true"
							className="absolute right-6 bottom-10 left-6 h-px bg-white/15 lg:right-12 lg:left-12"
						/>
					</PageContainer>
				</section>

				<section
					className="scroll-mt-20 bg-gray-10 py-12 sm:py-16"
					id="filiais"
				>
					<PageContainer className="px-6 sm:px-8 lg:px-12">
						<div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<SectionLabel>Filiais</SectionLabel>
								<h2 className="mt-2 max-w-155 font-bold font-display text-[clamp(36px,5vw,52px)] text-near-black leading-[0.95] tracking-[-0.01em]">
									Confira nossas filiais.
								</h2>
							</div>
							<div
								aria-hidden="true"
								className="h-0.5 w-40 bg-near-black sm:w-55"
							/>
						</div>

						<div className="grid gap-5 lg:grid-cols-2">
							{branches.map((branch) => (
								<BranchCard branch={branch} key={branch.id} />
							))}
						</div>
					</PageContainer>
				</section>
			</main>
		</>
	);
}

function BranchCard({ branch }: { branch: BranchCardData }) {
	const isRed = branch.accent === "red";

	return (
		<article className="grid overflow-hidden border border-gray-20 bg-white lg:grid-rows-[minmax(210px,240px)_auto]">
			<div className="relative min-h-55 overflow-hidden bg-gray-20">
				{branch.mapEmbedUrl ? (
					<iframe
						allowFullScreen
						className="absolute inset-0 h-full w-full border-0 grayscale"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						src={branch.mapEmbedUrl}
						title={`Mapa da filial ${branch.name}`}
					/>
				) : (
					<div className="absolute inset-0 bg-gray-20" />
				)}
				<div className="pointer-events-none absolute inset-0 bg-near-black/12 mix-blend-multiply" />

				<div className="absolute right-5 bottom-4 min-w-37.5 bg-emach-red p-3 text-white">
					<div className="font-bold font-display text-[10px] text-white uppercase tracking-[0.16em]">
						Filial
					</div>
					<strong className="mt-1 block text-[18px] leading-none">
						{branch.name}
					</strong>
					{branch.locality && (
						<div className="mt-1 font-bold font-display text-[10px] text-white uppercase tracking-[0.14em]">
							{branch.locality}
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
				<div className="grid gap-2 text-[13px] text-gray-60 leading-relaxed">
					<div>
						<strong className="text-near-black">Endereço</strong>:{" "}
						{branch.address}
					</div>
					{branch.phone && (
						<div>
							<strong className="text-near-black">Telefone</strong>:{" "}
							{branch.phone}
						</div>
					)}
					{branch.hours && (
						<div>
							<strong className="text-near-black">Horário</strong>:{" "}
							{branch.hours}
						</div>
					)}
				</div>

				{branch.mapsUrl && (
					<a
						className={
							isRed
								? "inline-flex h-10.5 items-center justify-center border border-emach-red bg-white px-5 font-bold text-[13px] text-emach-red transition-colors hover:bg-emach-red hover:text-white"
								: "inline-flex h-10.5 items-center justify-center border border-emach-red bg-white px-5 font-bold text-[13px] text-emach-red transition-colors hover:bg-emach-red hover:text-white"
						}
						href={branch.mapsUrl}
						rel="noopener"
						target="_blank"
					>
						Ver rota
					</a>
				)}
			</div>
		</article>
	);
}
