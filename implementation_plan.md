# Plano de Implementação — Milestone Calendário

> **Projeto:** Minerva · **Time:** Koda Labs  
> **Escopo:** 6 tasks pendentes (KOD-74 a KOD-79)  
> **Gerado em:** 2026-03-14 com base no Raio-X da codebase

---

## Arquitetura Atual (Raio-X)

| Achado | Detalhe |
|--------|---------|
| Feriados como bloqueios | `calendario_bloqueios.motivo = 'feriado'` · `celula-mes.tsx` já renderiza badge 🏛️ |
| RPC `contar_dias_uteis_mes` | Desconta weekends + bloqueios `motivo='feriado'` automaticamente |
| Aniversários: só colaboradores | `use-mes-calendario.ts` L111 → `colaboradores.data_nascimento` |
| `clientes` sem data_nascimento | Coluna **não existe** — precisa migration |
| Cargos coordenadores | `coord_obras` (5), `coord_assessoria` (5), `coord_administrativo` (6) |
| `configuracoes_rh` | Key-value store, sem `dias_uteis_mes` |

---

## KOD-74 · Feriados — entidade + marcar indisponível (3 pts, Medium)

**Abordagem:** Adicionar `'feriado'` ao `MOTIVO_OPTIONS` do `modal-criar-bloqueio.tsx` (L47). Não criar tabela separada — infraestrutura já existe.

| Arquivo | Ação |
|---------|------|
| `modal-criar-bloqueio.tsx` | Incluir `'feriado'` em `MOTIVO_OPTIONS`, forçar `dia_inteiro=true` |
| `calendario-painel-page.tsx` | Seção "Feriados cadastrados" no painel admin |

**Verificação:** Criar feriado → badge 🏛️ aparece → `contar_dias_uteis_mes` retorna -1

---

## KOD-75 · Aniversário do contratante (2 pts, Low)

**Abordagem:** Migration para `clientes.data_nascimento` + query no hook.

| Arquivo | Ação |
|---------|------|
| **[MIGRATION]** `add_data_nascimento_clientes.sql` | `ALTER TABLE clientes ADD COLUMN data_nascimento date` |
| `use-mes-calendario.ts` | Adicionar query de `clientes.data_nascimento`, merge no Map |
| `celula-mes.tsx` | Badge diferenciado: 🎂 colaborador / 🏢 cliente |
| Formulário de cliente | Campo `data_nascimento` |

**Verificação:** Cadastrar cliente com nascimento → ícone 🏢 aparece no mês

---

## KOD-76 · Alocação ao Coordenador (2 pts, Medium)

**Abordagem:** Prop `cargoFiltro` no modal de agendamento, filtro via join `colaboradores → cargos`.

| Arquivo | Ação |
|---------|------|
| `modal-novo-agendamento-v2.tsx` | Prop `cargoFiltro?: string[]` para filtrar por cargo slug |
| `step-agendar-apresentacao.tsx` | Passar `cargoFiltro={['coord_obras','coord_assessoria','coord_administrativo']}` |

**Risco:** Verificar se `colaboradores` tem FK para `cargos` ou se a associação é via `funcao` (texto livre)

**Verificação:** No agendamento de OS-05/06, apenas coordenadores aparecem no select

---

## KOD-77 · Custo dia útil — config dias úteis/mês (2 pts, Medium)

**Abordagem:** Inserir chave `dias_uteis_mes` na `configuracoes_rh` + UI para editar + update na RPC.

| Arquivo | Ação |
|---------|------|
| **[MIGRATION]** `add_dias_uteis_config.sql` | `INSERT INTO configuracoes_rh` com chave `dias_uteis_mes`, valor 22 |
| Página de configurações RH | Campo editável "Dias úteis/mês" |
| RPC `calcular_custo_dia` | Usar `dias_uteis_mes` como override quando disponível |
| `use-dias-uteis.ts` | Fallback para config manual |

**Verificação:** Alterar para 20 → custo/dia CLT aumenta proporcionalmente

---

## KOD-78 · Excluir dados de teste (2 pts, Low)

**Abordagem:** Script admin com dry-run + soft delete + audit log.

| Arquivo | Ação |
|---------|------|
| **[NEW]** `scripts/cleanup-test-data.ts` | Script de limpeza com dry-run + confirmação |
| Página admin ou Configurações | Botão para executar limpeza |

**Risco:** Exclusão acidental — mitigar com dry-run obrigatório

**Verificação:** Dry-run lista registros → execução marca como inativos → audit_log registra

---

## KOD-79 · Birthday trigger edge function (2 pts, Low)

**Abordagem:** Trigger DB em `colaboradores` e `clientes` ao alterar `data_nascimento`.

**⚠️ Dependência:** KOD-75 (coluna `data_nascimento` em `clientes`)

| Arquivo | Ação |
|---------|------|
| **[MIGRATION]** `create_aniversarios_trigger.sql` | Trigger AFTER INSERT/UPDATE em `colaboradores`/`clientes` |
| `types.ts` | Adicionar `'aniversario'` ao `BloqueioMotivo` |

**Verificação:** Cadastrar colaborador com nascimento → evento de aniversário aparece automaticamente

---

## Ordem de Implementação

| Sprint | Tasks | Pts | Justificativa |
|--------|-------|-----|---------------|
| **1** | KOD-74 + KOD-76 | 5 | Quick wins, infra existente |
| **2** | KOD-75 + KOD-77 | 4 | Migrations, impacto moderado |
| **3** | KOD-79 + KOD-78 | 4 | Dependências, menor urgência |
