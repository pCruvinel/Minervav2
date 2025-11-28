Com base em todas as informações técnicas, regras de negócio e cronogramas que discutimos (especialmente a transição para a v2.0 com workflows polimórficos e correção de Enums), preenchi o modelo completamente.

Não tenho dúvidas pendentes. As definições de **Workflows (13 tipos)**, **Hierarquia (7 níveis/slugs)** e **Stack Técnico (Supabase/React)** estão claras.

Abaixo está o PRD Oficial v2.0 no seu modelo:

# 📋 Product Requirements Document (PRD) - Minerva ERP

> **TEMPLATE** - Documento Mestre de Especificação para Desenvolvimento v2.0

---

## 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Projeto** | Minerva ERP (Sistema de Gestão de Engenharia) |
| **Data de Criação** | 28/11/2025 |
| **Versão** | 2.0 (Definitiva) |
| **Status** | 🟢 Aprovado para Implementação |
| **Cliente** | Minerva Engenharia |
| **Responsável (PM)** | [Seu Nome] |

---

## 1️⃣ RESUMO EXECUTIVO

> Visão geral da refatoração v2.0 e novas capacidades de workflow.

### 🎯 Visão em Uma Frase

Uma plataforma centralizada que orquestra 13 fluxos de trabalho distintos de engenharia e assessoria, garantindo segurança de dados por setor e automação de contratos através de um motor polimórfico.

### 📊 Objetivos de Negócio

- [ ] **Objetivo 1**: **Padronização Operacional**: Implementar workflows rígidos onde cada tipo de OS (Perícia, Assessoria, Reforma) segue etapas de validação obrigatórias.
- [ ] **Objetivo 2**: **Segurança da Informação**: Garantir que o setor de Obras não acesse dados da Assessoria e vice-versa, enquanto a Diretoria tem visão global.
- [ ] **Objetivo 3**: **Eficiência na Delegação**: Automatizar a distribuição de tarefas e evitar "gargalos" manuais na transição de Vendas para Execução (Start de Obra).

### ✅ Resultado Esperado

Quando este projeto estiver completo:

- **Usuários conseguirão**: Executar processos complexos (15 etapas) sem esquecer documentos ou validações.
- **Empresa economizará**: Tempo em retrabalho administrativo e correções de dados inconsistentes.
- **Métrica de sucesso**: 100% de adesão ao Workflow Digital (Zero planilhas paralelas).

---

## 2️⃣ CONTEXTO

### 🏢 Sobre a Empresa

| Aspecto | Descrição |
|--------|-----------|
| **Nome** | Minerva Engenharia |
| **Tamanho** | Média - Equipes de Escritório e Campo |
| **Indústria** | Engenharia Civil, Construção e Assessoria Técnica |
| **Mercado** | B2B (Condomínios, Empresas) e B2C |

### 📍 Situação Atual

O sistema atual (v1.0) possui divergências críticas entre a estrutura do Banco de Dados e o Código (Enums incompatíveis), gerando erros de tipagem. Além disso, o workflow era estático, não atendendo a diferença de complexidade entre uma "Troca de Lâmpada" e uma "Revitalização de Fachada".

### ⏰ Por Que Agora?

A operação cresceu e a falta de distinção entre os processos de **Assessoria** e **Obras** está gerando confusão. A correção da dívida técnica (Enums/Schema) é urgente para evitar paralisia do software.

---

## 3️⃣ PROBLEMA

### 🔴 Problema Principal

**Falta de flexibilidade nos processos e isolamento de dados inseguro.** O sistema antigo tratava todas as OSs de forma igual e não garantia via banco de dados (RLS) que um Gestor de Obras não visse dados confidenciais da Assessoria ou Financeiro.

### 📉 Impacto do Problema

- **⏳ Tempo desperdiçado**: Gestores corrigindo status de OSs manualmente.
- **💰 Risco Financeiro**: Visualização indevida de dados financeiros por perfis técnicos.
- **⚠️ Outro impacto**: Inconsistência de dados (erros no frontend devido a Enums incorretos).

### 🔧 Como Resolvem Hoje

Uso de processos manuais fora do sistema para OSs complexas e controle visual (confiança) para acesso a dados, sem bloqueio real via software.

### ❌ Por Que Não É Suficiente

A escala da empresa exige bloqueios sistêmicos. "Confiar" que o usuário não vai clicar no menu Financeiro não é uma política de segurança válida.

### 👥 Usuários Afetados

- **Gestores (Obras/Assessoria)**: 5-10 pessoas (Precisam de isolamento).
- **Diretoria/Adm**: 3-5 pessoas (Precisam de visão total).
- **Colaboradores**: 20+ pessoas (Operacional).
- **Mão de Obra**: 50+ pessoas (Apenas custo, sem acesso).

---

## 4️⃣ SOLUÇÃO PROPOSTA

### 💡 Visão Geral

Um ERP v2.0 com **Motor de Workflow Polimórfico** (adapta as etapas conforme o tipo de serviço) e **Segurança RLS (Row Level Security)** nativa do banco de dados.

### 🔄 Como Funciona (Fluxo Alto Nível)

1. **Adm cria OS**: Seleciona tipo (ex: "OS-01 Perícia"). O sistema carrega o workflow de 15 etapas.
2. **Execução**: Equipes cumprem etapas (Vistoria, Orçamento). O sistema valida dados a cada passo.
3. **Gatilho Automático**: Ao concluir a Etapa 15, o sistema gera automaticamente a "OS-13" (Start de Contrato) para a equipe de obras iniciar a execução.

### 🌟 Benefícios Principais

- **Segurança Real**: O banco de dados bloqueia queries de usuários não autorizados (mesmo se o frontend for alterado).
- **Automação**: Criação automática de OS de execução após venda.
- **Agenda Integrada**: Calendário proprietário que impede *overbooking* de técnicos.

### 🏆 Diferencial

| Comparação | Diferença |
|-----------|-----------|
| **vs Solução Atual (v1)** | Suporte a 13 tipos de fluxos diferentes vs 1 fluxo único rígido. |
| **vs Planilhas/Trello** | Validação de dados obrigatórios (Zod) e bloqueio financeiro real. |

---

## 5️⃣ PERSONAS

### 👤 Persona 1: Gestor Administrativo (Super Gestor)

**📋 Perfil**
- **Role:** `gestor_administrativo`
- **Poder:** Acesso transversal (Vê Obras, Assessoria e Adm).
- **Foco:** Financeiro e Fluxo de Contratos.

**🎯 Goals**
- Garantir que nenhuma OS fique parada na etapa de "Contrato".
- Conciliar lançamentos financeiros de todos os setores.

**😣 Pain Points**
- Ter que pedir para o Gestor de Obras status de visitas o tempo todo.

**💻 Contexto de Uso**
- Desktop, dia todo. Dashboard Financeiro e Kanban de OS.

---

### 👤 Persona 2: Gestor de Obras

**📋 Perfil**
- **Role:** `gestor_obras`
- **Poder:** Isolado (Vê apenas Obras).
- **Foco:** Execução técnica e Cronograma.

**🎯 Goals**
- Receber a OS de "Start de Contrato" (OS-13) com todas as infos prontas.
- Controlar a agenda dos técnicos de campo.

**😣 Pain Points**
- Receber OS sem vistoria feita ou sem orçamento aprovado.

**💻 Contexto de Uso**
- Híbrido (Escritório/Obra). Usa Calendário e Checklist de OS.

---

## 6️⃣ FEATURES

### 🚀 Features MVP (Essenciais para v2.0)

> ⚠️ Foco na correção estrutural e nos novos workflows.

---

#### ✨ Feature 1: Motor de Workflow Polimórfico (13 Tipos)

**📝 Descrição**: Sistema que renderiza etapas diferentes baseadas no código da OS (`OS-01` tem 15 etapas, `OS-09` tem 5 etapas).
**❓ Por quê**: Processos de complexidades diferentes não podem ter a mesma exigência burocrática.
**💬 Exemplo**: Ao abrir uma "Requisição de Compra", o usuário vê apenas 5 passos rápidos. Ao abrir "Perícia", vê 15 passos detalhados.
**🔴 Prioridade**: CRÍTICA

---

#### ✨ Feature 2: Segurança RLS Granular

**📝 Descrição**: Políticas de banco PostgreSQL que impedem `gestor_obras` de ver tabela `financeiro` e dados de `assessoria`. Bloqueio total de login para `mao_de_obra`.
**❓ Por quê**: Compliance e segurança de dados sensíveis da empresa.
**💬 Exemplo**: Se o Gestor de Obras tentar acessar a URL direta `/financeiro`, o banco retorna lista vazia/erro.
**🔴 Prioridade**: CRÍTICA

---

#### ✨ Feature 3: Calendário Customizado (Turnos e Vagas)

**📝 Descrição**: Sistema de agendamento com lógica de turnos (Manhã/Tarde), recorrência e validação de capacidade via RPC.
**❓ Por quê**: Evitar conflito de agenda (dois clientes no mesmo horário).
**💬 Exemplo**: Adm tenta agendar visita na Terça de Manhã. Sistema avisa "Turno Lotado (0/3 Vagas)".
**🔴 Prioridade**: ALTA

---

#### ✨ Feature 4: Automação de Gatilho (OS-13)

**📝 Descrição**: Criação automática da OS de Execução quando a OS de Venda/Projeto é concluída.
**❓ Por quê**: Garante a passagem de bastão (Handoff) perfeita entre Comercial e Obras.
**💬 Exemplo**: Diretor aprova contrato na OS-01. Imediatamente aparece uma OS-13 "Em Triagem" para o Gestor de Obras.
**🔴 Prioridade**: MÉDIA/ALTA

---

### 🎁 Features Pós-MVP

#### 🔮 Feature A: App Mobile Offline-First
**📝 Descrição**: Permitir preencher checklist de vistoria sem internet na obra.
**📅 Timeline**: Q2 2026

#### 🔮 Feature B: Integração WhatsApp
**📝 Descrição**: Notificar cliente automaticamente quando agendamento for confirmado.
**📅 Timeline**: Q1 2026

---

## 7️⃣ REQUISITOS TÉCNICOS

### 📈 Escalabilidade

| Período | Quantidade |
|---------|-----------|
| **Dia 1** | ~30 Usuários (Gestão + Colaboradores) |
| **Mês 6** | ~1000 OSs no histórico |

### 🔒 Dados & Conformidade

| Aspecto | Resposta |
|--------|----------|
| **Dados sensíveis?** | SIM (Contratos, Valores Financeiros, Dados de Clientes) |
| **Segurança** | RLS (Row Level Security) no Supabase obrigatório. |

### 📱 Plataformas

- [x] Web Desktop (Foco Gestão)
- [x] Web Mobile Responsivo (Foco Técnicos de Campo)

### 🔗 Integrações

- [x] Supabase Auth / Database / Storage
- [x] Geração de PDF (Propostas)

### ⚡ Performance

| Métrica | Alvo |
|--------|------|
| **Carregamento OS** | < 1 segundo (Lazy loading de etapas) |
| **Validação** | Instantânea (Zod no client-side) |

---

## 8️⃣ TIMELINE

### 📅 Datas Importantes

| Marco | Data |
|------|------|
| **Migração Banco (v1->v2)** | Imediato (D+1) |
| **Lançamento v2.0** | Imediato (D+3 após testes) |

### 🎯 Milestones

- **Milestone 1**: Correção dos Enums e Schema do Banco.
- **Milestone 2**: Implementação do Workflow Polimórfico no Frontend.
- **Milestone 3**: Teste de Carga e validação de permissões RLS.

### 🚫 Constraints

- **Deadline duro?** SIM. O sistema atual tem bugs de tipagem que impedem novas features.

---

## 🔟 MÉTRICAS DE SUCESSO

### 🎯 Métrica Primária

**Integridade de Dados (Zero Erros de Tipo)**
- **Target**: 0 erros de "Type Mismatch" no Sentry/Console.
- **Importância**: 🔴 CRÍTICA

### 📊 Métricas Secundárias

| Métrica | Target | Prazo |
|--------|--------|-------|
| **Tempo de Ciclo OS** | Reduzir em 20% | 3 Meses |
| **Uso do Calendário** | 100% das visitas agendadas | 1 Mês |

### ✅ Critérios de Aceitação

- [ ] Login de "Mão de Obra" deve ser rejeitado.
- [ ] Gestor de Obras não visualiza Financeiro.
- [ ] OS-01 concluída gera OS-13 automaticamente.
- [ ] Calendário bloqueia agendamento sem vaga.

---

## 1️⃣1️⃣ DEPENDÊNCIAS & RISCOS

### 🔗 Dependências

- Acesso admin ao projeto Supabase para rodar Migrations.
- Definição final dos campos dos formulários das 13 OSs.

### ⚠️ Riscos

#### Risco 1: Perda de dados na migração
- **Probabilidade**: 🟡 Média
- **Impacto**: 🔴 Alto
- **Mitigação**: Backup completo do banco v1 antes de rodar scripts de alteração de Enums.

#### Risco 2: Resistência do usuário ao novo fluxo rígido
- **Probabilidade**: 🟡 Média
- **Impacto**: 🟡 Médio
- **Mitigação**: Treinamento focado em mostrar que o sistema "pensa por eles" (automação).

---

## 1️⃣2️⃣ APROVAÇÃO

### 👨‍💼 Stakeholders

- [ ] **Cliente**: Minerva Engenharia
- [ ] **Tech Lead**: (Eu/AI Assistant)

---

## 🔐 Classificação

| Campo | Valor |
|-------|-------|
| **Classificação** | CONFIDENCIAL / INTERNO |
| **Última atualização** | 28/11/2025 |