# Design — Sincronizar schema `category.image_url` removida + redesign editorial do CategoryTile

> Issue: [#15](https://github.com/othavioquiliao/emach-ecommerce/issues/15)
> Data: 2026-05-15
> Origem da mudança: dashboard PR [#35](https://github.com/othavioquiliao/emach-dashboard/pull/35), branch `visual-categorias`

## Contexto

O dashboard admin (`othavioquiliao/emach-dashboard`) e este app compartilham o mesmo banco
Supabase. O dashboard é a fonte de verdade do schema; este repo mantém uma cópia versionada
que precisa ser sincronizada a cada mudança.

A coluna `category.image_url` foi removida no dashboard — uma categoria de catálogo é apenas
estrutura de classificação e não precisa de imagem própria. Este spec cobre a sincronização
da cópia local do schema Drizzle, a remoção de toda leitura de `imageUrl` em categoria, e o
ajuste do único componente de storefront que renderizava imagem de categoria (`CategoryTile`).

**Fora de escopo:** migrations versionadas. O drop físico da coluna no banco compartilhado é
aplicado pela migration do dashboard quando o PR #35 for mergeado. Este repo (ecommerce) não
mantém migrations próprias para tabelas owned-by-dashboard.

## Mapa de impacto

A coluna `image_url` / `imageUrl` é referenciada em 4 arquivos:

| Arquivo | Uso atual |
|---|---|
| `packages/db/src/schema/categories.ts:29` | Definição da coluna `imageUrl: text("image_url")` |
| `packages/db/src/queries/catalog.ts` (linhas 692, 713) | `getCategoryBySlug` seleciona `image_url AS "imageUrl"` (2×) |
| `apps/web/src/app/page.tsx:48` | `getRootCategories()` seleciona `category.imageUrl` |
| `apps/web/src/components/category-tile.tsx` | Renderiza `<Image src={category.imageUrl}>` na home |

Observações que reduziram o escopo:

- `getCategoryTree` já **não** seleciona `image_url` — nada a fazer.
- `getCategoryBySlug` retorna `imageUrl`, mas o único consumidor (`apps/web/src/app/catalog/page.tsx`)
  usa apenas `id`, `name` e `description`. Remover `imageUrl` da query não quebra nada.
- O tipo `Category` é `typeof category.$inferSelect` — perde `imageUrl` automaticamente ao
  remover a coluna do schema. `CategoryDetail = Category & { ancestors }` segue o mesmo.

## Parte 1 — Remoção mecânica (sincronizar schema)

1. **`packages/db/src/schema/categories.ts`** — deletar a linha 29:
   ```ts
   imageUrl: text("image_url"),
   ```

2. **`packages/db/src/queries/catalog.ts`** — em `getCategoryBySlug`, remover `image_url AS "imageUrl",`
   das duas listas de SELECT (query da categoria — ~linha 692 — e query dos ancestrais — ~linha 713).
   As demais colunas do SELECT permanecem inalteradas.

3. **`apps/web/src/app/page.tsx`** — em `getRootCategories()`, remover `imageUrl: category.imageUrl,`
   do objeto de select Drizzle. O objeto resultante passa a ter `{ id, slug, name, description }`.

## Parte 2 — Redesign editorial do CategoryTile

### Motivação

O `CategoryTile` atual tem dois caminhos de renderização: com imagem (`<Image>` + overlay
`emach-bg-category-overlay`) e sem imagem (gradiente `emach-bg-category-fallback`). Sem
`imageUrl`, os 5 tiles da home cairiam todos no mesmo gradiente — visualmente repetitivo.

O redesign diferencia cada tile com um **número-índice gigante "fantasma"** ao fundo. A escolha
está alinhada ao design system Ferrari-inspired do projeto: seções já são numeradas
("01 · Categorias"), usam Barlow Condensed uppercase, e o princípio "informação técnica é design"
trata números/specs com peso visual.

### Mockup

```
┌────────────────────────────────┐
│                          ╱╱ 02 │  ← índice "02" gigante (Barlow Condensed,
│                        ╱╱       │     text-white/[0.05], leading-none),
│   (textura diagonal + vinheta)  │     atrás de todo o conteúdo
│                                 │
│  02 · FURADEIRAS         ← SectionLabel com prefixo numérico
│  Furadeiras                ← nome (Barlow medium, 24px)
│  Linha profissional...     ← descrição (white/70, 13px)
│  Explorar →                ← CTA (vermelho no hover)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│  ← barra vermelha cresce no hover (mantida)
└────────────────────────────────┘
```

### Mudanças em `apps/web/src/components/category-tile.tsx`

- A interface `CategoryTileCategory` perde o campo `imageUrl: string | null`. Campos finais:
  `{ description: string | null; name: string; slug: string }`.
- `CategoryTileProps` ganha `index: number` (0-based — posição do tile na grade).
- Remover: o bloco `{category.imageUrl && (<div><Image .../></div>)}`, o `import Image from "next/image"`,
  e a lógica condicional `category.imageUrl ? "emach-bg-category-overlay" : "emach-bg-category-fallback"`.
- O overlay de gradiente passa a usar sempre `emach-bg-category-fallback` (classe já existente em
  `packages/ui/src/styles/globals.css`).
- Novo elemento — número-índice fantasma:
  - Texto: `String(index + 1).padStart(2, "0")` → `"01"`, `"02"`, …, `"05"`.
  - Classes: `font-display`, `leading-none`, `text-white/[0.05]`, `pointer-events-none`,
    posicionado absoluto no topo-direito.
  - Tamanho: `text-[200px]` quando `size === "full"`, `text-[120px]` nos demais tamanhos.
  - `aria-hidden="true"` — é decorativo.
- O `SectionLabel` dentro do tile passa a exibir `{String(index + 1).padStart(2, "0")} · {slug}`
  em vez de só `{slug}`.
- Mantidos sem alteração: textura diagonal (`emach-bg-diagonal-2`), vinheta inferior
  (`emach-bg-vignette-bottom`), barra vermelha de hover, animação de escala no overlay.

### Mudança em `apps/web/src/app/page.tsx`

Passar `index` para cada `<CategoryTile>` na grade de categorias:

```tsx
<CategoryTile category={tile0} index={0} size="full" />
{tile1 && <CategoryTile category={tile1} index={1} />}
{tile2 && <CategoryTile category={tile2} index={2} />}
{tile3 && <CategoryTile category={tile3} index={3} />}
{tile4 && <CategoryTile category={tile4} index={4} />}
```

### Decisões YAGNI

- **Um único gradiente de fundo.** O número-índice já dá a diferenciação editorial entre tiles —
  não serão adicionadas variantes de gradiente (`emach-bg-category-fallback-2/3`) ao `globals.css`.
- A classe `emach-bg-category-overlay` continua existindo em `globals.css` — não é mais usada pelo
  `CategoryTile`, mas removê-la é escopo de limpeza não pedido. Permanece intocada.

## Verificação

1. `bun check-types` no monorepo — detecta qualquer referência órfã a `category.imageUrl` e
   valida que `Category` / `CategoryDetail` continuam consistentes.
2. `bun fix` no escopo alterado (Ultracite/Biome).
3. `bun dev:web` + smoke manual:
   - `/` (home) — confirmar os 5 tiles de categoria renderizando com número-índice 01–05.
   - `/catalog?cat=<slug>` — confirmar que a página de categoria continua intacta
     (nome, descrição, árvore de categorias).

## Coordenação de timing

O drop físico de `image_url` só ocorre quando o PR #35 do dashboard for mergeado e a migration
rodar. Remover a leitura de `image_url` neste repo **antes** do drop é seguro: o SELECT apenas
para de pedir uma coluna que ainda existe. O inverso (drop antes da remoção da leitura) quebraria
o storefront. Portanto este trabalho deve ser mergeado **antes ou junto** do PR #35.
