import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailContent } from "./_components/verify-email-content";

export const metadata: Metadata = {
	title: "Verificar e-mail",
	robots: { index: false, follow: false },
};

function VerifyEmailFallback() {
	return (
		<main className="flex min-h-svh items-center justify-center bg-gray-10 px-6 py-20">
			<div className="w-full max-w-[400px] text-center">
				<h1 className="font-display font-medium text-[28px] text-near-black">
					Verificando…
				</h1>
				<p className="mt-3 text-[14px] text-gray-60">
					Aguarde enquanto confirmamos seu e-mail.
				</p>
			</div>
		</main>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<VerifyEmailFallback />}>
			<VerifyEmailContent />
		</Suspense>
	);
}
