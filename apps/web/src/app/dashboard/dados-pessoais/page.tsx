import { db } from "@emach/db";
import { clientAddress } from "@emach/db/schema/client";
import { desc, eq } from "drizzle-orm";

import { requireCurrentClient } from "@/lib/session";
import { AddressesSection } from "./_components/addresses-section";
import { PersonalDataForm } from "./_components/personal-data-form";

export default async function PersonalDataPage() {
	const session = await requireCurrentClient();
	const user = session.user as {
		name: string;
		email: string;
		emailVerified: boolean;
		phone?: string | null;
		document?: string | null;
	};

	const addresses = await db
		.select()
		.from(clientAddress)
		.where(eq(clientAddress.clientId, session.user.id))
		.orderBy(desc(clientAddress.isDefault), desc(clientAddress.updatedAt));

	return (
		<div className="space-y-16">
			<PersonalDataForm
				initialData={{
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					phone: user.phone ?? null,
					document: user.document ?? null,
				}}
			/>
			<AddressesSection addresses={addresses} />
		</div>
	);
}
