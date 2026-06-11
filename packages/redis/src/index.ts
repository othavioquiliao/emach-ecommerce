import { env } from "@emach/env/server";
import { Redis } from "@upstash/redis";

let cached: Redis | null | undefined;

/**
 * Cliente Upstash Redis compartilhado (REST/HTTP — serverless-native).
 *
 * Fonte única do client para todo o monorepo: rate limit do Better Auth
 * (#91, via `@emach/auth`) e rate limit do checkout (#94, via `apps/web`).
 * Lê as credenciais de `@emach/env/server` — não há ciclo, pois quem o
 * consome já depende de `@emach/env`.
 *
 * Retorna `null` quando as env vars do Upstash não estão configuradas, para
 * que os callers caiam em fallback (in-memory) sem quebrar dev/local. As envs
 * são `.optional()` no schema justamente por isso.
 */
export function getRedis(): Redis | null {
	if (cached !== undefined) {
		return cached;
	}

	const url = env.UPSTASH_REDIS_REST_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN;

	if (!(url && token)) {
		cached = null;
		return cached;
	}

	cached = new Redis({ url, token });
	return cached;
}

export type { Redis } from "@upstash/redis";
