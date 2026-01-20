# Relatório de Atualizações do Sistema (Últimos 13 Dias)

**Período:** 07/01/2026 a 20/01/2026

Este documento resume as principais alterações, melhorias e correções realizadas no sistema MinervaV2 neste período.

## 1. Módulo Financeiro
- **Consolidação de Páginas:**
  - Fusão das funcionalidades de `contas-receber` em `receitas-recorrentes`.
  - Fusão de `contas-pagar` em `faturas-recorrentes`.
  - Remoção de páginas redundantes e rotas obsoletas.
- **Refatoração de Filtros:**
  - Padronização da barra de filtros em `/financeiro/conciliacao` utilizando componentes `FilterBar`, `SearchInput` e `DateRangePicker`.
  - Ajuste no seletor de data para exibir apenas o calendário (sem presets laterais).
- **Correções:**
  - **Modal de Despesas:** Correção de warnings (`Ref`), ajustes no salvamento de despesas recorrentes/parceladas e limpeza de tipos/estados não utilizados.

## 2. Workflows e Ordens de Serviço (OS)
- **Padronização de Ações (OS-07 e OS-08):**
  - Unificação do botão "Salvar e Avançar", movendo-o para o rodapé do accordion (removendo footers externos manuais).
  - Implementação de handlers de salvamento unificados.
- **OS-05 e OS-06 (Assessoria):**
  - Refinamento do workflow com remoção de cards redundantes na Etapa 2.
  - Correção do comportamento "sticky" do cabeçalho.
  - Atualização de valores padrão no Formulário Memorial.
- **Formulários Públicos:**
  - **OS-07:** Adição de exibição "somente leitura" (read-only) dos dados do cliente no topo do formulário público.

## 3. Sistema, Administração e Padronização
- **Seeds e Configuração:**
  - Criação de gerador de dados (seeds) para usuários (Coordenadores e Colaboradores).
  - Adição de atalho "Seeds" no menu de configurações.
- **Componentes e Layouts:**
  - **Tabs Standard:** Introdução do componente `@ss-components/tabs-01` e atualização do `DESIGN_SYSTEM.md`.
  - **Layouts de Página:** Padronização de diversas páginas (`faturas-recorrentes`, `colaboradores-lista`, `recrutamento`, etc.) seguindo o "gold standard" (container, espaçamento, PageHeader).
- **Validação:**
  - Análise e documentação do sistema de validação (Zod + `useFieldValidation`) em `VALIDATION_SYSTEM.md`.
- **Dashboard:**
  - Unificação de funcionalidades do Dashboard Geral com o CRM (adição de filtro de data).

## 4. Integrações e Automações (Telegram / Mercado Pago)
- **Telegram Downloader:**
  - Restrição para apenas uma sincronização ativa por grupo.
  - Melhoria no cancelamento de jobs (atualização robusta no banco).
  - Tratamento de duplicatas no frontend e integração na sidebar de admin.
- **Gestão de Comunidade:**
  - Correções no upload de imagens e criação de posts (políticas de storage Supabase).
- **Pagamentos (Mercado Pago):**
  - Correção de erro de idempotência (`X-Idempotency-Key`) em workflows n8n.
  - Planejamento e estruturação de pagamentos via Pix com webhooks.
- **Estrutura de Dados:**
  - Criação de relacionamento (FK) entre Grupos e Categorias no Supabase.

## 5. UX/UI
- **Página de Login:**
  - Refinamento visual completo: novas mensagens, estilização de inputs, efeitos de hover, "lembrar-me" e "mostrar senha".
  - Implementação de background com vídeo/transição suave para imagem estática e efeito parallax.
- **Menu Lateral:** Reorganização dos itens do módulo financeiro e administração.

---
**Observação:** A análise baseia-se no histórico de atividades recentes e registros de conversa.
