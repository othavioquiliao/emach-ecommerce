export interface Product {
	badge?: string;
	category: string;
	categorySlug: string;
	description: string;
	id: string;
	images: string[];
	inStock: boolean;
	name: string;
	originalPrice?: number;
	price: number;
	rating?: { average: number; count: number };
	shortDescription: string[];
	sku: string;
	slug: string;
	specs: Record<string, string>;
	voltage?: string[];
}

export interface Category {
	description: string;
	image: string;
	name: string;
	slug: string;
}

export interface CartItem {
	product: Product;
	quantity: number;
	selectedVoltage?: string;
}

export interface Review {
	author: string;
	body: string;
	date: string;
	id: string;
	rating: 1 | 2 | 3 | 4 | 5;
}

export const categories: Category[] = [
	{
		name: "Ferramentas Elétricas",
		slug: "eletricas",
		description: "Furadeiras, serras, esmerilhadeiras e parafusadeiras.",
		image: "/images/categories/eletricas.png",
	},
	{
		name: "Ferramentas Manuais",
		slug: "manuais",
		description: "Chaves, alicates, martelos e serrotes profissionais.",
		image: "/images/categories/manuais.png",
	},
	{
		name: "Medição",
		slug: "medicao",
		description: "Níveis laser, trenas digitais e paquímetros de precisão.",
		image: "/images/categories/medicao.png",
	},
	{
		name: "Segurança",
		slug: "seguranca",
		description: "Óculos, luvas e protetores auriculares certificados.",
		image: "/images/categories/seguranca.png",
	},
	{
		name: "Acessórios",
		slug: "acessorios",
		description: "Brocas, discos de corte, lâminas e bits.",
		image: "/images/categories/acessorios.png",
	},
];

export const products: Product[] = [
	{
		id: "1",
		slug: "furadeira-impacto-20v",
		name: "Furadeira de Impacto 20V",
		category: "Ferramentas Elétricas",
		categorySlug: "eletricas",
		price: 89_900,
		description:
			"Furadeira de impacto profissional com motor brushless de alta eficiência. Mandril de 13mm com aperto rápido, 2 velocidades mecânicas e torque máximo de 60Nm. Ideal para concreto, metal e madeira.",
		shortDescription: [
			"Motor brushless de alta eficiência",
			"Torque máximo de 60 Nm em 2 velocidades mecânicas",
			"Mandril de 13 mm com aperto rápido",
			"Ideal para concreto, metal e madeira",
		],
		specs: {
			Voltagem: "20V",
			Torque: "60 Nm",
			Velocidade: "0–2.000 RPM",
			Mandril: "13mm",
			Peso: "1.8 kg",
			Bateria: "4.0 Ah Li-Ion",
		},
		images: [
			"/images/products/furadeira-impacto-20v.png",
			"/images/products/furadeira-impacto-20v-gallery.png",
		],
		badge: "Mais Vendido",
		sku: "EMC-FI-2001",
		inStock: true,
		voltage: ["20V"],
		rating: { average: 4.8, count: 342 },
	},
	{
		id: "2",
		slug: "serra-circular-185mm",
		name: "Serra Circular 185mm",
		category: "Ferramentas Elétricas",
		categorySlug: "eletricas",
		price: 129_900,
		originalPrice: 149_900,
		description:
			"Serra circular profissional com disco de 185mm e motor de 1.800W. Base em alumínio fundido com ajuste de profundidade e ângulo até 45°. Guia laser integrada para cortes precisos.",
		shortDescription: [
			"Motor de 1.800 W a 5.500 RPM",
			"Disco de 185 mm, profundidade de corte até 65 mm",
			"Base em alumínio fundido com ajuste de ângulo até 45°",
			"Guia laser integrada para cortes precisos",
		],
		specs: {
			Potência: "1.800W",
			Disco: "185mm",
			"Profundidade máx.": "65mm a 90°",
			Velocidade: "5.500 RPM",
			Peso: "4.2 kg",
		},
		images: ["/images/products/serra-circular-185mm.png"],
		badge: "Novo",
		sku: "EMC-SC-1851",
		inStock: true,
		voltage: ["110V", "220V"],
		rating: { average: 4.6, count: 87 },
	},
	{
		id: "3",
		slug: "esmerilhadeira-angular-125mm",
		name: "Esmerilhadeira Angular 125mm",
		category: "Ferramentas Elétricas",
		categorySlug: "eletricas",
		price: 59_900,
		description:
			"Esmerilhadeira compacta e potente com disco de 125mm. Motor de 1.100W com proteção contra sobrecarga. Empunhadura lateral ajustável em 3 posições.",
		shortDescription: [
			"Motor de 1.100 W a 11.000 RPM",
			"Disco de 125 mm para corte e desbaste",
			"Proteção eletrônica contra sobrecarga",
			"Empunhadura lateral ajustável em 3 posições",
		],
		specs: {
			Potência: "1.100W",
			Disco: "125mm",
			Velocidade: "11.000 RPM",
			Peso: "2.1 kg",
		},
		images: ["/images/products/esmerilhadeira-125mm.png"],
		sku: "EMC-EA-1251",
		inStock: true,
		voltage: ["110V", "220V"],
		rating: { average: 4.7, count: 256 },
	},
	{
		id: "4",
		slug: "parafusadeira-12v-compacta",
		name: "Parafusadeira Compacta 12V",
		category: "Ferramentas Elétricas",
		categorySlug: "eletricas",
		price: 49_900,
		description:
			"Parafusadeira compacta 12V com 20 posições de torque e embreagem eletrônica. Mandril de 10mm, design leve para trabalhos prolongados. Inclui 2 baterias e carregador rápido.",
		shortDescription: [
			"Bateria 12 V Li-Ion e torque de 30 Nm",
			"20 posições de torque com embreagem eletrônica",
			"Mandril de 10 mm, apenas 0,95 kg",
			"Inclui 2 baterias e carregador rápido",
		],
		specs: {
			Voltagem: "12V",
			Torque: "30 Nm",
			Mandril: "10mm",
			Peso: "0.95 kg",
			Bateria: "2.0 Ah Li-Ion",
		},
		images: ["/images/products/parafusadeira-12v.png"],
		sku: "EMC-PF-1201",
		inStock: true,
		voltage: ["12V"],
		rating: { average: 4.5, count: 198 },
	},
	{
		id: "5",
		slug: "jogo-chaves-combinadas-12pcs",
		name: "Jogo de Chaves Combinadas 12 Peças",
		category: "Ferramentas Manuais",
		categorySlug: "manuais",
		price: 18_900,
		description:
			"Jogo de 12 chaves combinadas em aço cromo-vanádio com acabamento espelhado. Medidas de 6mm a 22mm. Estojo organizador em EVA para transporte.",
		shortDescription: [
			"12 chaves em aço cromo-vanádio",
			"Medidas de 6 mm a 22 mm",
			"Acabamento espelhado e resistente à corrosão",
			"Estojo organizador em EVA para transporte",
		],
		specs: {
			Material: "Cromo-Vanádio",
			Peças: "12",
			Medidas: "6–22mm",
			Acabamento: "Espelhado",
		},
		images: ["/images/products/chaves-combinadas-12pcs.png"],
		sku: "EMC-CC-1201",
		inStock: true,
		rating: { average: 4.9, count: 412 },
	},
	{
		id: "6",
		slug: "alicate-universal-8pol",
		name: 'Alicate Universal 8"',
		category: "Ferramentas Manuais",
		categorySlug: "manuais",
		price: 7900,
		description:
			'Alicate universal profissional de 8" em aço especial temperado. Empunhadura bi-material antideslizante com proteção até 1.000V.',
		shortDescription: [
			'Aço especial temperado, 8" (200 mm)',
			"Isolamento elétrico até 1.000 V",
			"Empunhadura bi-material antideslizante",
			"Apenas 0,28 kg para uso prolongado",
		],
		specs: {
			Tamanho: '8" (200mm)',
			Material: "Aço Especial",
			Isolamento: "1.000V",
			Peso: "0.28 kg",
		},
		images: ["/images/products/alicate-universal-8pol.png"],
		sku: "EMC-AU-0801",
		inStock: true,
		rating: { average: 4.4, count: 76 },
	},
	{
		id: "7",
		slug: "nivel-laser-360-verde",
		name: "Nível Laser 360° Verde",
		category: "Medição",
		categorySlug: "medicao",
		price: 79_900,
		originalPrice: 99_900,
		description:
			"Nível laser autonivelante com projeção 360° horizontal e vertical. Laser verde de alta visibilidade, alcance de 30m (60m com detector). Tripé e maleta inclusos.",
		shortDescription: [
			"Laser verde 520 nm de alta visibilidade",
			"Projeção 360° horizontal e vertical",
			"Alcance de 30 m (60 m com detector)",
			"Precisão ±1 mm/5 m, autonivelante",
			"Tripé e maleta inclusos",
		],
		specs: {
			"Tipo laser": "Verde 520nm",
			Alcance: "30m (60m c/ detector)",
			Precisão: "±1mm/5m",
			Projeção: "360° H + V",
			Bateria: "Li-Ion recarregável",
		},
		images: ["/images/products/nivel-laser-360.png"],
		badge: "Promoção",
		sku: "EMC-NL-3601",
		inStock: true,
		rating: { average: 4.7, count: 134 },
	},
	{
		id: "8",
		slug: "trena-digital-laser-50m",
		name: "Trena Digital Laser 50m",
		category: "Medição",
		categorySlug: "medicao",
		price: 29_900,
		description:
			"Trena digital a laser com alcance de 50m e precisão de ±1.5mm. Mede distância, área e volume. Display retroiluminado e memória para 20 medições.",
		shortDescription: [
			"Alcance de 50 m com precisão ±1,5 mm",
			"Mede distância, área e volume",
			"Display LCD retroiluminado",
			"Memória para 20 medições",
		],
		specs: {
			Alcance: "50m",
			Precisão: "±1.5mm",
			Funções: "Distância / Área / Volume",
			Display: "LCD retroiluminado",
		},
		images: ["/images/products/trena-digital-50m.png"],
		sku: "EMC-TD-5001",
		inStock: true,
		rating: { average: 4.3, count: 58 },
	},
	{
		id: "9",
		slug: "kit-seguranca-profissional",
		name: "Kit Segurança Profissional",
		category: "Segurança",
		categorySlug: "seguranca",
		price: 14_900,
		description:
			"Kit completo com óculos de proteção anti-risco, protetor auricular tipo concha (NRR 25dB) e luvas de alta resistência. Certificação CA.",
		shortDescription: [
			"Óculos anti-risco com proteção UV400",
			"Protetor auricular tipo concha NRR 25 dB",
			"Luvas resistência mecânica nível 4",
			"Certificação CA conforme NR-6",
		],
		specs: {
			Óculos: "Anti-risco, UV400",
			Protetor: "NRR 25dB",
			Luvas: "Resistência mecânica nível 4",
			Certificação: "CA (NR-6)",
		},
		images: ["/images/products/kit-seguranca.png"],
		sku: "EMC-KS-0101",
		inStock: true,
		rating: { average: 5.0, count: 12 },
	},
	{
		id: "10",
		slug: "jogo-brocas-hss-25pcs",
		name: "Jogo de Brocas HSS 25 Peças",
		category: "Acessórios",
		categorySlug: "acessorios",
		price: 12_900,
		description:
			"Jogo de 25 brocas HSS com revestimento em titânio para metal, madeira e plástico. Medidas de 1mm a 13mm em estojo metálico organizador.",
		shortDescription: [
			"25 brocas HSS com revestimento em titânio",
			"Medidas de 1 mm a 13 mm",
			"Aplicação em metal, madeira e plástico",
			"Estojo metálico organizador",
		],
		specs: {
			Material: "HSS Titânio",
			Peças: "25",
			Medidas: "1–13mm",
			Aplicação: "Metal / Madeira / Plástico",
		},
		images: ["/images/products/brocas-hss-25pcs.png"],
		sku: "EMC-BH-2501",
		inStock: true,
		rating: { average: 4.6, count: 289 },
	},
	{
		id: "11",
		slug: "disco-corte-metal-115mm-10un",
		name: "Disco de Corte Metal 115mm (10un)",
		category: "Acessórios",
		categorySlug: "acessorios",
		price: 4900,
		description:
			"Pack com 10 discos de corte para metal 115mm x 1.0mm. Alta velocidade de corte com mínima geração de rebarbas.",
		shortDescription: [
			"Pack com 10 discos de 115 mm × 1,0 mm",
			"Rotação máxima de 13.300 RPM",
			"Alta velocidade de corte com mínima rebarba",
			'Compatível com esmerilhadeiras de 4½"',
		],
		specs: {
			Diâmetro: "115mm",
			Espessura: "1.0mm",
			"RPM máx.": "13.300",
			Quantidade: "10 unidades",
		},
		images: ["/images/products/disco-corte-115mm.png"],
		sku: "EMC-DC-1151",
		inStock: true,
		rating: { average: 4.8, count: 501 },
	},
];

export function formatPrice(cents: number): string {
	const reais = cents / 100;
	return reais.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
	return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(count = 4): Product[] {
	return products.filter((p) => p.badge).slice(0, count);
}

const reviewPool: Review[] = [
	{
		id: "r01",
		author: "Carlos M.",
		date: "2026-03-12",
		rating: 5,
		body: "Uso diário no canteiro há 4 meses. O motor aguenta perfurações contínuas em concreto sem aquecer. Bateria dura um turno inteiro com carga média. Mandril firme, sem folga.",
	},
	{
		id: "r02",
		author: "Renata S.",
		date: "2026-02-28",
		rating: 5,
		body: "Troquei a antiga por esta e a diferença de torque é absurda. Maleta bem organizada, veio com 2 baterias. Leve pro torque que entrega.",
	},
	{
		id: "r03",
		author: "Paulo F.",
		date: "2026-02-15",
		rating: 4,
		body: "Ferramenta profissional de verdade. Só tiro uma estrela porque a alça podia ter um apoio melhor pra uso acima da cabeça. No resto, impecável.",
	},
	{
		id: "r04",
		author: "João B.",
		date: "2026-02-02",
		rating: 5,
		body: "Comprei pra reforma da casa. Furou tudo: madeira, concreto, aço. Sem esforço extra, sem trepidação. Vale cada centavo investido.",
	},
	{
		id: "r05",
		author: "Marcos A.",
		date: "2026-01-20",
		rating: 5,
		body: "Fiz uma obra inteira com ela. Pega pesado no concreto armado sem patinar. A qualidade do mandril é notável. Recomendo para profissionais.",
	},
	{
		id: "r06",
		author: "Juliana R.",
		date: "2026-01-08",
		rating: 4,
		body: "Muito boa, só senti falta de uma luz LED mais forte para trabalhos em ambiente escuro. No mais, potente e precisa.",
	},
	{
		id: "r07",
		author: "Fernando L.",
		date: "2025-12-22",
		rating: 5,
		body: "Trabalho com marcenaria há 15 anos e essa é a melhor que já usei. Equilíbrio perfeito, vibração mínima, acabamento impecável nas peças.",
	},
	{
		id: "r08",
		author: "Bruno T.",
		date: "2025-12-10",
		rating: 3,
		body: "Produto bom mas esperava mais pelo preço. O desempenho é ok, mas já usei concorrentes por valor parecido com mais acessórios inclusos.",
	},
	{
		id: "r09",
		author: "Sérgio P.",
		date: "2025-11-28",
		rating: 5,
		body: "Chegou antes do prazo, embalagem excelente. Ferramenta robusta, pesada no lugar certo, leve no lugar certo. Entrega a potência que promete.",
	},
	{
		id: "r10",
		author: "Aline C.",
		date: "2025-11-14",
		rating: 5,
		body: "Primeira compra na EMACH e fiquei impressionada. Produto de ponta, atendimento rápido. Já virei cliente fiel da marca.",
	},
	{
		id: "r11",
		author: "Diego V.",
		date: "2025-10-30",
		rating: 4,
		body: "Cumpre o que promete. Só achei o manual um pouco resumido para quem é iniciante, mas pra quem já tem experiência é tranquilo de usar.",
	},
	{
		id: "r12",
		author: "Roberto G.",
		date: "2025-10-15",
		rating: 5,
		body: "Uso em instalações elétricas comerciais. Ferramenta que não falha, não aquece, não dá fadiga no braço. É investimento de longo prazo.",
	},
	{
		id: "r13",
		author: "Camila H.",
		date: "2025-09-28",
		rating: 2,
		body: "Tive problema com a bateria após 3 meses de uso moderado. Suporte técnico foi atencioso mas a troca demorou mais do que eu gostaria.",
	},
	{
		id: "r14",
		author: "Eduardo N.",
		date: "2025-09-10",
		rating: 5,
		body: "Comparando com o modelo anterior da minha marca antiga, esta é muito superior em torque e autonomia. Não volto mais pra concorrência.",
	},
	{
		id: "r15",
		author: "Patrícia O.",
		date: "2025-08-22",
		rating: 5,
		body: "Presente para meu marido, que é eletricista. Ele usa todos os dias há 6 meses e só tem elogios. Resistente, silenciosa e potente.",
	},
];

export function getReviewsByProductId(productId: string): Review[] {
	let hash = 0;
	for (let i = 0; i < productId.length; i++) {
		hash = (hash * 31 + productId.charCodeAt(i)) % 2_147_483_647;
	}
	const offset = hash % reviewPool.length;
	return [...reviewPool.slice(offset), ...reviewPool.slice(0, offset)];
}
