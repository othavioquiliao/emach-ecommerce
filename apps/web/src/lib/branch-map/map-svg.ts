import type { StateShape } from "./types";

/**
 * Gera o mapa base (contornos dos estados) como data-URI de imagem SVG.
 *
 * Por que `<img>` e não `<svg>` inline: o "Auto Dark Mode for Web Contents"
 * (Chromium/Brave, modo agressivo) inverte SVG inline — nosso fundo escuro
 * vira cinza claro. Ele preserva imagens (`<img>`), então o mapa renderizado
 * como data-URI fica escuro mesmo sob force-dark. Os pins ficam como overlay
 * HTML por cima (interativos). Validado empiricamente no Brave com force-dark.
 */
export function buildMapSvgDataUri(
	states: StateShape[],
	viewBox: string
): string {
	const [minX, minY, width, height] = viewBox.split(" ");
	const paths = states
		.map((s) => {
			const fillOpacity = s.highlighted ? "0.13" : "0.05";
			return `<path d="${s.path}" fill="#ffffff" fill-opacity="${fillOpacity}" fill-rule="evenodd" stroke="#0a0a0a" stroke-width="0.8"/>`;
		})
		.join("");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}"><rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#0a0a0a"/>${paths}</svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Máscara no formato da silhueta do Brasil (união dos estados, preenchidos
 * sólidos). Aplicada via `mask-image` na imagem do mapa, recorta o retângulo
 * de fundo: o "quadrado" deixa de existir e só a silhueta dos estados aparece
 * sobre o fundo da seção. É geometria CSS estática — não é afetada pelo
 * force-dark (que mexe em cor, não em alpha de máscara).
 */
export function buildMapMaskDataUri(
	states: StateShape[],
	viewBox: string
): string {
	const [, , width, height] = viewBox.split(" ");
	const paths = states
		.map(
			(s) =>
				`<path d="${s.path}" fill="#ffffff" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.4"/>`
		)
		.join("");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${paths}</svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
