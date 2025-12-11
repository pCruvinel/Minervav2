# 📋 BACKLOG COMPLETO - Projeto Minerva ERP v2.7

> **Documento Executivo de Status e Backlog**
> **Última Atualização:** 11/12/2025 (Transferência Automática)
> **Versão do Sistema:** v2.7 (Transferência Automática de Setor)
> **Status Geral:** Em Desenvolvimento Ativo

---

## 🎯 VISÃO EXECUTIVA

### Contexto do Projeto
O **Minerva ERP v2.7** é uma plataforma completa de gestão para empresas de engenharia e construção, focada na digitalização e automação de processos de Ordens de Serviço (OS), controle financeiro e gestão de relacionamento com clientes (CRM). O sistema implementa workflows polimórficos que se adaptam a 13 tipos diferentes de serviços, garantindo eficiência operacional, **transferência automática de setor** e isolamento de dados por setor.

### Objetivos Estratégicos
- **Digitalização Completa**: Eliminar processos manuais e planilhas paralelas
- **Segurança de Dados**: Isolamento total entre setores (Obras × Assessoria × Financeiro)
- **Automação de Processos**: Workflows inteligentes com gatilhos automáticos
- **Experiência do Cliente**: Portal dedicado e comunicação transparente

---

## 👥 USUÁRIOS E PERFIS

### Equipe Interna (Sistema Principal)

| Perfil | Nível | Quantidade | Responsabilidades | Acesso |
|--------|-------|------------|-------------------|---------|
| **Admin/TI** | 10 | 1-2 | Configurações globais, usuários, backups | Sistema completo |
| **Diretoria** | 9 | 3-5 | Relatórios estratégicos, aprovações críticas | Visão global |
| **Coordenador Administrativo** | 5 | 2-3 | Financeiro, RH, contratos transversais | Multi-setor |
| **Coordenador Obras** | 5 | 2-4 | OS de construção, equipes de campo | Setor isolado |
| **Coordenador Assessoria** | 5 | 2-3 | Laudos técnicos, pareceres | Setor isolado |
| **Colaborador** | 1 | 20+ | Execução operacional, próprias OS | Restrito |
| **Mão de Obra** | 0 | 50+ | Apenas custos/presença | **BLOQUEADO** |

### Clientes Externos (Portal Dedicado)

| Tipo de Cliente | Volume | Acesso | Funcionalidades |
|----------------|--------|--------|-----------------|
| **Pessoa Física** | Alto | Portal Cliente | OS próprias, documentos, pagamentos |
| **Pessoa Jurídica** | Médio | Portal Cliente | Contratos, faturamento, relatórios |
| **Condomínios** | Alto | Portal Cliente | Manutenção, aprovações, pagamentos |
| **Construtoras** | Médio | Portal Cliente | Projetos, fiscalizações, contratos |
| **Indústrias** | Baixo | Portal Cliente | Consultorias especializadas |

### Administradores do Sistema
- **Equipe de Desenvolvimento**: 1-2 desenvolvedores
- **Suporte Técnico**: Equipe interna Minerva
- **Administradores de Banco**: Acesso restrito ao Supabase

---

## 🚀 FUNCIONALIDADES IMPLEMENTADAS (v2.5)

### Core Business - Ordens de Serviço (13 Tipos)

#### ✅ **OS-01: Perícia de Fachada** (85% concluído)
- **Workflow**: 15 etapas completas
- **Status**: Componentes implementados, dados mockados
- **Responsável**: Gestor de Obras

#### ✅ **OS-02: Revitalização de Fachada** (85% concluído)
- **Workflow**: 15 etapas (compartilha componentes OS-01)
- **Status**: Arquitetura compartilhada implementada
- **Responsável**: Gestor de Obras

#### ✅ **OS-03: Reforço Estrutural** (85% concluído)
- **Workflow**: 15 etapas (compartilha componentes OS-01)
- **Status**: Arquitetura compartilhada implementada
- **Responsável**: Gestor de Obras

#### ✅ **OS-04: Outros (Obras)** (85% concluído)
- **Workflow**: 15 etapas (compartilha componentes OS-01)
- **Status**: Arquitetura compartilhada implementada
- **Responsável**: Gestor de Obras

#### ⚠️ **OS-05: Assessoria Mensal (Lead)** (60% concluído)
- **Workflow**: 6 etapas específicas para assessoria
- **Status**: Componentes básicos implementados
- **Responsável**: Gestor de Assessoria

#### ⚠️ **OS-06: Assessoria Avulsa (Lead)** (60% concluído)
- **Workflow**: Similar OS-05
- **Status**: Componentes básicos implementados
- **Responsável**: Gestor de Assessoria

#### ✅ **OS-07: Solicitação de Reforma** (90% concluído)
- **Workflow**: 5 etapas otimizadas
- **Status**: Implementação completa, formulário público
- **Responsável**: Gestor de Assessoria

#### ✅ **OS-08: Visita Técnica/Parecer** (90% concluído)
- **Workflow**: 5 etapas focadas em visita
- **Status**: Implementação completa
- **Responsável**: Gestor de Assessoria

#### ✅ **OS-09: Requisição de Compras** (90% concluído)
- **Workflow**: 5 etapas simplificadas
- **Status**: Implementação completa
- **Responsável**: Gestor Administrativo

#### ✅ **OS-10: Requisição de Mão de Obra** (90% concluído)
- **Workflow**: 5 etapas de recrutamento
- **Status**: Implementação completa, 10 funções disponíveis
- **Responsável**: Gestor Administrativo

#### ✅ **OS-11: Laudo Pontual Assessoria** (95% concluído)
- **Workflow**: 6 etapas (Cadastro → PDF → Envio)
- **Status**: Implementação completa, Edge Function implementada
- **Responsável**: Gestor de Assessoria

#### ✅ **OS-12: Assessoria Mensal/Anual** (90% concluído)
- **Workflow**: 6 etapas com recorrência
- **Status**: Implementação completa, SLA configurável
- **Responsável**: Gestor de Assessoria

#### ⚠️ **OS-13: Start de Contrato de Obra** (80% concluído)
- **Workflow**: 17 etapas completas de execução
- **Status**: Estrutura implementada, etapas mockadas
- **Responsável**: Gestor de Obras

### 🆕 Funcionalidades v2.5 (Redesign 2025)

#### ✅ **Sistema de Comentários** (Backend: 100% | Frontend: 60%)
- **Descrição**: Comunicação estruturada entre equipes
- **Tabela**: `os_comentarios` (implementada)
- **Funcionalidades**: Comentários por etapa, tipos (interno/externo)
- **Status**: Backend completo, frontend básico no Detalhes da OS

#### ✅ **Timeline de Atividades** (Backend: 100% | Frontend: 0%)
- **Descrição**: Rastreamento completo de todas as ações
- **Tabela**: `os_atividades` (implementada)
- **Funcionalidades**: Auditoria automática, dados antigos/novos
- **Status**: Backend completo, aguardando timeline component

#### ✅ **Gestão de Documentos** (Backend: 100% | Frontend: 0%)
- **Descrição**: Upload seguro e versionamento
- **Tabela**: `os_documentos` (implementada)
- **Funcionalidades**: Tipos MIME, metadados, organização por etapa
- **Status**: Backend completo, aguardando file upload components

#### ✅ **Controle de Presença** (Backend: 100% | Frontend: 70%)
- **Descrição**: Ponto eletrônico com avaliação
- **Tabela**: `registros_presenca` (implementada)
- **Funcionalidades**: Entrada/saída, performance, justificativas
- **Status**: Backend completo, interface básica em /colaboradores/presenca-tabela

#### ✅ **Portal de Documentos Cliente** (Backend: 100% | Frontend: 0%)
- **Descrição**: Área segura para clientes
- **Tabela**: `clientes_documentos` (implementada)
- **Funcionalidades**: Acesso a documentos compartilhados
- **Status**: Backend completo, aguardando portal dedicado

#### ✅ **Documentos de Colaboradores** (Backend: 100% | Frontend: 50%)
- **Descrição**: Gestão de arquivos de RH
- **Tabela**: `colaboradores_documentos` (implementada)
- **Funcionalidades**: Contratos, certificados, documentos pessoais
- **Status**: Backend completo, interface básica no Detalhes do Colaborador

### 💰 Módulo Financeiro/Bancário

#### ✅ **Contas a Pagar e Receber** (85% concluído)
- **Descrição**: Gestão completa do fluxo financeiro
- **Tabela**: `financeiro_lancamentos` (implementada)
- **Funcionalidades**:
  - Lançamentos de receita e despesa
  - Controle de vencimentos e pagamentos
  - Conciliação bancária
  - Vinculação com centros de custo
- **Status**: Backend completo, interface básica implementada

#### ✅ **Centro de Custos** (90% concluído)
- **Descrição**: Alocação de custos por projeto/cliente
- **Tabela**: `centros_custo` (implementada)
- **Funcionalidades**:
  - Vinculação automática com OS
  - Rateio de custos por colaborador
  - Relatórios por centro de custo
  - Controle de orçamento
- **Status**: Totalmente integrado com OS

#### ✅ **Relatórios Financeiros** (70% concluído)
- **Descrição**: Business Intelligence financeira
- **Funcionalidades**:
  - DRE (Demonstrativo de Resultados)
  - Fluxo de caixa
  - Análise de inadimplência
  - Relatórios por período
- **Status**: Relatórios básicos implementados

#### ⚠️ **Integração Bancária** (30% concluído)
- **Descrição**: Conexão com instituições financeiras
- **Funcionalidades Planejadas**:
  - Importação automática de extratos
  - Conciliação automática
  - Pagamentos via PIX
  - Integração com bancos (Itau, Bradesco, etc.)
- **Status**: Estrutura preparada, aguardando implementação

#### ⚠️ **Controle de Inadimplência** (40% concluído)
- **Descrição**: Gestão de clientes em atraso
- **Funcionalidades**:
  - Alertas automáticos de vencimento
  - Classificação de risco
  - Ações de cobrança
  - Relatórios de inadimplência
- **Status**: Lógica básica implementada

#### ⚠️ **Orçamentos e Planejamento** (20% concluído)
- **Descrição**: Controle orçamentário por período
- **Funcionalidades Planejadas**:
  - Orçamentos anuais/mensais
  - Comparativo realizado vs. planejado
  - Alertas de desvios
  - Aprovações de orçamento
- **Status**: Estrutura de dados preparada

#### ✅ **Vinculação OS x Financeiro** (95% concluído)
- **Descrição**: Integração automática entre projetos e finanças
- **Funcionalidades**:
  - Centro de custo criado automaticamente por OS
  - Rateio de custos de colaboradores
  - Controle de lucratividade por projeto
  - Relatórios financeiros por OS
- **Status**: Completamente integrado

### Infraestrutura e Integrações

#### ✅ **Autenticação Supabase** (100% concluído)
- **Status**: Implementado e funcional
- **Funcionalidades**: JWT, refresh tokens, recuperação de senha

#### ✅ **Banco de Dados PostgreSQL** (100% concluído)
- **Status**: Schema v2.5 completo
- **Tabelas**: 25+ tabelas implementadas
- **RLS**: Políticas de segurança ativas

#### ✅ **Calendário Customizado** (90% concluído)
- **Status**: Schedule-X + FullCalendar implementados
- **Funcionalidades**: Turnos, vagas, validações automáticas

#### ✅ **Sistema de PDFs** (90% concluído)
- **Status**: Edge Function `generate-pdf` implementada
- **Templates**: 7 templates implementados (contrato, proposta, parecer-reforma, visita-tecnica, memorial, documento-sst)

---

## 📊 MÉTRICAS E ESTATÍSTICAS

### Código e Arquitetura

| Métrica | Valor | Status |
|---------|-------|--------|
| **Linhas de Código (estimado)** | ~30.000+ | Ativo |
| **Componentes React** | 228+ | Em desenvolvimento |
| **Páginas/Rotas** | 30+ | Implementadas |
| **Hooks Customizados** | 25+ | Implementados |
| **Schemas Zod** | 20+ | Validações ativas |
| **Edge Functions** | 4/5 | Em desenvolvimento |

### Documentação

| Tipo | Quantidade | Localização |
|------|------------|-------------|
| **Documentos Técnicos** | 15+ | `/docs/technical/` |
| **Planejamento** | 20+ | `/docs/planning/` |
| **Guias de Uso** | 10+ | `/docs/guides/` |
| **Sistema** | 11 | `/docs/sistema/` |
| **Total Páginas** | ~56+ | Consolidado |

### Progresso por Camada

#### Backend/Database (95% concluído)
- ✅ Schema completo v2.5
- ✅ 25+ tabelas implementadas
- ✅ RLS ativo em tabelas críticas
- ✅ Triggers automáticos funcionais
- ✅ Sequences de OS ativas
- ⚠️ Edge Functions parcialmente implementadas (80%)

#### Frontend/UI (78% concluído)
- ✅ Autenticação completa
- ✅ Dashboard responsivo
- ✅ 12 OS workflows implementados
- ✅ Calendário customizado
- ✅ Componentes Shadcn/ui
- ⚠️ Funcionalidades v2.5 parcialmente implementadas (45%)
- ⚠️ Integração dados reais (80%)

#### Integrações (80% concluído)
- ✅ Supabase Auth/Database/Storage
- ✅ Calendário integrado
- ⚠️ Edge Functions (80%)
- ⚠️ WhatsApp API (0%)
- ⚠️ Email service (50%)

### Status de Integração

#### Supabase Platform
- **Database**: ✅ 100% integrado
- **Auth**: ✅ 100% integrado
- **Storage**: ✅ 100% integrado
- **Edge Functions**: ⚠️ 80% implementado
- **Real-time**: ✅ 100% integrado

#### APIs Externas
- **WhatsApp Business**: ❌ Não implementado
- **Email Service**: ⚠️ 50% (templates definidos)
- **PDF Generation**: ✅ 90% (Edge Function implementada)
- **Geolocalização**: ❌ Não implementado

---

## 🎯 BACKLOG DE TAREFAS

### 🔥 Prioridade CRÍTICA (Próximas 2 semanas)

#### Frontend v2.5 - Funcionalidades Pendentes
- [ ] **Sistema de Comentários UI** (60% - existe básico no Detalhes da OS)
  - Melhorar componente de comentários por etapa
  - Suporte completo a tipos (interno/externo)
  - Notificações em tempo real

- [ ] **Timeline de Atividades UI** (0% - ainda não implementado)
  - Componente de timeline visual completo
  - Filtros por data/tipo/usuário
  - Paginação otimizada

- [ ] **Gestão de Documentos UI** (0% - ainda não implementado)
  - Sistema completo de upload drag & drop
  - Visualização por tipo MIME
  - Versionamento automático

- [ ] **Controle de Presença UI** (70% - existe /colaboradores/presenca-tabela)
  - Expandir interface de ponto eletrônico
  - Melhorar relatórios de presença
  - Sistema completo de avaliação de performance

- [ ] **Portal de Documentos Cliente** (0% - ainda não implementado)
  - Interface dedicada externa
  - Autenticação independente
  - Documentos compartilhados

#### Integrações Pendentes
- [x] **Edge Function generate-pdf** (100%)
  - ✅ Função implementada no Supabase
  - ✅ Templates: contrato, proposta, parecer-reforma, visita-tecnica, memorial, documento-sst
  - ⚠️ Testes de geração pendentes

- [ ] **Substituição de Dados Mockados** (20%)
  - OS-01 a OS-04: Conectar dados reais
  - OS-05/OS-06: Implementar workflows completos
  - Validações Supabase ativas

### ⚠️ Prioridade ALTA (Próximas 4 semanas)

#### Melhorias de UX/UI
- [ ] **Portal Cliente** (0%)
  - Interface dedicada externa
  - Autenticação independente
  - Documentos compartilhados

- [ ] **Dashboard Avançado** (60%)
  - KPIs personalizáveis
  - Gráficos interativos
  - Filtros avançados

- [ ] **Notificações em Tempo Real** (30%)
  - WebSocket para atualizações
  - Notificações push
  - Centro de notificações

#### Funcionalidades de RH
- [ ] **Documentos de Colaboradores UI** (0%)
  - Upload de documentos RH
  - Organização por tipo
  - Controle de validade

- [ ] **Gestão de Equipes** (40%)
  - Hierarquia visual
  - Alocação de projetos
  - Relatórios de produtividade

#### Melhorias Financeiras
- [ ] **Integração Bancária Completa** (30%)
  - Conexão com APIs bancárias
  - Importação automática de extratos
  - Pagamentos via PIX integrados

- [ ] **Controle de Inadimplência** (40%)
  - Sistema de alertas automáticos
  - Classificação de risco de clientes
  - Workflow de cobrança

- [ ] **Orçamentos e Planejamento** (20%)
  - Módulo de orçamentos anuais
  - Comparativos realizado vs. planejado
  - Alertas de desvios orçamentários

### 📅 Prioridade MÉDIA (Próximas 8 semanas)

#### Relatórios e Analytics
- [ ] **Business Intelligence** (10%)
  - Dashboards executivos
  - Relatórios automatizados
  - Exportação para Excel/PDF

- [ ] **Auditoria Completa** (70%)
  - Logs de todas as ações
  - Relatórios de compliance
  - Backup automático

#### Integrações Externas
- [ ] **WhatsApp Business API** (0%)
  - Notificações automáticas
  - Chat integrado
  - Templates de mensagem

- [ ] **Email Marketing** (20%)
  - Templates personalizados
  - Automação de follow-ups
  - Relatórios de entrega

### 📈 Prioridade BAIXA (Próximas 12 semanas)

#### Mobile e PWA
- [ ] **App Mobile Offline-First** (0%)
  - PWA responsiva
  - Sincronização offline
  - Funcionalidades críticas

- [ ] **Geolocalização** (0%)
  - Rastreamento de equipes
  - Validação de presença
  - Otimização de rotas

---

## 📈 STATUS GERAL POR MÓDULO

### Módulo OS (Ordens de Serviço)
- **Status**: 85% concluído
- **Backend**: 100% (25 tabelas, RLS ativo)
- **Frontend**: 75% (12 OS implementadas)
- **Workflows**: 13 tipos definidos
- **Automação**: 80% (gatilhos pendentes)

### Módulo Financeiro/Bancário
- **Status**: 85% concluído
- **Contas Pagar/Receber**: 85% (lançamentos implementados)
- **Centro de Custos**: 90% (vinculação automática com OS)
- **Relatórios Financeiros**: 70% (DRE, fluxo de caixa básico)
- **Integração Bancária**: 30% (estrutura preparada)
- **Controle de Inadimplência**: 40% (alertas básicos)
- **Orçamentos**: 20% (estrutura de dados)
- **Vinculação OS**: 95% (integração completa)

### Módulo Calendário
- **Status**: 90% concluído
- **Turnos**: Implementados com validações
- **Agendamentos**: Vinculados às OS
- **Recorrência**: Suportada
- **Conflitos**: Validação automática

### Módulo Autenticação
- **Status**: 100% concluído
- **Supabase Auth**: Totalmente integrado
- **Hierarquia**: 7 níveis implementados
- **Permissões**: RLS ativo
- **Recuperação**: Funcional

### Módulo Dashboard
- **Status**: 70% concluído
- **KPIs**: Básicos implementados
- **Responsividade**: Completa
- **Filtros**: Parciais
- **Tempo Real**: Pendente

---

## 🔄 PRÓXIMOS PASSOS IMEDIATOS

### Semana 1-2 (Crítico)
1. **Completar componentes v2.5** (Timeline, Gestão de Documentos, Portal Cliente)
2. **Melhorar componentes existentes** (Comentários, Controle de Presença)
3. **Edge Function generate-pdf** para OS-11
4. **Substituir dados mockados** em OS-01/OS-02/OS-03/OS-04

### Semana 3-4 (Alto)
1. **Portal Cliente** com autenticação independente
2. **Expandir Controle de Presença** (já tem interface básica)
3. **Notificações em tempo real** no sistema
4. **Integração bancária** para conciliação automática
5. **Sistema de inadimplência** com alertas automáticos

### Semana 5-8 (Médio)
1. **Business Intelligence** dashboards avançados
2. **Integração WhatsApp** para notificações
3. **Mobile PWA** versão inicial

---

## 🎯 MÉTRICAS DE SUCESSO

### Funcionais
- **Adesão Digital**: 100% dos processos via sistema (meta: Q1 2026)
- **Tempo de Ciclo OS**: Redução de 30% (meta: Q2 2026)
- **Satisfação Cliente**: NPS > 70 (meta: Q1 2026)
- **Controle Financeiro**: 95% dos lançamentos automatizados (meta: Q1 2026)
- **Inadimplência**: Redução para < 5% (meta: Q2 2026)

### Técnicas
- **Performance**: < 2s em todas as operações (atual: 95%)
- **Uptime**: 99.9% (atual: 100% em desenvolvimento)
- **Segurança**: Zero vulnerabilidades críticas (atual: RLS ativo)

### Equipe
- **Produtividade**: +50% após implementação completa
- **Erros**: < 5% de retrabalho (meta: Q2 2026)
- **Satisfação**: > 80% na pesquisa anual

---

## 📞 CONTATO E SUPORTE

### Equipe Técnica
- **Desenvolvimento**: [Nome do Dev] - [Contato]
- **Supabase/Infra**: [Nome do Admin] - [Contato]
- **Documentação**: [Nome do PO] - [Contato]

### Stakeholders
- **Cliente**: Minerva Engenharia
- **Sponsor**: [Nome do Diretor]
- **Product Owner**: [Nome do PO]

---

## 🔄 HISTÓRICO DE VERSÕES

| Versão | Data | Principais Mudanças | Status |
|--------|------|-------------------|--------|
| v2.5 | 03/12/2025 | Redesign 2025: 8 novas tabelas, funcionalidades avançadas | Em desenvolvimento |
| v2.0 | 28/11/2025 | Workflows polimórficos, RLS completo | Concluído |
| v1.0 | 01/09/2025 | MVP inicial, autenticação básica | Arquivado |

---

**📊 Progresso Geral: 87% concluído**
**🎯 Próxima Milestone: Funcionalidades v2.5 + Financeiro completo (Meta: 15/12/2025)**
**🚀 Status: Sistema operacional, módulo financeiro robusto, funcionalidades avançadas parcialmente implementadas**