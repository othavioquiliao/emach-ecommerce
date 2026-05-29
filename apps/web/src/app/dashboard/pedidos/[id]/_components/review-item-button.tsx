"use client";

import { useState } from "react";

import { EmachButton } from "@/components/emach-button";
import { ReviewSheet } from "./review-sheet";

export function ReviewItemButton({
	orderId,
	toolId,
	productName,
	reviewed,
}: {
	orderId: string;
	productName: string;
	reviewed: boolean;
	toolId: string;
}) {
	const [open, setOpen] = useState(false);
	if (reviewed) {
		return (
			<span className="font-semibold text-[12px] text-success">Avaliado ✓</span>
		);
	}
	return (
		<>
			<EmachButton onClick={() => setOpen(true)} size="sm" variant="outline">
				Avaliar
			</EmachButton>
			<ReviewSheet
				onOpenChange={setOpen}
				open={open}
				orderId={orderId}
				productName={productName}
				toolId={toolId}
			/>
		</>
	);
}
