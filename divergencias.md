---
title: "Divergências entre Documentação ERS.md e Sistema Implementado"
description: "Análise das diferenças identificadas entre a documentação atual e a implementação real do sistema"
version: "1.0"
date: "2025-11-30"
status: "📋 Análise de Divergências"
author: "Sistema Minerva ERP"
---

# 📋 Divergências entre Documentação ERS.md e Sistema Implementado

## 🎯 Resumo Executivo

Durante a análise do sistema Minerva ERP v2.0, foram identificadas **divergências significativas** entre a documentação atual (ERS.md) e a implementação real do sistema. Esta análise visa documentar essas diferenças para tomada de decisão sobre qual versão deve prevalecer.

## 🔍 Metodologia de Análise

A análise foi realizada através de:
- ✅ **Código fonte**: Análise dos arquivos TypeScript/React
- ✅ **Tipos e interfaces**: Verificação do arquivo `src/lib/types.ts`
- ✅ **Banco de dados**: Análise das migrations Supabase
- ✅ **Documentação técnica**: Comparação com arquivos em `/docs/sistema/`
- ✅ **Componentes**: Verificação da estrutura de componentes

## 🚨 Divergências Críticas Identificadas

### 1. 🏗️ Arquitetura Técnica

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Stack Frontend** | WeWeb (plataforma visual) | React + TypeScript + Vite | 🔴 **DIVERGENTE** |
| **Backend** | Supabase (BaaS) | Supabase (BaaS) | ✅ **CONVERGENTE** |
| **Roteamento** | Não especificado | TanStack Router (type-safe) | 🔴 **DIVERGENTE** |
| **UI Components** | Não especificado | shadcn/ui + Radix UI | 🔴 **DIVERGENTE** |
| **Deployment** | Não especificado | Vercel | 🔴 **DIVERGENTE** |

**Impacto**: A documentação descreve uma arquitetura Low-Code que não corresponde à implementação atual.

### 2. 👥 Sistema de Roles e Permissões

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Estrutura de Roles** | 7 roles (admin, diretoria, gestor_administrativo, gestor_obras, gestor_assessoria, colaborador, mao_de_obra) | 7 roles idênticos | ✅ **CONVERGENTE** |
| **Níveis Hierárquicos** | 10, 9, 5, 5, 5, 1, 0 | 10, 9, 5, 5, 5, 1, 0 | ✅ **CONVERGENTE** |
| **Setores** | administrativo, assessoria, obras, diretoria | administrativo, assessoria, obras, diretoria | ✅ **CONVERGENTE** |
| **Permissões Detalhadas** | Matriz completa implementada | Matriz completa implementada | ✅ **CONVERGENTE** |

**Impacto**: Sistema de permissões está **correto e atualizado**.

### 3. 🏢 Módulos do Sistema

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Módulos Principais** | ADM/Comercial, Obras, Assessoria | Estrutura similar mas não explicitamente modularizada | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Funcionalidades ADM** | Gestão leads, propostas, contratos, agendamentos, financeiro | Implementado mas distribuído em componentes | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Funcionalidades Obras** | Execução obras, cronogramas, diários | Implementado via OS13 e componentes específicos | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Funcionalidades Assessoria** | Vistorias, laudos, planos manutenção | Implementado via OS08 e componentes específicos | 🟡 **PARCIALMENTE CONVERGENTE** |

**Impacto**: A documentação está **conceitualmente correta** mas precisa ser atualizada com detalhes técnicos.

### 4. 📋 Tipos de Ordens de Serviço (OS)

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Quantidade de OS** | 13 tipos (OS01-OS13) | 13 tipos (OS_01-OS_13) | ✅ **CONVERGENTE** |
| **Nomenclatura** | OS01-OS13 | OS_01-OS_13 (com underscore) | 🔴 **DIVERGENTE** |
| **Estrutura de Etapas** | 15 etapas sequenciais | Sistema de etapas dinâmico | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Workflow** | Sequencial obrigatório | Baseado em etapas com validações | 🟡 **PARCIALMENTE CONVERGENTE** |

**Impacto**: Diferença na nomenclatura pode causar confusão.

### 5. 🗄️ Estrutura do Banco de Dados

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Tabelas Principais** | ordens_servico, clientes, colaboradores, lancamentos_financeiros, agendamentos, turnos, logs_auditoria | ordens_servico, clientes, colaboradores, os_etapas, os_comentarios, os_atividades, os_documentos, os_logs | 🔴 **DIVERGENTE** |
| **Row Level Security** | Mencionado mas não detalhado | Implementado com políticas específicas | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Views** | Não mencionadas | os_detalhes_completos | 🔴 **DIVERGENTE** |
| **Triggers/Functions** | Não detalhadas | Múltiplas functions e triggers implementados | 🔴 **DIVERGENTE** |

**Impacto**: A documentação do banco está **desatualizada** e não reflete a estrutura real.

### 6. 📅 Sistema de Calendário

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Bibliotecas** | Não especificado | Schedule-X + FullCalendar | 🔴 **DIVERGENTE** |
| **Turnos** | Mencionado conceitualmente | Implementado com recorrência | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Agendamentos** | Vinculado a OS | Implementado com validações | 🟡 **PARCIALMENTE CONVERGENTE** |
| **Validações** | Mencionadas | Implementadas (vagas, conflitos) | ✅ **CONVERGENTE** |

**Impacto**: Detalhes técnicos não documentados.

### 7. 💰 Sistema Financeiro

| Aspecto | Documentação ERS.md | Sistema Implementado | Status |
|---------|-------------------|---------------------|---------|
| **Rateio de Custos** | Detalhado teoricamente | Não implementado ainda | 🔴 **DIVERGENTE** |
| **Conciliação Bancária** | Mencionada | Não implementada | 🔴 **DIVERGENTE** |
| **Centro de Custos** | Conceito definido | Estrutura básica existe | 🟡 **PARCIALMENTE CONVERGENTE** |

**Impacto**: Funcionalidades **ainda não implementadas** apesar de documentadas.

## 📊 Estatísticas das Divergências

| Categoria | Convergente | Parcialmente | Divergente | Total |
|-----------|-------------|-------------|------------|-------|
| **Arquitetura** | 1 | 0 | 5 | 6 |
| **Roles/Permissões** | 4 | 0 | 0 | 4 |
| **Módulos** | 0 | 3 | 0 | 3 |
| **OS/Workflow** | 1 | 2 | 1 | 4 |
| **Banco de Dados** | 0 | 1 | 3 | 4 |
| **Calendário** | 1 | 2 | 1 | 4 |
| **Financeiro** | 0 | 1 | 2 | 3 |
| **TOTAL** | **7** | **9** | **12** | **28** |

## 🎯 Recomendações

### 1. **Prioridade Alta** - Atualizar Arquitetura
- ✅ **AÇÃO**: Atualizar seção de arquitetura no ERS.md
- ✅ **JUSTIFICATIVA**: A arquitetura atual (React/TypeScript/Vite) é a implementação real
- ✅ **IMPACTO**: Evita confusão sobre stack tecnológica

### 2. **Prioridade Alta** - Atualizar Banco de Dados
- ✅ **AÇÃO**: Completar seção de modelo de dados com tabelas reais
- ✅ **JUSTIFICATIVA**: A estrutura atual é muito diferente da documentada
- ✅ **IMPACTO**: Essencial para desenvolvimento e manutenção

### 3. **Prioridade Média** - Padronizar Nomenclatura OS
- ✅ **AÇÃO**: Decidir entre "OS01" vs "OS_01" e atualizar consistentemente
- ✅ **JUSTIFICATIVA**: Evita confusão no código e documentação
- ✅ **IMPACTO**: Melhora consistência do sistema

### 4. **Prioridade Baixa** - Atualizar Funcionalidades Não Implementadas
- ✅ **AÇÃO**: Remover ou marcar como "planejado" recursos não implementados
- ✅ **JUSTIFICATIVA**: Evita expectativas incorretas sobre funcionalidades disponíveis
- ✅ **IMPACTO**: Transparência sobre estado atual do projeto

## 📋 Plano de Ação Sugerido

### Fase 1: Correções Críticas (Esta Sprint)
1. ✅ Atualizar seção de arquitetura técnica
2. ✅ Atualizar estrutura do banco de dados
3. ✅ Padronizar nomenclatura OS
4. ✅ Atualizar diagrama de arquitetura

### Fase 2: Correções Secundárias (Próxima Sprint)
1. ✅ Detalhar sistema de calendário
2. ✅ Atualizar seções de módulos com detalhes técnicos
3. ✅ Revisar regras de negócio implementadas vs documentadas

### Fase 3: Manutenção Contínua
1. ✅ Estabelecer processo de sincronização documentação-código
2. ✅ Revisar documentação após cada feature implementada
3. ✅ Automatizar validação de consistência quando possível

## 🔍 Conclusão

A documentação ERS.md apresenta **divergências significativas** com a implementação atual, especialmente nas áreas de arquitetura técnica e estrutura do banco de dados. As **regras de negócio e sistema de permissões estão corretos**, mas precisam ser complementados com detalhes técnicos da implementação atual.

**Recomendação**: **Atualizar o ERS.md** com as informações corretas da implementação atual, mantendo as regras de negócio validadas e adicionando os detalhes técnicos necessários para o desenvolvimento contínuo.

---

**📅 Data da Análise**: 2025-11-30
**📊 Cobertura**: Arquitetura, Banco de Dados, Roles, Módulos, OS, Calendário, Financeiro
**🎯 Status**: ✅ **Análise Completa - Aguardando Decisão sobre Atualização**