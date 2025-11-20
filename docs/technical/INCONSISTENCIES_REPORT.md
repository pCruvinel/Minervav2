# Relatório de Inconsistências de Tipos

**Data:** 20/11/2025
**Status:** Crítico
**Contexto:** Divergência entre definições de tipos no Frontend (TypeScript), Backend (Edge Functions) e Banco de Dados (PostgreSQL ENUMs).

## 🚨 Resumo das Inconsistências

Identificamos que os tipos utilizados no código TypeScript (`src/lib/types.ts`) não correspondem exatamente aos ENUMs definidos no banco de dados Supabase. O backend (`src/supabase/functions/server/index.tsx`) implementa algumas camadas de normalização para mitigar isso, mas o risco de erros em tempo de execução permanece alto, especialmente para **Roles** e **Setores**.

---

## 1. Níveis de Acesso (Roles)

| Frontend (`RoleLevel`) | Banco de Dados (`user_role_nivel`) | Status |
|------------------------|------------------------------------|--------|
| `DIRETORIA` | `DIRETORIA` | ✅ OK |
| `GESTOR_ADMINISTRATIVO` | `GESTOR_SETOR` (ou `GESTOR_ADM`?) | ❌ **CRÍTICO** |
| `GESTOR_ASSESSORIA` | `GESTOR_SETOR` | ❌ **CRÍTICO** |
| `GESTOR_OBRAS` | `GESTOR_SETOR` | ❌ **CRÍTICO** |
| `COLABORADOR_ADMINISTRATIVO`| `COLABORADOR` | ⚠️ Divergente |
| `COLABORADOR_ASSESSORIA`| `COLABORADOR` | ⚠️ Divergente |
| `COLABORADOR_OBRAS` | `COLABORADOR` | ⚠️ Divergente |
| `MOBRA` | *Não existe* | ❌ **CRÍTICO** |

**Impacto:** O backend verifica permissões comparando strings exatas (ex: `['GESTOR_ADMINISTRATIVO', ...]`). Se o banco retornar `GESTOR_SETOR`, a verificação falhará.

---

## 2. Setores

| Frontend (`Setor`) | Banco de Dados (`user_setor`) | Status |
|--------------------|-------------------------------|--------|
| `COM` | *Não existe* (talvez `ADM`?) | ❌ **CRÍTICO** |
| `ASS` | `ASSESSORIA` | ⚠️ Requer Mapeamento |
| `OBR` | `OBRAS` | ⚠️ Requer Mapeamento |

**Impacto:** Falhas na filtragem de OS por setor e na atribuição de permissões.

---

## 3. Status de Cliente

| Frontend | Banco de Dados (`cliente_status`) | Normalização Backend |
|----------|-----------------------------------|----------------------|
| `ATIVO` | `CLIENTE_ATIVO` | ✅ Sim (`normalizeClienteStatus`) |
| `INATIVO`| `CLIENTE_INATIVO` | ✅ Sim (`normalizeClienteStatus`) |
| `LEAD` | `LEAD` | ✅ OK |

**Situação:** O backend trata isso via função `normalizeClienteStatus`.

---

## 4. Status de Etapa

| Frontend (`EtapaStatus`) | Banco de Dados (`os_etapa_status`) | Normalização Backend |
|--------------------------|------------------------------------|----------------------|
| `CONCLUIDA` (Legado) | `APROVADA` | ✅ Mapeado para `APROVADA` |
| `REPROVADA` (Legado) | `REJEITADA` | ✅ Mapeado para `REJEITADA` |

**Situação:** O backend trata isso via função `normalizeEtapaStatus`.

---

## 🛠️ Recomendações

1.  **Curto Prazo (Backend):** Manter e expandir as funções de normalização no `index.tsx` para cobrir Roles e Setores.
2.  **Médio Prazo (Banco):** Atualizar os ENUMs do banco para refletir a granularidade do Frontend (ex: adicionar `GESTOR_ADMINISTRATIVO`, `GESTOR_OBRAS` ao invés de apenas `GESTOR_SETOR`).
3.  **Longo Prazo (Refatoração):** Unificar as definições de tipos em um pacote compartilhado ou gerar tipos TypeScript automaticamente a partir do Schema do banco (Supabase CLI).
