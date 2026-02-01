# 📋 Documento de Discussão: Contrato, Centro de Custo e Ordem de Serviço

> **Objetivo:** Alinhar pontos que **dependem de decisão operacional da cliente**.  
> **Data:** 29/01/2026  
> **Para:** Reunião com Cliente  
> **Nota:** Questões puramente técnicas serão resolvidas internamente.

---

## 🎯 Contexto

Durante a análise do sistema, identificamos que o fluxo de OSs funciona corretamente, mas existem **algumas decisões de negócio** que impactam a operação e precisam de alinhamento.

A tabela `contratos` existe no sistema e está preparada para rastrear contratos de forma estruturada. Precisamos definir **quando e como** ela será populada dentro do fluxo atual de OSs.

---

## ❓ Perguntas que Precisam de Decisão da Cliente

### 1. Centro de Custo para Assessoria Recorrente (OS-12)

**Situação:** Um cliente de assessoria recorrente renova anualmente.

**Dúvida operacional:**
- [ ] **Mesmo CC** para todos os anos (ex: `CC12001-CLIENTE` usado em 2025, 2026, 2027...)
- [ ] **Novo CC por ano** (ex: `CC12001-CLIENTE-2025`, `CC12002-CLIENTE-2026`...)

**Impacto:** Afeta como é calculada a lucratividade:
- Mesmo CC = Visão consolidada de todo o histórico do cliente
- Novo CC = Visão por período contratual

**Informação adicional:** Você respondeu "Mesmo CC" anteriormente. Confirma?

---

### 2. Aditivos de Contrato

**Situação:** Um contrato de obra precisa de aditivo (mais valor, mais prazo, mais escopo).

**Dúvida operacional:** Como a operação registra aditivos hoje?
- [ ] Upload de novo PDF anexo ao contrato original
- [ ] Comentário/observação na OS
- [ ] Não há fluxo definido

**Impacto:** 
- Se não houver registro estruturado, o `valor_global` do CC fica desatualizado
- Relatórios de lucratividade podem estar incorretos

**Pergunta:** O valor do aditivo deve atualizar automaticamente o Centro de Custo?

---

### 3. OSs Derivadas (Compras/Contratação) - Vínculo com Contrato Pai

**Situação:** Durante uma obra (OS-13), o usuário cria OS-09 (Compras) ou OS-10 (Contratação MO).

**Fluxo atual:** O usuário seleciona manualmente o CC no formulário.

**Dúvida operacional:** 
- [ ] Manter seleção manual (como está)
- [ ] Sugerir automaticamente o CC baseado no contrato/obra em andamento
- [ ] Criar OSs derivadas a partir da página do contrato (já com CC preenchido)

**Impacto:** 
- Seleção manual → Risco de erro + tempo perdido
- Automático → Mais ágil, mas menos flexível

---

### 4. Visualização Centralizada de Contratos

**Situação:** Não existe uma página `/contratos` para listar todos os contratos do sistema.

**Dúvida operacional:** A operação precisa de uma visão centralizada de contratos?

| Funcionalidade | Necessário? |
|----------------|-------------|
| Listar todos os contratos ativos | [ ] Sim [ ] Não |
| Ver contratos por cliente | [ ] Sim [ ] Não |
| Ver OSs vinculadas a cada contrato | [ ] Sim [ ] Não |
| Alertas de vencimento/renovação | [ ] Sim [ ] Não |

**Nota técnica:** Se necessário, podemos criar isso sem alterar o fluxo de OSs.

---

## ✅ O que será resolvido tecnicamente (sem necessidade de decisão)

| Item | Solução Técnica |
|------|-----------------|
| Contrato não é salvo no banco | Inserir registro em `contratos` quando OS-13/12 for concluída |
| CC sem vínculo com contrato | Vincular `contratos.cc_id` automaticamente |
| Parcelas não são geradas | Trigger já existe, será ativado quando contrato for inserido |
| Upload de contrato | Já funciona, apenas vincular ao registro de contrato |

---

## 📝 Resumo para Decisão

| # | Pergunta | Opções |
|---|----------|--------|
| 1 | CC de assessoria recorrente | Mesmo CC OU Novo por ano |
| 2 | Como registrar aditivos | Upload OU Campo estruturado |
| 3 | OSs derivadas | Manual OU Automático OU Via página contrato |
| 4 | Página de contratos | Sim OU Não (e quais funcionalidades) |

---

*Após essas definições, a implementação técnica será feita mantendo o fluxo atual de OSs.*
