import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@emach/ui/components/avatar";
import { cn } from "@emach/ui/lib/utils";

const WHITESPACE_RE = /\s+/;

function getInitials(name: string): string {
	const parts = name.trim().split(WHITESPACE_RE);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}

/**
 * Avatar do cliente na área de conta: mostra a foto (`image`) quando houver,
 * com fallback nas iniciais sobre fundo Ferrari Red. Compartilhado entre a
 * sidebar e o header de "Meus dados".
 */
export function AccountAvatar({
	name,
	image,
	className,
	fallbackClassName,
}: {
	className?: string;
	fallbackClassName?: string;
	image?: string | null;
	name: string;
}) {
	return (
		<Avatar className={cn("after:border-white/15", className)} size="default">
			{image ? <AvatarImage alt={name} src={image} /> : null}
			<AvatarFallback
				className={cn(
					"bg-emach-red font-display font-semibold text-white",
					fallbackClassName
				)}
			>
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
