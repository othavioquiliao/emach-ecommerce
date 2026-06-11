import { getRedis, RATE_LIMIT_WINDOW_SECONDS } from "@emach/redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface Limiter {
	limit(key: string): Promise<{ success: boolean }>;
}

/** Janela compartilhada (auth + checkout) — fonte única em `@emach/redis`. */
const WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;

/** Acima deste tamanho, o fallback varre e descarta chaves fora da janela. */
const MEMORY_SWEEP_THRESHOLD = 1024;

/**
 * Fallback in-memory: BEST-EFFORT. Em serverless cada instância (lambda) tem o
 * próprio Map — o contador reseta em cold start e NÃO é compartilhado entre
 * instâncias. Serve para dev local e como degradação graciosa enquanto o
 * Upstash não está provisionado; o modo durável liga sozinho quando
 * `getRedis()` passa a devolver um client (env vars UPSTASH_* presentes).
 */
function memoryLimiter(max: number): Limiter {
	const hits = new Map<string, number[]>();
	return {
		limit(key) {
			const now = Date.now();
			// Limpeza amortizada: sem isto, chaves de clientes que não voltam ficam
			// no Map para sempre (leak em instância long-lived sem Upstash). Só varre
			// quando o Map cresce, mantendo o custo por-request ~O(1).
			if (hits.size > MEMORY_SWEEP_THRESHOLD) {
				for (const [k, ts] of hits) {
					if (now - (ts.at(-1) ?? 0) >= WINDOW_MS) {
						hits.delete(k);
					}
				}
			}
			const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
			recent.push(now);
			hits.set(key, recent);
			return Promise.resolve({ success: recent.length <= max });
		},
	};
}

function createLimiter(max: number): Limiter {
	const redis = getRedis();
	if (redis) {
		return new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(max, `${RATE_LIMIT_WINDOW_SECONDS} s`),
			prefix: "checkout",
		});
	}
	return memoryLimiter(max);
}

export const couponLimiter = createLimiter(10);
export const orderLimiter = createLimiter(5);
export const shippingLimiter = createLimiter(20);

export const RATE_LIMIT_MESSAGE = "Muitas tentativas, aguarde um instante";
