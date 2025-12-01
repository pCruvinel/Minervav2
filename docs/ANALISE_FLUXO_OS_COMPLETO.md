# 📊 Análise Completa: Fluxos de Ordem de Serviço

> **Data:** 2025-12-01
> **Analista:** Claude (Analista de Negócios e Engenheiro de Backend)
> **Objetivo:** Analisar integridade, segurança e resiliência dos fluxos de OS

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Arquitetura Atual](#arquitetura-atual)
3. [Problemas Críticos Identificados](#problemas-críticos-identificados)
4. [Análise de Edge Cases](#análise-de-edge-cases)
5. [Validações de Segurança](#validações-de-segurança)
6. [Propostas de Solução](#propostas-de-solução)
7. [Roadmap de Implementação](#roadmap-de-implementação)

---

## 🎯 Resumo Executivo

### Status Atual: ⚠️ **CRÍTICO** - Vulnerabilidades de Integridade e Segurança

**Problemas de Alta Prioridade Identificados:**

| Categoria | Severidade | Descrição | Impacto |
|-----------|-----------|-----------|---------|
| Consistência de Estados | 🔴 **CRÍTICO** | Sem validação de transições de estado | OS podem travar em etapas inválidas |
| Race Conditions | 🔴 **CRÍTICO** | Atualizações concorrentes sem controle | Dados podem ser sobrescritos |
| Validações de Permissão | 🔴 **CRÍTICO** | RLS policies muito permissivas | Usuários podem fazer operações não autorizadas |
| Salvamento de Dados | 🟡 **ALTO** | Validação apenas no frontend | Dados corrompidos no banco |
| Resiliência de Conexão | 🟡 **ALTO** | Sem retry logic ou timeout | Dados inconsistentes se conexão cair |

---

## 🏗️ Arquitetura Atual

### Estrutura de Dados

#### 1. Tabela `ordens_servico`

```sql
CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_os VARCHAR(50) UNIQUE NOT NULL,
  status_geral os_status_geral NOT NULL, -- enum: em_triagem, em_andamento, concluida, cancelada
  descricao TEXT,

  -- Relacionamentos
  cliente_id UUID REFERENCES clientes(id),
  tipo_os_id UUID REFERENCES tipos_os(id),
  responsavel_id UUID REFERENCES colaboradores(id),
  criado_por_id UUID REFERENCES colaboradores(id),
  cc_id UUID REFERENCES centros_custo(id),

  -- Valores
  valor_proposta DECIMAL(15,2),
  valor_contrato DECIMAL(15,2),

  -- Datas
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_prazo TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Possíveis Status:**
- `em_triagem` - OS criada, aguardando atribuição
- `em_andamento` - Em execução de etapas
- `aguardando_aprovacao` - Aguardando aprovação de gestor
- `concluida` - Todas etapas concluídas
- `cancelada` - OS cancelada

#### 2. Tabela `os_etapas`

```sql
CREATE TABLE os_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,

  ordem INTEGER NOT NULL, -- Número sequencial da etapa (1-15)
  nome_etapa VARCHAR(255) NOT NULL,
  status os_etapa_status NOT NULL, -- enum: pendente, em_andamento, concluida, bloqueada, cancelada

  dados_etapa JSONB DEFAULT '{}', -- Dados do formulário da etapa

  -- Responsabilidade
  responsavel_id UUID REFERENCES colaboradores(id),
  aprovador_id UUID REFERENCES colaboradores(id),

  -- Datas
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,

  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(os_id, ordem)
);
```

**Possíveis Status de Etapa:**
- `pendente` - Não iniciada
- `em_andamento` - Sendo executada
- `concluida` - Finalizada com sucesso
- `bloqueada` - Bloqueada por dependência
- `cancelada` - Cancelada

### Fluxo de 15 Etapas (OS 01-04)

**Etapas do Workflow:**

| # | Etapa | Responsável | Campos Críticos | Validação Schema |
|---|-------|-------------|-----------------|------------------|
| 1 | Identificação do Cliente | Administrativo | `leadId`, `nome` | ✅ Sim (`etapa1Schema`) |
| 2 | Seleção do Tipo de OS | Administrativo | `tipoOS` | ✅ Sim (`etapa2Schema`) |
| 3 | Follow-up 1 (Entrevista) | Administrativo | 7 campos obrigatórios | ✅ Sim (`etapa3Schema`) |
| 4 | Agendar Visita Técnica | Administrativo | `agendamentoId` ou `dataVisita` | ✅ Sim (`etapa4Schema`) |
| 5 | Realizar Visita | Obras | `visitaRealizada` | ✅ Sim (`etapa5Schema`) |
| 6 | Follow-up 2 (Pós-Visita) | Obras | 8 campos obrigatórios | ✅ Sim (`etapa6Schema`) |
| 7 | Memorial (Escopo) | Obras | `objetivo`, `etapasPrincipais` | ✅ Sim (`etapa7Schema`) |
| 8 | Precificação | Obras | Cálculos financeiros | ✅ Sim (`etapa8Schema`) |
| 9 | Gerar Proposta | Administrativo | Dados da proposta | ✅ Sim (`etapa9Schema`) |
| 10 | Agendar Apresentação | Administrativo | Data/hora | ✅ Sim (`etapa10Schema`) |
| 11 | Realizar Apresentação | Administrativo | Confirmação | ✅ Sim (`etapa11Schema`) |
| 12 | Follow-up 3 | Administrativo | Feedback cliente | ✅ Sim (`etapa12Schema`) |
| 13 | Gerar Contrato | Administrativo | Upload contrato | ✅ Sim (`etapa13Schema`) |
| 14 | Contrato Assinado | Administrativo | Confirmação assinatura | ✅ Sim (`etapa14Schema`) |
| 15 | Iniciar Obra | Sistema | Dados iniciais obra | ✅ Sim (`etapa15Schema`) |

### Camada de API

**Edge Function: `server/index.ts`**

Endpoints principais:
- `POST /server/ordens-servico` - Criar OS
- `PUT /server/ordens-servico/:id` - Atualizar OS
- `GET /server/ordens-servico/:osId/etapas` - Listar etapas
- `POST /server/ordens-servico/:osId/etapas` - Criar etapa
- `PUT /server/etapas/:id` - Atualizar etapa

**⚠️ PROBLEMA CRÍTICO:** Edge Function usa `SUPABASE_SERVICE_ROLE_KEY`, **bypassando completamente as Row Level Security policies!**

---

## 🔴 Problemas Críticos Identificados

### 1. Consistência de Estados - CRÍTICO

#### Problema

**Não há máquina de estados definida para transições de OS e Etapas.**

```typescript
// ❌ VULNERABILIDADE: Qualquer status pode ser atualizado para qualquer outro
app.put("/server/ordens-servico/:id", async (c) => {
  const body = await c.req.json();

  // NENHUMA VALIDAÇÃO DE TRANSIÇÃO DE ESTADO!
  const { data, error } = await supabase
    .from('ordens_servico')
    .update(body)  // ⚠️ Aceita qualquer campo, inclusive status_geral
    .eq('id', id)
    .select()
    .single();
});
```

**Cenários de Falha:**

1. **OS travada em etapa intermediária**
   - Usuário pode marcar OS como `concluida` mesmo com etapas pendentes
   - OS pode voltar de `concluida` para `em_triagem` sem validação

2. **Etapas fora de sequência**
   - Etapa 8 pode ser concluída antes da Etapa 1
   - Não há validação de dependência entre etapas

3. **Estados inconsistentes**
   - OS marcada como `em_andamento` mas todas etapas `pendente`
   - Etapa marcada como `concluida` mas dados obrigatórios vazios

**Evidência no Código:**

```typescript:src/lib/hooks/use-etapas.ts
// ❌ Atualização sem validação de transição
const updateEtapa = async (etapaId: string, data: UpdateEtapaData): Promise<OsEtapa> => {
  const updatedEtapa = await ordensServicoAPI.updateEtapa(etapaId, data);
  // Não há verificação se:
  // - Etapa anterior está concluída
  // - Usuário tem permissão para esta transição
  // - Dados obrigatórios estão completos
};
```

#### Impacto

- ⚠️ OS podem travar em estados inválidos permanentemente
- ⚠️ Relatórios e dashboards mostrarão dados incorretos
- ⚠️ Workflow pode pular etapas críticas (ex: aprovação)

---

### 2. Race Conditions - CRÍTICO

#### Problema

**Múltiplos usuários podem editar a mesma OS/Etapa simultaneamente sem controle de concorrência.**

**Cenário de Race Condition:**

```
Tempo | Usuário A                        | Usuário B
------|----------------------------------|----------------------------------
T0    | GET /etapas/123                  | GET /etapas/123
      | { status: "pendente", dados: {} }| { status: "pendente", dados: {} }
      |                                  |
T1    | Edita formulário localmente      | Edita formulário localmente
      | dados = { campo1: "A" }          | dados = { campo2: "B" }
      |                                  |
T2    | PUT /etapas/123                  |
      | { dados: { campo1: "A" } }       |
      |                                  |
T3    |                                  | PUT /etapas/123
      |                                  | { dados: { campo2: "B" } }
      |                                  |
T4    | ❌ PERDEU: campo1 sobrescrito!   | ✅ VENCEU: campo2 salvo
```

**Evidência no Código:**

```typescript:supabase/functions/server/index.ts
// ❌ Sem controle de concorrência
app.put("/server/etapas/:id", async (c) => {
  const body = await c.req.json();

  // Atualização direta sem verificar versão ou timestamp
  const { data, error } = await supabase
    .from('os_etapas')
    .update(body)
    .eq('id', id)  // ⚠️ Não verifica updated_at!
    .select()
    .single();
});
```

**Não há:**
- ❌ Optimistic locking (versioning)
- ❌ Timestamp comparison (`updated_at > last_read_at`)
- ❌ Database-level locks (`SELECT FOR UPDATE`)
- ❌ Merge strategy para conflitos

#### Impacto

- ⚠️ **Perda de dados silenciosa** - usuário não é notificado
- ⚠️ Trabalho duplicado desperdiçado
- ⚠️ Dados de formulários extensos (Etapa 6, 7) podem ser perdidos

---

### 3. Salvamento de Dados em Campos Corretos

#### Status: ✅ **CORRETO** (com ressalvas)

**Estrutura Atual:**

```sql
-- ✅ Dados salvos em campo JSONB dedicado
os_etapas.dados_etapa JSONB
```

**Fluxo de Salvamento:**

```typescript:src/lib/hooks/use-etapas.ts
// ✅ Salva em dados_etapa
const saveFormData = async (etapaId: string, formData: any, markAsComplete: boolean) => {
  const updateData: UpdateEtapaData = {
    dados_etapa: formData,  // ✅ Campo correto
  };

  if (markAsComplete) {
    updateData.status = 'concluida';
    updateData.data_conclusao = new Date().toISOString();
  }

  await updateEtapa(etapaId, updateData);
};
```

**⚠️ Ressalvas:**

1. **Validação apenas no Frontend**

```typescript:src/lib/validations/os-etapas-schema.ts
// ✅ Schema Zod bem definido
export const etapa3Schema = z.object({
  idadeEdificacao: z.string().min(1),
  motivoProcura: z.string().min(5),
  // ... 7 campos obrigatórios
});

// ❌ MAS validação só acontece no frontend!
```

**Backend aceita qualquer JSON:**

```typescript:supabase/functions/server/index.ts
// ❌ Sem validação de schema no backend
app.put("/server/etapas/:id", async (c) => {
  const body = await c.req.json();
  // Aceita body.dados_etapa = QUALQUER COISA
});
```

2. **Sem Versionamento de Schema**

Se o schema Zod mudar, dados antigos podem se tornar inválidos.

#### Recomendação

✅ **Adicionar validação de schema no backend:**

```typescript
// Proposta: Validar antes de salvar
app.put("/server/etapas/:id", async (c) => {
  const body = await c.req.json();
  const etapa = await getEtapa(id);

  // ✅ Validar dados_etapa contra schema da etapa
  const schema = stepsSchemas[etapa.ordem];
  const validation = schema.safeParse(body.dados_etapa);

  if (!validation.success) {
    return c.json({ error: validation.error }, 400);
  }

  // Salvar dados validados
  await supabase.from('os_etapas').update(body).eq('id', id);
});
```

---

### 4. Travas de Segurança - Validações de Permissão

#### Problema: RLS Muito Permissivo + Edge Function Bypassa RLS

**Row Level Security Atual:**

```sql:supabase/migrations/20251124172000_redesign_os_details_schema.sql
-- ⚠️ POLÍTICA MUITO PERMISSIVA
CREATE POLICY "Documentos visíveis por envolvidos na OS" ON os_documentos
  FOR ALL USING (
    os_id IN (
      SELECT id FROM ordens_servico
      WHERE responsavel_id = auth.uid() OR criado_por_id = auth.uid()
    )
  );
```

**Problema 1: Qualquer usuário autenticado pode ver/editar OS se for responsável**

Não valida:
- ❌ Nível hierárquico do usuário
- ❌ Setor do usuário vs. setor da OS
- ❌ Permissão específica para a operação (aprovar, delegar, cancelar)

**Problema 2: Edge Function usa SERVICE_ROLE_KEY**

```typescript:supabase/functions/server/index.ts
// 🔴 CRÍTICO: Bypassa completamente as RLS policies
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,  // ⚠️ BYPASSA RLS!
  );
};
```

**Evidência:**

```typescript
// ❌ Sem validação de permissão para aprovar etapa
app.put("/server/etapas/:id", async (c) => {
  const body = await c.req.json();

  // QUALQUER usuário autenticado pode:
  // - Marcar etapa como concluída
  // - Alterar responsável
  // - Modificar dados_etapa

  const { data, error } = await supabase
    .from('os_etapas')
    .update(body)  // ⚠️ Sem validação!
    .eq('id', id);
});
```

#### Cenários de Vulnerabilidade

1. **Colaborador (nível 1) aprova etapa que requer Gestor (nível 5+)**

```typescript
// ❌ Permitido atualmente
const colaborador = { cargo_slug: 'colaborador', nivel: 1 };
await updateEtapa(etapaId, { status: 'concluida' });  // Deveria falhar!
```

2. **Usuário de Setor A edita OS do Setor B**

```typescript
// ❌ Permitido atualmente
const userSetor = 'assessoria';
const osSetor = 'obras';
await updateOS(osId, { status_geral: 'cancelada' });  // Deveria falhar!
```

3. **Delegação sem validação hierárquica**

```typescript
// ❌ Colaborador pode delegar para Gestor
const colaborador = { nivel: 1 };
const gestor = { nivel: 5 };
await createDelegacao({ delegado_id: gestor.id });  // Deveria falhar!
```

#### Impacto

- 🔴 **CRÍTICO:** Violação de regras de negócio
- 🔴 **CRÍTICO:** Auditoria comprometida
- 🔴 **CRÍTICO:** Responsabilidades mal atribuídas

---

### 5. Edge Cases de Conexão

#### Problema: Sem Resiliência em Operações Críticas

**Cenário 1: Conexão cai durante atualização de etapa**

```typescript:src/lib/hooks/use-etapas.ts
const updateEtapa = async (etapaId: string, data: UpdateEtapaData) => {
  // ❌ Sem retry, sem timeout, sem rollback
  const updatedEtapa = await ordensServicoAPI.updateEtapa(etapaId, data);

  // Se falhar aqui, usuário perde o trabalho!
};
```

**Possíveis Falhas:**
- Timeout de rede (> 2 minutos)
- Erro 500 do servidor
- Erro 503 (serviço indisponível)

**Consequências:**
- Formulário extenso (Etapa 6, 7) perdido
- Usuário não sabe se salvou ou não
- Pode reenviar e causar duplicação

**Cenário 2: Criação de OS falha após gerar código**

```typescript:supabase/functions/server/index.ts
// ⚠️ Pode gerar código mas falhar ao inserir
const codigo_os = `OS-${year}-${String(nextNumber).padStart(3, '0')}`;

const { data, error } = await supabase
  .from('ordens_servico')
  .insert([{ ...body, codigo_os }]);  // ⚠️ Se falhar, código fica "queimado"
```

**Evidência de falta de tratamento:**

```typescript
// ❌ Sem retry logic
try {
  const data = await ordensServicoAPI.getEtapas(osId);
  setEtapas(data);
} catch (err) {
  // Apenas loga erro, não tenta novamente
  console.error('❌ Erro ao buscar etapas:', err);
  setError(errorMsg);
  throw err;
}
```

#### Impacto

- ⚠️ Experiência ruim do usuário
- ⚠️ Perda de trabalho
- ⚠️ Dados inconsistentes (códigos pulados, etapas duplicadas)

---

## 🔍 Análise de Edge Cases

### Edge Case 1: Dois Usuários Editam Mesma Etapa

**Fluxo:**

```
1. Gestor A abre Etapa 8 (Precificação)
   - Preenche: margemLucro = "15%"

2. Gestor B abre Etapa 8 ao mesmo tempo
   - Preenche: margemLucro = "20%"

3. Gestor A salva (T0)
   - dados_etapa = { margemLucro: "15%" }

4. Gestor B salva (T0 + 5s)
   - dados_etapa = { margemLucro: "20%" }

5. ❌ RESULTADO: Perda silenciosa do trabalho do Gestor A
```

**Solução Necessária:** Optimistic Locking

---

### Edge Case 2: Conexão Cai Durante Salvamento

**Fluxo:**

```
1. Usuário preenche Etapa 6 (15 minutos de trabalho)
   - 8 campos obrigatórios + uploads de fotos

2. Clica "Salvar e Continuar"
   - Frontend envia PUT /etapas/123

3. Conexão cai no meio da requisição
   - ❌ Timeout após 2 minutos

4. Frontend mostra erro genérico
   - Usuário não sabe se salvou ou não

5. Opções do usuário:
   a) Tentar salvar de novo → Pode duplicar
   b) Atualizar página → Perde tudo
   c) Voltar → Perde tudo
```

**Solução Necessária:** Auto-save em LocalStorage + Retry Logic

---

### Edge Case 3: OS Trava em Estado Inválido

**Fluxo:**

```
1. OS criada com status_geral = "em_triagem"

2. Etapa 1-14 concluídas corretamente

3. Bug/erro na Etapa 15 faz update direto:
   UPDATE ordens_servico SET status_geral = 'concluida' WHERE id = 'X'

4. ❌ RESULTADO: OS marcada como concluída mas Etapa 15 ainda pendente

5. Dashboard mostra OS como concluída
   Mas workflow ainda aguarda Etapa 15
```

**Solução Necessária:** Trigger que valida consistência

```sql
CREATE OR REPLACE FUNCTION validate_os_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se marcar como concluída, validar que todas etapas estão concluídas
  IF NEW.status_geral = 'concluida' THEN
    IF EXISTS (
      SELECT 1 FROM os_etapas
      WHERE os_id = NEW.id AND status != 'concluida'
    ) THEN
      RAISE EXCEPTION 'Não é possível marcar OS como concluída com etapas pendentes';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Edge Case 4: Sequência de Geração de Código com Race Condition

**Problema:**

```typescript:supabase/migrations/20251129000000_standardize_os_ids.sql
-- ⚠️ Possível race condition apesar de UPSERT
INSERT INTO public.os_sequences (tipo_os_id, current_value, updated_at)
VALUES (NEW.tipo_os_id, 1, NOW())
ON CONFLICT (tipo_os_id)
DO UPDATE SET
    current_value = os_sequences.current_value + 1,
    updated_at = NOW()
RETURNING current_value INTO v_seq;
```

**Cenário de Falha:**

```
Tempo | Usuário A               | Usuário B
------|-------------------------|-------------------------
T0    | INSERT OS tipo_os_id=1  | INSERT OS tipo_os_id=1
      |                         |
T1    | SELECT current_value    | SELECT current_value
      | → 5                     | → 5 (RACE!)
      |                         |
T2    | v_seq = 5               | v_seq = 5
      | codigo = OS1300005      | codigo = OS1300005
      |                         |
T3    | ❌ CONSTRAINT ERROR: codigo_os duplicado!
```

**Solução:** O `ON CONFLICT` já previne isso, mas **precisa de SERIALIZABLE isolation level** em alta concorrência.

---

## 🔐 Validações de Segurança

### Validações Necessárias por Operação

#### 1. Criar OS

**Permissões Necessárias:**
- ✅ `pode_criar_os` (nível >= 1)
- ✅ Setor do tipo de OS deve ser visível ao usuário

**Validações:**
```typescript
// Proposta
async function validateCreateOS(user: User, osData: CreateOSData) {
  const permissoes = getPermissoes(user);

  // 1. Verificar permissão básica
  if (!permissoes.pode_criar_os) {
    throw new Error('Usuário não tem permissão para criar OS');
  }

  // 2. Verificar se pode criar OS deste tipo/setor
  const tipoOS = await getTipoOS(osData.tipo_os_id);
  if (!podeVerSetor(user, tipoOS.setor_slug)) {
    throw new Error('Usuário não tem acesso a este setor');
  }

  // 3. Validar dados obrigatórios
  if (!osData.cliente_id || !osData.tipo_os_id) {
    throw new Error('Cliente e Tipo de OS são obrigatórios');
  }
}
```

#### 2. Atualizar Status de OS

**Permissões Necessárias:**
- Cancelar: `pode_cancelar_os` (nível >= 5)
- Concluir: Verificar todas etapas concluídas
- Reabrir: `pode_cancelar_os` (nível >= 5)

**Validações:**
```typescript
async function validateUpdateOSStatus(
  user: User,
  os: OrdemServico,
  newStatus: OSStatus
) {
  const permissoes = getPermissoes(user);

  // Transições permitidas
  const transitions: Record<OSStatus, OSStatus[]> = {
    'em_triagem': ['em_andamento', 'cancelada'],
    'em_andamento': ['aguardando_aprovacao', 'concluida', 'cancelada'],
    'aguardando_aprovacao': ['em_andamento', 'concluida', 'cancelada'],
    'concluida': ['em_andamento'],  // Reabrir (apenas gestores)
    'cancelada': ['em_triagem'],     // Reativar (apenas gestores)
  };

  // 1. Validar se transição é permitida
  if (!transitions[os.status_geral].includes(newStatus)) {
    throw new Error(`Transição inválida: ${os.status_geral} → ${newStatus}`);
  }

  // 2. Validar permissões específicas
  if (newStatus === 'cancelada' && !permissoes.pode_cancelar_os) {
    throw new Error('Usuário não pode cancelar OS');
  }

  if (newStatus === 'concluida') {
    // Verificar se todas etapas estão concluídas
    const etapasPendentes = await countEtapasPendentes(os.id);
    if (etapasPendentes > 0) {
      throw new Error('Não é possível concluir OS com etapas pendentes');
    }
  }

  // 3. Reabertura requer gestor
  if (os.status_geral === 'concluida' && !isGestor(user)) {
    throw new Error('Apenas gestores podem reabrir OS concluídas');
  }
}
```

#### 3. Transição de Etapa

**Permissões Necessárias:**
- Iniciar (pendente → em_andamento): Ser responsável ou delegado
- Concluir (em_andamento → concluida): Ser responsável + validar dados
- Aprovar: `pode_aprovar` (nível >= 5)

**Validações:**
```typescript
async function validateEtapaTransition(
  user: User,
  etapa: OsEtapa,
  newStatus: EtapaStatus,
  newData?: any
) {
  const permissoes = getPermissoes(user);

  // 1. Validar sequência de etapas
  if (newStatus === 'em_andamento') {
    const etapaAnterior = await getEtapa(etapa.os_id, etapa.ordem - 1);
    if (etapaAnterior && etapaAnterior.status !== 'concluida') {
      throw new Error('Etapa anterior não está concluída');
    }
  }

  // 2. Validar responsabilidade
  const isResponsavel = etapa.responsavel_id === user.id;
  const isDelegado = await isDelegadoNaEtapa(user.id, etapa.id);

  if (newStatus === 'em_andamento' && !isResponsavel && !isDelegado) {
    throw new Error('Usuário não é responsável nem delegado nesta etapa');
  }

  // 3. Validar dados obrigatórios ao concluir
  if (newStatus === 'concluida') {
    const schema = stepsSchemas[etapa.ordem];
    const validation = schema.safeParse(newData || etapa.dados_etapa);

    if (!validation.success) {
      throw new Error('Dados obrigatórios não preenchidos');
    }
  }

  // 4. Validar permissão de aprovação
  if (newStatus === 'concluida' && etapa.aprovador_id) {
    if (!permissoes.pode_aprovar) {
      throw new Error('Usuário não tem permissão para aprovar etapas');
    }
  }
}
```

#### 4. Delegação

**Permissões Necessárias:**
- `pode_delegar` (nível >= 5)
- Hierarquia: Apenas delegar para níveis iguais ou inferiores
- Setor: Apenas delegar dentro do mesmo setor (exceto admin/diretoria)

**Validações:**
```typescript
async function validateDelegacao(
  user: User,
  delegado: User,
  os: OrdemServico
) {
  const permissoes = getPermissoes(user);

  // 1. Verificar permissão básica
  if (!permissoes.pode_delegar) {
    throw new Error('Usuário não pode delegar tarefas');
  }

  // 2. Validar hierarquia
  const nivelDelegante = getNivelHierarquico(user);
  const nivelDelegado = getNivelHierarquico(delegado);

  if (nivelDelegado > nivelDelegante) {
    throw new Error('Não é possível delegar para nível hierárquico superior');
  }

  // 3. Validar setor (exceto admin/diretoria)
  if (!isAdminOuDiretoria(user)) {
    const setorDelegante = user.setor_slug;
    const setorDelegado = delegado.setor_slug;
    const setorOS = os.tipo_os?.setor?.slug;

    if (setorDelegado !== setorOS) {
      throw new Error('Delegado deve ser do mesmo setor da OS');
    }
  }

  // 4. Verificar se delegado está ativo
  if (!delegado.ativo) {
    throw new Error('Não é possível delegar para colaborador inativo');
  }
}
```

---

## 💡 Propostas de Solução

### Solução 1: Implementar Máquina de Estados com Trigger

**Objetivo:** Garantir transições de estado válidas em nível de banco de dados.

#### Implementação

```sql
-- migration: 20251201_add_state_machine_validation.sql

-- =====================================================
-- FUNCTION: Validar Transição de Status de OS
-- =====================================================

CREATE OR REPLACE FUNCTION validate_os_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_etapas_pendentes INTEGER;
BEGIN
  -- Se status não mudou, permitir
  IF OLD.status_geral = NEW.status_geral THEN
    RETURN NEW;
  END IF;

  -- Validar transições permitidas
  IF (OLD.status_geral = 'em_triagem' AND NEW.status_geral NOT IN ('em_andamento', 'cancelada')) OR
     (OLD.status_geral = 'em_andamento' AND NEW.status_geral NOT IN ('aguardando_aprovacao', 'concluida', 'cancelada')) OR
     (OLD.status_geral = 'aguardando_aprovacao' AND NEW.status_geral NOT IN ('em_andamento', 'concluida', 'cancelada')) OR
     (OLD.status_geral = 'concluida' AND NEW.status_geral NOT IN ('em_andamento')) OR
     (OLD.status_geral = 'cancelada' AND NEW.status_geral NOT IN ('em_triagem'))
  THEN
    RAISE EXCEPTION 'Transição de status inválida: % → %', OLD.status_geral, NEW.status_geral;
  END IF;

  -- Se marcar como concluída, validar que todas etapas estão concluídas
  IF NEW.status_geral = 'concluida' THEN
    SELECT COUNT(*) INTO v_etapas_pendentes
    FROM os_etapas
    WHERE os_id = NEW.id AND status != 'concluida';

    IF v_etapas_pendentes > 0 THEN
      RAISE EXCEPTION 'Não é possível marcar OS como concluída com % etapas pendentes', v_etapas_pendentes;
    END IF;

    -- Definir data_conclusao automaticamente
    NEW.data_conclusao := NOW();
  END IF;

  -- Atualizar timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_validate_os_status
BEFORE UPDATE OF status_geral ON ordens_servico
FOR EACH ROW
EXECUTE FUNCTION validate_os_status_transition();

-- =====================================================
-- FUNCTION: Validar Transição de Status de Etapa
-- =====================================================

CREATE OR REPLACE FUNCTION validate_etapa_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_etapa_anterior os_etapas;
BEGIN
  -- Se status não mudou, permitir
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Ao iniciar etapa (pendente → em_andamento)
  IF OLD.status = 'pendente' AND NEW.status = 'em_andamento' THEN
    -- Validar que etapa anterior está concluída (exceto etapa 1)
    IF NEW.ordem > 1 THEN
      SELECT * INTO v_etapa_anterior
      FROM os_etapas
      WHERE os_id = NEW.os_id AND ordem = NEW.ordem - 1;

      IF v_etapa_anterior.status != 'concluida' THEN
        RAISE EXCEPTION 'Etapa % (%) deve ser concluída antes de iniciar etapa %',
          NEW.ordem - 1, v_etapa_anterior.nome_etapa, NEW.ordem;
      END IF;
    END IF;

    -- Definir data_inicio automaticamente
    NEW.data_inicio := NOW();
  END IF;

  -- Ao concluir etapa (em_andamento → concluida)
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    -- Validar dados_etapa não vazios
    IF NEW.dados_etapa IS NULL OR NEW.dados_etapa = '{}' THEN
      RAISE EXCEPTION 'Não é possível concluir etapa sem dados preenchidos';
    END IF;

    -- Definir data_conclusao automaticamente
    NEW.data_conclusao := NOW();
  END IF;

  -- Atualizar timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_validate_etapa_status
BEFORE UPDATE OF status ON os_etapas
FOR EACH ROW
EXECUTE FUNCTION validate_etapa_status_transition();
```

**Benefícios:**
- ✅ Garante integridade de dados em nível de banco
- ✅ Previne transições inválidas mesmo se frontend falhar
- ✅ Auditoria automática (updated_at, data_conclusao)

---

### Solução 2: Optimistic Locking com `updated_at`

**Objetivo:** Prevenir race conditions em atualizações concorrentes.

#### Implementação Backend

```typescript:supabase/functions/server/index.ts
// ✅ UPDATE com validação de versão
app.put("/server/etapas/:id", async (c) => {
  const supabase = getSupabaseClient();
  const { id } = c.req.param();
  const body = await c.req.json();

  // ✅ Exigir timestamp da última leitura
  const { last_read_at } = body;
  if (!last_read_at) {
    return c.json({
      error: 'last_read_at é obrigatório para evitar conflitos'
    }, 400);
  }

  // Normalizar status
  if (body.status) {
    body.status = normalizeEtapaStatus(body.status);
  }

  // ✅ UPDATE condicional: apenas se updated_at não mudou
  const { data, error } = await supabase
    .from('os_etapas')
    .update({
      ...body,
      updated_at: new Date().toISOString(),  // Novo timestamp
    })
    .eq('id', id)
    .lte('updated_at', last_read_at)  // ✅ Validar versão!
    .select()
    .single();

  if (error || !data) {
    // Buscar versão atual
    const { data: currentData } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('id', id)
      .single();

    return c.json({
      error: 'Conflito de versão detectado',
      conflict: true,
      current_data: currentData,  // Enviar dados atuais para merge
    }, 409);  // HTTP 409 Conflict
  }

  return c.json(data);
});
```

#### Implementação Frontend

```typescript:src/lib/hooks/use-etapas.ts
const updateEtapa = async (
  etapaId: string,
  data: UpdateEtapaData,
  lastReadAt: string  // ✅ Timestamp da última leitura
): Promise<OsEtapa> => {
  try {
    const updatedEtapa = await ordensServicoAPI.updateEtapa(etapaId, {
      ...data,
      last_read_at: lastReadAt,  // ✅ Enviar versão
    });

    setEtapas((prev) =>
      prev ? prev.map((e) => (e.id === etapaId ? updatedEtapa : e)) : [updatedEtapa]
    );

    return updatedEtapa;
  } catch (err: any) {
    // ✅ Detectar conflito de versão
    if (err.conflict) {
      // Mostrar modal de merge ao usuário
      const shouldMerge = await showConflictDialog(err.current_data);

      if (shouldMerge) {
        // Tentar merge automático ou manual
        return mergeAndRetry(etapaId, data, err.current_data);
      } else {
        throw new Error('Atualização cancelada devido a conflito');
      }
    }

    throw err;
  }
};
```

**Benefícios:**
- ✅ Detecta conflitos antes de sobrescrever
- ✅ Permite merge inteligente de dados
- ✅ Feedback claro ao usuário

---

### Solução 3: Validação de Permissões no Backend

**Objetivo:** Implementar RBAC rigoroso em nível de Edge Function.

#### Implementação

```typescript:supabase/functions/server/rbac.ts
// ✅ Novo módulo: RBAC Helper

import { createClient } from "jsr:@supabase/supabase-js@2";

interface User {
  id: string;
  cargo_slug: string;
  setor_slug: string;
  nivel_acesso: number;
}

interface Permissoes {
  nivel: number;
  pode_criar_os: boolean;
  pode_cancelar_os: boolean;
  pode_aprovar: boolean;
  pode_delegar: boolean;
  setores_visiveis: string[] | 'todos';
}

const PERMISSOES_POR_CARGO: Record<string, Permissoes> = {
  'admin': {
    nivel: 10,
    pode_criar_os: true,
    pode_cancelar_os: true,
    pode_aprovar: true,
    pode_delegar: true,
    setores_visiveis: 'todos',
  },
  'diretoria': {
    nivel: 9,
    pode_criar_os: true,
    pode_cancelar_os: true,
    pode_aprovar: true,
    pode_delegar: true,
    setores_visiveis: 'todos',
  },
  'gestor_administrativo': {
    nivel: 5,
    pode_criar_os: true,
    pode_cancelar_os: true,
    pode_aprovar: true,
    pode_delegar: true,
    setores_visiveis: 'todos',
  },
  'gestor_obras': {
    nivel: 5,
    pode_criar_os: true,
    pode_cancelar_os: true,
    pode_aprovar: true,
    pode_delegar: true,
    setores_visiveis: ['obras'],
  },
  'gestor_assessoria': {
    nivel: 5,
    pode_criar_os: true,
    pode_cancelar_os: true,
    pode_aprovar: true,
    pode_delegar: true,
    setores_visiveis: ['assessoria'],
  },
  'colaborador': {
    nivel: 1,
    pode_criar_os: true,
    pode_cancelar_os: false,
    pode_aprovar: false,
    pode_delegar: false,
    setores_visiveis: [],
  },
};

export async function getCurrentUser(
  authHeader: string,
  supabase: any
): Promise<User | null> {
  // Extrair token JWT
  const token = authHeader.replace('Bearer ', '');

  // Validar token e buscar usuário
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Buscar colaborador com cargo
  const { data: colaborador } = await supabase
    .from('colaboradores')
    .select(`
      id,
      cargo_id,
      setor_id,
      cargos (slug, nivel_acesso),
      setores (slug)
    `)
    .eq('id', user.id)
    .single();

  if (!colaborador) return null;

  return {
    id: colaborador.id,
    cargo_slug: colaborador.cargos.slug,
    setor_slug: colaborador.setores.slug,
    nivel_acesso: colaborador.cargos.nivel_acesso,
  };
}

export function getPermissoes(user: User): Permissoes {
  return PERMISSOES_POR_CARGO[user.cargo_slug] || PERMISSOES_POR_CARGO['colaborador'];
}

export function canCancelOS(user: User): boolean {
  return getPermissoes(user).pode_cancelar_os;
}

export function canApprove(user: User): boolean {
  return getPermissoes(user).pode_aprovar;
}

export function canDelegate(user: User, delegado: User): boolean {
  const permissoes = getPermissoes(user);

  // 1. Precisa ter permissão de delegar
  if (!permissoes.pode_delegar) return false;

  // 2. Não pode delegar para nível superior
  if (delegado.nivel_acesso > user.nivel_acesso) return false;

  return true;
}

export function canAccessSetor(user: User, setor: string): boolean {
  const permissoes = getPermissoes(user);

  if (permissoes.setores_visiveis === 'todos') return true;

  return permissoes.setores_visiveis.includes(setor);
}
```

#### Uso na Edge Function

```typescript:supabase/functions/server/index.ts
import { getCurrentUser, canCancelOS, canApprove } from './rbac.ts';

// ✅ Proteger endpoint de atualização de OS
app.put("/server/ordens-servico/:id", async (c) => {
  const supabase = getSupabaseClient();
  const { id } = c.req.param();
  const body = await c.req.json();

  // ✅ Autenticar e autorizar
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const user = await getCurrentUser(authHeader, supabase);
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // ✅ Validar permissão para cancelar
  if (body.status_geral === 'cancelada' && !canCancelOS(user)) {
    return c.json({
      error: 'Usuário não tem permissão para cancelar OS'
    }, 403);
  }

  // ✅ Validar acesso ao setor da OS
  const { data: os } = await supabase
    .from('ordens_servico')
    .select('id, tipo_os:tipos_os(setor:setores(slug))')
    .eq('id', id)
    .single();

  if (os && !canAccessSetor(user, os.tipo_os.setor.slug)) {
    return c.json({
      error: 'Usuário não tem acesso a este setor'
    }, 403);
  }

  // ✅ UPDATE autorizado
  const { data, error } = await supabase
    .from('ordens_servico')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});
```

**Benefícios:**
- ✅ Validações centralizadas e reutilizáveis
- ✅ Segurança em nível de backend (não pode ser bypassada)
- ✅ Auditoria clara de quem fez o quê

---

### Solução 4: Auto-Save e Retry Logic

**Objetivo:** Prevenir perda de dados em caso de falha de conexão.

#### Implementação: Auto-Save em LocalStorage

```typescript:src/lib/hooks/use-auto-save.ts
// ✅ Hook de auto-save
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface AutoSaveOptions {
  key: string;  // Chave única (ex: `os-${osId}-etapa-${etapaId}`)
  interval?: number;  // Intervalo de auto-save (ms)
}

export function useAutoSave<T>(options: AutoSaveOptions) {
  const { key, interval = 5000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Carregar do LocalStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data);
        setLastSaved(new Date(parsed.timestamp));
      } catch (err) {
        console.error('Erro ao carregar auto-save:', err);
      }
    }
  }, [key]);

  // Salvar automaticamente com debounce
  const saveToLocalStorage = useCallback(
    debounce((dataToSave: T) => {
      setIsSaving(true);
      try {
        localStorage.setItem(key, JSON.stringify({
          data: dataToSave,
          timestamp: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      } catch (err) {
        console.error('Erro ao auto-salvar:', err);
      } finally {
        setIsSaving(false);
      }
    }, interval),
    [key, interval]
  );

  // Atualizar dados e salvar
  const updateData = (newData: T) => {
    setData(newData);
    saveToLocalStorage(newData);
  };

  // Limpar auto-save
  const clearAutoSave = () => {
    localStorage.removeItem(key);
    setData(null);
    setLastSaved(null);
  };

  return {
    data,
    updateData,
    clearAutoSave,
    isSaving,
    lastSaved,
  };
}
```

#### Uso no Componente

```typescript:src/components/os/os-details-workflow-page.tsx
const { data: autoSaveData, updateData: updateAutoSave, clearAutoSave } =
  useAutoSave({ key: `os-${osId}-etapa-${currentStep}` });

// Restaurar auto-save ao carregar etapa
useEffect(() => {
  if (autoSaveData) {
    const shouldRestore = confirm(
      'Encontramos dados não salvos desta etapa. Deseja restaurá-los?'
    );

    if (shouldRestore) {
      setStepData(currentStep, autoSaveData);
    } else {
      clearAutoSave();
    }
  }
}, [currentStep, autoSaveData]);

// Auto-salvar ao editar formulário
const handleFormChange = (field: string, value: any) => {
  const newData = { ...getStepData(currentStep), [field]: value };
  setStepData(currentStep, newData);
  updateAutoSave(newData);  // ✅ Auto-save
};

// Limpar auto-save após salvar com sucesso
const handleSaveStep = async () => {
  try {
    await saveStep(currentStep);
    clearAutoSave();  // ✅ Limpar rascunho
    toast.success('Dados salvos com sucesso!');
  } catch (err) {
    toast.error('Erro ao salvar. Dados preservados localmente.');
  }
};
```

#### Implementação: Retry Logic

```typescript:src/lib/utils/retry.ts
// ✅ Helper de retry com backoff exponencial
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => true,  // Retry em qualquer erro por padrão
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Não fazer retry se não deve
      if (!shouldRetry(error)) {
        throw error;
      }

      // Última tentativa, lançar erro
      if (attempt === maxRetries) {
        break;
      }

      // Calcular delay com backoff exponencial
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      console.warn(`Tentativa ${attempt + 1} falhou. Tentando novamente em ${delay}ms...`);

      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

#### Uso no Hook

```typescript:src/lib/hooks/use-etapas.ts
import { retryWithBackoff } from '@/lib/utils/retry';

const updateEtapa = async (etapaId: string, data: UpdateEtapaData): Promise<OsEtapa> => {
  try {
    setIsLoading(true);

    // ✅ Fazer update com retry
    const updatedEtapa = await retryWithBackoff(
      () => ordensServicoAPI.updateEtapa(etapaId, data),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: (error) => {
          // Retry apenas em erros de rede ou timeout
          return error.message.includes('network') ||
                 error.message.includes('timeout') ||
                 error.status >= 500;  // Erros de servidor
        },
      }
    );

    setEtapas((prev) =>
      prev ? prev.map((e) => (e.id === etapaId ? updatedEtapa : e)) : [updatedEtapa]
    );

    return updatedEtapa;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar etapa';
    console.error('❌ Erro ao atualizar etapa após retries:', err);
    setError(errorMsg);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

**Benefícios:**
- ✅ Resiliência a falhas temporárias de rede
- ✅ Preservação de trabalho do usuário
- ✅ Feedback claro de progresso

---

### Solução 5: Logging e Auditoria Completa

**Objetivo:** Rastrear todas as operações críticas para debugging e compliance.

#### Implementação

```sql:supabase/migrations/20251201_add_audit_logging.sql
-- =====================================================
-- FUNCTION: Registrar Mudanças de Status
-- =====================================================

CREATE OR REPLACE FUNCTION audit_os_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status
  IF OLD.status_geral != NEW.status_geral THEN
    INSERT INTO os_atividades (
      os_id,
      usuario_id,
      tipo,
      descricao,
      dados_antigos,
      dados_novos,
      metadados
    ) VALUES (
      NEW.id,
      auth.uid(),  -- Usuário que fez a mudança
      'status_change',
      format('Status alterado: %s → %s', OLD.status_geral, NEW.status_geral),
      jsonb_build_object('status_geral', OLD.status_geral),
      jsonb_build_object('status_geral', NEW.status_geral),
      jsonb_build_object(
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_os_status
AFTER UPDATE OF status_geral ON ordens_servico
FOR EACH ROW
EXECUTE FUNCTION audit_os_status_change();

-- =====================================================
-- FUNCTION: Registrar Mudanças de Etapa
-- =====================================================

CREATE OR REPLACE FUNCTION audit_etapa_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status
  IF OLD.status != NEW.status THEN
    INSERT INTO os_atividades (
      os_id,
      etapa_id,
      usuario_id,
      tipo,
      descricao,
      dados_antigos,
      dados_novos
    ) VALUES (
      NEW.os_id,
      NEW.id,
      auth.uid(),
      'etapa_status_change',
      format('Etapa %s: %s → %s', NEW.nome_etapa, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;

  -- Registrar mudança de dados
  IF OLD.dados_etapa::text != NEW.dados_etapa::text THEN
    INSERT INTO os_atividades (
      os_id,
      etapa_id,
      usuario_id,
      tipo,
      descricao,
      dados_antigos,
      dados_novos
    ) VALUES (
      NEW.os_id,
      NEW.id,
      auth.uid(),
      'etapa_data_change',
      format('Dados da etapa %s atualizados', NEW.nome_etapa),
      OLD.dados_etapa,
      NEW.dados_etapa
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_etapa
AFTER UPDATE ON os_etapas
FOR EACH ROW
EXECUTE FUNCTION audit_etapa_change();
```

**Benefícios:**
- ✅ Histórico completo de mudanças
- ✅ Rastreabilidade para auditoria
- ✅ Facilita debugging de problemas

---

## 🗺️ Roadmap de Implementação

### Fase 1: Crítico (Sprint 1 - 1 semana)

**Objetivo:** Estabilizar integridade de dados.

| Tarefa | Prioridade | Estimativa | Responsável |
|--------|-----------|-----------|-------------|
| ✅ Implementar máquina de estados (Solução 1) | 🔴 **CRÍTICA** | 2 dias | Backend |
| ✅ Adicionar optimistic locking (Solução 2) | 🔴 **CRÍTICA** | 2 dias | Backend + Frontend |
| ✅ Implementar RBAC no backend (Solução 3) | 🔴 **CRÍTICA** | 3 dias | Backend |

**Entregável:** Sistema com validações básicas de integridade e segurança.

---

### Fase 2: Alto (Sprint 2 - 1 semana)

**Objetivo:** Melhorar experiência do usuário e resiliência.

| Tarefa | Prioridade | Estimativa | Responsável |
|--------|-----------|-----------|-------------|
| ✅ Auto-save em LocalStorage (Solução 4) | 🟡 **ALTO** | 2 dias | Frontend |
| ✅ Retry logic com backoff (Solução 4) | 🟡 **ALTO** | 1 dia | Frontend |
| ✅ Logging e auditoria (Solução 5) | 🟡 **ALTO** | 2 dias | Backend |

**Entregável:** Sistema resiliente a falhas de rede com auditoria completa.

---

### Fase 3: Médio (Sprint 3 - 1 semana)

**Objetivo:** Refinamentos e validações adicionais.

| Tarefa | Prioridade | Estimativa | Responsável |
|--------|-----------|-----------|-------------|
| Validação de schema no backend | 🟢 **MÉDIO** | 2 dias | Backend |
| Modal de merge para conflitos | 🟢 **MÉDIO** | 2 dias | Frontend |
| Dashboards de auditoria | 🟢 **MÉDIO** | 2 dias | Frontend |
| Testes de integração | 🟢 **MÉDIO** | 3 dias | QA |

**Entregável:** Sistema robusto com UX aprimorada.

---

### Fase 4: Baixo (Sprint 4 - Melhorias Contínuas)

**Objetivo:** Otimizações e monitoramento.

| Tarefa | Prioridade | Estimativa | Responsável |
|--------|-----------|-----------|-------------|
| Monitoramento de performance | 🔵 **BAIXO** | 2 dias | DevOps |
| Alerts de anomalias | 🔵 **BAIXO** | 1 dia | DevOps |
| Documentação técnica | 🔵 **BAIXO** | 2 dias | Tech Writer |

**Entregável:** Sistema em produção com monitoramento ativo.

---

## 📝 Conclusão

### Resumo dos Achados

| Categoria | Status Atual | Severidade | Prioridade |
|-----------|--------------|-----------|-----------|
| **Consistência de Estados** | ❌ Vulnerável | 🔴 CRÍTICO | P0 - Imediato |
| **Race Conditions** | ❌ Sem proteção | 🔴 CRÍTICO | P0 - Imediato |
| **Validações de Permissão** | ⚠️ Muito permissivo | 🔴 CRÍTICO | P0 - Imediato |
| **Salvamento de Dados** | ⚠️ Validação só frontend | 🟡 ALTO | P1 - Sprint 2 |
| **Resiliência de Conexão** | ❌ Sem retry/auto-save | 🟡 ALTO | P1 - Sprint 2 |

### Próximos Passos

1. **Imediato (Esta Semana):**
   - [ ] Criar migrations de validação de estado
   - [ ] Implementar optimistic locking
   - [ ] Adicionar RBAC no backend

2. **Curto Prazo (Próxima Sprint):**
   - [ ] Auto-save com LocalStorage
   - [ ] Retry logic com backoff
   - [ ] Sistema de auditoria

3. **Médio Prazo (Próximas 2-3 Sprints):**
   - [ ] Validação de schema no backend
   - [ ] Modal de merge de conflitos
   - [ ] Testes de integração completos

---

## 📚 Referências

- **Código Analisado:**
  - `src/lib/types.ts` - Definições de tipos
  - `src/lib/validations/os-etapas-schema.ts` - Schemas Zod
  - `src/lib/hooks/use-etapas.ts` - Lógica de etapas
  - `supabase/functions/server/index.ts` - Edge Function
  - `supabase/migrations/20251124172000_redesign_os_details_schema.sql` - Schema do banco

- **Documentação de Referência:**
  - [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
  - [Optimistic Locking Pattern](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
  - [State Machine Pattern](https://refactoring.guru/design-patterns/state)

---

**Documento gerado em:** 2025-12-01
**Última atualização:** 2025-12-01
**Versão:** 1.0
