"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
	id: string;
	name: string;
	onBlur: () => void;
	onChange: (value: string) => void;
	placeholder?: string;
	value: string;
}

export function PasswordInput({
	id,
	name,
	value,
	onBlur,
	onChange,
	placeholder,
}: PasswordInputProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="relative">
			<input
				className="emach-input"
				id={id}
				name={name}
				onBlur={onBlur}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				style={{ paddingRight: "42px" }}
				type={isVisible ? "text" : "password"}
				value={value}
			/>
			<button
				aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
				className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center text-gray-50 transition-colors duration-150 hover:text-near-black"
				onClick={() => setIsVisible((v) => !v)}
				tabIndex={-1}
				type="button"
			>
				{isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
			</button>
		</div>
	);
}
