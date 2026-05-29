import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "NEXT_PUBLIC_",
	client: {
		NEXT_PUBLIC_ECOMMERCE_AUTH_URL: z.url(),
		NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY: z.string().min(1).optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_ECOMMERCE_AUTH_URL: process.env.NEXT_PUBLIC_ECOMMERCE_AUTH_URL,
		NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY:
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY,
	},
	emptyStringAsUndefined: true,
});
