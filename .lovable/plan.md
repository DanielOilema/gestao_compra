## Objetivo
Adicionar barra de pesquisa nas listagens de Pedidos de Compra e Solicitações de Compra, permitindo busca por número do documento ou nome do fornecedor/solicitante, sem modificar componentes existentes.

## Abordagem
Criar um novo componente reutilizável `src/components/OrderSearchBar.tsx` (input controlado com ícone de busca e botão de limpar) e usá-lo em `src/pages/Dashboard.tsx` para ambas as categorias.

## Mudanças

1. **Novo componente `src/components/OrderSearchBar.tsx`**
   - Props: `value: string`, `onChange: (v: string) => void`, `placeholder?: string`.
   - Input com ícone de lupa à esquerda e botão "X" para limpar quando houver texto.
   - Estilo coerente com o restante (tokens do design system).

2. **Atualizar `src/pages/Dashboard.tsx`**
   - Adicionar estado `searchQuery` (string) para ambas as categorias.
   - Renderizar `<OrderSearchBar>` acima do título da listagem ativa, sempre que houver itens na categoria selecionada.
   - **Para Pedidos:** filtrar por `order.numero` e `order.fornecedor` (case-insensitive).
   - **Para Solicitações:** filtrar por `order.numero` e `order.solicitante` (case-insensitive).
   - Passar listas filtradas para `<PedidoList>` / `<SolicitacaoList>` e usar contagem filtrada no título.
   - Não tocar em `PedidoList`, `SolicitacaoList`, hooks ou tipos.

## Restrições respeitadas
- Nenhuma alteração em componentes existentes além de `Dashboard.tsx` (página) que orquestra a tela.
- Sem refatoração global, sem mudanças em hooks, tipos ou edge functions.