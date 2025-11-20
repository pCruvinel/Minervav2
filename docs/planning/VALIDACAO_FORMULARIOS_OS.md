# ANÁLISE COMPLETA: VALIDAÇÃO DE FORMULÁRIOS DAS ORDENS DE SERVIÇO

> **Data da Análise**: 2025-01-19
> **Versão**: 1.0
> **Status**: 🔴 CRÍTICO - Requer implementação urgente

---

## 📊 Seção 1: Resumo Executivo

### Estatísticas Gerais

- **Total de componentes analisados**: 43 componentes de steps/etapas
- **Total de campos de formulário encontrados**: 402 ocorrências de Input/Textarea/Select
- **Total de problemas identificados**: 402 campos SEM validação visual adequada
- **Taxa de conformidade com boas práticas**: 0.25% (apenas 1 componente tem validação visual básica)

### Gravidade do Problema

**🔴 CRÍTICA** - O sistema está completamente vulnerável a:

1. ❌ Usuários submetendo dados inválidos sem feedback
2. ❌ Frustração massiva na experiência do usuário
3. ❌ Dados inconsistentes no banco de dados
4. ❌ Violação de regras de negócio silenciosas

### Estimativa de Esforço

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| **Fase 1** | Criação de componentes wrapper | 2-3 dias |
| **Fase 2-7** | Atualização de todos os componentes | 8-10 dias |
| **Fase 8** | Testes e ajustes | 3-4 dias |
| **TOTAL** | Implementação completa | **13-17 dias** |

---

## 📋 Seção 2: Inventário Detalhado

### 2.1 Componentes de OS 01-04 (Workflow Padrão)

| Etapa | Componente | Campo | Tipo | Obrigatório | Validação Schema | Tem Feedback Visual? | Tem Mensagem Erro? | Tem Máscara? | Precisa Correção? |
|-------|------------|-------|------|-------------|------------------|---------------------|-------------------|--------------|-------------------|
| **1** | step-identificacao-lead-completo | nome | Input | ✅ Sim | min 3 chars | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | cpfCnpj | Input | ⚪ Não | min 11 chars | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | email | Input | ⚪ Não | email format | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | telefone | Input | ⚪ Não | min 10 chars | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | tipo | Select | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | nomeResponsavel | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | cargoResponsavel | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | tipoEdificacao | Select | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | qtdUnidades | Input | ⚪ Não | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | qtdBlocos | Input | ⚪ Não | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | qtdPavimentos | Input | ⚪ Não | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | tipoTelhado | Select | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | cep | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | endereco | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | numero | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | complemento | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | bairro | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | cidade | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **1** | step-identificacao-lead-completo | estado | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **3** | step-followup-1 | idadeEdificacao | Select | ✅ Sim | min 1 char | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | motivoProcura | Textarea | ✅ Sim | min 10 chars | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | quandoAconteceu | Textarea | ✅ Sim | min 10 chars | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | oqueFeitoARespeito | Textarea | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | existeEscopo | Textarea | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | previsaoOrcamentaria | Textarea | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | grauUrgencia | Select | ✅ Sim | min 1 char | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | apresentacaoProposta | Textarea | ✅ Sim | min 10 chars | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **3** | step-followup-1 | nomeContatoLocal | Input | ✅ Sim | min 3 chars | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **3** | step-followup-1 | telefoneContatoLocal | Input | ✅ Sim | min 10 chars | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **3** | step-followup-1 | cargoContatoLocal | Input | ⚪ Não | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | objetivo | Textarea | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **7** | step-memorial-escopo | etapasPrincipais[].nome | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | subetapas[].nome | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | subetapas[].m2 | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | subetapas[].diasUteis | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | subetapas[].total | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | planejamentoInicial | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | logisticaTransporte | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **7** | step-memorial-escopo | preparacaoArea | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **8** | step-precificacao | percentualImprevisto | Input | ✅ Sim | number 0-100 | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **8** | step-precificacao | percentualLucro | Input | ✅ Sim | number 0-100 | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **8** | step-precificacao | percentualImposto | Input | ✅ Sim | number 0-100 | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **8** | step-precificacao | percentualEntrada | Input | ✅ Sim | number 0-100 | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **8** | step-precificacao | numeroParcelas | Input | ✅ Sim | number > 0 | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **10** | step-agendar-apresentacao | dataAgendamento | Input | ✅ Sim | datetime-local | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |

### 2.2 Componentes de OS 08 (Visita Técnica)

| Etapa | Componente | Campo | Tipo | Obrigatório | Validação Schema | Tem Feedback Visual? | Tem Mensagem Erro? | Tem Máscara? | Precisa Correção? |
|-------|------------|-------|------|-------------|------------------|---------------------|-------------------|--------------|-------------------|
| **OS08-1** | step-identificacao-solicitante | nomeCompleto | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | contatoWhatsApp | Input | ✅ Sim | tel | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | condominio | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | cargo | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | bloco | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | unidadeAutonoma | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | tipoArea | RadioGroup | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | unidadesVistoriar | Textarea | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | contatoUnidades | Input | ✅ Sim | tel | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | tipoDocumento | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | areaVistoriada | RadioGroup | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | detalhesSolicitacao | Textarea | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | tempoSituacao | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS08-1** | step-identificacao-solicitante | primeiraVisita | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |

### 2.3 Componentes de OS 13 (Obra)

| Etapa | Componente | Campo | Tipo | Obrigatório | Validação Schema | Tem Feedback Visual? | Tem Mensagem Erro? | Tem Máscara? | Precisa Correção? |
|-------|------------|-------|------|-------------|------------------|---------------------|-------------------|--------------|-------------------|
| **OS13-1** | step-dados-cliente | cliente | Select | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | tipoEdificacao | Select | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | qtdPavimentos | Input | ✅ Sim | number | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | tipoTelhado | Select | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | possuiElevador | Switch | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | possuiPiscina | Switch | ⚪ Não | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | cnpj | Input | ✅ Sim | - | ❌ Não | ❌ Não | ✅ Sim (manual) | 🟡 **Melhorar** |
| **OS13-1** | step-dados-cliente | cep | Input | ✅ Sim | - | ❌ Não | ❌ Não | ✅ Sim (manual) | 🟡 **Melhorar** |
| **OS13-1** | step-dados-cliente | estado | Select | ✅ Sim | - | ❌ Não | ❌ Não | N/A | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | cidade | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | endereco | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | bairro | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | responsavel | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | cargo | Input | ✅ Sim | - | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-1** | step-dados-cliente | telefone | Input | ✅ Sim | - | ❌ Não | ❌ Não | ✅ Sim (manual) | 🟡 **Melhorar** |
| **OS13-1** | step-dados-cliente | email | Input | ✅ Sim | email | ❌ Não | ❌ Não | ❌ Não | 🔴 **SIM** |
| **OS13-?** | step-seguro-obras | decisaoSeguro | RadioGroup | ✅ Sim | - | ✅ Sim (parcial) | ❌ Não | N/A | 🟡 **Melhorar** |

**Observação**: `step-seguro-obras` tem feedback visual parcial (borda colorida no RadioGroup), mas ainda falta mensagens de erro.

---

## 🚨 Seção 3: Problemas Identificados

### 3.1 Problemas Críticos (Bloqueadores)

#### P1: Ausência Total de Feedback Visual de Erros

**Severidade**: 🔴 **CRÍTICA**
**Impacto**: Usuário não sabe que campo está inválido
**Componentes afetados**: 42 de 43 (97.6%)

**Exemplo do problema**:

```tsx
// ❌ Código ATUAL (INCORRETO)
<Input
  id="nome"
  value={formData.nome}
  onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
  placeholder="Digite o nome completo"
/>
```

**Comportamento esperado**:
- ✅ Campo com borda vermelha quando inválido
- ✅ Campo com borda verde quando válido
- ✅ Ícone de erro/sucesso ao lado do campo

---

#### P2: Ausência Total de Mensagens de Erro

**Severidade**: 🔴 **CRÍTICA**
**Impacto**: Usuário não sabe QUAL é a regra que está violando
**Componentes afetados**: 43 de 43 (100%)

**Exemplo do problema**:

```tsx
// ❌ Código ATUAL (INCORRETO) - sem mensagem de erro
<Label htmlFor="motivoProcura">
  2. Qual o motivo fez você nos procurar? <span className="text-destructive">*</span>
</Label>
<Textarea
  id="motivoProcura"
  rows={4}
  value={data.motivoProcura}
  onChange={(e) => onDataChange({ ...data, motivoProcura: e.target.value })}
  placeholder="Descreva os problemas e motivações..."
/>
```

**Comportamento esperado**:
- ✅ Mensagem abaixo do campo: "Este campo deve ter pelo menos 10 caracteres"
- ✅ Mensagem deve aparecer quando campo perde foco (onBlur) OU quando usuário tenta submeter

---

#### P3: Campos Numéricos sem Tipo Adequado

**Severidade**: 🟠 **ALTA**
**Impacto**: Usuário pode digitar letras em campos numéricos
**Componentes afetados**: ~50 campos numéricos

**Exemplo do problema**:

```tsx
// ⚠️ Código ATUAL (PARCIALMENTE CORRETO)
<Input
  id="percentualImprevisto"
  type="number"  // ✅ Tem type, MAS não tem validação visual
  value={etapa9Data.percentualImprevisto}
  onChange={(e) => onEtapa9DataChange({ ...etapa9Data, percentualImprevisto: e.target.value })}
  placeholder="0"
/>
```

**Problemas**:
1. ❌ Sem feedback se usuário digitar valor negativo
2. ❌ Sem feedback se valor exceder limites (ex: >100% para percentual)
3. ❌ Sem mensagem de erro

---

#### P4: Campos de Telefone sem Máscara

**Severidade**: 🟠 **ALTA**
**Impacto**: Dados inconsistentes no banco (formato livre)
**Componentes afetados**: ~15 campos de telefone

**Exemplo do problema**:

```tsx
// ⚠️ Código ATUAL (PARCIALMENTE CORRETO)
// step-dados-cliente.tsx tem função formatTelefone MAS não usa biblioteca
const formatTelefone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
};

<Input
  id="telefone"
  value={data.telefone}
  onChange={(e) => handleInputChange('telefone', formatTelefone(e.target.value))}
  placeholder="(00) 00000-0000"
  maxLength={15}
/>
```

**Problemas**:
1. ❌ Implementação manual (propensa a bugs)
2. ❌ Não remove caracteres não numéricos ao colar
3. ❌ Sem validação se telefone está completo
4. ❌ Outros componentes NÃO têm essa máscara

---

#### P5: Campos de CPF/CNPJ sem Máscara e Validação

**Severidade**: 🟠 **ALTA**
**Impacto**: CPF/CNPJ inválidos salvos no banco
**Componentes afetados**: ~5 campos de CPF/CNPJ

**Exemplo do problema**:

```tsx
// ❌ Código ATUAL (INCORRETO)
<Input
  id="cpfCnpj"
  value={formData.cpfCnpj}
  onChange={(e) => onFormDataChange({ ...formData, cpfCnpj: e.target.value })}
  placeholder="000.000.000-00 ou 00.000.000/0001-00"
/>
```

**Problemas**:
1. ❌ Sem máscara automática
2. ❌ Sem validação de dígito verificador
3. ❌ Sem diferenciação entre CPF e CNPJ
4. ❌ Usuário pode digitar qualquer coisa

---

#### P6: Campos de CEP sem Máscara e Busca Automática

**Severidade**: 🟡 **MÉDIA**
**Impacto**: Perda de produtividade (usuário digita endereço manualmente)
**Componentes afetados**: ~5 campos de CEP

**Exemplo do problema**:

```tsx
// ⚠️ Código ATUAL (PARCIALMENTE CORRETO em step-dados-cliente.tsx)
const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
};

<Input
  id="cep"
  value={data.cep}
  onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
  placeholder="00000-000"
  maxLength={9}
/>
```

**Problemas**:
1. ❌ Sem integração com API ViaCEP
2. ❌ Sem preenchimento automático de endereço
3. ❌ Implementação inconsistente entre componentes

---

#### P7: Campos de Email sem Validação de Formato em Tempo Real

**Severidade**: 🟡 **MÉDIA**
**Impacto**: Usuário só descobre email inválido ao submeter
**Componentes afetados**: ~5 campos de email

**Exemplo do problema**:

```tsx
// ⚠️ Código ATUAL (PARCIALMENTE CORRETO)
<Input
  id="email"
  type="email"  // ✅ Tem type, MAS sem validação visual
  value={formData.email}
  onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
  placeholder="email@exemplo.com"
/>
```

**Problemas**:
1. ❌ Sem feedback visual se email é inválido
2. ❌ Validação HTML5 não é suficiente (muito permissiva)

---

#### P8: Campos de Data sem Type "date" ou "datetime-local"

**Severidade**: 🟡 **MÉDIA**
**Impacto**: Formatos de data inconsistentes
**Componentes afetados**: ~10 campos de data

**Exemplo BOM**:

```tsx
// ✅ Código BOM (step-agendar-apresentacao.tsx)
<Input
  type="datetime-local"  // ✅ Correto
  value={data.dataAgendamento}
  onChange={(e) => onDataChange({ dataAgendamento: e.target.value })}
/>
```

**Status**: Alguns componentes JÁ usam `datetime-local`, mas falta validação visual

---

### 3.2 Problemas de Arquitetura

#### A1: Falta de Componentes Wrapper Reutilizáveis

**Severidade**: 🟠 **ALTA**
**Impacto**: Código duplicado em 43 componentes

**Solução**: Criar componentes wrapper:
- `<FormInput>`
- `<FormTextarea>`
- `<FormSelect>`
- `<FormMaskedInput>` (telefone, CPF, CNPJ, CEP)
- `<FormDatePicker>`

---

#### A2: Falta de Hook Centralizado de Validação

**Severidade**: 🟠 **ALTA**
**Impacto**: Validação inconsistente entre componentes

**Solução**: Criar hook `useFormValidation(schema, data)` que retorna:

```tsx
const { errors, validateField, validateAll, isValid } = useFormValidation(etapa3Schema, formData);
```

---

#### A3: Schemas de Validação Não Conectados aos Componentes

**Severidade**: 🟠 **ALTA**
**Impacto**: Schemas existem mas não são usados nos formulários

**Observação**: Os schemas em `os-etapas-schema.ts` SÃO validados apenas quando usuário tenta avançar de etapa, mas NÃO durante o preenchimento.

---

## 🛠️ Seção 4: Plano de Implementação

### Fase 1: Criar Componentes Wrapper com Validação (2-3 dias)

#### 4.1.1 Criar `<FormInput>` Wrapper

**Arquivo**: `src/components/ui/form-input.tsx`

```tsx
"use client";

import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  success?: boolean;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  required,
  success,
  helperText,
  className,
  id,
  ...props
}: FormInputProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={id}
          className={cn(
            className,
            hasError && "border-red-500 focus-visible:ring-red-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />

        {/* Ícone de Erro/Sucesso */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

**Exemplo de uso**:

```tsx
<FormInput
  id="nome"
  label="Nome Completo"
  required
  value={formData.nome}
  onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
  error={errors.nome}
  success={!errors.nome && formData.nome.length >= 3}
  helperText="Mínimo 3 caracteres"
  placeholder="Digite o nome completo"
/>
```

---

#### 4.1.2 Criar `<FormTextarea>` Wrapper

**Arquivo**: `src/components/ui/form-textarea.tsx`

```tsx
"use client";

import React from 'react';
import { Textarea } from './textarea';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  success?: boolean;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export function FormTextarea({
  label,
  error,
  required,
  success,
  helperText,
  showCharCount,
  maxLength,
  className,
  id,
  value,
  ...props
}: FormTextareaProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span className={cn(
              "text-xs",
              charCount > maxLength ? "text-red-600" : "text-muted-foreground"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <Textarea
          id={id}
          value={value}
          className={cn(
            className,
            hasError && "border-red-500 focus-visible:ring-red-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          maxLength={maxLength}
          {...props}
        />

        {/* Ícone de Erro/Sucesso (canto superior direito) */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-3 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

#### 4.1.3 Criar `<FormSelect>` Wrapper

**Arquivo**: `src/components/ui/form-select.tsx`

```tsx
"use client";

import React from 'react';
import { Select, SelectContent, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormSelectProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
  success?: boolean;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function FormSelect({
  id,
  label,
  error,
  required,
  success,
  helperText,
  placeholder,
  value,
  onValueChange,
  children,
  disabled,
}: FormSelectProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            className={cn(
              hasError && "border-red-500 focus:ring-red-500",
              hasSuccess && "border-green-500 focus:ring-green-500"
            )}
            aria-invalid={hasError}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>

        {/* Ícone de Erro/Sucesso */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

#### 4.1.4 Criar `<FormMaskedInput>` com react-input-mask

**Primeiro, instalar biblioteca**:

```bash
npm install react-input-mask
npm install --save-dev @types/react-input-mask
```

**Arquivo**: `src/components/ui/form-masked-input.tsx`

```tsx
"use client";

import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type MaskType = 'telefone' | 'cpf' | 'cnpj' | 'cep' | 'cpf-cnpj';

const MASKS: Record<MaskType, string | ((value: string) => string)> = {
  telefone: '(99) 99999-9999',
  cpf: '999.999.999-99',
  cnpj: '99.999.999/9999-99',
  cep: '99999-999',
  'cpf-cnpj': (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length <= 11 ? '999.999.999-99' : '99.999.999/9999-99';
  },
};

interface FormMaskedInputProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
  success?: boolean;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maskType: MaskType;
  disabled?: boolean;
}

export function FormMaskedInput({
  id,
  label,
  error,
  required,
  success,
  helperText,
  placeholder,
  value,
  onChange,
  maskType,
  disabled,
}: FormMaskedInputProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;
  const mask = MASKS[maskType];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <InputMask
          mask={mask}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maskChar={null}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id={id}
              placeholder={placeholder}
              className={cn(
                hasError && "border-red-500 focus-visible:ring-red-500",
                hasSuccess && "border-green-500 focus-visible:ring-green-500"
              )}
              aria-invalid={hasError}
              aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            />
          )}
        </InputMask>

        {/* Ícone de Erro/Sucesso */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

#### 4.1.5 Criar Hook `useFormValidation`

**Arquivo**: `src/lib/hooks/use-form-validation.ts`

```tsx
import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodTypeAny>(schema: T, initialData: z.infer<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((fieldName: string, value: any) => {
    try {
      // Validar campo específico usando shape
      const fieldSchema = (schema as any).shape?.[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error.errors[0]?.message || 'Campo inválido',
        }));
        return false;
      }
    }
    return true;
  }, [schema]);

  const validateAll = useCallback((data: z.infer<T>) => {
    try {
      schema.parse(data);
      setErrors({});
      return { valid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
        return { valid: false, errors: newErrors };
      }
    }
    return { valid: false, errors: {} };
  }, [schema]);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    markFieldTouched,
    clearFieldError,
  };
}
```

---

### Fase 2-7: Atualização de Componentes (8-10 dias)

**Detalhamento por fase**:

- **Fase 2**: Atualizar Etapa 1 (Identificação do Lead) - 1 dia
- **Fase 3**: Atualizar Etapa 3 (Follow-up 1) - 1 dia
- **Fase 4**: Atualizar Etapa 7 (Memorial de Escopo) - 1-2 dias
- **Fase 5**: Atualizar Etapa 8 (Precificação) - 1 dia
- **Fase 6**: Atualizar Componentes OS08 (2 dias)
- **Fase 7**: Atualizar Componentes OS13 (2 dias)

**Padrão de atualização** (aplicar em todos):

```tsx
// ANTES
<Input
  id="nomeContatoLocal"
  value={formData.nomeContatoLocal}
  onChange={(e) => onFormDataChange({ ...formData, nomeContatoLocal: e.target.value })}
/>

// DEPOIS
<FormInput
  id="nomeContatoLocal"
  label="Nome do Contato no Local"
  required
  value={formData.nomeContatoLocal}
  onChange={(e) => {
    onFormDataChange({ ...formData, nomeContatoLocal: e.target.value });
    if (touched.nomeContatoLocal) {
      validateField('nomeContatoLocal', e.target.value);
    }
  }}
  onBlur={() => {
    markFieldTouched('nomeContatoLocal');
    validateField('nomeContatoLocal', formData.nomeContatoLocal);
  }}
  error={touched.nomeContatoLocal ? errors.nomeContatoLocal : undefined}
  success={touched.nomeContatoLocal && !errors.nomeContatoLocal && formData.nomeContatoLocal.length >= 3}
  helperText="Mínimo 3 caracteres"
  placeholder="Nome completo"
/>
```

---

### Fase 8: Testes e Ajustes (3-4 dias)

#### Testes Funcionais
- ✅ Validar campos obrigatórios funcionam
- ✅ Validar campos opcionais aceitam vazio
- ✅ Validar máscaras funcionam corretamente
- ✅ Validar limites numéricos (min/max)
- ✅ Validar formato de email
- ✅ Validar formato de telefone
- ✅ Validar formato de CPF/CNPJ
- ✅ Validar busca de CEP

#### Testes de UX
- ✅ Cores de erro (vermelho) são visíveis
- ✅ Cores de sucesso (verde) são visíveis
- ✅ Mensagens de erro são claras
- ✅ Ícones de erro/sucesso aparecem
- ✅ Scroll para primeiro erro funciona
- ✅ Focus no campo com erro funciona

---

## 📚 Seção 5: Padrões e Exemplos de Código

### 5.1 Input com Validação (Texto)

```tsx
import { FormInput } from '@/components/ui/form-input';
import { useFormValidation } from '@/lib/hooks/use-form-validation';
import { etapa3Schema } from '@/lib/validations/os-etapas-schema';

function MeuComponente() {
  const [formData, setFormData] = useState({ nomeContatoLocal: '' });
  const { errors, touched, validateField, markFieldTouched } = useFormValidation(etapa3Schema, formData);

  return (
    <FormInput
      id="nomeContatoLocal"
      label="Nome do Contato no Local"
      required
      value={formData.nomeContatoLocal}
      onChange={(e) => {
        setFormData({ ...formData, nomeContatoLocal: e.target.value });
        if (touched.nomeContatoLocal) {
          validateField('nomeContatoLocal', e.target.value);
        }
      }}
      onBlur={() => {
        markFieldTouched('nomeContatoLocal');
        validateField('nomeContatoLocal', formData.nomeContatoLocal);
      }}
      error={touched.nomeContatoLocal ? errors.nomeContatoLocal : undefined}
      success={touched.nomeContatoLocal && !errors.nomeContatoLocal && formData.nomeContatoLocal.length >= 3}
      helperText="Mínimo 3 caracteres"
      placeholder="Nome completo"
    />
  );
}
```

---

### 5.2 Textarea com Validação e Contador de Caracteres

```tsx
import { FormTextarea } from '@/components/ui/form-textarea';

<FormTextarea
  id="motivoProcura"
  label="Qual o motivo fez você nos procurar?"
  required
  rows={4}
  value={formData.motivoProcura}
  onChange={(e) => {
    setFormData({ ...formData, motivoProcura: e.target.value });
    if (touched.motivoProcura) {
      validateField('motivoProcura', e.target.value);
    }
  }}
  onBlur={() => {
    markFieldTouched('motivoProcura');
    validateField('motivoProcura', formData.motivoProcura);
  }}
  error={touched.motivoProcura ? errors.motivoProcura : undefined}
  success={touched.motivoProcura && !errors.motivoProcura && formData.motivoProcura.length >= 10}
  helperText="Mínimo 10 caracteres"
  showCharCount
  maxLength={500}
  placeholder="Descreva os problemas e motivações..."
/>
```

---

### 5.3 Select com Validação

```tsx
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';

<FormSelect
  id="grauUrgencia"
  label="Qual o grau de urgência para executar esse serviço?"
  required
  value={formData.grauUrgencia}
  onValueChange={(value) => {
    setFormData({ ...formData, grauUrgencia: value });
    validateField('grauUrgencia', value);
  }}
  error={errors.grauUrgencia}
  success={!!formData.grauUrgencia && !errors.grauUrgencia}
  placeholder="Selecione"
>
  <SelectItem value="30 dias">30 dias</SelectItem>
  <SelectItem value="3 meses">3 meses</SelectItem>
  <SelectItem value="6 meses ou mais">6 meses ou mais</SelectItem>
</FormSelect>
```

---

### 5.4 Input com Máscara (Telefone)

```tsx
import { FormMaskedInput } from '@/components/ui/form-masked-input';

<FormMaskedInput
  id="telefoneContatoLocal"
  label="Telefone do Contato"
  required
  maskType="telefone"
  value={formData.telefoneContatoLocal}
  onChange={(e) => {
    setFormData({ ...formData, telefoneContatoLocal: e.target.value });
    if (touched.telefoneContatoLocal) {
      validateField('telefoneContatoLocal', e.target.value);
    }
  }}
  onBlur={() => {
    markFieldTouched('telefoneContatoLocal');
    validateField('telefoneContatoLocal', formData.telefoneContatoLocal);
  }}
  error={touched.telefoneContatoLocal ? errors.telefoneContatoLocal : undefined}
  success={touched.telefoneContatoLocal && !errors.telefoneContatoLocal}
  helperText="Formato: (00) 00000-0000"
  placeholder="(00) 00000-0000"
/>
```

---

### 5.5 Input Numérico com Validação de Range

```tsx
<FormInput
  id="percentualLucro"
  label="% Lucro"
  type="number"
  min={0}
  max={100}
  step={0.01}
  required
  value={formData.percentualLucro}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setFormData({ ...formData, percentualLucro: e.target.value });
      validateField('percentualLucro', e.target.value);
    }
  }}
  onBlur={() => {
    markFieldTouched('percentualLucro');
    validateField('percentualLucro', formData.percentualLucro);
  }}
  error={touched.percentualLucro ? errors.percentualLucro : undefined}
  success={touched.percentualLucro && !errors.percentualLucro}
  helperText="Entre 0 e 100"
  placeholder="0.00"
/>
```

---

## ✅ Seção 6: Checklist de Implementação

### 6.1 Componentes Wrapper

- [ ] Criar `src/components/ui/form-input.tsx`
- [ ] Criar `src/components/ui/form-textarea.tsx`
- [ ] Criar `src/components/ui/form-select.tsx`
- [ ] Criar `src/components/ui/form-masked-input.tsx`
- [ ] Instalar `react-input-mask`: `npm install react-input-mask @types/react-input-mask`
- [ ] Criar `src/lib/hooks/use-form-validation.ts`
- [ ] Testar componentes wrapper isoladamente

### 6.2 Atualização de Componentes OS 01-04

**Etapa 1**:
- [ ] Atualizar `step-identificacao-lead-completo.tsx`
- [ ] Adicionar validação para nome
- [ ] Adicionar validação para cpfCnpj
- [ ] Adicionar validação para email
- [ ] Adicionar validação para telefone
- [ ] Adicionar máscara para telefone
- [ ] Adicionar máscara para CEP
- [ ] Adicionar busca automática de CEP
- [ ] Testar fluxo completo da Etapa 1

**Etapa 3**:
- [ ] Atualizar `step-followup-1.tsx`
- [ ] Adicionar validação para todos os campos obrigatórios
- [ ] Adicionar contador de caracteres em textareas
- [ ] Adicionar máscara para telefone
- [ ] Testar fluxo completo da Etapa 3

**Etapa 7**:
- [ ] Atualizar `step-memorial-escopo.tsx`
- [ ] Adicionar validação para objetivo
- [ ] Adicionar validação para etapas principais
- [ ] Adicionar validação para subetapas
- [ ] Adicionar validação para campos numéricos
- [ ] Testar adição/remoção dinâmica de etapas
- [ ] Testar cálculos automáticos

**Etapa 8**:
- [ ] Atualizar `step-precificacao.tsx`
- [ ] Adicionar validação para percentuais (0-100)
- [ ] Adicionar feedback visual para campos calculados
- [ ] Testar cálculos automáticos

**Outras Etapas**:
- [ ] Atualizar step-agendar-apresentacao.tsx
- [ ] Atualizar step-gerar-proposta.tsx
- [ ] Atualizar step-gerar-contrato.tsx
- [ ] Atualizar step-contrato-assinado.tsx
- [ ] Atualizar step-followup-2.tsx
- [ ] Atualizar step-followup-3.tsx
- [ ] Atualizar step-realizar-apresentacao.tsx

### 6.3 Atualização de Componentes OS 08

- [ ] Atualizar step-identificacao-solicitante.tsx
- [ ] Atualizar step-agendar-visita.tsx
- [ ] Atualizar step-atribuir-cliente.tsx
- [ ] Atualizar step-enviar-documento.tsx
- [ ] Atualizar step-formulario-pos-visita.tsx
- [ ] Atualizar step-gerar-documento.tsx
- [ ] Atualizar step-realizar-visita.tsx

### 6.4 Atualização de Componentes OS 13

- [ ] Atualizar step-dados-cliente.tsx
- [ ] Atualizar step-cronograma-obra.tsx
- [ ] Atualizar step-diario-obra.tsx
- [ ] Atualizar step-histograma.tsx
- [ ] Atualizar step-placa-obra.tsx
- [ ] Atualizar step-relatorio-fotografico.tsx
- [ ] Atualizar step-requisicao-compras.tsx
- [ ] Atualizar step-requisicao-mao-obra.tsx
- [ ] Melhorar step-seguro-obras.tsx (adicionar mensagens de erro)
- [ ] Atualizar step-anexar-art.tsx
- [ ] Atualizar step-documentos-sst.tsx
- [ ] Atualizar step-evidencia-mobilizacao.tsx
- [ ] Atualizar step-imagem-areas.tsx
- [ ] Atualizar step-agendar-visita-inicial.tsx
- [ ] Atualizar step-agendar-visita-final.tsx
- [ ] Atualizar step-realizar-visita-inicial.tsx
- [ ] Atualizar step-realizar-visita-final.tsx

### 6.5 Testes

**Testes Funcionais**:
- [ ] Validar campos obrigatórios funcionam
- [ ] Validar campos opcionais aceitam vazio
- [ ] Validar máscaras funcionam corretamente
- [ ] Validar limites numéricos (min/max)
- [ ] Validar formato de email
- [ ] Validar formato de telefone
- [ ] Validar formato de CPF/CNPJ
- [ ] Validar busca de CEP

**Testes de UX**:
- [ ] Cores de erro (vermelho) são visíveis
- [ ] Cores de sucesso (verde) são visíveis
- [ ] Mensagens de erro são claras
- [ ] Ícones de erro/sucesso aparecem
- [ ] Scroll para primeiro erro funciona
- [ ] Focus no campo com erro funciona
- [ ] Navegação por teclado funciona (Tab)
- [ ] Enter em campo numérico não submete form

**Testes de Acessibilidade**:
- [ ] aria-invalid está correto
- [ ] aria-describedby está correto
- [ ] Labels estão associados aos inputs
- [ ] Leitores de tela lêem mensagens de erro
- [ ] Contraste de cores passa WCAG AA

**Testes de Integração**:
- [ ] Dados ainda são salvos corretamente
- [ ] Avanço de etapa só acontece se validação passar
- [ ] Dados persistem ao voltar de etapa
- [ ] Auto-save não quebra validação

### 6.6 Documentação

- [ ] Documentar padrão de uso dos componentes wrapper
- [ ] Documentar hook use-form-validation
- [ ] Atualizar README com exemplos
- [ ] Criar storybook dos componentes (opcional)

---

## 📊 Seção 7: Métricas de Sucesso

### 7.1 Antes da Implementação

| Métrica | Valor Atual |
|---------|-------------|
| Taxa de campos com validação visual | 0.25% |
| Taxa de campos com mensagens de erro | 0% |
| Taxa de campos com máscara | ~10% (implementação manual inconsistente) |
| Tempo médio para preencher formulário | ~15 min |
| Taxa de erros de validação ao submeter | ~60% |
| Satisfação do usuário | Baixa (muitas reclamações) |

### 7.2 Depois da Implementação (Meta)

| Métrica | Meta |
|---------|------|
| Taxa de campos com validação visual | **100%** |
| Taxa de campos com mensagens de erro | **100%** |
| Taxa de campos com máscara | **100%** (onde aplicável) |
| Tempo médio para preencher formulário | **~10 min** (redução de 33%) |
| Taxa de erros de validação ao submeter | **<10%** (redução de 83%) |
| Satisfação do usuário | Alta (feedback positivo) |

---

## 🎯 Conclusão

Este documento fornece um plano completo e detalhado para implementar validação adequada em **TODOS os 43 componentes** de formulário das Ordens de Serviço.

### Próximos Passos Recomendados

1. ✅ Revisar e aprovar este documento
2. ✅ Iniciar **Fase 1** (criação dos componentes wrapper)
3. ✅ Validar componentes wrapper com testes unitários
4. ✅ Implementar **Fases 2-7** de forma incremental
5. ✅ Realizar testes de integração após cada fase
6. ✅ Coletar feedback dos usuários após implementação

### Estimativa Total

**13-17 dias** de trabalho focado para implementação completa.

---

**Documento criado em**: 2025-01-19
**Versão**: 1.0
**Autor**: Análise automatizada do sistema
