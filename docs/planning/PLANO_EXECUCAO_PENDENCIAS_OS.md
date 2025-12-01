# 🚀 PLANO DE EXECUÇÃO - Conclusão das OS Pendentes

## 📊 Status Atual do Sistema

**Data:** 01/12/2025
**OS Implementadas:** 9/12 (75%)
**OS Pendentes:** 3 (OS-10, OS-11, OS-12)
**Etapas Mockadas:** ~60% das etapas existentes
**Integração Supabase:** Parcial (dados mockados em produção)

---

## 🎯 OBJETIVOS DO PLANO

### Primários
1. **Implementar 3 OS pendentes** (OS-10, OS-11, OS-12)
2. **Substituir dados mockados** por integração real com Supabase
3. **Completar workflows** com validações e regras de negócio
4. **Otimizar performance** e experiência do usuário

### Secundários
1. **Expandir testes** para cobrir novos componentes
2. **Documentar** novos workflows implementados
3. **Refatorar** componentes para melhor reutilização

---

## 📋 FASE 1: IMPLEMENTAÇÃO DAS OS PENDENTES (2-3 semanas)

### 🎯 Semana 1: OS-10 (Requisição de Mão de Obra / Recrutamento)

#### **Dia 1-2: Planejamento e Estrutura**
- [ ] **Definir workflow OS-10 (Recrutamento)**
  - 5 etapas: Abertura → Seleção CC → Seleção Colaborador → Detalhes Vaga → Requisição Múltipla
  - Setor: RH (Gestor Administrativo)
  - Fluxo interno (não acessível a clientes)
  - Suporte a múltiplos colaboradores na mesma OS
- [ ] **Criar estrutura de componentes**
  ```
  src/components/os/
  ├── os10-workflow-page.tsx
  └── steps/rh/
      ├── step-abertura-solicitacao.tsx
      ├── step-selecao-centro-custo.tsx
      ├── step-selecao-colaborador.tsx
      ├── step-detalhes-vaga.tsx
      └── step-requisicao-multipla.tsx
  ```
- [ ] **Configurar rotas** em `src/app/` (apenas para gestores)

#### **Dia 3-4: Desenvolvimento Core**
- [ ] **Implementar etapa 1: Abertura da Solicitação**
  - Formulário acessível a qualquer colaborador logado
  - Campos básicos de identificação
  - Validação de permissões
- [ ] **Implementar etapa 2: Seleção do Centro de Custo**
  - Lista dropdown de CCs ativos
  - Validação de CC válido
  - Rateio automático de custos

#### **Dia 5: Desenvolvimento Avançado**
- [ ] **Implementar etapa 3: Seleção do Colaborador**
  - Lista de 10 funções disponíveis
  - Identificação de colaborador obra (sem acesso ao sistema)
  - Hierarquia automática baseada no cargo
- [ ] **Implementar etapas 4-5: Detalhes e Múltipla Requisição**
  - Campos para recomendações e habilidades
  - Suporte a múltiplos colaboradores
  - Validações específicas por tipo

#### **Dia 6-7: Testes e Ajustes**
- [ ] **Testes unitários** dos novos componentes
- [ ] **Testes de integração** com workflow stepper
- [ ] **Ajustes de UX/UI** e responsividade
- [ ] **Documentação** completa do workflow OS-10

---

### 🎯 Semana 2: OS-11 (Laudo Pontual Assessoria)

#### **Dia 1-2: Planejamento e Setup**
- [ ] **Definir workflow OS-11 (Laudo Pontual)**
  - 6 etapas: Cadastro Cliente → Agendar Visita → Realizar Visita → Anexar RT → Gerar PDF → Enviar Cliente
  - Setor: Assessoria (Gestor de Assessoria)
  - Gatilho: Após fechamento do contrato (OS-06)
  - Foco: Entrega de documento técnico pontual
- [ ] **Criar estrutura de componentes**
  ```
  src/components/os/
  ├── os11-workflow-page.tsx
  └── steps/assessoria/
      ├── step-cadastro-cliente.tsx
      ├── step-agendar-visita.tsx
      ├── step-realizar-visita.tsx
      ├── step-anexar-rt.tsx
      ├── step-gerar-documento.tsx
      └── step-enviar-cliente.tsx
  ```

#### **Dia 3-4: Desenvolvimento Core**
- [ ] **Implementar etapas 1-2: Cadastro e Agendamento**
  - Validação dos dados do cliente
  - Integração com módulo de calendário
  - Agendamento de visita técnica
- [ ] **Implementar etapa 3: Realizar Visita e Questionário**
  - Formulário estruturado de vistoria
  - Checklist específico para assessoria
  - Registro fotográfico e observações

#### **Dia 5: Desenvolvimento Avançado**
- [ ] **Implementar etapas 4-5: RT e Geração de PDF**
  - Upload de Responsabilidade Técnica (RT)
  - Integração com Edge Function `generate-pdf`
  - Uso do template `laudo-tecnico`
  - Chamada: `generate-pdf('laudo-tecnico', dadosDaVistoria)`
  - Preenchimento automático com dados da vistoria
- [ ] **Implementar etapa 6: Envio Automático**
  - Sistema envia PDF diretamente ao cliente
  - Confirmação de entrega
  - Registro de envio no histórico

#### **Dia 6-7: Testes e Integração**
- [ ] **Integração com OS-06** (gatilho automático)
- [ ] **Testes de geração de PDF** e envio
- [ ] **Ajustes baseados em feedback**
- [ ] **Documentação** do workflow de laudo pontual

---

### 🎯 Semana 3: OS-12 (Assessoria Técnica Mensal/Anual)

#### **Dia 1-2: Planejamento**
- [ ] **Definir workflow OS-12 (Contrato Anual)**
  - 6 etapas: Cadastro → SLA → Recorrência → Equipe → Calendário → Início
  - Setor: Assessoria (Gestor de Assessoria)
  - Tipo: Contrato de longo prazo com recorrência
  - Complexidade: Integração com calendário, financeiro e renovação automática
- [ ] **Criar estrutura de componentes**
  ```
  src/components/os/
  ├── os12-workflow-page.tsx
  └── steps/assessoria/
      ├── step-cadastro-cliente-anual.tsx
      ├── step-definicao-sla.tsx
      ├── step-setup-recorrencia.tsx
      ├── step-alocacao-equipe.tsx
      ├── step-configuracao-calendario.tsx
      └── step-inicio-servicos-anual.tsx
  ```

#### **Dia 3-4: Desenvolvimento Core**
- [ ] **Implementar etapas 1-2: Cadastro e SLA**
  - Cadastro completo do cliente
  - Definição de Service Level Agreement (SLA)
  - Acordos de nível de serviço específicos
- [ ] **Implementar etapa 3: Setup de Recorrência**
  - Configuração de pagamentos mensais/anuais
  - Previsão de parcelas e valores
  - Integração com módulo financeiro

#### **Dia 5: Desenvolvimento Avançado**
- [ ] **Implementar etapas 4-5: Equipe e Calendário**
  - Alocação de técnicos responsáveis
  - Configuração de visita semanal obrigatória
  - Reserva automática de slots no calendário
  - Sistema de alertas para visitas não realizadas
- [ ] **Implementar etapa 6: Início dos Serviços**
  - Ativação do contrato anual
  - Geração de recorrência financeira
  - Notificações de início

#### **Dia 6-7: Finalização e Integrações**
- [ ] **Implementar renovação automática**
  - Detecção de contratos com previsão de renovação
  - Geração automática de +12 meses
  - Aplicação de reajuste anual (ex: 2%)
- [ ] **Criar página customizada do cliente**
  - Histórico completo de OS relacionadas
  - Relatórios mensais de manutenção
  - Área para documentos (projetos, AVCB, RT)
  - Links diretos para OS-08 e WhatsApp
- [ ] **Testes completos** e ajustes
- [ ] **Documentação** detalhada do contrato anual

---

## 📋 FASE 2: SUBSTITUIÇÃO DE DADOS MOCKADOS (2-3 semanas)

### 🎯 Semana 4-5: Etapas Mockadas Críticas

#### **Prioridade 1: Etapas de Agendamento (4, 10)**
- [ ] **Substituir mock por integração real**
  - Conectar com módulo de calendário
  - Validação de disponibilidade real
  - Criação automática de agendamentos
- [ ] **Implementar regras de negócio**
  - Antecedência mínima obrigatória
  - Validação de conflitos
  - Notificações automáticas

#### **Prioridade 2: Etapas Financeiras (8, 9, 13)**
- [ ] **Precificação (Etapa 8)**
  - Conectar com tabela `financeiro_lancamentos`
  - Cálculos reais baseados em custos
  - Centro de custos automático
- [ ] **Geração de Proposta (Etapa 9)**
  - PDF dinâmico com dados reais
  - Integração com template de propostas
  - Assinatura digital
- [ ] **Contrato (Etapa 13)**
  - Upload real para Supabase Storage
  - Validação de documentos obrigatórios
  - Versionamento de contratos

#### **Prioridade 3: Etapas de Follow-up (3, 6, 12)**
- [ ] **Substituir formulários mockados**
  - Dados reais de entrevistas
  - Relatórios pós-visita estruturados
  - Histórico de negociações

---

### 🎯 Semana 6: Integração Completa com Supabase

#### **Backend Integration**
- [ ] **Configurar todas as tabelas necessárias**
  - Verificar schema em `DATABASE_SCHEMA.md`
  - Executar migrations pendentes
  - Popular dados de referência (tipos_os, setores, etc.)
- [ ] **Implementar RLS completo**
  - Políticas para todas as tabelas
  - Testes de segurança por perfil
  - Auditoria de acessos

#### **API Integration**
- [ ] **Substituir todos os hooks mockados**
  - `useOS` - conectar com `ordens_servico`
  - `useClientes` - conectar com `clientes`
  - `useFinanceiro` - conectar com `financeiro_lancamentos`
- [ ] **Implementar real-time subscriptions**
  - Atualizações ao vivo nos dashboards
  - Notificações de mudanças
  - Sincronização entre usuários

---

## 📋 FASE 3: OTIMIZAÇÃO E QUALIDADE (1-2 semanas)

### 🎯 Semana 7: Performance e UX

#### **Performance**
- [ ] **Lazy loading** de componentes pesados
- [ ] **Memoização** de cálculos complexos
- [ ] **Otimização de queries** Supabase
- [ ] **Bundle splitting** para carregamento mais rápido

#### **UX/UI**
- [ ] **Responsividade completa** em mobile
- [ ] **Acessibilidade** (WCAG 2.1)
- [ ] **Micro-interações** e feedback visual
- [ ] **Loading states** e skeletons

### 🎯 Semana 8: Testes e Documentação

#### **Testes**
- [ ] **Cobertura de testes > 80%**
  - Unitários para novos componentes
  - Integração para workflows completos
  - E2E para cenários críticos
- [ ] **Testes de performance**
  - Carregamento < 2s
  - Memória sem leaks
  - Bundle size otimizado

#### **Documentação**
- [ ] **Atualizar TODAS_OS_E_ETAPAS.md**
  - Marcar OS-10,11,12 como concluídas
  - Atualizar percentuais de conclusão
- [ ] **Documentação técnica**
  - Novos componentes e hooks
  - APIs e integrações
  - Guia de deployment

---

## 📊 MÉTRICAS DE SUCESSO

### Funcionais
- [ ] **3 OS pendentes implementadas** (OS-10, OS-11, OS-12)
- [ ] **0 dados mockados** em produção
- [ ] **100% workflows funcionais** end-to-end
- [ ] **RLS implementado** e testado

### Técnicas
- [ ] **Performance mantida** (< 2s carregamento)
- [ ] **Cobertura de testes > 80%**
- [ ] **Zero bugs críticos** em produção
- [ ] **Documentação completa** e atualizada

### de Tempo
- [ ] **8 semanas** para conclusão total
- [ ] **Milestone semanal** atingido
- [ ] **Deploy incremental** possível a cada semana

---

## ⚠️ RISCOS E CONTINGÊNCIAS

### Riscos Identificados
1. **Complexidade da integração Supabase** → Contingência: Implementar gradualmente por módulo
2. **Dependência de equipe reduzida** → Contingência: Focar em tarefas independentes
3. **Mudanças nos requisitos** → Contingência: Revisões semanais com stakeholders

### Plano B
- **Se Supabase tiver issues**: Manter dados mockados temporariamente com flag de feature
- **Se prazo apertar**: Priorizar OS-10 primeiro, depois 11/12
- **Se equipe reduzida**: Focar apenas em substituir mocks críticos

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Hoje (Dia 1)
1. **Reunião de alinhamento** com equipe
2. **Setup do ambiente** de desenvolvimento
3. **Criar branch** `feature/os-pendentes`
4. **Começar OS-10** - planejamento detalhado

### Semana 1
1. **OS-10 completa** (solicitação de mão de obra)
2. **Testes unitários** dos novos componentes
3. **Code review** e merge

### Semana 2
1. **OS-11 completa** (start assessoria mensal)
2. **Integração OS-05 → OS-11**
3. **Testes de integração**

---

## 📞 RECURSOS NECESSÁRIOS

### Humanos
- **2-3 Desenvolvedores Frontend** (React/TypeScript)
- **1 Desenvolvedor Backend** (Supabase/PostgreSQL)
- **1 QA Tester** para testes manuais

### Técnicos
- **Acesso admin Supabase** para configurações
- **Ambiente de staging** para testes
- **Ferramentas de monitoramento** (Sentry, analytics)

### Tempo
- **8 semanas** para conclusão completa
- **Daily standups** para acompanhamento
- **Code reviews** semanais

---

**Data:** 01/12/2025
**Responsável:** Equipe de Desenvolvimento
**Status:** ✅ Plano Aprovado - Pronto para Execução