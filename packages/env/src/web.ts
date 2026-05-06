import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "NEXT_PUBLIC_",
	client: {
		NEXT_PUBLIC_ECOMMERCE_AUTH_URL: z.url(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_ECOMMERCE_AUTH_URL: process.env.NEXT_PUBLIC_ECOMMERCE_AUTH_URL,
	},
	emptyStringAsUndefined: true,
});
