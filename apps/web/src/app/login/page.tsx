import type { Metadata } from "next";
import { Suspense } from "react";
import Loader from "@/components/loader";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
	title: "Entrar",
};

function LoginFallback() {
	return (
		<main className="flex h-svh items-center justify-center bg-near-black">
			<Loader />
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginFallback />}>
			<LoginForm />
		</Suspense>
	);
}
