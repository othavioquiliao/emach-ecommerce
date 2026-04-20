"use client";
import type { authClient } from "@/lib/auth-client";

interface DashboardProps {
	session: typeof authClient.$Infer.Session;
}

export default function Dashboard(_props: DashboardProps) {
	return null;
}
