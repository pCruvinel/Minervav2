# 📋 DIAGNÓSTICO GERAL DOS FLUXOS DE OS - 2025

## 🎯 **RESUMO EXECUTIVO**

Este documento apresenta um diagnóstico completo do estado atual de implementação de todos os fluxos de Ordem de Serviço (OS) no sistema Minerva.

| Fluxo OS | Nome | Status | Nível de Completude |
| :--- | :--- | :--- | :--- |
| **OS 01-04** | Perícias e Obras | ✅ **Produção** | 100% (Production-Ready) |
| **OS 05** | [Nome Pendente] | 🚧 **Básico** | 10% (Placeholder) |
| **OS 06** | [Nome Pendente] | 🚧 **Básico** | 10% (Placeholder) |
| **OS 07** | Comunicação de Reforma | ⚠️ **Parcial** | 60% (Frontend ok, Backend mockado) |
| **OS 08** | Visita Técnica / Parecer | ✅ **Completo** | 95% (Frontend completo, verificar integração) |
| **OS 09** | Requisição de Compras | ✅ **Completo** | 95% (Frontend completo, verificar integração) |
| **OS 13** | Start de Contrato | ✅ **Completo** | 95% (Frontend completo, verificar integração) |

---

## 🔍 **ANÁLISE DETALHADA POR FLUXO**

### 1. **OS 01-04: Perícias e Obras (Fluxo Principal)**
- **Arquivo Principal:** `src/components/os/os-details-workflow-page.tsx`
- **Status:** ✅ **Concluído e Otimizado**
- **Observações:**
  - Diagnóstico anterior confirmou status "Production-Ready".
  - Possui tratamento de erros, loading states, upload/download de arquivos e persistência robusta.
  - Integração total com backend Supabase.

### 2. **OS 05: [Nome a Definir]**
- **Arquivo Principal:** `src/components/os/os05-workflow-page.tsx`
- **Status:** 🚧 **Incompleto (Placeholder)**
- **O que falta:**
  - Definição clara do escopo de negócio.
  - Implementação real das etapas (atualmente possui apenas cards estáticos de "Identificação", "Processamento" e "Concluída").
  - Integração com backend.
  - Criação dos formulários específicos.

### 3. **OS 06: [Nome a Definir]**
- **Arquivo Principal:** `src/components/os/os06-workflow-page.tsx`
- **Status:** 🚧 **Incompleto (Placeholder)**
- **O que falta:**
  - Idêntico à OS 05, serve apenas como esqueleto de navegação.
  - Necessita definição de requisitos e implementação dos formulários.

### 4. **OS 07: Termo de Comunicação de Reforma**
- **Arquivos Principais:** 
  - `src/components/os/os07-workflow-page.tsx` (Fluxo interno)
  - `src/components/os/os07-analise-page.tsx` (Análise técnica)
  - `src/components/os/os07-form-publico.tsx` (Formulário externo)
- **Status:** ⚠️ **Parcialmente Implementado**
- **O que falta:**
  - **Integração Real:** O fluxo de "Simular Recebimento" (`handleSimularRecebimento`) é puramente visual (mock).
  - **Dados Reais na Análise:** A página de análise (`OS07AnalisePage`) usa dados estáticos (`dadosFormulario` mockado). Precisa buscar do banco de dados.
  - **Geração de PDF:** A função `handleGerarParecer` simula uma espera de 2 segundos mas não gera PDF real nem salva no storage.
  - **Conexão Form Público -> Backend:** Verificar se o formulário público está salvando corretamente nas tabelas definitivas.

### 5. **OS 08: Visita Técnica / Parecer Técnico**
- **Arquivo Principal:** `src/components/os/os08-workflow-page.tsx`
- **Status:** ✅ **Frontend Completo**
- **Observações:**
  - Utiliza a nova arquitetura de hooks (`useWorkflowState`, `useWorkflowNavigation`).
  - Possui 7 etapas detalhadas implementadas em `src/components/os/steps/os08/`.
  - **Ação Necessária:** Validar se a persistência de dados de todas as 7 etapas está funcionando 100% com o backend (tabela `os_etapas_dados` ou similar).

### 6. **OS 09: Requisição de Compras**
- **Arquivo Principal:** `src/components/os/os09-workflow-page.tsx`
- **Status:** ✅ **Frontend Completo**
- **Observações:**
  - Fluxo curto de 2 etapas (Requisição e Upload).
  - Utiliza nova arquitetura.
  - **Ação Necessária:** Teste ponta a ponta de criação de requisição e anexo de orçamentos.

### 7. **OS 13: Start de Contrato de Obra**
- **Arquivo Principal:** `src/components/os/os13-workflow-page.tsx`
- **Status:** ✅ **Frontend Completo**
- **Observações:**
  - Fluxo complexo com 17 etapas.
  - Todas as etapas parecem ter componentes correspondentes em `src/components/os/steps/os13/`.
  - Utiliza nova arquitetura.
  - **Ação Necessária:** Devido à extensão (17 etapas), recomenda-se um teste rigoroso de persistência de estado para garantir que nenhum dado se perde entre navegações.

---

## 🚀 **PLANO DE AÇÃO RECOMENDADO**

1.  **Prioridade Alta (OS 07):**
    -   Substituir mocks da página de análise por queries reais do Supabase.
    -   Implementar a geração real do PDF de parecer.
    -   Conectar o formulário público ao fluxo de aprovação real.

2.  **Prioridade Média (Validação OS 08, 09, 13):**
    -   Realizar "Smoke Test" (teste rápido) em cada um desses fluxos para garantir que o botão "Salvar" está persistindo os dados no banco.

3.  **Prioridade Baixa (OS 05 e 06):**
    -   Definir requisitos de negócio com o cliente.
    -   Implementar formulários reais ou ocultar essas opções do menu até que sejam necessárias.
