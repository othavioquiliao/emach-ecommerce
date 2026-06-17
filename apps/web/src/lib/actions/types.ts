/** Resultado padrão de server action sem payload. */
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Resultado de server action que devolve dados em caso de sucesso. */
export type ActionResultWith<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };
