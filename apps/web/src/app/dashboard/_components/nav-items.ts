import type { Route } from "next";

export type NavItem =
	| {
			kind: "link";
			label: string;
			href: Route;
	  }
	| { kind: "soon"; label: string };

export const NAV_ITEMS: NavItem[] = [
	{ kind: "link", label: "Início", href: "/dashboard" },
	{ kind: "link", label: "Pedidos", href: "/dashboard/pedidos" },
	{
		kind: "link",
		label: "Reembolso e devoluções",
		href: "/dashboard/reembolso",
	},
	{ kind: "link", label: "Meus dados", href: "/dashboard/dados-pessoais" },
];
