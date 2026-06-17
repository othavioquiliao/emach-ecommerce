import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import Providers from "@/components/providers";
import "../index.css";

const barlow = Barlow({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
	),
	title: {
		default: "EMACH Ferramentas — Furadeiras, Serras e EPIs",
		template: "%s · EMACH",
	},
	description:
		"Furadeiras, serras, equipamentos de medição e EPIs para obra e oficina. Compra direta na EMACH, com envio para todo o Brasil.",
	applicationName: "EMACH",
	openGraph: {
		siteName: "EMACH",
		type: "website",
		locale: "pt_BR",
		images: ["/images/og-default.png"],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/images/og-default.png"],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#000000" },
		{ media: "(prefers-color-scheme: dark)", color: "#000000" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
				suppressHydrationWarning
			>
				<Providers>{children}</Providers>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
