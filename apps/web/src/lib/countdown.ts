// apps/web/src/lib/countdown.ts
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;
const SECOND = 1000;

/**
 * Tempo restante até `target` formatado como "Xd Xh Xm Ss".
 * `null` quando já expirou (alvo <= agora) — o caller esconde o contador.
 * `now` é injetado (ms epoch) pra manter a função pura e testável.
 */
export function formatCountdown(target: Date, now: number): string | null {
	const ms = target.getTime() - now;
	if (ms <= 0) {
		return null;
	}
	const d = Math.floor(ms / DAY);
	const h = Math.floor((ms % DAY) / HOUR);
	const m = Math.floor((ms % HOUR) / MINUTE);
	const s = Math.floor((ms % MINUTE) / SECOND);
	return `${d}d ${h}h ${m}m ${s}s`;
}
