"use client";

import type { ClientAddress } from "@emach/db/schema/client";
import { cn } from "@emach/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

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

	const { primary, others } = useMemo(() => {
		const sorted = [...addresses].sort((a, b) => {
			if (a.isDefault && !b.isDefault) {
				return -1;
			}
			if (!a.isDefault && b.isDefault) {
				return 1;
			}
			return b.updatedAt.getTime() - a.updatedAt.getTime();
		});
		return { primary: sorted[0] ?? null, others: sorted.slice(1) };
	}, [addresses]);

	const hasOthers = addresses.length > 0;

	return (
		<section>
			<div className="mb-6 font-display font-semibold text-[12px] text-gray-50 uppercase tracking-[0.16em]">
				Endereço de entrega
			</div>

			{primary === null ? (
				<EmptyState
					onAdd={() => setSheetMode({ kind: "create", hasOthers: false })}
				/>
			) : (
				<div className="space-y-3">
					<AddressCard
						address={primary}
						highlighted
						onEdit={() => setSheetMode({ kind: "edit", address: primary })}
					/>

					{others.length > 0 && (
						<>
							<button
								className="font-display font-semibold text-[11px] text-near-black uppercase tracking-[0.14em] hover:underline"
								onClick={() => setExpanded((v) => !v)}
								type="button"
							>
								{expanded
									? `Ocultar outros endereços (${others.length})`
									: `Ver outros endereços (${others.length})`}
							</button>

							{expanded && (
								<div className="space-y-3">
									{others.map((addr) => (
										<AddressCard
											address={addr}
											key={addr.id}
											onEdit={() =>
												setSheetMode({ kind: "edit", address: addr })
											}
										/>
									))}
								</div>
							)}
						</>
					)}

					<div className="pt-4">
						<button
							className="font-display font-semibold text-[12px] text-near-black uppercase tracking-[0.08em] hover:underline"
							onClick={() => setSheetMode({ kind: "create", hasOthers })}
							type="button"
						>
							+ Adicionar endereço
						</button>
					</div>
				</div>
			)}

			<AddressSheet mode={sheetMode} onClose={() => setSheetMode(null)} />
		</section>
	);
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
	return (
		<div className="flex items-start justify-between gap-4 border border-emach-red bg-emach-red/5 p-6">
			<div className="min-w-0 flex-1">
				<div className="font-display font-semibold text-[11px] text-emach-red uppercase tracking-[0.14em]">
					Endereço de Entrega
				</div>
				<div className="mt-1 text-[14px] text-gray-50 italic">
					Nenhum endereço cadastrado
				</div>
				<div className="mt-1 text-[11px] text-gray-50">
					Necessário para finalizar compras
				</div>
			</div>
			<button
				className="shrink-0 font-display font-semibold text-[11px] text-emach-red uppercase tracking-[0.08em] hover:underline"
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
	highlighted?: boolean;
	onEdit: () => void;
}

function AddressCard({
	address,
	highlighted = false,
	onEdit,
}: AddressCardProps) {
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
		<div
			className={cn(
				"flex items-start justify-between gap-4 border bg-gray-10 p-6",
				highlighted ? "border-near-black" : "border-border"
			)}
		>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<div className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.14em]">
						{address.label ?? "Endereço"}
					</div>
					{address.isDefault && (
						<span className="bg-near-black px-2 py-0.5 font-display font-semibold text-[10px] text-white uppercase tracking-[0.08em]">
							Padrão
						</span>
					)}
				</div>
				<div className="mt-1 text-[16px] text-near-black">{lineMain}</div>
				<div className="mt-1 text-[13px] text-gray-50">{lineSub}</div>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-2">
				<button
					className="font-display font-semibold text-[11px] text-near-black uppercase tracking-[0.08em] hover:underline"
					onClick={onEdit}
					type="button"
				>
					Editar
				</button>
				{!address.isDefault && (
					<button
						className="font-display font-semibold text-[11px] text-gray-50 uppercase tracking-[0.08em] hover:text-near-black hover:underline disabled:opacity-50"
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
