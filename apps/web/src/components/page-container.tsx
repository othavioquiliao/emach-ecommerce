import { cn } from "@emach/ui/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	as?: "div" | "section" | "main";
	bleed?: boolean;
}

/**
 * Container editorial padrão EMACH. Centraliza conteúdo em `max-w-[1440px]`
 * com padding horizontal consistente. `bleed` desativa o max-width quando
 * o consumidor precisa ocupar a largura total (mantém apenas o padding).
 */
export function PageContainer({
	as: Tag = "div",
	bleed = false,
	className,
	...props
}: PageContainerProps) {
	return (
		<Tag
			className={cn(
				"mx-auto w-full px-10",
				!bleed && "max-w-[1440px]",
				className
			)}
			{...props}
		/>
	);
}
