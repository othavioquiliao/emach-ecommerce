"use client";

import { useState } from "react";

type ButtonVariant = "primary" | "outline" | "outline-light" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface EmachButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	full?: boolean;
	icon?: React.ReactNode;
	size?: ButtonSize;
	variant?: ButtonVariant;
}

const BASE =
	"inline-flex items-center justify-center gap-2 font-sans font-semibold tracking-[0.04em] rounded-[2px] border border-transparent cursor-pointer transition-all duration-180 whitespace-nowrap";

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "h-9 px-4 text-xs",
	md: "h-11 px-[22px] text-[13px]",
	lg: "h-13 px-[30px] text-sm",
};

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
	primary: { background: "var(--emach-red)", color: "#fff" },
	outline: {
		background: "transparent",
		color: "var(--near-black)",
		borderColor: "var(--near-black)",
	},
	"outline-light": {
		background: "transparent",
		color: "#fff",
		borderColor: "rgba(255,255,255,0.7)",
	},
	ghost: { background: "transparent", color: "var(--near-black)" },
	dark: { background: "var(--near-black)", color: "#fff" },
};

const HOVER_STYLES: Record<ButtonVariant, React.CSSProperties> = {
	primary: { background: "var(--emach-red-hover)" },
	outline: { background: "var(--near-black)", color: "#fff" },
	"outline-light": {
		background: "#fff",
		color: "var(--near-black)",
		borderColor: "#fff",
	},
	ghost: { background: "var(--gray-10)" },
	dark: { background: "#000" },
};

export function EmachButton({
	children,
	variant = "primary",
	size = "md",
	full = false,
	icon,
	style,
	...props
}: EmachButtonProps) {
	const [hovered, setHovered] = useState(false);

	return (
		<button
			{...props}
			className={`${BASE} ${SIZE_CLASSES[size]} ${full ? "w-full" : ""} ${props.className ?? ""}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				...VARIANT_STYLES[variant],
				...(hovered ? HOVER_STYLES[variant] : {}),
				...style,
			}}
			type={props.type ?? "button"}
		>
			{icon}
			{children}
		</button>
	);
}
