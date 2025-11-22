# 🔐 Manual de Permissões e Controle de Acesso - ERP Minerva

**Última atualização:** 22/11/2025
**Versão:** 2.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Hierarquia de Perfis](#hierarquia-de-perfis)
3. [Módulo Financeiro - Restrições](#módulo-financeiro---restrições)
4. [Permissões por Perfil](#permissões-por-perfil)
5. [Permissões de Ordens de Serviço](#permissões-de-ordens-de-serviço)
6. [Permissões de Delegação](#permissões-de-delegação)
7. [Visibilidade de Menu](#visibilidade-de-menu)
8. [Implementação Técnica](#implementação-técnica)

---

## 🎯 Visão Geral

O ERP Minerva utiliza um **sistema hierárquico de permissões** baseado em roles (perfis de usuário). Cada perfil possui um nível hierárquico que determina suas capacidades no sistema.

### Princípios do Sistema

- **Hierarquia de Níveis**: Quanto maior o nível, mais permissões
- **Separação por Setor**: Alguns perfis têm acesso limitado a setores específicos
- **Delegação Controlada**: Apenas gestores e diretoria podem delegar tarefas
- **Módulo Financeiro Restrito**: Acesso limitado a perfis de alta hierarquia

---

## 📊 Hierarquia de Perfis

| Perfil | Nível | Código | Descrição |
|--------|-------|--------|-----------|
| **Admin** | 10 | `admin` | Acesso total ao sistema (super usuário) |
| **Diretoria** | 9 | `DIRETORIA` | Direção da empresa - Acesso completo |
| **Gestor Administrativo** | 6 | `GESTOR_ADMINISTRATIVO` | Gerente comercial/administrativo |
| **Gestor de Obras** | 5 | `GESTOR_OBRAS` | Gerencia execução de obras |
| **Gestor de Assessoria** | 5 | `GESTOR_ASSESSORIA` | Gerencia laudos e assessoria |
| **Colaborador** | 1 | `COLABORADOR_*` | Colaboradores operacionais |
| **Mão de Obra (MOBRA)** | 0 | `MOBRA` | Sem acesso ao sistema |

---

## 💰 Módulo Financeiro - Restrições

### ⚠️ ACESSO RESTRITO

O **Módulo Financeiro** (contas a pagar/receber, conciliação bancária, fluxo de caixa) é **RESTRITO** aos seguintes perfis:

#### ✅ Perfis com Acesso ao Financeiro

1. **ADMIN** (Nível 10)
   - Acesso total irrestrito

2. **DIRETORIA** (Nível 9)
   - Acesso completo a todas as funcionalidades financeiras
   - Pode visualizar e editar contas a pagar/receber
   - Pode realizar conciliação bancária
   - Pode aprovar despesas e receitas

3. **GESTOR_ADMINISTRATIVO** (Nível 6)
   - Acesso completo ao módulo financeiro
   - Gerencia contas a pagar/receber
   - Realiza conciliação bancária
   - Controla fluxo de caixa

#### ❌ Perfis SEM Acesso ao Financeiro

- **GESTOR_OBRAS** - Gerencia obras, sem acesso financeiro
- **GESTOR_ASSESSORIA** - Gerencia laudos, sem acesso financeiro
- **COLABORADOR_*** - Todos os colaboradores
- **MOBRA** - Sem acesso ao sistema

### Justificativa da Restrição

O módulo financeiro contém **informações sensíveis** como:
- Valores de contratos
- Contas bancárias
- Fluxo de caixa da empresa
- Dados de fornecedores e pagamentos

Por isso, apenas perfis de **alta hierarquia administrativa** têm acesso.

---

## 🔑 Permissões por Perfil

### 1️⃣ ADMIN (Nível 10)

```typescript
✅ Ver todas as OS (Ordens de Serviço)
✅ Acessar módulo financeiro
✅ Delegar tarefas para qualquer setor
✅ Aprovar etapas de workflow
✅ Gerenciar usuários (CRUD completo)
✅ Criar novas OS
✅ Cancelar OS existentes
✅ Editar qualquer OS
✅ Reabrir OS concluídas
```

**Descrição**: Super usuário com acesso irrestrito a todo o sistema.

---

### 2️⃣ DIRETORIA (Nível 9)

```typescript
✅ Ver todas as OS de todos os setores
✅ Acessar módulo financeiro
✅ Delegar para QUALQUER setor (COM, ASS, OBR)
✅ Aprovar etapas de qualquer setor
✅ Gerenciar todos os usuários
✅ Criar OS para qualquer setor
✅ Cancelar qualquer OS
✅ Editar qualquer OS
✅ Reabrir OS concluídas (com justificativa)
```

**Descrição**: Direção da empresa com acesso completo e capacidade de gestão total.

**Setores de Acesso**: `*` (todos)

---

### 3️⃣ GESTOR_ADMINISTRATIVO (Nível 6)

```typescript
✅ Ver todas as OS de todos os setores
✅ Acessar módulo financeiro
✅ Delegar para qualquer setor
✅ Aprovar etapas de todos os setores
❌ Gerenciar usuários (apenas Diretoria)
✅ Criar OS
✅ Cancelar OS
✅ Editar qualquer OS
❌ Reabrir OS (apenas Diretoria)
```

**Descrição**: Gestor comercial/administrativo com acesso financeiro completo.

**Setores de Acesso**: `*` (todos)

---

### 4️⃣ GESTOR_OBRAS (Nível 5)

```typescript
✅ Ver todas as OS (filtradas por setor OBR via RLS)
❌ Acessar módulo financeiro
✅ Delegar apenas para setor OBR (Obras)
✅ Aprovar etapas do setor OBR
❌ Gerenciar usuários
✅ Criar OS do setor OBR
✅ Cancelar OS do setor OBR
✅ Editar OS do setor OBR
❌ Reabrir OS
```

**Descrição**: Gerencia execução de obras - **SEM acesso financeiro**.

**Setores de Acesso**: `OBR` (Obras)

---

### 5️⃣ GESTOR_ASSESSORIA (Nível 5)

```typescript
✅ Ver todas as OS (filtradas por setor ASS via RLS)
❌ Acessar módulo financeiro
✅ Delegar apenas para setor ASS (Assessoria)
✅ Aprovar etapas do setor ASS
❌ Gerenciar usuários
✅ Criar OS do setor ASS
✅ Cancelar OS do setor ASS
✅ Editar OS do setor ASS
❌ Reabrir OS
```

**Descrição**: Gerencia laudos e assessoria - **SEM acesso financeiro**.

**Setores de Acesso**: `ASS` (Assessoria)

---

### 6️⃣ COLABORADOR_* (Nível 1)

```typescript
❌ Ver todas as OS (apenas delegadas para ele)
❌ Acessar módulo financeiro
❌ Delegar tarefas
❌ Aprovar etapas
❌ Gerenciar usuários
✅ Criar OS (depende do tipo de colaborador)
❌ Cancelar OS
❌ Editar OS
❌ Reabrir OS
```

**Descrição**: Colaboradores operacionais com acesso limitado às suas tarefas.

**Tipos de Colaborador**:
- `COLABORADOR_COMERCIAL` - Setor COM
- `COLABORADOR_ASSESSORIA` - Setor ASS
- `COLABORADOR_OBRAS` - Setor OBR
- `COLABORADOR_ADMINISTRATIVO` - Administrativo

---

### 7️⃣ MOBRA (Nível 0)

```typescript
❌ Sem acesso ao sistema web
❌ Sem permissões
```

**Descrição**: Mão de obra sem acesso digital (trabalhadores de campo).

---

## 📋 Permissões de Ordens de Serviço

### Visualização de OS

| Perfil | Pode Ver |
|--------|----------|
| **Admin** | Todas as OS |
| **Diretoria** | Todas as OS |
| **Gestor Administrativo** | Todas as OS |
| **Gestor de Obras** | Apenas OS do setor OBR |
| **Gestor de Assessoria** | Apenas OS do setor ASS |
| **Colaborador** | Apenas OS delegadas para ele |
| **MOBRA** | Nenhuma |

### Criação de OS

| Perfil | Pode Criar OS |
|--------|---------------|
| **Admin** | ✅ Sim |
| **Diretoria** | ✅ Sim |
| **Gestor Administrativo** | ✅ Sim |
| **Gestor de Obras** | ✅ Sim (setor OBR) |
| **Gestor de Assessoria** | ✅ Sim (setor ASS) |
| **Colaborador** | ⚠️ Depende do tipo |
| **MOBRA** | ❌ Não |

### Edição de OS

| Perfil | Pode Editar |
|--------|-------------|
| **Admin** | Todas as OS |
| **Diretoria** | Todas as OS |
| **Gestor Administrativo** | Todas as OS |
| **Gestor de Obras** | Apenas OS do setor OBR |
| **Gestor de Assessoria** | Apenas OS do setor ASS |
| **Colaborador** | ❌ Não pode editar |
| **MOBRA** | ❌ Não |

### Cancelamento de OS

| Perfil | Pode Cancelar |
|--------|---------------|
| **Admin** | ✅ Sim |
| **Diretoria** | ✅ Sim |
| **Gestor Administrativo** | ✅ Sim |
| **Gestor de Obras** | ✅ Sim (setor OBR) |
| **Gestor de Assessoria** | ✅ Sim (setor ASS) |
| **Colaborador** | ❌ Não |
| **MOBRA** | ❌ Não |

### Reabertura de OS Concluídas

| Perfil | Pode Reabrir |
|--------|--------------|
| **Diretoria** | ✅ Sim (com justificativa) |
| **Todos os outros** | ❌ Não |

---

## 🔄 Permissões de Delegação

### Matriz de Delegação

| Perfil Delegante | Pode Delegar Para | Setores Permitidos |
|------------------|-------------------|---------------------|
| **Admin** | Qualquer usuário | `*` (todos) |
| **Diretoria** | Qualquer usuário | `*` (todos) |
| **Gestor Administrativo** | Qualquer colaborador | `*` (todos) |
| **Gestor de Obras** | Colaboradores OBR | `OBR` |
| **Gestor de Assessoria** | Colaboradores ASS | `ASS` |
| **Colaborador** | ❌ Não pode delegar | - |
| **MOBRA** | ❌ Não pode delegar | - |

### Regras de Delegação

1. **MOBRA não pode receber delegações** - Sempre bloqueado
2. **Colaboradores inativos não podem receber delegações**
3. **Gestor de setor só pode delegar para seu setor**
4. **Diretoria e Gestor Administrativo podem delegar para qualquer setor**

---

## 🗂️ Visibilidade de Menu

### Itens do Menu Lateral por Perfil

| Menu Item | Diretoria | Gestores | Colaboradores | MOBRA |
|-----------|-----------|----------|---------------|-------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Ordens de Serviço** | ✅ | ✅ | ✅ | ❌ |
| **Financeiro** | ✅ | ⚠️ Apenas Admin | ❌ | ❌ |
| **Colaboradores** | ✅ | ✅ | ❌ | ❌ |
| **Clientes** | ✅ | ✅ | ✅ | ❌ |
| **Calendário** | ✅ | ✅ | ✅ | ❌ |
| **Configurações** | ✅ | ✅ | ❌ | ❌ |

**Nota**: O item "Financeiro" no menu só aparece para:
- ADMIN
- DIRETORIA
- GESTOR_ADMINISTRATIVO

---

## 🛠️ Implementação Técnica

### Verificação de Permissões no Código

#### Verificar Acesso ao Financeiro

```typescript
import { PermissaoUtil } from '@/lib/auth-utils';

// Verificar se usuário pode acessar financeiro
const podeAcessar = PermissaoUtil.podeAcessarFinanceiro(usuario);

if (!podeAcessar) {
  toast.error('Você não tem permissão para acessar o módulo financeiro');
  return;
}
```

#### Verificar Acesso a uma OS

```typescript
// Verificar se usuário pode visualizar uma OS
const temAcesso = PermissaoUtil.temAcessoAOS(usuario, ordemServico);

if (!temAcesso) {
  return <AcessoNegado />;
}
```

#### Verificar Permissão de Edição

```typescript
// Verificar se pode editar uma OS
const podeEditar = PermissaoUtil.podeEditarOS(usuario, ordemServico);

<Button
  disabled={!podeEditar}
  onClick={handleEditar}
>
  Editar OS
</Button>
```

#### Validar Delegação

```typescript
// Validar se pode delegar uma tarefa
const validacao = PermissaoUtil.validarDelegacao(
  delegante,
  delegado,
  ordemServico
);

if (!validacao.valido) {
  toast.error(validacao.mensagem);
  return;
}
```

### Arquivo de Referência

**Localização**: `/src/lib/auth-utils.ts`

Este arquivo contém a classe `PermissaoUtil` com todos os métodos de verificação de permissões.

### Configuração de Permissões

**Localização**: `/src/lib/types.ts`

O objeto `PERMISSOES_POR_ROLE` define as permissões de cada perfil:

```typescript
export const PERMISSOES_POR_ROLE: Record<RoleLevel, Permissoes> = {
  admin: {
    nivel: 10,
    pode_acessar_financeiro: true,
    // ... outras permissões
  },
  DIRETORIA: {
    nivel: 9,
    pode_acessar_financeiro: true,
    // ... outras permissões
  },
  GESTOR_ADMINISTRATIVO: {
    nivel: 6,
    pode_acessar_financeiro: true, // ✅ TEM ACESSO
    // ... outras permissões
  },
  GESTOR_OBRAS: {
    nivel: 5,
    pode_acessar_financeiro: false, // ❌ SEM ACESSO
    // ... outras permissões
  },
  // ... outros perfis
};
```

---

## 🔒 Segurança - Row Level Security (RLS)

### Políticas de Segurança no Banco

O Supabase implementa **Row Level Security (RLS)** nas tabelas para garantir que:

1. **Gestores de Setor** só veem OS de seu setor
2. **Colaboradores** só veem OS delegadas para eles
3. **Dados financeiros** são bloqueados para perfis sem permissão

### Exemplo de Política RLS

```sql
-- Política para visualização de OS por gestor de setor
CREATE POLICY "gestor_ve_seu_setor" ON ordens_servico
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM usuarios
      WHERE role_nivel LIKE 'GESTOR_%'
      AND setor = ordens_servico.setor
    )
    OR
    auth.uid() IN (
      SELECT id FROM usuarios
      WHERE role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
    )
  );
```

---

## 📝 Resumo de Permissões

### Resumo Rápido

```
┌─────────────────────────────────────────────────────────────────┐
│                  MÓDULO FINANCEIRO - ACESSO                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ ADMIN                     (Nível 10)                        │
│  ✅ DIRETORIA                 (Nível 9)                         │
│  ✅ GESTOR_ADMINISTRATIVO     (Nível 6)                         │
│                                                                 │
│  ❌ GESTOR_OBRAS              (Nível 5) - SEM ACESSO           │
│  ❌ GESTOR_ASSESSORIA         (Nível 5) - SEM ACESSO           │
│  ❌ COLABORADOR_*             (Nível 1) - SEM ACESSO           │
│  ❌ MOBRA                     (Nível 0) - SEM ACESSO           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentação Relacionada

- **[MENU_VISIBILIDADE_README.md](/docs/guides/MENU_VISIBILIDADE_README.md)** - Sistema de visibilidade de menu
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema do banco de dados
- **[USUARIOS_SCHEMA.md](./USUARIOS_SCHEMA.md)** - Schema de usuários
- **[auth-utils.ts](/src/lib/auth-utils.ts)** - Implementação das permissões

---

## 🔄 Histórico de Alterações

| Data | Versão | Alteração |
|------|--------|-----------|
| 22/11/2025 | 2.0 | Documentação completa de permissões com foco no módulo financeiro |
| 17/11/2025 | 1.5 | Sistema de visibilidade de menu implementado |
| 15/11/2025 | 1.0 | Sistema hierárquico de permissões inicial |

---

**Documentação Técnica - ERP Minerva**
**Confidencial - Uso Interno**
