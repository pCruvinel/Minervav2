# Planejamento: Padronização Visual Financeiro

**Objetivo**: Padronizar as tabelas dos módulos financeiros utilizando o novo Design System (referência: `conciliacao-bancaria-page.tsx`), garantindo consistência visual e alta densidade de dados.

## Escopo
1.  **Página de Detalhes do Centro de Custo** (`centro-custo-detalhes-page.tsx`)
2.  **Página de Lista de Centros de Custo** (`centro-custo-lista-page.tsx`)

## Padrões Adotados (Design System)
-   **Wrapper**: `CompactTableWrapper` (Inclui Título, Paginação e Seletor de Qtd).
-   **Linhas**: `CompactTableRow` (Hover, pointer).
-   **Células**: `CompactTableCell` (Padding reduzido, text-sm).
-   **Badges**: Variante `outline` + cores semânticas (`bg-success/10`, `text-success`).
-   **Datas**: Formato `dd/MM/yy - HH:mm` (se houver hora) ou `dd/MM/yy`.
-   **Valores**: `text-right` + `tabular-nums`.

## Tarefas por Arquivo

### 1. [centro-custo-lista-page.tsx](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/src/components/financeiro/centro-custo-lista-page.tsx)
-   [ ] Substituir `Table` padrão por estrutura `CompactTable`.
-   [ ] Implementar `CompactTableWrapper` com paginação (mesmo que mockada inicialmente ou client-side).
-   [ ] Ajustar colunas:
    -   **Nome**: Negrito/Medium.
    -   **Tipo**: Badge (Fixo/Variável).
    -   **Status**: Badge (Ativo/Inativo).
    -   **Gestor**: Nome ou "-".
    -   **Ações**: Botão view/edit alinhado à direita.

### 2. [centro-custo-detalhes-page.tsx](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/src/components/financeiro/centro-custo-detalhes-page.tsx)
Este arquivo possui múltiplas tabelas (Abas). Todas devem ser migradas.

#### Aba Resumo - Tabela "Composição de Custos"
-   [ ] Migrar para `CompactTable`.
-   [ ] Adicionar linha de **Totais** usando estilo `bg-muted/50 font-bold` (já existe logicamente, ajustar visualmente se necessário).

#### Aba Despesas
-   [ ] Migrar grid de despesas para `CompactTable`.
-   [ ] Colunas: Data, Descrição, Categoria, Fornecedor, Status (Badge), Valor (Right).
-   [ ] Estilo de Status: Pendente (Yellow), Pago (Green), Atrasado (Red).

#### Aba Receitas
-   [ ] Migrar grid de receitas para `CompactTable`.
-   [ ] Colunas: Data, Descrição, Cliente, Status, Valor.

## Verificação
-   [ ] **Visual**: Verificar se hover, paddings e fontes estão consistentes com a página de conciliação.
-   [ ] **Build**: `npm run build` para garantir que não há erro de Tipagem nos novos componentes.
