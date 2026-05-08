import { requireCurrentClient } from "@/lib/session";
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

	return (
		<PersonalDataForm
			initialData={{
				name: user.name,
				email: user.email,
				emailVerified: user.emailVerified,
				phone: user.phone ?? null,
				document: user.document ?? null,
			}}
		/>
	);
}
