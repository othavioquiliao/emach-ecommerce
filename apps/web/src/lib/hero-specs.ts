/**
 * Normaliza a ficha técnica do hero (banner.specs, #158): faz trim e descarta
 * entradas vazias. null/[]/só-vazios → []. Usado pelo HeroSpecs (render) e pelo
 * cálculo de overlay/gradiente do hero-carousel. Sem React: testável em node.
 */
export function resolveHeroSpecs(specs: string[] | null): string[] {
	return specs?.map((s) => s.trim()).filter((s) => s.length > 0) ?? [];
}
