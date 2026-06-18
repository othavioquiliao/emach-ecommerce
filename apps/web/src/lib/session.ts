import { authEcommerce, type EcommerceSession } from "@emach/auth/ecommerce";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

// `cache()` deduplica chamadas dentro da mesma request render: o `/dashboard`
// resolve a sessão no layout (DashboardChrome) e na page (requireCurrentClient),
// e sem isto seriam dois `getSession` no mesmo render. Combinado com o
// `cookieCache` do auth, a sessão é resolvida uma vez e sem hit no DB.
export const getCurrentClient = cache(
	async (): Promise<EcommerceSession | null> =>
		authEcommerce.api.getSession({ headers: await headers() })
);

export const requireCurrentClient = async (): Promise<EcommerceSession> => {
	const session = await getCurrentClient();
	if (!session?.user) {
		redirect("/login");
	}
	return session;
};
