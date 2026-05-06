import { authEcommerce, type EcommerceSession } from "@emach/auth/ecommerce";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getCurrentClient = async (): Promise<EcommerceSession | null> =>
	authEcommerce.api.getSession({ headers: await headers() });

export const requireCurrentClient = async (): Promise<EcommerceSession> => {
	const session = await getCurrentClient();
	if (!session?.user) {
		redirect("/login");
	}
	return session;
};
