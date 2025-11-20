# 📊 Sistema de Usuários, Hierarquia e Permissões - Minerva ERP

**Data de Criação**: 19/11/2025
**Última Atualização**: 19/11/2025
**Versão**: 1.0
**Status**: ⚠️ Requer Correções Críticas

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Tipos de Usuários (Roles)](#tipos-de-usuários-roles)
3. [Hierarquia e Setores](#hierarquia-e-setores)
4. [Permissões CRUD por Role](#permissões-crud-por-role)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Inconsistências Identificadas](#inconsistências-identificadas)
7. [Recomendações de Correção](#recomendações-de-correção)

---

## 🎯 Visão Geral

O sistema Minerva ERP implementa um modelo hierárquico de permissões com **4 níveis** e **8 tipos de roles** distribuídos em **3 setores principais**. O controle de acesso é gerenciado através de:

- **Frontend**: Lógica em TypeScript (`src/lib/types.ts` e `src/lib/auth-utils.ts`)
- **Backend**: Row Level Security (RLS) no Supabase PostgreSQL
- **Hierarquia**: Sistema de supervisão e delegação de tarefas

### Arquivos de Referência
- `src/lib/types.ts`: Definição de tipos e permissões
- `src/lib/auth-utils.ts`: Classe `PermissaoUtil` com lógica de negócio
- `src/lib/hooks/use-permissoes.ts`: Hook React para verificação de permissões
- `supabase/migrations/*.sql`: Políticas RLS do banco de dados

---

## 🔐 Tipos de Usuários (Roles)

### Estrutura Hierárquica

```typescript
export type RoleLevel =
  | 'DIRETORIA'              // Nível 4
  | 'GESTOR_COMERCIAL'       // Nível 3
  | 'GESTOR_ASSESSORIA'      // Nível 3
  | 'GESTOR_OBRAS'           // Nível 3
  | 'COLABORADOR_COMERCIAL'  // Nível 2
  | 'COLABORADOR_ASSESSORIA' // Nível 2
  | 'COLABORADOR_OBRAS'      // Nível 2
  | 'MOBRA';                 // Nível 1
```

---

### Nível 4 - Diretoria

#### **DIRETORIA**
- **Descrição**: Nível mais alto da hierarquia
- **Setor**: Acesso a todos os setores (*)
- **Características**:
  - Acesso total ao sistema
  - Pode gerenciar usuários
  - Único que pode reabrir OS concluídas
  - Acesso a dashboards executivos

**Módulos de Acesso**:
- ✅ Administrativo
- ✅ Financeiro
- ✅ Operacional
- ✅ Recursos Humanos

---

### Nível 3 - Gestores

#### **GESTOR_COMERCIAL**
- **Descrição**: Gerente do setor comercial
- **Setor**: COM (mas acessa todos)
- **Características**:
  - Visão global de todas as OS
  - Pode delegar para **qualquer setor**
  - Aprova tarefas do setor COM
  - Acesso ao módulo financeiro
  - Gerencia calendário de agendamentos

**Módulos de Acesso**:
- ✅ Administrativo
- ✅ Financeiro

**Pode Delegar Para**: Todos os setores (*)
**Pode Aprovar**: Setor COM

---

#### **GESTOR_ASSESSORIA**
- **Descrição**: Gerente da Assessoria Técnica
- **Setor**: ASS
- **Características**:
  - Acesso restrito ao setor ASS
  - Pode delegar apenas para ASS
  - Aprova tarefas do setor ASS
  - Não acessa financeiro

**Módulos de Acesso**:
- ✅ Operacional

**Pode Delegar Para**: Apenas ASS
**Pode Aprovar**: Setor ASS

---

#### **GESTOR_OBRAS**
- **Descrição**: Gerente do setor de Obras
- **Setor**: OBR
- **Características**:
  - Acesso restrito ao setor OBR
  - Pode delegar apenas para OBR
  - Aprova tarefas do setor OBR
  - Não acessa financeiro

**Módulos de Acesso**:
- ✅ Operacional

**Pode Delegar Para**: Apenas OBR
**Pode Aprovar**: Setor OBR

---

### Nível 2 - Colaboradores

#### **COLABORADOR_COMERCIAL**
- **Descrição**: Colaborador do setor comercial
- **Setor**: COM
- **Características**:
  - Executa tarefas delegadas
  - Não pode criar OS
  - Não pode delegar
  - Acesso apenas às suas OS

**Módulos de Acesso**:
- ✅ Operacional

**Pode Delegar Para**: ❌ Não pode delegar
**Pode Aprovar**: ❌ Não pode aprovar

---

#### **COLABORADOR_ASSESSORIA**
- **Descrição**: Colaborador da Assessoria Técnica
- **Setor**: ASS
- **Características**: Idênticas ao Colaborador Comercial

**Módulos de Acesso**:
- ✅ Operacional

**Pode Delegar Para**: ❌ Não pode delegar
**Pode Aprovar**: ❌ Não pode aprovar

---

#### **COLABORADOR_OBRAS**
- **Descrição**: Colaborador do setor de Obras
- **Setor**: OBR
- **Características**: Idênticas ao Colaborador Comercial

**Módulos de Acesso**:
- ✅ Operacional

**Pode Delegar Para**: ❌ Não pode delegar
**Pode Aprovar**: ❌ Não pode aprovar

---

### Nível 1 - Mão de Obra

#### **MOBRA**
- **Descrição**: Mão de obra sem acesso ao sistema
- **Setor**: N/A
- **Características**:
  - **SEM ACESSO AO SISTEMA**
  - Apenas registro de presença
  - Gerenciado por gestores

**Módulos de Acesso**:
- ❌ Nenhum

---

## 🏢 Hierarquia e Setores

### Setores do Sistema

```typescript
export type Setor = 'COM' | 'ASS' | 'OBR';

export const SETOR_NAMES: Record<Setor, string> = {
  'COM': 'Comercial',
  'ASS': 'Assessoria Técnica',
  'OBR': 'Obras',
};
```

### Pirâmide Hierárquica

```
                    ┌──────────────────────┐
                    │     DIRETORIA        │
                    │   (Nível 4)          │
                    │   Todos Setores      │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────┴─────────┐  ┌──────┴────────┐  ┌───────┴────────┐
│ GESTOR_COMERCIAL  │  │    GESTOR     │  │     GESTOR     │
│   (Nível 3)       │  │  ASSESSORIA   │  │     OBRAS      │
│ Acesso: Todos (*)│  │  (Nível 3)    │  │   (Nível 3)    │
│ Setor: COM        │  │  Setor: ASS   │  │   Setor: OBR   │
└─────────┬─────────┘  └──────┬────────┘  └───────┬────────┘
          │                   │                    │
          │                   │                    │
┌─────────┴─────────┐  ┌──────┴────────┐  ┌───────┴────────┐
│  COLABORADOR_COM  │  │ COLABORADOR   │  │  COLABORADOR   │
│   (Nível 2)       │  │     ASS       │  │      OBR       │
│   Setor: COM      │  │  (Nível 2)    │  │  (Nível 2)     │
└───────────────────┘  └───────────────┘  └────────────────┘

            ┌──────────────────────┐
            │       MOBRA          │
            │    (Nível 1)         │
            │  Sem acesso sistema  │
            └──────────────────────┘
```

### Regras de Acesso por Setor

| Role | COM | ASS | OBR |
|------|-----|-----|-----|
| **DIRETORIA** | ✅ | ✅ | ✅ |
| **GESTOR_COMERCIAL** | ✅ | ✅ | ✅ |
| **GESTOR_ASSESSORIA** | ❌ | ✅ | ❌ |
| **GESTOR_OBRAS** | ❌ | ❌ | ✅ |
| **COLABORADOR_COMERCIAL** | ✅ | ❌ | ❌ |
| **COLABORADOR_ASSESSORIA** | ❌ | ✅ | ❌ |
| **COLABORADOR_OBRAS** | ❌ | ❌ | ✅ |
| **MOBRA** | ❌ | ❌ | ❌ |

---

## 📝 Permissões CRUD por Role

### Tabela Resumida de Permissões

| Recurso | DIRETORIA | GESTOR_COM | GESTOR_ASS/OBR | COLABORADOR | MOBRA |
|---------|-----------|------------|----------------|-------------|-------|
| **Criar OS** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ver OS** | Todas | Todas | Seu setor | Delegadas | ❌ |
| **Editar OS** | Todas | Todas | Seu setor | ❌ | ❌ |
| **Reabrir OS** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Criar Delegação** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ver Delegações** | Todas | Todas | Suas | Suas | ❌ |
| **Aprovar Tarefas** | Todos setores | Setor COM | Seu setor | ❌ | ❌ |
| **Ver Clientes** | Todos | Todos | Seu setor | Relacionados | ❌ |
| **Gerenciar Usuários** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Acesso Financeiro** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gerenciar Agendamentos** | ✅ | ✅ | Seu setor | Próprios | ❌ |

---

### Detalhamento por Role

#### 1. DIRETORIA

| Recurso | CREATE | READ | UPDATE | DELETE | Observações |
|---------|--------|------|--------|--------|-------------|
| **Ordens de Serviço** | ✅ | ✅ Todas | ✅ Todas | ✅ | Acesso total, pode reabrir concluídas |
| **Clientes** | ✅ | ✅ Todos | ✅ Todos | ✅ | Acesso total |
| **Usuários** | ✅ | ✅ Todos | ✅ Todos | ✅ | Único que gerencia usuários |
| **Delegações** | ✅ | ✅ Todas | ✅ Todas | ✅ | Pode delegar para qualquer setor |
| **Financeiro** | ✅ | ✅ Tudo | ✅ Tudo | ✅ | Acesso completo ao módulo |
| **Agendamentos** | ✅ | ✅ Todos | ✅ Todos | ✅ | Gerencia calendário completo |
| **Centros de Custo** | ✅ | ✅ Todos | ✅ Todos | ✅ | Acesso total |

---

#### 2. GESTOR_COMERCIAL

| Recurso | CREATE | READ | UPDATE | DELETE | Observações |
|---------|--------|------|--------|--------|-------------|
| **Ordens de Serviço** | ✅ | ✅ Todas | ✅ Todas | ❌ | Vê e edita todas as OS |
| **Clientes** | ✅ | ✅ Todos | ✅ Todos | ❌ | Acesso a todos clientes |
| **Usuários** | ❌ | ✅ Todos | ❌ | ❌ | Apenas visualiza |
| **Delegações** | ✅ | ✅ Todas | ✅ Próprias | ❌ | Delega para todos os setores |
| **Financeiro** | ✅ | ✅ Tudo | ✅ Tudo | ❌ | Acesso ao módulo financeiro |
| **Agendamentos** | ✅ | ✅ Todos | ✅ Todos | ✅ | Gerencia calendário |
| **Centros de Custo** | ✅ | ✅ Todos | ✅ Seus | ❌ | Acesso a todos |

**Notas Especiais**:
- Pode aprovar tarefas apenas do setor COM
- Visibilidade global, mas autoridade no setor COM

---

#### 3. GESTOR_ASSESSORIA / GESTOR_OBRAS

| Recurso | CREATE | READ | UPDATE | DELETE | Observações |
|---------|--------|------|--------|--------|-------------|
| **Ordens de Serviço** | ✅ | ✅ Setor | ✅ Setor | ❌ | Apenas do seu setor |
| **Clientes** | ❌ | ✅ Setor | ❌ | ❌ | Relacionados às suas OS |
| **Usuários** | ❌ | ✅ Setor | ❌ | ❌ | Apenas do seu setor |
| **Delegações** | ✅ | ✅ Próprias | ✅ Próprias | ⚠️ Pendentes | Delega apenas no setor |
| **Financeiro** | ❌ | ❌ | ❌ | ❌ | Sem acesso |
| **Agendamentos** | ✅ | ✅ Setor | ✅ Próprios | ❌ | Do seu setor |
| **Centros de Custo** | ❌ | ✅ Setor | ❌ | ❌ | Apenas visualiza |

**Notas Especiais**:
- GESTOR_ASSESSORIA: delega apenas para ASS, aprova apenas ASS
- GESTOR_OBRAS: delega apenas para OBR, aprova apenas OBR

---

#### 4. COLABORADOR_* (Comercial, Assessoria, Obras)

| Recurso | CREATE | READ | UPDATE | DELETE | Observações |
|---------|--------|------|--------|--------|-------------|
| **Ordens de Serviço** | ❌ | ✅ Delegadas | ❌ | ❌ | Apenas OS delegadas para si |
| **Clientes** | ❌ | ✅ Relacionados | ❌ | ❌ | Apenas das suas OS |
| **Usuários** | ❌ | ✅ Próprio | ❌ | ❌ | Apenas seu perfil |
| **Delegações** | ❌ | ✅ Próprias | ⚠️ Status | ❌ | Atualiza status das suas tarefas |
| **Financeiro** | ❌ | ❌ | ❌ | ❌ | Sem acesso |
| **Agendamentos** | ✅ | ✅ Próprios | ✅ Próprios | ❌ | Apenas seus agendamentos |
| **Centros de Custo** | ❌ | ❌ | ❌ | ❌ | Sem acesso |

**Notas Especiais**:
- Pode atualizar apenas status e observações de delegações
- Não pode criar novas OS
- Acesso muito restrito ao sistema

---

#### 5. MOBRA

| Recurso | CREATE | READ | UPDATE | DELETE | Observações |
|---------|--------|------|--------|--------|-------------|
| **Todos** | ❌ | ❌ | ❌ | ❌ | **SEM ACESSO AO SISTEMA** |

**Uso**: Apenas registro de presença gerenciado por gestores

---

## 🔒 Row Level Security (RLS)

### Status de Implementação

#### ✅ Tabelas COM RLS Implementado

##### **1. delegacoes**

**Políticas Implementadas** (`create_delegacoes_table.sql`):

```sql
-- 1. Delegante e delegado visualizam suas delegações
CREATE POLICY "delegacao_view_own"
ON delegacoes FOR SELECT
USING (
  auth.uid() = delegante_id OR
  auth.uid() = delegado_id
);

-- 2. Diretoria visualiza todas as delegações
CREATE POLICY "delegacao_view_diretoria"
ON delegacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- 3. Apenas gestores+ podem criar delegações
CREATE POLICY "delegacao_create_managers"
ON delegacoes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS', 'DIRETORIA')
  )
);

-- 4. Delegante atualiza suas delegações
CREATE POLICY "delegacao_update_delegante"
ON delegacoes FOR UPDATE
USING (auth.uid() = delegante_id);

-- 5. Delegado atualiza status/observações
CREATE POLICY "delegacao_update_delegado"
ON delegacoes FOR UPDATE
USING (auth.uid() = delegado_id)
WITH CHECK (
  -- Não pode alterar campos estruturais
  OLD.os_id = NEW.os_id AND
  OLD.delegante_id = NEW.delegante_id AND
  OLD.delegado_id = NEW.delegado_id AND
  OLD.descricao_tarefa = NEW.descricao_tarefa
);

-- 6. Diretoria atualiza todas
CREATE POLICY "delegacao_update_diretoria"
ON delegacoes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- 7. Delegante deleta apenas PENDENTES
CREATE POLICY "delegacao_delete_delegante"
ON delegacoes FOR DELETE
USING (
  auth.uid() = delegante_id AND
  status_delegacao = 'PENDENTE'
);
```

**Status**: ✅ Implementado corretamente

---

##### **2. turnos**

**Políticas Implementadas** (`create_calendario_tables.sql`):

```sql
-- 1. Todos visualizam turnos ativos
CREATE POLICY "Turnos ativos são visíveis para todos"
ON turnos FOR SELECT
USING (ativo = true);

-- 2. Apenas admins gerenciam turnos
CREATE POLICY "Apenas admins podem gerenciar turnos"
ON turnos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')
  )
);
```

**Status**: ⚠️ Usa campo `tipo_colaborador` que não existe (deveria ser `role_nivel`)

---

##### **3. agendamentos**

**Políticas Implementadas** (`create_calendario_tables.sql`):

```sql
-- 1. Todos visualizam agendamentos confirmados
CREATE POLICY "Agendamentos confirmados são visíveis para todos"
ON agendamentos FOR SELECT
USING (status IN ('confirmado', 'realizado'));

-- 2. Usuários criam seus agendamentos
CREATE POLICY "Usuários podem criar agendamentos"
ON agendamentos FOR INSERT
WITH CHECK (auth.uid() = criado_por);

-- 3. Usuários gerenciam seus agendamentos
CREATE POLICY "Usuários podem gerenciar seus agendamentos"
ON agendamentos FOR UPDATE
USING (auth.uid() = criado_por);

-- 4. Admins gerenciam todos
CREATE POLICY "Admins podem gerenciar todos agendamentos"
ON agendamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')
  )
);
```

**Status**: ⚠️ Usa campo `tipo_colaborador` que não existe (deveria ser `role_nivel`)

---

#### ❌ Tabelas SEM RLS (CRÍTICO)

As seguintes tabelas **NÃO** possuem RLS implementado, representando **risco de segurança crítico**:

1. **colaboradores**
   - Qualquer usuário autenticado pode ver todos os colaboradores
   - Pode alterar dados de outros usuários

2. **ordens_servico**
   - Qualquer usuário pode ver todas as OS
   - Pode editar OS de outros setores

3. **os_etapas**
   - Acesso irrestrito a todas as etapas

4. **os_anexos**
   - Anexos de todas as OS visíveis

5. **clientes**
   - Todos os clientes visíveis para qualquer usuário

6. **centros_custo**
   - Dados financeiros expostos

7. **financeiro_lancamentos**
   - Lançamentos financeiros sem proteção

8. **audit_log**
   - Logs de auditoria sem RLS

9. **os_historico_status**
   - Histórico completo sem proteção

---

### Políticas RLS Recomendadas

#### Para **colaboradores**

```sql
-- Diretoria vê todos
CREATE POLICY "colaboradores_view_diretoria"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'DIRETORIA'
  )
);

-- Gestor Comercial vê todos
CREATE POLICY "colaboradores_view_gestor_comercial"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'GESTOR_COMERCIAL'
  )
);

-- Gestor de Setor vê seu setor
CREATE POLICY "colaboradores_view_gestor_setor"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND colaboradores.setor = c.setor
  )
);

-- Colaborador vê apenas si mesmo
CREATE POLICY "colaboradores_view_self"
ON colaboradores FOR SELECT
USING (id = auth.uid());
```

---

#### Para **ordens_servico**

```sql
-- Diretoria vê todas
CREATE POLICY "os_view_diretoria"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- Gestor Comercial vê todas
CREATE POLICY "os_view_gestor_comercial"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'GESTOR_COMERCIAL'
  )
);

-- Gestor de Setor vê seu setor
CREATE POLICY "os_view_gestor_setor"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND ordens_servico.setor = colaboradores.setor
  )
);

-- Colaborador vê OS delegadas para ele
CREATE POLICY "os_view_colaborador"
ON ordens_servico FOR SELECT
USING (
  responsavel_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM delegacoes
    WHERE delegacoes.os_id = ordens_servico.id
    AND delegacoes.delegado_id = auth.uid()
  )
);
```

---

## ⚠️ Inconsistências Identificadas

### 🔴 CRÍTICAS - Ação Imediata

#### 1. RLS Ausente em Tabelas Principais
**Problema**: Tabelas críticas não possuem RLS
**Risco**: Qualquer usuário autenticado pode acessar/modificar todos os dados
**Afeta**: `ordens_servico`, `colaboradores`, `clientes`, `os_etapas`, `os_anexos`, `centros_custo`, `financeiro_lancamentos`
**Ação**: Implementar políticas RLS urgentemente

**Impacto**: 🔴 CRÍTICO - Dados expostos sem controle de acesso

---

#### 2. Conflito de Nomenclatura - Roles
**Problema**: Divergência entre código TypeScript e schema do banco

**No Código TypeScript** (`src/lib/types.ts`):
```typescript
'DIRETORIA'
'GESTOR_COMERCIAL'
'GESTOR_ASSESSORIA'
'GESTOR_OBRAS'
'COLABORADOR_COMERCIAL'
'COLABORADOR_ASSESSORIA'
'COLABORADOR_OBRAS'
'MOBRA'
```

**Na Documentação** (`DATABASE_SCHEMA.md`):
```sql
CREATE TYPE user_role_nivel AS ENUM (
  'COLABORADOR',
  'COORDENADOR',
  'GESTOR',
  'DIRETOR'
);
```

**Ação**:
1. Verificar ENUM real no banco via Supabase
2. Se incorreto, criar migration para alterar ENUM
3. Atualizar documentação

**Impacto**: 🔴 CRÍTICO - Sistema pode não funcionar corretamente

---

#### 3. Conflito de Nomenclatura - Setores
**Problema**: Divergência nos setores

**No Código TypeScript**:
```typescript
type Setor = 'COM' | 'ASS' | 'OBR';
```

**Na Documentação**:
```sql
CREATE TYPE setor_colaborador AS ENUM (
  'ADM',
  'OBRAS',
  'LABORATORIO',
  'FINANCEIRO',
  'COMERCIAL'
);
```

**Ação**:
1. Verificar ENUM real no banco
2. Normalizar para usar códigos curtos (COM, ASS, OBR) ou nomes completos
3. Atualizar código e banco conforme decisão

**Impacto**: 🔴 CRÍTICO - Inconsistência de dados

---

#### 4. Referência Incorreta em Políticas RLS
**Problema**: Políticas RLS usam campo inexistente

**Exemplo em** `create_calendario_tables.sql`:
```sql
-- ERRADO
WHERE colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')

-- CORRETO
WHERE colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
```

**Afeta**: Tabelas `turnos` e `agendamentos`
**Ação**: Corrigir políticas RLS

**Impacto**: 🔴 ALTO - Políticas RLS não funcionam

---

### 🟡 MODERADAS - Ação em Breve

#### 5. Lógica de Delegação do Gestor Comercial
**Problema**: Gestor Comercial pode delegar para todos os setores, mas seu setor é COM

**Código atual**:
```typescript
'GESTOR_COMERCIAL': {
  pode_delegar_para: ['*'],  // Todos os setores
  setor: 'COM'
}
```

**Questão**: Isso está correto ou deveria delegar apenas para COM?
**Ação**: Validar regra de negócio com stakeholders

**Impacto**: 🟡 MODERADO - Pode ser comportamento esperado

---

#### 6. Permissão de Reabrir OS
**Problema**: Lógica apenas no frontend

**Código atual**:
```typescript
static podeReabrirOS(usuario: User, os: OrdemServico): boolean {
  return this.ehDiretoria(usuario) && os.status === 'CONCLUIDA';
}
```

**Ação**:
1. Criar campo `reaberta_por_id` em `ordens_servico` (já existe segundo types.ts)
2. Implementar policy RLS para reabertura
3. Adicionar trigger de auditoria

**Impacto**: 🟡 MODERADO - Controle insuficiente

---

#### 7. Colaborador Não Pode Criar OS
**Problema**: Colaboradores não criam OS, mas preenchem follow-ups

**Questão**: Como funciona o fluxo inicial?
- Gestor cria OS e delega?
- Ou follow-up não é considerado "criar OS"?

**Ação**: Documentar fluxo completo de criação de OS

**Impacto**: 🟡 BAIXO - Precisa clarificação

---

### 🟢 MENORES - Melhorias

#### 8. Documentação Desatualizada
**Problema**: `DATABASE_SCHEMA.md` não reflete código atual
**Ação**: Atualizar documento de schema
**Impacto**: 🟢 BAIXO - Documentação

---

#### 9. Falta de Stored Procedures
**Problema**: Lógica de permissões apenas no frontend
**Ação**: Criar funções SQL para validação de permissões
**Benefício**: Segurança adicional no banco
**Impacto**: 🟢 BAIXO - Melhoria de arquitetura

---

#### 10. Falta Auditoria de Permissões
**Problema**: Mudanças de permissões não são auditadas
**Ação**: Adicionar triggers em `colaboradores.role_nivel`
**Impacto**: 🟢 BAIXO - Auditoria

---

## ✅ Recomendações de Correção

### 🔴 Prioridade CRÍTICA (Fazer AGORA)

#### 1. Implementar RLS em Todas as Tabelas Principais

**Ordem de Prioridade**:
1. `ordens_servico` (maior risco)
2. `colaboradores` (dados sensíveis)
3. `clientes` (dados pessoais)
4. `os_etapas` (dados de trabalho)
5. `os_anexos` (documentos)
6. `financeiro_lancamentos` (dados financeiros)
7. `centros_custo` (custos)

**Arquivo a Criar**: `supabase/migrations/add_rls_to_main_tables.sql`

---

#### 2. Corrigir ENUMs do Banco

**Verificar via SQL**:
```sql
-- Ver ENUMs existentes
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role_nivel', 'setor_colaborador')
ORDER BY t.typname, e.enumsortorder;
```

**Se incorretos, criar migration**:
```sql
-- Alterar ENUM de roles
ALTER TYPE user_role_nivel RENAME TO user_role_nivel_old;

CREATE TYPE user_role_nivel AS ENUM (
  'MOBRA',
  'COLABORADOR_COMERCIAL',
  'COLABORADOR_ASSESSORIA',
  'COLABORADOR_OBRAS',
  'GESTOR_COMERCIAL',
  'GESTOR_ASSESSORIA',
  'GESTOR_OBRAS',
  'DIRETORIA'
);

ALTER TABLE colaboradores
  ALTER COLUMN role_nivel TYPE user_role_nivel
  USING role_nivel::text::user_role_nivel;

DROP TYPE user_role_nivel_old;
```

---

#### 3. Corrigir Políticas RLS Existentes

**Arquivo**: `supabase/migrations/fix_existing_rls_policies.sql`

```sql
-- Corrigir turnos
DROP POLICY IF EXISTS "Apenas admins podem gerenciar turnos" ON turnos;

CREATE POLICY "Apenas admins podem gerenciar turnos"
ON turnos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);

-- Corrigir agendamentos
DROP POLICY IF EXISTS "Admins podem gerenciar todos agendamentos" ON agendamentos;

CREATE POLICY "Admins podem gerenciar todos agendamentos"
ON agendamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);
```

---

### 🟡 Prioridade ALTA (Próxima Sprint)

#### 4. Criar Views de Permissões

```sql
-- View para permissões do usuário
CREATE OR REPLACE VIEW v_user_permissions AS
SELECT
  c.id,
  c.nome_completo,
  c.role_nivel,
  c.setor,
  CASE
    WHEN c.role_nivel = 'DIRETORIA' THEN true
    ELSE false
  END AS pode_gerenciar_usuarios,
  CASE
    WHEN c.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN true
    ELSE false
  END AS pode_criar_os,
  CASE
    WHEN c.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN true
    ELSE false
  END AS pode_delegar
FROM colaboradores c;
```

---

#### 5. Criar Funções de Validação

```sql
-- Função para validar se pode ver OS
CREATE OR REPLACE FUNCTION pode_ver_os(
  p_user_id UUID,
  p_os_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
  v_setor text;
  v_os_setor text;
BEGIN
  -- Buscar role e setor do usuário
  SELECT role_nivel, setor INTO v_role, v_setor
  FROM colaboradores
  WHERE id = p_user_id;

  -- Buscar setor da OS
  SELECT setor INTO v_os_setor
  FROM ordens_servico
  WHERE id = p_os_id;

  -- Diretoria vê tudo
  IF v_role = 'DIRETORIA' THEN
    RETURN true;
  END IF;

  -- Gestor Comercial vê tudo
  IF v_role = 'GESTOR_COMERCIAL' THEN
    RETURN true;
  END IF;

  -- Gestor de Setor vê seu setor
  IF v_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') AND v_setor = v_os_setor THEN
    RETURN true;
  END IF;

  -- Colaborador vê se foi delegado
  IF v_role LIKE 'COLABORADOR_%' THEN
    RETURN EXISTS (
      SELECT 1 FROM delegacoes
      WHERE os_id = p_os_id
      AND delegado_id = p_user_id
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### 6. Adicionar Triggers de Auditoria

```sql
-- Trigger para mudanças de role
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role_nivel IS DISTINCT FROM NEW.role_nivel THEN
    INSERT INTO audit_log (
      usuario_id,
      acao,
      tabela_afetada,
      registro_id_afetado,
      dados_antigos,
      dados_novos
    ) VALUES (
      auth.uid(),
      'UPDATE_ROLE',
      'colaboradores',
      NEW.id::text,
      jsonb_build_object('role_nivel', OLD.role_nivel),
      jsonb_build_object('role_nivel', NEW.role_nivel)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_role_change
  AFTER UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION audit_role_change();
```

---

### 🟢 Prioridade MÉDIA (Melhorias)

#### 7. Atualizar Documentação

- [ ] Atualizar `DATABASE_SCHEMA.md` com ENUMs corretos
- [ ] Criar diagrama de fluxo de permissões
- [ ] Documentar casos de uso de delegação
- [ ] Criar guia de troubleshooting de permissões

---

#### 8. Criar Testes Automatizados

```sql
-- Suite de testes para permissões
CREATE OR REPLACE FUNCTION test_permissions()
RETURNS TABLE (
  test_name text,
  passed boolean,
  message text
) AS $$
BEGIN
  -- Teste 1: Colaborador não vê OS de outros setores
  RETURN QUERY
  SELECT
    'Colaborador isolation'::text,
    NOT EXISTS (
      SELECT 1 FROM ordens_servico
      WHERE setor != (SELECT setor FROM colaboradores WHERE id = auth.uid())
    ) AS passed,
    'Colaborador should only see own sector OS'::text;

  -- Mais testes...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### 9. Implementar Rate Limiting

```sql
-- Proteção contra tentativas de acesso não autorizado
CREATE TABLE failed_permission_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES colaboradores(id),
  attempted_resource text,
  attempted_action text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para registrar tentativa
CREATE OR REPLACE FUNCTION log_failed_permission(
  p_resource text,
  p_action text
)
RETURNS void AS $$
BEGIN
  INSERT INTO failed_permission_attempts (
    user_id,
    attempted_resource,
    attempted_action
  ) VALUES (
    auth.uid(),
    p_resource,
    p_action
  );

  -- Se mais de 10 tentativas em 1 hora, bloquear
  IF (
    SELECT COUNT(*)
    FROM failed_permission_attempts
    WHERE user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 hour'
  ) > 10 THEN
    RAISE EXCEPTION 'Too many failed permission attempts';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📚 Referências de Código

### Arquivos Principais

#### Frontend
- **`src/lib/types.ts`**: Definições de tipos, roles, permissões
- **`src/lib/auth-utils.ts`**: Classe `PermissaoUtil` com lógica de negócio
- **`src/lib/hooks/use-permissoes.ts`**: Hook React para verificação
- **`src/lib/contexts/auth-context.tsx`**: Contexto de autenticação

#### Backend
- **`supabase/migrations/create_delegacoes_table.sql`**: RLS de delegações
- **`supabase/migrations/create_calendario_tables.sql`**: RLS de calendário

#### Documentação
- **`src/DATABASE_SCHEMA.md`**: Schema do banco (⚠️ desatualizado)
- **`src/docs/usuarios-sistema.md`**: Este documento

---

## 📊 Checklist de Implementação

### Fase 1 - Correções Críticas (Semana 1)

- [ ] Verificar ENUMs reais no banco via SQL
- [ ] Criar migration para corrigir ENUMs (se necessário)
- [ ] Implementar RLS em `ordens_servico`
- [ ] Implementar RLS em `colaboradores`
- [ ] Implementar RLS em `clientes`
- [ ] Corrigir políticas RLS existentes (turnos/agendamentos)
- [ ] Testar acesso de cada role em ambiente de DEV

---

### Fase 2 - Complementos (Semana 2)

- [ ] Implementar RLS em `os_etapas`
- [ ] Implementar RLS em `os_anexos`
- [ ] Implementar RLS em `financeiro_lancamentos`
- [ ] Implementar RLS em `centros_custo`
- [ ] Criar views de permissões
- [ ] Criar funções de validação SQL

---

### Fase 3 - Melhorias (Semana 3-4)

- [ ] Adicionar triggers de auditoria
- [ ] Criar testes automatizados
- [ ] Atualizar documentação completa
- [ ] Criar guia de troubleshooting
- [ ] Implementar rate limiting
- [ ] Code review completo

---

## 🚨 Avisos Importantes

### ⚠️ Antes de Deploy em Produção

1. **NUNCA** fazer deploy sem RLS nas tabelas principais
2. **SEMPRE** testar cada role em ambiente isolado
3. **VERIFICAR** se migrations não quebram dados existentes
4. **FAZER BACKUP** completo do banco antes de alterar ENUMs
5. **DOCUMENTAR** todas as mudanças de permissões

### 🔒 Segurança

- RLS é a **última linha de defesa**
- Mesmo com lógica no frontend, **sempre validar no backend**
- **Nunca** confiar apenas em `auth.uid()` - sempre verificar role
- **Logs** de tentativas de acesso não autorizado são essenciais

### 📝 Manutenção

- Revisar permissões a cada **3 meses**
- Auditar acessos suspeitos **semanalmente**
- Atualizar documentação a cada **mudança**
- Treinar novos desenvolvedores em **permissões**

---

## 📞 Contato e Suporte

**Equipe de Desenvolvimento**: Minerva ERP
**Documento Mantido Por**: Equipe de Backend
**Última Revisão**: 19/11/2025
**Próxima Revisão**: 19/02/2026

---

**FIM DO DOCUMENTO**
