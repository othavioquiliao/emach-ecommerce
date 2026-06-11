"use client";

import type { ClientAddress } from "@emach/db/schema/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AccountSection } from "@/app/dashboard/_components/account-section";
import { setDefaultAddressAction } from "@/app/dashboard/dados-pessoais/_actions/addresses";

import { AddressSheet, type AddressSheetMode } from "./address-sheet";

interface AddressesSectionProps {
	addresses: ClientAddress[];
}

const RE_CEP_DISPLAY = /^(\d{5})(\d{3})$/;
function formatCep(zip: string): string {
	return zip.replace(RE_CEP_DISPLAY, "$1-$2");
}

export function AddressesSection({ addresses }: AddressesSectionProps) {
	const [sheetMode, setSheetMode] = useState<AddressSheetMode>(null);
	const [expanded, setExpanded] = useState(false);

	const sorted = [...addresses].sort((a, b) => {
		if (a.isDefault && !b.isDefault) {
			return -1;
		}
		if (!a.isDefault && b.isDefault) {
			return 1;
		}
		return b.updatedAt.getTime() - a.updatedAt.getTime();
	});
	const primary = sorted[0] ?? null;
	const others = sorted.slice(1);

	const hasOthers = addresses.length > 0;

	return (
		<AccountSection bodyClassName="p-0" title="Endereço de entrega">
			{primary === null ? (
				<EmptyState
					onAdd={() => setSheetMode({ kind: "create", hasOthers: false })}
				/>
			) : (
				<div className="divide-y divide-white/10">
					<AddressCard
						address={primary}
						onEdit={() => setSheetMode({ kind: "edit", address: primary })}
					/>

					{others.length > 0 && (
						<button
							className="w-full px-5 py-3 text-left font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em] hover:text-white"
							onClick={() => setExpanded((v) => !v)}
							type="button"
						>
							{expanded
								? `Ocultar outros endereços (${others.length})`
								: `Ver outros endereços (${others.length})`}
						</button>
					)}

					{expanded &&
						others.map((addr) => (
							<AddressCard
								address={addr}
								key={addr.id}
								onEdit={() => setSheetMode({ kind: "edit", address: addr })}
							/>
						))}

					<button
						className="w-full px-5 py-3.5 text-left font-display font-semibold text-[12px] text-white uppercase tracking-[0.08em] hover:underline"
						onClick={() => setSheetMode({ kind: "create", hasOthers })}
						type="button"
					>
						+ Adicionar endereço
					</button>
				</div>
			)}

			<AddressSheet mode={sheetMode} onClose={() => setSheetMode(null)} />
		</AccountSection>
	);
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
	return (
		<div className="flex items-start justify-between gap-4 bg-emach-red/15 p-5">
			<div className="min-w-0 flex-1">
				<div className="font-display font-semibold text-[11px] text-emach-red-on-dark uppercase tracking-[0.14em]">
					Nenhum endereço cadastrado
				</div>
				<div className="mt-1 text-[13px] text-white/65">
					Necessário para finalizar compras.
				</div>
			</div>
			<button
				className="shrink-0 font-display font-semibold text-[11px] text-emach-red-on-dark uppercase tracking-[0.08em] hover:underline"
				onClick={onAdd}
				type="button"
			>
				+ Adicionar
			</button>
		</div>
	);
}

interface AddressCardProps {
	address: ClientAddress;
	onEdit: () => void;
}

function AddressCard({ address, onEdit }: AddressCardProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleSetDefault = () => {
		startTransition(async () => {
			const result = await setDefaultAddressAction({ id: address.id });
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			toast.success("Endereço definido como padrão");
			router.refresh();
		});
	};

	const lineMain = [`${address.street}, ${address.number}`, address.complement]
		.filter(Boolean)
		.join(" — ");
	const lineSub = [
		address.neighborhood,
		`${address.city}/${address.state}`,
		formatCep(address.zipCode),
	].join(" · ");

	return (
		<div className="flex items-start justify-between gap-4 p-5">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<div className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
						{address.label ?? "Endereço"}
					</div>
					{address.isDefault && (
						<span className="bg-white px-2 py-0.5 font-display font-semibold text-[10px] text-near-black uppercase tracking-[0.08em]">
							Padrão
						</span>
					)}
				</div>
				<div className="mt-1 text-[16px] text-white">{lineMain}</div>
				<div className="mt-1 text-[13px] text-gray-50">{lineSub}</div>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-2">
				<button
					className="font-display font-semibold text-[11px] text-white uppercase tracking-[0.08em] hover:underline"
					onClick={onEdit}
					type="button"
				>
					Editar
				</button>
				{!address.isDefault && (
					<button
						className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.08em] hover:text-white hover:underline disabled:opacity-50"
						disabled={isPending}
						onClick={handleSetDefault}
						type="button"
					>
						Tornar padrão
					</button>
				)}
			</div>
		</div>
	);
}
