import { execSync } from "node:child_process";
import fs from "node:fs";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = `${ROOT}scripts/.mapdata`;
const OUT = `${ROOT}apps/web/src/lib/branch-map`;
const W = 560,
	H = 580;

// UF sigla -> codigo_uf (IBGE) para casar municipios.csv
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

// 2) projeção única (estados + pontos usam a MESMA)
const proj = geoMercator().fitSize([W, H], geo);
const pathGen = geoPath(proj);
const r1 = (d) => (d || "").replace(/-?\d+\.?\d*/g, (n) => (+n).toFixed(1));

// 3) paths dos estados
const states = geo.features
	.map((f) => {
		const uf = (f.properties.sigla || f.properties.SIGLA || "").toUpperCase();
		return { uf, path: r1(pathGen(f)) };
	})
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
// 5) fallback: centroide de cada estado
for (const f of geo.features) {
	const uf = (f.properties.sigla || f.properties.SIGLA || "").toUpperCase();
	if (!uf) {
		continue;
	}
	const [x, y] = proj(geoCentroid(f));
	out[`_uf|${uf}`] = [+x.toFixed(1), +y.toFixed(1)];
}
fs.writeFileSync(`${OUT}/municipios.json`, JSON.stringify(out));
console.log(`OK — ${states.length} estados, ${Object.keys(out).length} chaves`);
