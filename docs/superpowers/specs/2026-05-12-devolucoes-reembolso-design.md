# Devoluções e Reembolso — Design Spec

**Data:** 2026-05-12
**Branch:** `feat/organizar-site`
**Escopo:** Página `/dashboard/devolucoes` (listagem) + bloco "Reembolso" reaproveitado em `/dashboard/pedidos/[id]` quando o pedido tiver devolução reembolsada.

---

## 1. Objetivo

Dar ao cliente visibilidade do estado de devoluções/reembolsos abertos a partir de seus pedidos. **Esta página é apenas listagem** — a solicitação nasce dentro da página do pedido (não está em escopo aqui). "Ver detalhes" no card de devolução leva ao `/dashboard/pedidos/[id]` correspondente.

## 2. Arquitetura (alinhada com `/dashboard/pedidos`)

```
apps/web/src/app/dashboard/
├── _components/
│   └── dashboard-sidebar.tsx           ← trocar "Reembolso e devoluções" de kind:"soon" para kind:"link" → /dashboard/devolucoes
├── _lib/
│   ├── types.ts                        ← adicionar tipos RefundStatus, RefundTab, Refund, RefundResolution, RefundMethod
│   └── mock-refunds.ts                 ← novo: mocks de devoluções (espelha shape de mock-orders.ts)
└── devolucoes/
    ├── page.tsx                        ← Server component, headline + RefundsTabs
    └── _components/
        ├── refunds-tabs.tsx            ← shadcn Tabs variant="line", 2 abas (open/closed) com counts
        ├── refund-card.tsx             ← card de devolução (espelha OrderCard)
        ├── refund-status-badge.tsx     ← badge colorido por status
        └── refunds-empty-state.tsx     ← vazio por aba
```

Reuso em `/dashboard/pedidos/[id]`:

```
apps/web/src/app/dashboard/pedidos/[id]/_components/
└── order-refund-block.tsx              ← NOVO componente compartilhado: renderiza
                                          "Reembolso" (data/método/prazo) quando há
                                          devolução vinculada ao pedido. Usado tanto
                                          aqui quanto dentro de refund-card.tsx.
```

## 3. Modelo de dados (mock por enquanto)

Sem schema novo no banco — toda a feature roda em `mock-refunds.ts` espelhando o padrão de `mock-orders.ts`. Em produção, futuramente, vira tabela `return_request` no dashboard.

```ts
// apps/web/src/app/dashboard/_lib/types.ts (adições)

export type RefundStatus = "solicitado" | "em_analise" | "reembolsado" | "recusado";

export type RefundTab = "open" | "closed";

export type RefundMethod = "pix" | "credit_card" | "boleto" | "store_credit";

export interface RefundResolution {
  /** Quando o reembolso foi efetivamente estornado (apenas status=reembolsado) */
  refundedAt?: Date;
  /** Método de devolução do dinheiro (apenas status=reembolsado) */
  method?: RefundMethod;
  /** Prazo informado ao cliente após o estorno (ex.: "1-2 dias úteis") */
  etaLabel?: string;
  /** Justificativa quando recusado (texto livre vindo do staff) */
  deniedReason?: string;
}

export interface Refund {
  id: string;                  // ex.: "DEV-2026-00128"
  orderId: string;             // FK para Order — usado pelo link "Ver detalhes"
  createdAt: Date;             // data da solicitação
  status: RefundStatus;
  reason: string;              // motivo do cliente (texto livre)
  items: OrderItem[];          // reutiliza shape de OrderItem (mesma thumb/var/qty)
  amountCents: number;         // total a reembolsar (snapshot no momento da solicitação)
  resolution?: RefundResolution;
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  solicitado: "Solicitado",
  em_analise: "Em análise",
  reembolsado: "Reembolsado",
  recusado: "Recusado",
};

export const REFUND_TAB_LABEL: Record<RefundTab, string> = {
  open: "Em andamento",
  closed: "Finalizado",
};

export const REFUND_TABS: readonly RefundTab[] = ["open", "closed"] as const;

export const REFUND_METHOD_LABEL: Record<RefundMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  boleto: "Boleto bancário",
  store_credit: "Crédito na loja",
};
```

**Mapeamento aba → status:**
- `open` (Em andamento) → `solicitado`, `em_analise`
- `closed` (Finalizado) → `reembolsado`, `recusado`

`mock-refunds.ts` exporta `getRefundCounts()`, `getRefundsByTab(tab)` espelhando o helper de `mock-orders.ts`.

## 4. Layout e componentes

### 4.1 `page.tsx`

```tsx
<section>
  <SectionLabel>Minha conta</SectionLabel>
  <h1 className="mt-2 mb-7 font-display font-medium text-[36px] leading-none">
    Devoluções e reembolso
  </h1>
  <RefundsTabs />
</section>
```

Idêntico em estrutura ao `pedidos/page.tsx` — só muda título.

### 4.2 `RefundsTabs`

Mesma marcação do `OrdersTabs` (shadcn `<Tabs variant="line">`), com 2 triggers em vez de 5. Contagem ao lado do label, mesmo estilo (`font-normal text-gray-50`).

`defaultValue="open"`.

### 4.3 `RefundCard` (variante de `OrderCard`)

Estrutura de cima para baixo:

1. **Header** (`bg-gray-10`) — três pares meta-label/value + badge à direita:
   - `Devolução` `#DEV-2026-00128`
   - `Pedido` `#PED-104872`
   - `Solicitada em` `10/05/2026`
   - Badge de status (canto direito)

2. **Lista de itens** — reutiliza visual do `OrderCard.item` (mesma `<ItemThumb>` por `categorySlug`, mesmo layout `nome / variant / quantidade / preço`). Múltiplos itens separados por divisor sutil.

3. **Bloco "Motivo"** — fundo `bg-white`, border-top:
   ```
   MOTIVO     Produto chegou com defeito (botão de reversão travado)
   ```
   meta-label uppercase + texto em `text-gray-60`.

4. **Bloco "Reembolso" / "Decisão"** (renderizado pelo componente compartilhado `<OrderRefundBlock />` — ver §4.6):
   - **Se `status === "reembolsado"`:** fundo `bg-[#fafafa]`, mostra "Reembolso · Estornado em **DD/MM/AAAA** · Pix · 1-2 dias úteis"
   - **Se `status === "recusado"`:** fundo `bg-[#FFF5F5]`, mostra "Decisão · <deniedReason>"
   - **Se `open` (solicitado/em_analise):** bloco NÃO renderiza

5. **Linha de total** (`bg-[#fafafa]`):
   - `solicitado`/`em_analise`/`reembolsado`: `A reembolsar` `<valor>` (no `reembolsado`, valor em verde `#16A34A`)
   - `recusado`: `Valor solicitado` com `text-decoration: line-through` em `text-gray-60`

6. **Footer de ações** (`border-t`, fundo `bg-white`, justify-end):
   - `solicitado` → `[Cancelar solicitação] [Ver detalhes]`
   - `em_analise` → `[Ver detalhes]`
   - `reembolsado` → `[Ver detalhes]`
   - `recusado` → `[Ver detalhes]`

   "Ver detalhes" é um `<Link href={\`/dashboard/pedidos/${refund.orderId}\`}>` estilado como `emachButtonVariants({ variant: "outline", size: "sm" })`. Botão "Cancelar solicitação" usa `EmachButton variant="ghost" size="sm"` e por enquanto faz `toast.info("Cancelar solicitação: em breve")` — comportamento real ficará para um spec futuro.

   Card recusado leva `className="opacity-85"` no `<article>` (apenas estado visual, não desabilita interação).

### 4.4 `RefundStatusBadge`

Mesma anatomia do `OrderStatusBadge` (dot 6×6 + label uppercase Barlow Condensed, padding 5×10, border 1px) com paleta:

| Status | Cor texto/border | Fundo | Notas |
|---|---|---|---|
| Solicitado | `#3860BE` (link-hover) | `#3860BE11` | azul informativo |
| Em análise | `#B45309` (âmbar) | `#B4530911` | atenção sem alarme — NÃO usar `--destructive` (#F13A2C) que é só para warning de erro |
| Reembolsado | `#16A34A` (`--success`) | `#16A34A11` | verde conclusão |
| Recusado | `#666666` (`gray-60`) | `#fafafa` | neutro/desabilitado |

Importante: nada de Ferrari Red (`#DA291C`) em badge — vermelho está reservado a CTA primária por DESIGN.md §7.

### 4.5 `RefundsEmptyState`

Espelha `OrdersEmptyState` — recebe `tabLabel: string`, ícone neutro, mensagem "Você não tem devoluções <em andamento|finalizadas>". Sem CTA primária aqui (a entrada para solicitar é em `/dashboard/pedidos/[id]`).

### 4.6 `OrderRefundBlock` (componente compartilhado)

Onde mora: `apps/web/src/app/dashboard/pedidos/[id]/_components/order-refund-block.tsx` (perto da página do pedido, importado também pelo card de devolução — é o pedido que "possui" o reembolso).

Props:
```ts
interface OrderRefundBlockProps {
  status: RefundStatus;
  resolution?: RefundResolution;
  variant?: "card" | "page"; // card = denso (dentro de refund-card); page = mais respirado
}
```

Aparece em dois lugares:
- **`RefundCard`** (`variant="card"`) — linha compacta horizontal, como mostrado nos mockups.
- **`/dashboard/pedidos/[id]`** (`variant="page"`) — bloco com mais respiro, posicionado entre o bloco de pagamento e o de rastreio. **Requisito explícito do usuário:** quando o pedido tiver devolução com `status="reembolsado"`, a página do pedido mostra data do estorno, método e prazo. Se a devolução estiver `solicitado`/`em_analise` mostra apenas um aviso "Devolução em andamento · #DEV-...". Se `recusado`, mostra "Devolução recusada · #DEV-..." com a justificativa.

Para o mock de detalhe do pedido (`mock-order-detail.ts`), adicionamos um campo opcional `refund?: Refund` ao `OrderDetail`, populado apenas em pedidos com devolução vinculada.

## 5. Sidebar e rota

`dashboard-sidebar.tsx` — converter o item "Reembolso e devoluções" de `kind: "soon"` para `kind: "link"` apontando para `/dashboard/devolucoes`. Manter rótulo exato (já vetado pelo usuário em rounds anteriores) para não quebrar consistência. `Route` literal de Next 16 typedRoutes vai validar automaticamente.

Ordem no menu permanece: Pedidos · Reembolso e devoluções · Meus dados · Sair.

## 6. Dados de mock — cenários a cobrir

`mock-refunds.ts` deve incluir, no mínimo:

- 1 devolução `solicitado` com 1 item
- 1 devolução `em_analise` com 1 item
- 1 devolução `solicitado` com 2+ itens (testar divisor)
- 1 devolução `reembolsado` (com `resolution` completa: refundedAt, method=`pix`, etaLabel)
- 1 devolução `recusado` (com `deniedReason` populado)

Cada `Refund.orderId` deve apontar para um pedido **já existente** em `mock-orders.ts` (não adicionar pedidos novos só para isso). Pelo menos um dos pedidos referenciados precisa ter `OrderDetail.refund` populado em `mock-order-detail.ts` para o status `reembolsado`, garantindo que `/dashboard/pedidos/[id]` mostre o bloco quando aberto.

## 7. Tokens / classes (todas existentes em `globals.css` ou Tailwind)

- Fontes: `font-display` (Barlow Condensed) para meta-labels e h1; `font-sans` (Barlow) para body
- Cores: `bg-near-black`, `text-gray-50/60`, `bg-gray-10`, `border-border`, `bg-emach-red`
- Radius: `rounded-none` em tudo, `2px` (default shadcn) só nos botões
- Sem novos tokens nem novas classes utilitárias

## 8. Acessibilidade

- Tabs do shadcn já entregam ARIA correto (role=tablist/tab/tabpanel + keyboard nav).
- Badges são puramente visuais; status também é comunicado via texto explícito ("Solicitado", "Em análise"...).
- Botão "Cancelar solicitação" tem `aria-label` redundante porque ação é destrutiva-leaning.
- Cards não viram `<button>` — `<article>` semântico, ações no footer são botões/links reais.

## 9. Fora de escopo (próximos specs)

- Fluxo "Solicitar devolução" a partir do pedido (`/dashboard/pedidos/[id]`)
- Página de detalhe da devolução (`/dashboard/devolucoes/[id]`) — confirmado pelo usuário que não existe
- Schema real no banco (tabela `return_request` + RLS + migrations) — owned by dashboard
- Ação "Cancelar solicitação" funcional (continua mostrando toast "em breve")
- Notificações por e-mail de mudança de status

## 10. Critérios de pronto

1. Rota `/dashboard/devolucoes` acessível pelo sidebar autenticado.
2. Duas abas com contagem; alternância carrega listas distintas.
3. Cinco cenários de mock visíveis e renderizando todos os blocos descritos (header, itens, motivo, reembolso/decisão quando aplicável, total, ações).
4. `[Ver detalhes]` em qualquer card navega para `/dashboard/pedidos/[orderId]`.
5. Página do pedido (`/dashboard/pedidos/[id]`) renderiza `<OrderRefundBlock variant="page" />` quando o `OrderDetail` tem `refund` populado — pelo menos um pedido de mock deve provar isso para `reembolsado`.
6. Empty state aparece quando a aba está vazia.
7. `bun run check-types` e `bun run check` passam.
8. Visual confere com mockups `devolucoes-v1.html` e `devolucoes-v2-finalizado.html` no companion.
