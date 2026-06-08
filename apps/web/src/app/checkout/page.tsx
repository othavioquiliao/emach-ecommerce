import { db } from "@emach/db";
import { client, clientAddress } from "@emach/db/schema/client";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { requireCurrentClient } from "@/lib/session";
import { CheckoutContent } from "./_components/checkout-content";

export const metadata: Metadata = {
	title: "Checkout — EMACH",
	description: "Finalize seu pedido EMACH com segurança.",
};

export default async function CheckoutPage() {
	const session = await requireCurrentClient();
	const [addresses, clientRow] = await Promise.all([
		db
			.select()
			.from(clientAddress)
			.where(eq(clientAddress.clientId, session.user.id))
			.orderBy(desc(clientAddress.isDefault), desc(clientAddress.updatedAt)),
		db
			.select({
				name: client.name,
				email: client.email,
				phone: client.phone,
				document: client.document,
			})
			.from(client)
			.where(eq(client.id, session.user.id))
			.limit(1),
	]);
	const profile = clientRow[0];

	return (
		<CheckoutContent
			addresses={addresses}
			clientDocument={profile?.document ?? null}
			clientEmail={profile?.email ?? ""}
			clientName={profile?.name ?? ""}
			clientPhone={profile?.phone ?? ""}
		/>
	);
}
