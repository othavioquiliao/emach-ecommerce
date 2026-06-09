import { execSync } from "node:child_process";
import fs from "node:fs";
import { geoMercator } from "d3-geo";

// Gera os assets estáticos do mapa de filiais:
//   - apps/web/src/lib/branch-map/brazil-states.ts  (paths SVG dos 27 estados + viewBox)
//   - apps/web/src/lib/branch-map/municipios.json    (cidade|UF -> [x,y] já projetado + fallback _uf|UF)
// Projeção fixada pelo bbox PLANAR do Brasil — não usa fitSize/geoBounds, que são esféricos
// e quebram com o winding-order invertido deste GeoJSON (geoBounds retornaria o mundo inteiro,
// comprimindo o Brasil numa bolha de ~60px).

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = `${ROOT}scripts/.mapdata`;
const OUT = `${ROOT}apps/web/src/lib/branch-map`;
const W = 560;
const H = 580;
const PAD = 18;

// UF sigla -> codigo_uf (IBGE) para casar com municipios.csv
const UF_CODE = {
	RO: 11,
	AC: 12,
	AM: 13,
	RR: 14,
	PA: 15,
	AP: 16,
	TO: 17,
	MA: 21,
	PI: 22,
	CE: 23,
	RN: 24,
	PB: 25,
	PE: 26,
	AL: 27,
	SE: 28,
	BA: 29,
	MG: 31,
	ES: 32,
	RJ: 33,
	SP: 35,
	PR: 41,
	SC: 42,
	RS: 43,
	MS: 50,
	MT: 51,
	GO: 52,
	DF: 53,
};
const CODE_UF = Object.fromEntries(
	Object.entries(UF_CODE).map(([k, v]) => [String(v), k])
);
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// 1) simplifica o geojson via mapshaper (reduz vértices -> paths leves)
const SIMPL = `${DATA}/br-simpl.geojson`;
execSync(
	`npx -y mapshaper "${DATA}/br.geojson" -simplify 8% keep-shapes -o "${SIMPL}" force`,
	{ stdio: "inherit" }
);
const geo = JSON.parse(fs.readFileSync(SIMPL, "utf8"));

// 2) projeção fixa pelo bbox planar conhecido do Brasil (imune ao winding-order bug)
const LNG0 = -74;
const LAT0 = 6;
const LNG1 = -34.6;
const LAT1 = -34;
const unit = geoMercator().scale(1).translate([0, 0]);
const tl = unit([LNG0, LAT0]);
const brc = unit([LNG1, LAT1]);
const bw = brc[0] - tl[0];
const bh = brc[1] - tl[1];
const scale = Math.min((W - 2 * PAD) / bw, (H - 2 * PAD) / bh);
const sUnit = geoMercator().scale(scale).translate([0, 0]);
const tl2 = sUnit([LNG0, LAT0]);
const usedW = bw * scale;
const usedH = bh * scale;
const tx = PAD + (W - 2 * PAD - usedW) / 2 - tl2[0];
const ty = PAD + (H - 2 * PAD - usedH) / 2 - tl2[1];
const proj = geoMercator().scale(scale).translate([tx, ty]);

// Monta o path SVG projetando cada vértice manualmente (M/L/Z por anel). NÃO usa
// geoPath(): o clip de esfera do d3-geo, com o winding-order invertido deste GeoJSON,
// emite o COMPLEMENTO do estado (estado + retângulo gigante da esfera projetada), o
// que faz o fill cobrir o exterior. Projeção ponto-a-ponto é imune a isso.
function featureToPath(feature) {
	const g = feature.geometry;
	const polys = g.type === "MultiPolygon" ? g.coordinates : [g.coordinates];
	let d = "";
	for (const poly of polys) {
		for (const ring of poly) {
			for (let i = 0; i < ring.length; i++) {
				const p = proj(ring[i]);
				if (!p) {
					continue;
				}
				d += `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
			}
			d += "Z";
		}
	}
	return d;
}

// centro do bbox PROJETADO de cada feature (fallback robusto; geoCentroid é esférico e
// também sofreria com o winding invertido)
function projectedCenter(feature) {
	const b = [1e9, 1e9, -1e9, -1e9];
	const walk = (c) => {
		if (typeof c[0] === "number") {
			const p = proj(c);
			if (p) {
				b[0] = Math.min(b[0], p[0]);
				b[1] = Math.min(b[1], p[1]);
				b[2] = Math.max(b[2], p[0]);
				b[3] = Math.max(b[3], p[1]);
			}
		} else {
			for (const x of c) {
				walk(x);
			}
		}
	};
	walk(feature.geometry.coordinates);
	return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
}

// 3) paths dos estados
const states = geo.features
	.map((f) => ({
		uf: (f.properties.sigla || f.properties.SIGLA || "").toUpperCase(),
		path: featureToPath(f),
	}))
	.filter((s) => s.uf);

fs.writeFileSync(
	`${OUT}/brazil-states.ts`,
	"// GERADO por scripts/gen-brazil-map.mjs — não editar à mão.\n" +
		`export const BRAZIL_VIEWBOX = "0 0 ${W} ${H}";\n` +
		`export const BRAZIL_STATES: { uf: string; path: string }[] = ${JSON.stringify(states)};\n`
);

// 4) municípios -> [x,y] já projetados
const out = {};
for (const row of fs
	.readFileSync(`${DATA}/municipios.csv`, "utf8")
	.trim()
	.split("\n")
	.slice(1)) {
	const [, nome, lat, lng, , codUf] = row.split(",");
	const uf = CODE_UF[codUf];
	if (!uf) {
		continue;
	}
	const [x, y] = proj([Number.parseFloat(lng), Number.parseFloat(lat)]);
	out[`${norm(nome)}|${uf}`] = [+x.toFixed(1), +y.toFixed(1)];
}
// 5) fallback: centro projetado de cada estado
for (const f of geo.features) {
	const uf = (f.properties.sigla || f.properties.SIGLA || "").toUpperCase();
	if (!uf) {
		continue;
	}
	const [x, y] = projectedCenter(f);
	out[`_uf|${uf}`] = [+x.toFixed(1), +y.toFixed(1)];
}
fs.writeFileSync(`${OUT}/municipios.json`, JSON.stringify(out));
console.log(`OK — ${states.length} estados, ${Object.keys(out).length} chaves`);
