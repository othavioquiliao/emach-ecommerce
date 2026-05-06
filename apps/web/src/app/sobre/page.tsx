import type { Metadata } from "next";

import { PageContainer } from "@/components/page-container";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
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
		text: "Duas unidades físicas para retirada, atendimento técnico presencial e suporte pós-venda.",
	},
	{
		id: "garantia",
		label: "Garantia",
		text: "Cobertura técnica realizada pela própria Emach, com responsabilidade direta sobre projeto, peças e mão de obra.",
	},
] as const;

const branches = [
	{
		id: "filial-01",
		kicker: "Filial 01",
		name: "Nome / Cidade",
		address: "Endereço / placeholder",
		hours: "Horário / placeholder",
		phone: "Telefone / placeholder",
		accent: "red",
	},
	{
		id: "filial-02",
		kicker: "Filial 02",
		name: "Nome / Cidade",
		address: "Endereço / placeholder",
		hours: "Horário / placeholder",
		phone: "Telefone / placeholder",
		accent: "dark",
	},
] as const;

export default function AboutPage() {
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
						className="absolute top-10 right-[-0.08em] font-bold font-display text-[clamp(86px,14vw,190px)] text-white/4.5 leading-[0.75] tracking-[-0.055em]"
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
								<h1 className="max-w-[720px] text-balance font-bold font-display text-[clamp(46px,8vw,82px)] leading-[0.88] tracking-[-0.02em]">
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
							<div className="relative flex min-h-[320px] w-full flex-col justify-between bg-emach-red p-7 text-white sm:min-h-[380px]">
								<div className="font-bold font-display text-[11px] uppercase tracking-[0.18em]">
									Presença local
								</div>
								<div>
									<div className="font-bold font-display text-[clamp(112px,17vw,168px)] leading-[0.72] tracking-[-0.08em]">
										2
									</div>
									<div className="mt-3 font-bold font-display text-[clamp(38px,5vw,48px)] leading-[0.86] tracking-[-0.03em]">
										filiais
									</div>
								</div>
								<p className="max-w-[250px] text-[13px] text-white/85 leading-relaxed">
									Duas unidades físicas para retirada, atendimento técnico
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
								<h2 className="mt-2 max-w-[620px] font-bold font-display text-[clamp(36px,5vw,52px)] text-near-black leading-[0.95] tracking-[-0.01em]">
									Confira nossas filiais.
								</h2>
							</div>
							<div
								aria-hidden="true"
								className="h-0.5 w-40 bg-near-black sm:w-[220px]"
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

			<SiteFooter />
		</>
	);
}

type Branch = (typeof branches)[number];

function BranchCard({ branch }: { branch: Branch }) {
	const isRed = branch.accent === "red";

	return (
		<article className="grid overflow-hidden border border-gray-20 bg-white lg:grid-rows-[minmax(210px,240px)_auto]">
			<div className="relative min-h-[220px] overflow-hidden bg-gray-20">
				<div
					aria-hidden="true"
					className={
						isRed
							? "absolute inset-0 bg-[linear-gradient(24deg,transparent_0_18%,#bcbcbc_18%_19%,transparent_19%_46%,#bcbcbc_46%_47%,transparent_47%),linear-gradient(115deg,transparent_0_25%,#c8c8c8_25%_26%,transparent_26%_62%,#c8c8c8_62%_63%,transparent_63%),linear-gradient(0deg,transparent_0_34%,#c4c4c4_34%_35%,transparent_35%_72%,#c4c4c4_72%_73%,transparent_73%)] sm:inset-[-20px] sm:-rotate-3 sm:scale-[1.08]"
							: "absolute inset-0 bg-[linear-gradient(152deg,transparent_0_22%,#bdbdbd_22%_23%,transparent_23%_52%,#bdbdbd_52%_53%,transparent_53%),linear-gradient(82deg,transparent_0_21%,#c8c8c8_21%_22%,transparent_22%_66%,#c8c8c8_66%_67%,transparent_67%),linear-gradient(0deg,transparent_0_29%,#c4c4c4_29%_30%,transparent_30%_69%,#c4c4c4_69%_70%,transparent_70%)] sm:inset-[-20px] sm:-rotate-2 sm:scale-[1.08]"
					}
				/>
				<div className="absolute top-4 left-5 bg-near-black px-2.5 py-2 font-bold font-display text-[10px] text-white uppercase tracking-[0.16em]">
					Google Maps
				</div>
				<div
					aria-hidden="true"
					className={
						isRed
							? "absolute top-[18%] right-[10%] left-[30%] h-[3px] origin-left rotate-18 bg-emach-red shadow-[110px_38px_0_#DA291C]"
							: "absolute top-[58%] right-[15%] left-[18%] h-[3px] origin-left rotate-[-16deg] bg-near-black shadow-[120px_-34px_0_#181818]"
					}
				/>
				<div
					aria-hidden="true"
					className={
						isRed
							? "absolute right-[34%] bottom-[34%] size-6 rotate-45 bg-emach-red"
							: "absolute top-[37%] right-[38%] size-6 rotate-45 bg-near-black"
					}
				/>
				<div className="absolute right-5 bottom-4 min-w-[150px] bg-white p-3 text-near-black">
					<div className="font-bold font-display text-[10px] text-gray-60 uppercase tracking-[0.16em]">
						{branch.kicker}
					</div>
					<strong className="mt-1 block text-[18px] leading-none">
						{branch.name}
					</strong>
				</div>
			</div>

			<div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
				<div className="grid gap-2 text-[13px] text-gray-60 leading-relaxed">
					<div>
						<strong className="text-near-black">Endereço</strong> /{" "}
						{branch.address}
					</div>
					<div>
						<strong className="text-near-black">Horário</strong> /{" "}
						{branch.hours}
					</div>
					<div>
						<strong className="text-near-black">Telefone</strong> /{" "}
						{branch.phone}
					</div>
				</div>

				<button
					className={
						isRed
							? "h-[42px] cursor-not-allowed border border-near-black bg-near-black px-5 font-bold text-[13px] text-white opacity-70"
							: "h-[42px] cursor-not-allowed border border-near-black bg-white px-5 font-bold text-[13px] text-near-black opacity-70"
					}
					disabled
					title="Rota disponível quando o endereço real for cadastrado"
					type="button"
				>
					Ver rota
				</button>
			</div>
		</article>
	);
}
