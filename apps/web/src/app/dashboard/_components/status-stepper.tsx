import { cn } from "@emach/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StepState = "done" | "current" | "upcoming" | "ok";

export interface StepperStep {
	Icon: LucideIcon;
	key: string;
	label: string;
	state: StepState;
}

export function StatusStepper({
	steps,
	tone = "light",
}: {
	steps: StepperStep[];
	tone?: "light" | "dark";
}) {
	const dark = tone === "dark";
	return (
		<div
			className={cn(
				"flex items-start border-t px-[18px] pt-5 pb-4",
				dark ? "border-white/12 bg-white/[0.035]" : "border-border bg-[#fafafa]"
			)}
		>
			{steps.map((step, idx) => (
				<div className="contents" key={step.key}>
					{idx > 0 && (
						<div
							className={cn(
								"mt-[18px] h-[2px] flex-1",
								segClass(steps[idx - 1].state, dark)
							)}
						/>
					)}
					<div className="flex w-[25%] flex-col items-center">
						<span
							className={cn(
								"flex h-[38px] w-[38px] items-center justify-center rounded-full border",
								nodeClass(step.state, dark)
							)}
						>
							<step.Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
						</span>
						<span
							className={cn(
								"mt-[9px] text-center font-display font-semibold text-[12px] uppercase leading-tight tracking-[0.06em]",
								labelClass(step.state, dark)
							)}
						>
							{step.label}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

function nodeClass(state: StepState, dark: boolean): string {
	if (state === "ok") {
		return "border-success bg-success text-white";
	}
	if (state === "current") {
		return dark
			? "border-2 border-emach-red bg-near-black text-white shadow-[0_0_0_5px_rgba(218,41,28,0.28)]"
			: "border-2 border-emach-red bg-white text-emach-red shadow-[0_0_0_5px_rgba(218,41,28,0.16)]";
	}
	if (state === "done") {
		return dark
			? "border-white bg-white text-near-black"
			: "border-near-black bg-near-black text-white";
	}
	return dark
		? "border-white/20 bg-white/[0.06] text-[#888]"
		: "border-border bg-white text-gray-50";
}

function labelClass(state: StepState, dark: boolean): string {
	if (state === "ok") {
		return "text-success";
	}
	if (state === "current") {
		return dark ? "text-white" : "text-emach-red";
	}
	if (state === "done") {
		return dark ? "text-white" : "text-near-black";
	}
	return dark ? "text-[#888]" : "text-gray-50";
}

function segClass(prevState: StepState, dark: boolean): string {
	const filled = prevState === "done" || prevState === "ok";
	if (filled) {
		return dark ? "bg-white" : "bg-near-black";
	}
	return dark ? "bg-white/20" : "bg-border";
}
