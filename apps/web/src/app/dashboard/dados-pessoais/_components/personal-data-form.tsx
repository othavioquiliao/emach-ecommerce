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
import { AccountBadge } from "@/app/dashboard/_components/account-badge";
import { AccountSection } from "@/app/dashboard/_components/account-section";
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
		<AccountSection bodyClassName="p-0" title="Seus dados">
			<div className="grid grid-cols-1 sm:grid-cols-2">
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
		</AccountSection>
	);
}

interface CardShellProps {
	accent?: "default" | "danger";
	children: React.ReactNode;
}

/**
 * Célula de um campo dentro da seção "Seus dados". Bordas internas formam a
 * grade (igual à listagem flat do detalhe do pedido) — sem box-in-box. A
 * borda direita só aparece na coluna esquerda (`sm`); a inferior, nas duas
 * primeiras células.
 */
function CardShell({ accent = "default", children }: CardShellProps) {
	return (
		<div
			className={cn(
				"flex items-start justify-between gap-4 border-white/10 p-5",
				"border-b sm:[&:nth-child(odd)]:border-r",
				"sm:[&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0",
				accent === "danger" && "bg-emach-red/15"
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
				"font-display font-semibold text-[12px] uppercase tracking-[0.14em]",
				tone === "danger" ? "text-emach-red-on-dark" : "text-gray-50"
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
				"shrink-0 font-display font-semibold text-[12px] uppercase tracking-[0.08em] hover:underline",
				tone === "danger" ? "text-emach-red-on-dark" : "text-white"
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
				className="rounded-none border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
	return <p className="mt-1 text-[12px] text-emach-red-on-dark">{message}</p>;
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
					<div className="mt-1 truncate text-[18px] text-white">
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
					className="mt-2 rounded-none border-white/20 bg-white/5 text-[15px] text-white placeholder:text-gray-50"
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
	const [sending, setSending] = useState(false);

	const handleVerify = async () => {
		setSending(true);
		try {
			await authClient.sendVerificationEmail(
				{ email, callbackURL: "/dashboard/dados-pessoais" },
				{
					onSuccess: () => {
						toast.success("E-mail de verificação enviado");
					},
					onError: (err) => {
						toast.error(err.error.message || "Não foi possível enviar.");
					},
				}
			);
		} finally {
			setSending(false);
		}
	};

	return (
		<CardShell>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<FieldLabel>E-mail</FieldLabel>
					<AccountBadge family={verified ? "green" : "amber"}>
						{verified ? "Verificado" : "Não verificado"}
					</AccountBadge>
				</div>
				<div className="mt-2 truncate text-[18px] text-white">{email}</div>
				{verified ? (
					<div className="mt-1 text-[12px] text-gray-50">Somente leitura</div>
				) : (
					<div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-white/15 border-t border-dashed pt-3">
						<span className="text-[13px] text-white/65">
							Confirme seu e-mail para receber atualizações de pedido.
						</span>
						<Button
							className="shrink-0 rounded-none border-amber-on-dark/55 bg-transparent text-amber-on-dark hover:bg-amber-on-dark/10 hover:text-amber-on-dark"
							disabled={sending}
							onClick={handleVerify}
							type="button"
							variant="outline"
						>
							{sending ? "Enviando..." : "Verificar e-mail"}
						</Button>
					</div>
				)}
			</div>
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
						<div className="mt-1 text-[18px] text-white">
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
					className="mt-2 rounded-none border-white/20 bg-white/5 text-[15px] text-white placeholder:text-gray-50"
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
						<div className="mt-1 text-[18px] text-white">
							{maskCpfCnpj(initialValue)}
						</div>
					) : (
						<>
							<div className="mt-1 text-[14px] text-gray-50 italic">
								Não informado
							</div>
							<div className="mt-1 text-[12px] text-gray-50">
								Você também informa na finalização da compra, ao emitir a nota
								fiscal.
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
					className="mt-2 mb-3 inline-flex rounded-none border border-white/30 text-white"
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
					className="rounded-none border-white/20 bg-white/5 text-[15px] text-white placeholder:text-gray-50"
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
