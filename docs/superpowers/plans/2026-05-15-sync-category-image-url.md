# Sincronização `category.image_url` + Redesign CategoryTile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sincronizar a cópia versionada do schema Drizzle removendo a coluna `category.image_url`, eliminar toda leitura desse campo e redesenhar o `CategoryTile` da home com tratamento editorial (número-índice fantasma) já que categorias não têm mais imagem.

**Architecture:** Mudança atômica — remover a coluna do schema cascateia para os consumidores. Por isso é uma única task com um único commit: o tipo `Category` (`$inferSelect`) perde `imageUrl` automaticamente, e `bun check-types` só fica verde quando schema, queries SQL e os componentes do app estão todos sincronizados. Migrations versionadas ficam fora de escopo (o drop físico no banco compartilhado é aplicado pela migration do dashboard PR #35).

**Tech Stack:** Drizzle ORM 0.45, Next.js 16, React 19, Tailwind CSS v4, Bun, Turborepo.

**Spec de referência:** `docs/superpowers/specs/2026-05-15-sync-category-image-url-design.md`

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/db/src/schema/categories.ts` | Definição Drizzle da tabela `category` | Modificar — remover coluna |
| `packages/db/src/queries/catalog.ts` | Queries SQL de catálogo (`getCategoryBySlug`) | Modificar — remover `image_url` de 2 SELECTs |
| `apps/web/src/components/category-tile.tsx` | Card de categoria da home | Modificar — redesign editorial completo |
| `apps/web/src/app/page.tsx` | Home page server component | Modificar — remover `imageUrl` do select + passar `index` |

Nenhum arquivo novo. Nenhuma migration neste repo (fora de escopo por decisão do projeto ecommerce).

---

## Task 1: Sincronizar schema, queries e redesenhar CategoryTile

**Files:**
- Modify: `packages/db/src/schema/categories.ts:29`
- Modify: `packages/db/src/queries/catalog.ts` (SELECTs de `getCategoryBySlug`, ~linhas 692 e 713)
- Modify: `apps/web/src/components/category-tile.tsx` (reescrita do componente)
- Modify: `apps/web/src/app/page.tsx` (`getRootCategories` + uso de `<CategoryTile>`)

> **Nota sobre TDD:** este projeto não tem framework de testes unitários. O gate de verificação
> é `bun check-types` (compilação TypeScript do monorepo) + smoke manual via `bun dev:web`.
> Os passos abaixo seguem essa realidade — não há "failing test" a escrever.

- [ ] **Step 1: Remover a coluna `imageUrl` do schema Drizzle**

Em `packages/db/src/schema/categories.ts`, deletar a linha 29 dentro do objeto de colunas da
tabela `category`:

```ts
		imageUrl: text("image_url"),
```

O bloco resultante (linhas ~25-32) fica:

```ts
		sortOrder: integer("sort_order").notNull().default(0),
		isActive: boolean("is_active").notNull().default(true),
		description: text("description"),
		path: text("path").notNull(),
		depth: integer("depth").notNull().default(0),
```

O tipo exportado `Category` (`typeof category.$inferSelect`, linha ~86) perde `imageUrl`
automaticamente. `import` de `text` continua usado por outras colunas — não remover.

- [ ] **Step 2: Remover `image_url` do SELECT principal de `getCategoryBySlug`**

Em `packages/db/src/queries/catalog.ts`, na função `getCategoryBySlug`, a primeira query
(`db.execute<Category>` que busca a categoria pelo slug, ~linha 690-696). Trocar:

```ts
	const found = await db.execute<Category>(sql`
		SELECT id, slug, name, parent_id AS "parentId", sort_order AS "sortOrder",
		       is_active AS "isActive", description, image_url AS "imageUrl",
		       path, depth, created_at AS "createdAt", updated_at AS "updatedAt"
		FROM category
		WHERE slug = ${slug} AND is_active = true
		LIMIT 1
	`);
```

por:

```ts
	const found = await db.execute<Category>(sql`
		SELECT id, slug, name, parent_id AS "parentId", sort_order AS "sortOrder",
		       is_active AS "isActive", description,
		       path, depth, created_at AS "createdAt", updated_at AS "updatedAt"
		FROM category
		WHERE slug = ${slug} AND is_active = true
		LIMIT 1
	`);
```

- [ ] **Step 3: Remover `image_url` do SELECT de ancestrais de `getCategoryBySlug`**

Ainda em `packages/db/src/queries/catalog.ts`, a segunda query da mesma função (busca dos
ancestrais via `id = ANY(...)`, ~linha 710-718). Trocar:

```ts
		const ancestorsRes = await db.execute<Category>(sql`
			SELECT id, slug, name, parent_id AS "parentId", sort_order AS "sortOrder",
			       is_active AS "isActive", description, image_url AS "imageUrl",
			       path, depth, created_at AS "createdAt", updated_at AS "updatedAt"
			FROM category
			WHERE id = ANY(${arrayLiteral(ancestorIds, "text[]")})
			ORDER BY depth ASC
		`);
```

por:

```ts
		const ancestorsRes = await db.execute<Category>(sql`
			SELECT id, slug, name, parent_id AS "parentId", sort_order AS "sortOrder",
			       is_active AS "isActive", description,
			       path, depth, created_at AS "createdAt", updated_at AS "updatedAt"
			FROM category
			WHERE id = ANY(${arrayLiteral(ancestorIds, "text[]")})
			ORDER BY depth ASC
		`);
```

- [ ] **Step 4: Reescrever `category-tile.tsx` com o redesign editorial**

Substituir o conteúdo completo de `apps/web/src/components/category-tile.tsx` por:

```tsx
import { cn } from "@emach/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

interface CategoryTileCategory {
	description: string | null;
	name: string;
	slug: string;
}

interface CategoryTileProps {
	category: CategoryTileCategory;
	index: number;
	size?: "sm" | "md" | "lg" | "full";
}

const SIZE_CLASS: Record<NonNullable<CategoryTileProps["size"]>, string> = {
	sm: "h-[240px]",
	md: "h-[320px]",
	lg: "h-[400px]",
	full: "h-full min-h-[664px]",
};

const OVERLAY_BASE =
	"pointer-events-none absolute inset-0 transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]";

export function CategoryTile({
	category,
	index,
	size = "md",
}: CategoryTileProps) {
	const indexLabel = String(index + 1).padStart(2, "0");

	return (
		<Link
			className={cn(
				"group relative block overflow-hidden rounded-[2px] bg-near-black",
				SIZE_CLASS[size]
			)}
			href={`/catalog?cat=${category.slug}`}
		>
			{/* Gradient fallback */}
			<div
				aria-hidden="true"
				className={cn(OVERLAY_BASE, "emach-bg-category-fallback")}
			/>

			{/* Texture overlay */}
			<div
				aria-hidden="true"
				className="emach-bg-diagonal-2 pointer-events-none absolute inset-0"
			/>

			{/* Bottom vignette */}
			<div
				aria-hidden="true"
				className="emach-bg-vignette-bottom pointer-events-none absolute inset-0"
			/>

			{/* Ghost index number */}
			<span
				aria-hidden="true"
				className={cn(
					"-top-[0.14em] -right-[0.02em] pointer-events-none absolute font-display leading-none text-white/[0.05]",
					size === "full" ? "text-[200px]" : "text-[120px]"
				)}
			>
				{indexLabel}
			</span>

			{/* Red accent bar on hover */}
			<div
				aria-hidden="true"
				className="absolute bottom-0 left-0 h-[3px] w-0 bg-emach-red transition-[width] duration-300 ease-out group-hover:w-full"
			/>

			{/* Content */}
			<div className="absolute right-6 bottom-6 left-6 flex flex-col gap-1.5 text-white">
				<SectionLabel tone="light">{`${indexLabel} · ${category.slug}`}</SectionLabel>
				<div className="font-medium text-[24px]">{category.name}</div>
				<div className="max-w-[320px] text-[13px] text-white/70 leading-relaxed">
					{category.description}
				</div>
				<div className="mt-2.5 flex items-end gap-2 font-semibold text-white text-xs">
					<span>Explorar</span>
					<ArrowRight
						className="text-white transition-[color,transform] duration-200 ease-out group-hover:translate-x-1 group-hover:text-emach-red"
						size={14}
						strokeWidth={2}
					/>
				</div>
			</div>
		</Link>
	);
}
```

Mudanças vs. versão anterior: removido `import Image from "next/image"`, removido o campo
`imageUrl` da interface `CategoryTileCategory`, removido o bloco condicional de `<Image>` e o
overlay condicional `emach-bg-category-overlay`. Adicionado prop `index` e o número-índice
fantasma. `SectionLabel` agora exibe `{indexLabel} · {slug}`.

- [ ] **Step 5: Remover `imageUrl` do select de `getRootCategories` em `page.tsx`**

Em `apps/web/src/app/page.tsx`, na função `getRootCategories` (~linha 41-53), remover a linha
`imageUrl: category.imageUrl,`. O objeto de select fica:

```ts
async function getRootCategories() {
	return db
		.select({
			id: category.id,
			slug: category.slug,
			name: category.name,
			description: category.description,
		})
		.from(category)
		.where(and(isNull(category.parentId), eq(category.isActive, true)))
		.orderBy(asc(category.sortOrder))
		.limit(5);
}
```

- [ ] **Step 6: Passar `index` para cada `<CategoryTile>` em `page.tsx`**

Em `apps/web/src/app/page.tsx`, na seção de categorias (~linha 187-196), trocar:

```tsx
						<div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-6">
							{tile0 && (
								<div className="row-span-2">
									<CategoryTile category={tile0} size="full" />
								</div>
							)}
							{tile1 && <CategoryTile category={tile1} />}
							{tile2 && <CategoryTile category={tile2} />}
							{tile3 && <CategoryTile category={tile3} />}
							{tile4 && <CategoryTile category={tile4} />}
						</div>
```

por:

```tsx
						<div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-6">
							{tile0 && (
								<div className="row-span-2">
									<CategoryTile category={tile0} index={0} size="full" />
								</div>
							)}
							{tile1 && <CategoryTile category={tile1} index={1} />}
							{tile2 && <CategoryTile category={tile2} index={2} />}
							{tile3 && <CategoryTile category={tile3} index={3} />}
							{tile4 && <CategoryTile category={tile4} index={4} />}
						</div>
```

- [ ] **Step 7: Verificar tipos no monorepo**

Run: `bun check-types`
Expected: PASS, sem erros. Confirma que nenhuma referência órfã a `category.imageUrl` /
`imageUrl` restou e que `Category` / `CategoryDetail` continuam consistentes.

- [ ] **Step 8: Rodar lint/format**

Run: `bun fix`
Expected: sem erros pendentes; arquivos alterados eventualmente reformatados pelo Biome.
Se `bun fix` reformatar algo, está OK — segue para o próximo passo.

- [ ] **Step 9: Smoke run-time**

Run: `bun dev:web` (porta 3001)
Verificar manualmente:
- `http://localhost:3001/` — seção "01 · Categorias": os 5 tiles renderizam com número-índice
  fantasma (01–05) no canto superior direito, gradiente de fundo, nome e descrição. Nenhum
  erro no console.
- `http://localhost:3001/catalog?cat=<slug-de-categoria-existente>` — a página de categoria
  carrega normalmente (nome, descrição, árvore de categorias na sidebar). Nenhum erro SSR.

Encerrar o servidor após a verificação.

- [ ] **Step 10: Commit**

```bash
git add packages/db/src/schema/categories.ts packages/db/src/queries/catalog.ts apps/web/src/components/category-tile.tsx apps/web/src/app/page.tsx
git commit -m "refactor: remover category.image_url e redesenhar CategoryTile"
```

---

## Self-Review (preenchido pelo autor do plano)

**Spec coverage:**
- Spec Parte 1 (remoção mecânica) → Steps 1, 2, 3, 5. ✓
- Spec Parte 2 (redesign CategoryTile) → Steps 4, 6. ✓
- Spec Parte 3 (verificação) → Steps 7, 8, 9. ✓
- Spec "coordenação de timing" → informativo, não gera task. ✓
- Migrations → fora de escopo, confirmado no spec e no header. ✓

**Placeholder scan:** Nenhum TBD/TODO. Todo step tem o código/comando concreto. ✓

**Type consistency:** `CategoryTileCategory` (Step 4) usa `{description, name, slug}` — compatível
com o objeto retornado por `getRootCategories` após Step 5 (`{id, slug, name, description}`; o
`id` extra é aceito por tipagem estrutural ao atribuir variável). `index: number` em
`CategoryTileProps` casa com `index={0..4}` passados no Step 6. `Category` (schema) perde
`imageUrl` no Step 1; os SQLs `db.execute<Category>` nos Steps 2-3 deixam de selecionar a
coluna — consistente. ✓
