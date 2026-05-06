export function ProductCardSkeleton() {
	return (
		<div className="animate-pulse">
			<div className="mb-3 aspect-square bg-[color:var(--gray-10)]" />
			<div className="mb-1 h-3 w-20 bg-[color:var(--gray-10)]" />
			<div className="mb-2 h-4 w-full bg-[color:var(--gray-10)]" />
			<div className="h-4 w-24 bg-[color:var(--gray-10)]" />
		</div>
	);
}
