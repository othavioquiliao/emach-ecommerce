"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@emach/ui/components/dropdown-menu";
import { LogOut, Package, User, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";

export function AccountMenu() {
	const { data: session, isPending } = useSession();
	const router = useRouter();

	if (isPending || !session?.user) {
		return (
			<Link
				aria-label="Conta"
				className="text-white/80 hover:text-white"
				href="/login"
			>
				<User className="size-[18px]" />
			</Link>
		);
	}

	const handleSignOut = async () => {
		await signOut();
		toast.success("Sessão encerrada");
		router.push("/");
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Conta"
				className="cursor-pointer text-white/80 hover:text-white"
			>
				<User className="size-[18px]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem render={<Link href="/dashboard/pedidos" />}>
					<Package />
					Meus pedidos
				</DropdownMenuItem>
				<DropdownMenuItem render={<Link href="/dashboard/dados-pessoais" />}>
					<UserCog />
					Meus dados
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} variant="destructive">
					<LogOut />
					Sair
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
