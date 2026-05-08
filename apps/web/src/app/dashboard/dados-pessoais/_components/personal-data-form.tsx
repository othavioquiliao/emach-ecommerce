"use client";

import { Button } from "@emach/ui/components/button";
import { Input } from "@emach/ui/components/input";
import { Label } from "@emach/ui/components/label";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@emach/ui/components/toggle-group";
import { cn } from "@emach/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import {
	isValidCpfCnpj,
	maskCpfCnpj,
	maskPhone,
	onlyDigits,
} from "@/lib/validators/cpf-cnpj";

type AccountType = "PF" | "PJ";

const detectAccountType = (document: string | null): AccountType =>
	document && onlyDigits(document).length === 14 ? "PJ" : "PF";

interface InitialData {
	document: string | null;
	email: string;
	emailVerified: boolean;
	name: string;
	phone: string | null;
}

interface PersonalDataFormProps {
	initialData: InitialData;
}

export function PersonalDataForm({ initialData }: PersonalDataFormProps) {
	const [data, setData] = useState(initialData);

	return (
		<section>
			<header className="mb-10 border-near-black border-b-2 pb-6">
				<div className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
					Minha conta
				</div>
				<h1 className="mt-2 font-semibold text-[32px] text-near-black leading-tight tracking-tight">
					Dados Pessoais
				</h1>
				<p className="mt-3 max-w-[560px] text-[14px] text-gray-50">
					Mantenha suas informações atualizadas para garantir que pedidos e
					notas fiscais sejam emitidos corretamente.
				</p>
			</header>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<NameCard
					initialValue={data.name}
					onSaved={(v) => setData((d) => ({ ...d, name: v }))}
				/>
				<EmailCard email={data.email} verified={data.emailVerified} />
				<PhoneCard
					initialValue={data.phone}
					onSaved={(v) => setData((d) => ({ ...d, phone: v }))}
				/>
				<DocumentCard
					initialValue={data.document}
					onSaved={(v) => setData((d) => ({ ...d, document: v }))}
				/>
			</div>
		</section>
	);
}

interface CardShellProps {
	accent?: "default" | "danger";
	children: React.ReactNode;
}

function CardShell({ accent = "default", children }: CardShellProps) {
	return (
		<div
			className={cn(
				"flex items-start justify-between gap-4 border bg-white p-6",
				accent === "danger"
					? "border-emach-red bg-emach-red/5"
					: "border-border"
			)}
		>
			{children}
		</div>
	);
}

function FieldLabel({
	children,
	tone = "default",
}: {
	children: React.ReactNode;
	tone?: "default" | "danger";
}) {
	return (
		<div
			className={cn(
				"font-display font-semibold text-[11px] uppercase tracking-[0.14em]",
				tone === "danger" ? "text-emach-red" : "text-gray-50"
			)}
		>
			{children}
		</div>
	);
}

function EditTrigger({
	label = "Editar",
	tone = "default",
	onClick,
}: {
	label?: string;
	tone?: "default" | "danger";
	onClick: () => void;
}) {
	return (
		<button
			className={cn(
				"shrink-0 font-display font-semibold text-[11px] uppercase tracking-[0.08em] hover:underline",
				tone === "danger" ? "text-emach-red" : "text-near-black"
			)}
			onClick={onClick}
			type="button"
		>
			{label}
		</button>
	);
}

function FormActions({
	onCancel,
	isSaving,
}: {
	onCancel: () => void;
	isSaving: boolean;
}) {
	return (
		<div className="mt-4 flex justify-end gap-2">
			<Button
				className="rounded-none"
				onClick={onCancel}
				type="button"
				variant="outline"
			>
				Cancelar
			</Button>
			<Button
				className="rounded-none bg-emach-red hover:bg-emach-red/90"
				disabled={isSaving}
				type="submit"
			>
				{isSaving ? "Salvando..." : "Salvar"}
			</Button>
		</div>
	);
}

function FieldError({ message }: { message: string | null }) {
	if (!message) {
		return null;
	}
	return <p className="mt-1 text-[12px] text-destructive">{message}</p>;
}

const nameSchema = z.string().min(2, "Informe seu nome");

function NameCard({
	initialValue,
	onSaved,
}: {
	initialValue: string;
	onSaved: (next: string) => void;
}) {
	const router = useRouter();
	const [mode, setMode] = useState<"read" | "edit">("read");
	const [value, setValue] = useState(initialValue);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	if (mode === "read") {
		return (
			<CardShell>
				<div className="min-w-0 flex-1">
					<FieldLabel>Nome</FieldLabel>
					<div className="mt-1 truncate text-[16px] text-near-black">
						{initialValue}
					</div>
				</div>
				<EditTrigger onClick={() => setMode("edit")} />
			</CardShell>
		);
	}

	const handleCancel = () => {
		setValue(initialValue);
		setError(null);
		setMode("read");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const parsed = nameSchema.safeParse(value);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Inválido");
			return;
		}
		setIsSaving(true);
		await authClient.updateUser(
			{ name: value } as Parameters<typeof authClient.updateUser>[0],
			{
				onSuccess: () => {
					toast.success("Nome atualizado");
					onSaved(value);
					setMode("read");
					router.refresh();
				},
				onError: (err) => {
					toast.error(err.error.message || "Não foi possível salvar.");
				},
			}
		);
		setIsSaving(false);
	};

	return (
		<CardShell>
			<form className="w-full" onSubmit={handleSubmit}>
				<Label
					className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]"
					htmlFor="name-input"
				>
					Nome
				</Label>
				<Input
					autoFocus
					className="mt-2 rounded-none"
					id="name-input"
					onChange={(e) => setValue(e.target.value)}
					value={value}
				/>
				<FieldError message={error} />
				<FormActions isSaving={isSaving} onCancel={handleCancel} />
			</form>
		</CardShell>
	);
}

function EmailCard({ email, verified }: { email: string; verified: boolean }) {
	return (
		<CardShell>
			<div className="min-w-0 flex-1">
				<FieldLabel>E-mail</FieldLabel>
				<div className="mt-1 truncate text-[16px] text-near-black">{email}</div>
				<div className="mt-1 text-[11px] text-gray-50">Somente leitura</div>
			</div>
			<span
				className={cn(
					"shrink-0 px-2 py-1 font-display font-semibold text-[10px] text-white uppercase tracking-[0.08em]",
					verified ? "bg-[#0a8a0a]" : "bg-gray-50"
				)}
			>
				{verified ? "Verificado" : "Pendente"}
			</span>
		</CardShell>
	);
}

const phoneSchema = z
	.string()
	.refine(
		(v) => !v || [10, 11].includes(onlyDigits(v).length),
		"Telefone inválido"
	);

function PhoneCard({
	initialValue,
	onSaved,
}: {
	initialValue: string | null;
	onSaved: (next: string | null) => void;
}) {
	const router = useRouter();
	const [mode, setMode] = useState<"read" | "edit">("read");
	const [value, setValue] = useState(
		initialValue ? maskPhone(initialValue) : ""
	);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	if (mode === "read") {
		return (
			<CardShell>
				<div className="min-w-0 flex-1">
					<FieldLabel>Telefone</FieldLabel>
					{initialValue ? (
						<div className="mt-1 text-[16px] text-near-black">
							{maskPhone(initialValue)}
						</div>
					) : (
						<div className="mt-1 text-[14px] text-gray-50 italic">
							Não informado
						</div>
					)}
				</div>
				<EditTrigger
					label={initialValue ? "Editar" : "+ Adicionar"}
					onClick={() => setMode("edit")}
				/>
			</CardShell>
		);
	}

	const handleCancel = () => {
		setValue(initialValue ? maskPhone(initialValue) : "");
		setError(null);
		setMode("read");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const parsed = phoneSchema.safeParse(value);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Inválido");
			return;
		}
		const digits = onlyDigits(value);
		setIsSaving(true);
		await authClient.updateUser(
			{
				phone: digits || undefined,
			} as Parameters<typeof authClient.updateUser>[0],
			{
				onSuccess: () => {
					toast.success("Telefone atualizado");
					onSaved(digits || null);
					setMode("read");
					router.refresh();
				},
				onError: (err) => {
					toast.error(err.error.message || "Não foi possível salvar.");
				},
			}
		);
		setIsSaving(false);
	};

	return (
		<CardShell>
			<form className="w-full" onSubmit={handleSubmit}>
				<Label
					className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]"
					htmlFor="phone-input"
				>
					Telefone
				</Label>
				<Input
					autoFocus
					className="mt-2 rounded-none"
					id="phone-input"
					onChange={(e) => setValue(maskPhone(e.target.value))}
					placeholder="(00) 00000-0000"
					value={value}
				/>
				<FieldError message={error} />
				<FormActions isSaving={isSaving} onCancel={handleCancel} />
			</form>
		</CardShell>
	);
}

const documentSchema = z
	.string()
	.refine((v) => !v || isValidCpfCnpj(v), "Documento inválido");

function DocumentCard({
	initialValue,
	onSaved,
}: {
	initialValue: string | null;
	onSaved: (next: string | null) => void;
}) {
	const router = useRouter();
	const [mode, setMode] = useState<"read" | "edit">("read");
	const [accountType, setAccountType] = useState<AccountType>(
		detectAccountType(initialValue)
	);
	const [value, setValue] = useState(
		initialValue ? maskCpfCnpj(initialValue) : ""
	);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const isEmpty = !initialValue;
	const accent = isEmpty && mode === "read" ? "danger" : "default";

	if (mode === "read") {
		return (
			<CardShell accent={accent}>
				<div className="min-w-0 flex-1">
					<FieldLabel tone={isEmpty ? "danger" : "default"}>
						CPF / CNPJ
					</FieldLabel>
					{initialValue ? (
						<div className="mt-1 text-[16px] text-near-black">
							{maskCpfCnpj(initialValue)}
						</div>
					) : (
						<>
							<div className="mt-1 text-[14px] text-gray-50 italic">
								Não informado
							</div>
							<div className="mt-1 text-[11px] text-gray-50">
								Necessário para emitir nota fiscal
							</div>
						</>
					)}
				</div>
				<EditTrigger
					label={isEmpty ? "+ Adicionar" : "Editar"}
					onClick={() => setMode("edit")}
					tone={isEmpty ? "danger" : "default"}
				/>
			</CardShell>
		);
	}

	const handleAccountTypeChange = (groupValue: string[]) => {
		const next = groupValue[0];
		if (next !== "PF" && next !== "PJ") {
			return;
		}
		if (next === accountType) {
			return;
		}
		setAccountType(next);
		setValue("");
		setError(null);
	};

	const handleCancel = () => {
		setAccountType(detectAccountType(initialValue));
		setValue(initialValue ? maskCpfCnpj(initialValue) : "");
		setError(null);
		setMode("read");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const parsed = documentSchema.safeParse(value);
		if (!parsed.success) {
			setError(accountType === "PJ" ? "CNPJ inválido" : "CPF inválido");
			return;
		}
		const digits = onlyDigits(value);
		setIsSaving(true);
		await authClient.updateUser(
			{
				document: digits || undefined,
			} as Parameters<typeof authClient.updateUser>[0],
			{
				onSuccess: () => {
					toast.success("Documento atualizado");
					onSaved(digits || null);
					setMode("read");
					router.refresh();
				},
				onError: (err) => {
					toast.error(err.error.message || "Não foi possível salvar.");
				},
			}
		);
		setIsSaving(false);
	};

	return (
		<CardShell>
			<form className="w-full" onSubmit={handleSubmit}>
				<FieldLabel>Documento</FieldLabel>
				<ToggleGroup
					className="mt-2 mb-3 inline-flex rounded-none border border-near-black"
					onValueChange={handleAccountTypeChange}
					value={[accountType]}
				>
					<ToggleGroupItem
						className="rounded-none px-4 py-1.5 font-display font-semibold text-[12px] uppercase tracking-[0.08em]"
						value="PF"
					>
						CPF
					</ToggleGroupItem>
					<ToggleGroupItem
						className="rounded-none px-4 py-1.5 font-display font-semibold text-[12px] uppercase tracking-[0.08em]"
						value="PJ"
					>
						CNPJ
					</ToggleGroupItem>
				</ToggleGroup>
				<Input
					autoFocus
					className="rounded-none"
					onChange={(e) => setValue(maskCpfCnpj(e.target.value))}
					placeholder={
						accountType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"
					}
					value={value}
				/>
				<FieldError message={error} />
				<FormActions isSaving={isSaving} onCancel={handleCancel} />
			</form>
		</CardShell>
	);
}
