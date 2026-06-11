import { db } from "@emach/db";
import { clientAddress } from "@emach/db/schema/client";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { requireCurrentClient } from "@/lib/session";
import { AddressesSection } from "./_components/addresses-section";
import { PersonalDataForm } from "./_components/personal-data-form";
import { ProfileHeader } from "./_components/profile-header";

export const metadata: Metadata = {
	title: "Dados pessoais",
};

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
		<>
			<ProfileHeader />
			<div className="px-6 py-8 md:px-10">
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
		</>
	);
}
