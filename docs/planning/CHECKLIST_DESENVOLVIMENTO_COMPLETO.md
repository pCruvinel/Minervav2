# 📋 Checklist de Desenvolvimento Completo - Minerva ERP v2.0

## 📊 Visão Geral do Projeto

**Sistema:** ERP para gestão de Ordens de Serviço, Financeiro e Dashboard  
**Domínio:** Engenharia civil, construção e assessoria técnica  
**Stack:** React/TypeScript + Supabase + PostgreSQL  
**Arquitetura:** Full-stack com RLS, workflows polimórficos, calendário customizado  

**Escopo Total:** 13 tipos de OS, 15 etapas por workflow, 7 perfis de usuário, 8 módulos principais  
**Estimativa Total:** 240-320 horas de desenvolvimento  
**Prazo Sugerido:** 8-12 semanas (dependendo da equipe)

---

## 🎯 Marcos de Entrega (Milestones)

### Milestone 1: Infraestrutura e Autenticação (2-3 semanas)
- [ ] Setup do projeto e dependências
- [ ] Sistema de autenticação completo
- [ ] Autorização baseada em perfis
- [ ] Dashboard básico funcional

### Milestone 2: Core Business Logic (3-4 semanas)
- [ ] Módulo OS com workflows básicos
- [ ] Gestão de clientes (CRM)
- [ ] Calendário e agendamentos
- [ ] Interface responsiva

### Milestone 3: Funcionalidades Avançadas (2-3 semanas)
- [ ] Workflows polimórficos completos
- [ ] Módulos Financeiro e Colaboradores
- [ ] Upload de arquivos e storage
- [ ] Notificações e comunicação

### Milestone 4: Qualidade e Produção (1-2 semanas)
- [ ] Testes completos (unitários, integração, E2E)
- [ ] Otimizações de performance
- [ ] Segurança e auditoria
- [ ] Deploy e documentação

---

## 1️⃣ INFRAESTRUTURA E CONFIGURAÇÃO

### 1.1 Setup do Projeto
- [ ] **Configurar ambiente de desenvolvimento**
  - Instalar Node.js 18+, npm/yarn
  - Clonar repositório e instalar dependências
  - Configurar VSCode com extensões recomendadas
  - **Tempo:** 2-4 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Configurar Supabase**
  - Criar projeto no Supabase
  - Configurar variáveis de ambiente
  - Setup de banco PostgreSQL
  - **Tempo:** 4-6 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Estrutura de pastas e organização**
  - Verificar estrutura src/ (components, lib, hooks, etc.)
  - Configurar scripts de build e desenvolvimento
  - Setup de linting e formatação (ESLint, Prettier)
  - **Tempo:** 2-3 horas | **Prioridade:** 🟡 ALTA

### 1.2 Dependências e Build
- [ ] **Verificar dependências críticas**
  - React 18.3+, TypeScript, Vite
  - TanStack Router, TanStack Query
  - Supabase JS, Zod, React Hook Form
  - Tailwind CSS, Shadcn/UI
  - **Tempo:** 1-2 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Configurar build e deploy**
  - Scripts npm (dev, build, test, lint)
  - Configuração Vite para produção
  - Setup CI/CD básico
  - **Tempo:** 2-3 horas | **Prioridade:** 🟡 ALTA

---

## 2️⃣ AUTENTICAÇÃO E AUTORIZAÇÃO

### 2.1 Sistema de Login
- [ ] **Implementar autenticação Supabase**
  - Formulário de login com validação
  - Recuperação de senha
  - Persistência de sessão
  - **Tempo:** 8-12 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Gerenciamento de sessão**
  - Context API para estado do usuário
  - Refresh tokens automático
  - Logout seguro
  - **Tempo:** 4-6 horas | **Prioridade:** 🔴 CRÍTICA

### 2.2 Controle de Acesso (RBAC)
- [ ] **Implementar Row Level Security (RLS)**
  - Políticas para todas as tabelas críticas
  - Controle baseado em cargo_slug e setor_slug
  - Bloqueio de mão_de_obra_access
  - **Tempo:** 12-16 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Permissões por módulo**
  - Financeiro: apenas admin/diretoria/gestor_administrativo
  - OS: gestores podem criar/editar, colaboradores visualizar próprias
  - Calendário: gestores criam turnos, todos visualizam
  - **Tempo:** 6-8 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Sistema de delegação**
  - Trigger validar_regras_delegacao
  - Interface para delegar tarefas
  - Notificações de delegação
  - **Tempo:** 8-10 horas | **Prioridade:** 🟡 ALTA

---

## 3️⃣ DASHBOARD E NAVEGAÇÃO

### 3.1 Interface Base
- [ ] **Layout responsivo**
  - Sidebar com navegação
  - Header com informações do usuário
  - Tema claro/escuro
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

- [ ] **Dashboards adaptativos**
  - Dashboard Diretoria: KPIs financeiros globais
  - Dashboard Gestores: métricas operacionais do setor
  - Dashboard Colaborador: tarefas pessoais
  - **Tempo:** 12-16 horas | **Prioridade:** 🟡 ALTA

### 3.2 Navegação e UX
- [ ] **Sistema de roteamento**
  - TanStack Router configurado
  - Proteção de rotas autenticadas
  - Navegação baseada em permissões
  - **Tempo:** 4-6 horas | **Prioridade:** 🟡 ALTA

- [ ] **Componentes de navegação**
  - Breadcrumbs
  - Botões de ação contextuais
  - Indicadores de progresso
  - **Tempo:** 3-4 horas | **Prioridade:** 🟢 MÉDIA

---

## 4️⃣ MÓDULO OS (WORKFLOWS)

### 4.1 Workflow Base
- [ ] **Estrutura de dados OS**
  - Tabela ordens_servico
  - Tabela os_etapas (15 etapas)
  - Relacionamentos com clientes, tipos_os
  - **Tempo:** 8-10 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Workflow stepper unificado**
  - Componente WorkflowStepper
  - Navegação entre etapas
  - Validação por etapa
  - **Tempo:** 16-20 horas | **Prioridade:** 🔴 CRÍTICA

### 4.2 Workflows Polimórficos
- [ ] **13 tipos de OS diferentes com workflows específicos**
  - **OS-01 (Perícia de Fachada)**: 15 etapas completas (Obras)
  - **OS-02 (Revitalização de Fachada)**: 15 etapas completas (Obras)
  - **OS-03 (Reforço Estrutural)**: 15 etapas completas (Obras)
  - **OS-04 (Outros - Obras)**: 15 etapas completas (Obras)
  - **OS-05 (Assessoria Mensal - Lead)**: Workflow específico (Assessoria)
  - **OS-06 (Assessoria Avulsa - Lead)**: Workflow específico (Assessoria)
  - **OS-07 (Solicitação de Reforma)**: Workflow específico (Assessoria)
  - **OS-08 (Visita Técnica/Parecer)**: Workflow específico (Assessoria)
  - **OS-09 (Requisição de Compras)**: 5 etapas simplificadas (Financeiro)
  - **OS-10 (Requisição de Mão de Obra)**: Workflow específico (RH)
  - **OS-11 (Start Contrato Assessoria Mensal)**: Workflow específico (Assessoria)
  - **OS-12 (Start Contrato Assessoria Avulsa)**: Workflow específico (Assessoria)
  - **OS-13 (Start de Contrato de Obra)**: Workflow específico (Obras)
  - **Tempo:** 20-24 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Implementar 15 etapas padrão do workflow OS**
  1. Identificação do Cliente
  2. Seleção do Tipo de OS
  3. Follow-up 1 (Entrevista Inicial)
  4. Agendar Visita Técnica
  5. Realizar Visita
  6. Follow-up 2 (Pós-Visita)
  7. Formulário Memorial (Escopo)
  8. Precificação
  9. Gerar Proposta Comercial
  10. Agendar Visita (Apresentação)
  11. Realizar Visita (Apresentação)
  12. Follow-up 3 (Pós-Apresentação)
  13. Gerar Contrato (Upload)
  14. Contrato Assinado
  15. Iniciar Contrato de Obra (gatilho automático OS-13)
  - **Tempo:** 16-20 horas | **Prioridade:** 🔴 CRÍTICA

- [ ] **Regras de negócio por etapa**
  - Validações específicas (etapa 3: flexibilidade reduzida)
  - Auto-save automático
  - Salvamento como rascunho
  - **Tempo:** 12-16 horas | **Prioridade:** 🟡 ALTA

### 4.3 Funcionalidades Avançadas
- [ ] **Delegação de tarefas**
  - Interface de delegação
  - Regras de permissão
  - Notificações
  - **Tempo:** 8-10 horas | **Prioridade:** 🟡 ALTA

- [ ] **Timeline e histórico**
  - Registro de todas as ações
  - Visualização cronológica
  - Filtros e busca
  - **Tempo:** 6-8 horas | **Prioridade:** 🟢 MÉDIA

---

## 5️⃣ MÓDULO CLIENTES (CRM)

### 5.1 Gestão de Clientes
- [ ] **CRUD completo de clientes**
  - Cadastro com validação
  - Busca e filtros
  - Perfis detalhados
  - **Tempo:** 8-12 horas | **Prioridade:** 🟡 ALTA

- [ ] **Sistema de leads**
  - Conversão lead → cliente
  - Status e acompanhamento
  - Integração com OS
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

### 5.2 Funcionalidades CRM
- [ ] **Histórico de interações**
  - Registro de contatos
  - Documentos anexados
  - Timeline de atividades
  - **Tempo:** 4-6 horas | **Prioridade:** 🟢 MÉDIA

---

## 6️⃣ MÓDULO COLABORADORES

### 6.1 Gestão de Equipe
- [ ] **Perfis de usuário**
  - 7 níveis hierárquicos
  - Cargos e setores
  - Permissões granulares
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

- [ ] **Controle de presença**
  - Registro de ponto
  - Relatórios de horas
  - Controle de acesso
  - **Tempo:** 8-10 horas | **Prioridade:** 🟢 MÉDIA

---

## 7️⃣ MÓDULO FINANCEIRO

### 7.1 Contas a Pagar/Receber
- [ ] **Lançamentos financeiros (tabela financeiro_lancamentos)**
  - Interface de entrada para receitas e despesas
  - Campos: descrição, valor, tipo (receita/despesa), data_vencimento, data_pagamento
  - Vínculo com centros de custo (cc_id)
  - Vínculo com clientes (cliente_id)
  - Status de conciliação (conciliado boolean)
  - **Tempo:** 10-12 horas | **Prioridade:** 🟡 ALTA

- [ ] **Contas a Receber**
  - Listagem de receitas pendentes e recebidas
  - Filtros por período, cliente, status
  - Marcação de recebimentos
  - Relatórios de inadimplência
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

- [ ] **Contas a Pagar**
  - Listagem de despesas pendentes e pagas
  - Filtros por período, fornecedor, categoria
  - Marcação de pagamentos
  - Controle de vencimentos
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

### 7.2 Conciliação Bancária
- [ ] **Conciliação automática**
  - Importação de extratos bancários
  - Matching automático de lançamentos
  - Resolução de diferenças
  - **Tempo:** 8-10 horas | **Prioridade:** 🟢 MÉDIA

- [ ] **Relatórios financeiros**
  - Dashboard financeiro com KPIs
  - Fluxo de caixa mensal/anual
  - Demonstrativos de resultado
  - Análises por centro de custo
  - **Tempo:** 8-10 horas | **Prioridade:** 🟢 MÉDIA

### 7.3 Centro de Custos
- [ ] **Gestão de centros de custos**
  - Criação e edição de CCs
  - Vínculo com OS e clientes
  - Controle de orçamento por CC
  - Relatórios por centro de custo
  - **Tempo:** 4-6 horas | **Prioridade:** 🟢 MÉDIA

---

## 8️⃣ MÓDULO CALENDÁRIO

### 8.1 Calendário Customizado
- [ ] **Sistema de turnos**
  - Criação de turnos (Manhã/Tarde)
  - Recorrência semanal
  - Capacidade por turno
  - **Tempo:** 12-16 horas | **Prioridade:** 🟡 ALTA

- [ ] **Agendamentos**
  - Validação de vagas
  - Conflito de horários
  - Vínculo obrigatório com OS
  - **Tempo:** 8-10 horas | **Prioridade:** 🟡 ALTA

### 8.2 Visualizações
- [ ] **Calendário semanal**
  - Grade 7 dias × 11 horas
  - Turnos posicionados absolutamente
  - Interação drag-and-drop
  - **Tempo:** 6-8 horas | **Prioridade:** 🟢 MÉDIA

---

## 9️⃣ TESTES E QUALIDADE

### 9.1 Testes Unitários
- [ ] **Hooks customizados**
  - useAuth, useOS, useClientes
  - Cobertura > 80%
  - **Tempo:** 16-20 horas | **Prioridade:** 🟡 ALTA

- [ ] **Componentes críticos**
  - WorkflowStepper
  - Formulários complexos
  - Componentes de UI
  - **Tempo:** 12-16 horas | **Prioridade:** 🟡 ALTA

### 9.2 Testes de Integração
- [ ] **Fluxos completos**
  - Criação de OS end-to-end
  - Login → Dashboard → OS
  - **Tempo:** 8-12 horas | **Prioridade:** 🟡 ALTA

- [ ] **APIs e banco**
  - Endpoints Supabase
  - RLS funcionando
  - **Tempo:** 6-8 horas | **Prioridade:** 🟡 ALTA

### 9.3 Testes E2E
- [ ] **Cenários críticos**
  - Workflow completo de OS
  - Agendamento de visitas
  - Upload de arquivos
  - **Tempo:** 10-14 horas | **Prioridade:** 🟢 MÉDIA

---

## 🔟 SEGURANÇA E PERFORMANCE

### 10.1 Segurança
- [ ] **Auditoria completa**
  - Logs de todas as operações
  - Rastreamento de mudanças
  - Compliance LGPD
  - **Tempo:** 8-10 horas | **Prioridade:** 🟡 ALTA

- [ ] **Validações de segurança**
  - Sanitização de inputs
  - Proteção contra XSS
  - Rate limiting
  - **Tempo:** 4-6 horas | **Prioridade:** 🟡 ALTA

### 10.2 Performance
- [ ] **Otimizações frontend**
  - Lazy loading de componentes
  - Memoização (React.memo, useMemo)
  - Bundle splitting
  - **Tempo:** 6-8 horas | **Prioridade:** 🟢 MÉDIA

- [ ] **Otimização de queries**
  - Queries eficientes Supabase
  - Cache inteligente
  - Paginação automática
  - **Tempo:** 4-6 horas | **Prioridade:** 🟢 MÉDIA

---

## 1️⃣1️⃣ DEPLOY E PRODUÇÃO

### 11.1 Preparação para Produção
- [ ] **Configuração de produção**
  - Variáveis de ambiente
  - Build otimizado
  - CDN para assets
  - **Tempo:** 4-6 horas | **Prioridade:** 🟡 ALTA

- [ ] **Backup e recuperação**
  - Estratégia de backup
  - Plano de contingência
  - Recuperação de desastres
  - **Tempo:** 3-4 horas | **Prioridade:** 🟡 ALTA

### 11.2 Monitoramento
- [ ] **Logging e monitoramento**
  - Sentry para erros
  - Analytics de uso
  - Performance monitoring
  - **Tempo:** 4-6 horas | **Prioridade:** 🟢 MÉDIA

- [ ] **Documentação final**
  - Guia de usuário
  - Documentação técnica
  - Runbook de operações
  - **Tempo:** 6-8 horas | **Prioridade:** 🟢 MÉDIA

---

## 📈 DEPENDÊNCIAS ENTRE TAREFAS

### Dependências Críticas (Devem ser feitas primeiro)
1. **Infraestrutura** → Tudo depende disso
2. **Autenticação** → Necessária para qualquer funcionalidade
3. **OS Core** → Base para agendamentos e financeiro

### Dependências por Módulo
- **Calendário** depende de **OS** (agendamentos vinculados)
- **Financeiro** depende de **OS** (lançamentos vinculados)
- **Colaboradores** depende de **Autenticação** (perfis de usuário)

### Dependências de Testes
- Testes unitários podem ser feitos em paralelo com desenvolvimento
- Testes de integração só após módulos básicos prontos
- Testes E2E só no final

---

## 📱 TELAS FRONTEND PENDENTES

### Telas Principais por Módulo

#### 1. **Autenticação e Acesso**
- [ ] `/login` - ✅ Implementada
- [ ] `/dashboard` - ✅ Implementada (adaptativa por perfil)
- [ ] `/configuracoes` - ⚠️ Parcialmente implementada

#### 2. **Módulo OS - Páginas Principais**
- [ ] `/os` - ✅ Implementada (listagem)
- [ ] `/os/criar` - ✅ Implementada (hub de criação)
- [ ] `/os/$id` - ✅ Implementada (detalhes com workflow)

#### 3. **Módulo OS - Workflows por Tipo**
- [ ] **OS-01 (Perícia de Fachada)** - ✅ Workflow implementado
- [ ] **OS-02 (Revitalização de Fachada)** - ✅ Workflow implementado
- [ ] **OS-03 (Reforço Estrutural)** - ✅ Workflow implementado
- [ ] **OS-04 (Outros - Obras)** - ✅ Workflow implementado
- [ ] **OS-05 (Assessoria Mensal - Lead)** - ⚠️ Workflow básico, etapas mockadas
- [ ] **OS-06 (Assessoria Avulsa - Lead)** - ⚠️ Workflow básico, etapas mockadas
- [ ] **OS-07 (Solicitação de Reforma)** - ✅ Workflow implementado (os07-workflow-page.tsx)
- [ ] **OS-08 (Visita Técnica/Parecer)** - ✅ Workflow implementado (os08-workflow-page.tsx)
- [ ] **OS-09 (Requisição de Compras)** - ✅ Workflow implementado (os09-workflow-page.tsx)
- [ ] **OS-10 (Requisição de Mão de Obra)** - ❌ **NÃO IMPLEMENTADO**
- [ ] **OS-11 (Start Contrato Assessoria Mensal)** - ❌ **NÃO IMPLEMENTADO**
- [ ] **OS-12 (Start Contrato Assessoria Avulsa)** - ❌ **NÃO IMPLEMENTADO**
- [ ] **OS-13 (Start de Contrato de Obra)** - ✅ Workflow implementado (os13-workflow-page.tsx)

#### 4. **Etapas de OS Ainda Mockadas**
- [ ] **Etapa 4: Agendar Visita Técnica** - ⚠️ Funcional mas com dados mockados
- [ ] **Etapa 5: Realizar Visita** - ⚠️ Interface existe, mas checklist mockado
- [ ] **Etapa 6: Follow-up 2 (Pós-Visita)** - ⚠️ Relatório mockado
- [ ] **Etapa 7: Formulário Memorial (Escopo)** - ⚠️ Dados mockados
- [ ] **Etapa 8: Precificação** - ⚠️ Cálculos mockados
- [ ] **Etapa 9: Gerar Proposta Comercial** - ⚠️ PDF mockado
- [ ] **Etapa 10: Agendar Visita (Apresentação)** - ⚠️ Agendamento mockado
- [ ] **Etapa 11: Realizar Visita (Apresentação)** - ⚠️ Feedback mockado
- [ ] **Etapa 12: Follow-up 3 (Pós-Apresentação)** - ⚠️ Negociação mockada
- [ ] **Etapa 13: Gerar Contrato (Upload)** - ⚠️ Minuta mockada
- [ ] **Etapa 14: Contrato Assinado** - ⚠️ Upload mockado
- [ ] **Etapa 15: Iniciar Contrato de Obra** - ⚠️ Gatilho automático mockado

#### 5. **Módulo Clientes (CRM)**
- [ ] `/clientes` - ✅ Implementada (listagem)
- [ ] `/clientes/$id` - ✅ Implementada (detalhes)
- [ ] **Histórico financeiro por cliente** - ⚠️ Dados mockados
- [ ] **Timeline de interações** - ⚠️ Eventos mockados

#### 6. **Módulo Financeiro**
- [ ] `/financeiro` - ✅ Dashboard implementado (dados mockados)
- [ ] `/financeiro/contas-receber` - ✅ Implementada (dados mockados)
- [ ] `/financeiro/contas-pagar` - ✅ Implementada (dados mockados)
- [ ] `/financeiro/conciliacao-bancaria` - ✅ Implementada (interface mockada)
- [ ] `/financeiro/prestacao-contas` - ✅ Implementada (relatórios mockados)
- [ ] **Integração real com lançamentos** - ❌ **NÃO IMPLEMENTADO**

#### 7. **Módulo Calendário**
- [ ] `/calendario` - ✅ Implementado (calendário customizado)
- [ ] **Agendamentos reais** - ⚠️ Funcional mas dados mockados
- [ ] **Validação de conflitos** - ⚠️ Lógica mockada

#### 8. **Módulo Colaboradores**
- [ ] `/colaboradores` - ✅ Implementada (listagem)
- [ ] **Controle de presença** - ⚠️ Dados mockados
- [ ] **Perfis de usuário** - ✅ Implementados

#### 9. **Dashboards por Perfil**
- [ ] **Diretoria** - ✅ KPIs financeiros (dados mockados)
- [ ] **Gestor Administrativo** - ✅ Visão transversal (dados mockados)
- [ ] **Gestor de Obras** - ✅ Foco operacional (dados mockados)
- [ ] **Gestor de Assessoria** - ✅ Foco técnico (dados mockados)
- [ ] **Colaborador** - ✅ Tarefas pessoais (dados mockados)

#### 10. **Páginas de Gestores (Pendentes)**
- [ ] `/gestor-assessoria/laudos` - ✅ Implementada
- [ ] `/gestor-assessoria/reformas` - ✅ Implementada
- [ ] `/gestor-obras/cronogramas` - ✅ Implementada
- [ ] `/gestor-obras/medicoes` - ✅ Implementada

---

## 🎯 MÉTRICAS DE SUCESSO

### Funcionais
- [ ] 100% dos workflows de OS funcionando
- [ ] RLS bloqueando acessos indevidos
- [ ] Calendário sem conflitos de agendamento
- [ ] Interface responsiva em todos os dispositivos

### Técnicas
- [ ] Cobertura de testes > 70%
- [ ] Performance: carregamento < 2s
- [ ] Zero vulnerabilidades de segurança críticas
- [ ] Uptime > 99.5% em produção

### de Negócio
- [ ] Tempo de ciclo OS reduzido em 30%
- [ ] Adesão total ao sistema digital
- [ ] Satisfação do usuário > 4.5/5

---

## ⚠️ RISCOS E MITIGAÇÕES

### Riscos Técnicos
- **Complexidade dos workflows**: Mitigação - prototipagem rápida das 15 etapas
- **Performance com dados grandes**: Mitigação - paginação e lazy loading
- **RLS complexo**: Mitigação - testes rigorosos de permissões

### Riscos de Projeto
- **Escopo creep**: Mitigação - definição clara de MVP vs. pós-MVP
- **Dependências de equipe**: Mitigação - trabalho paralelo onde possível
- **Mudanças de requisitos**: Mitigação - revisões semanais com stakeholders

---

**Data de Criação:** 01/12/2025  
**Versão:** 2.0  
**Responsável:** Equipe de Desenvolvimento Minerva ERP  
**Status:** ✅ Aprovado para Implementação