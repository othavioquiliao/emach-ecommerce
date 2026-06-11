import { getRedis } from "@emach/redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface Limiter {
	limit(key: string): Promise<{ success: boolean }>;
}

/** Janela de 60s para todos os limiters do checkout. */
const WINDOW_MS = 60_000;

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
			limiter: Ratelimit.slidingWindow(max, "60 s"),
			prefix: "checkout",
		});
	}
	return memoryLimiter(max);
}

export const couponLimiter = createLimiter(10);
export const orderLimiter = createLimiter(5);
export const shippingLimiter = createLimiter(20);

export const RATE_LIMIT_MESSAGE = "Muitas tentativas, aguarde um instante";
