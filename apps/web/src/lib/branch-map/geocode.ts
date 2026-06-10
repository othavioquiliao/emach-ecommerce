import municipios from "./municipios.json";

const TABLE = municipios as unknown as Record<string, [number, number]>;
const norm = (s: string) =>
	s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Coordenada [x,y] no viewBox do mapa para uma cidade. Fallback: centroide da UF. */
export function cityToXY(city: string, uf: string): [number, number] | null {
	const sigla = uf.toUpperCase();
	return TABLE[`${norm(city)}|${sigla}`] ?? TABLE[`_uf|${sigla}`] ?? null;
}
