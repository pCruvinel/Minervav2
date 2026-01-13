# 📋 Plano de Reestruturação Dinâmica da OS-08

**Data:** 2026-01-13  
**Responsável:** Sistema  
**Status:** Fases 1 e 2 ✅ | Fase 3 ⏳ Pendente

---

## 🎯 Objetivo

Transformar a OS-08 (Visita Técnica / Parecer Técnico) em um workflow dinâmico que:
1. Seleciona a finalidade da inspeção no início
2. Gera automaticamente o título do documento
3. Adapta o formulário pós-visita conforme a finalidade
4. Implementa checklist de recebimento de unidade autônoma

---

## 📦 Fases de Implementação

### Fase 1: Campo Finalidade + Título Dinâmico ✅

**Arquivos Criados:**
- `src/components/os/assessoria/os-8/types/os08-types.ts`

**Arquivos Modificados:**
- `src/components/os/assessoria/os-8/steps/step-detalhes-solicitacao.tsx`
- `src/components/os/assessoria/os-8/pages/os08-workflow-page.tsx`

**Funcionalidades:**
- Campo `finalidadeInspecao` com 5 opções
- Preview do título do documento em tempo real
- Auto-preenchimento de área para SPCI/SPDA

**Opções de Finalidade:**

| Valor | Label | Título Gerado |
|-------|-------|---------------|
| `recebimento_unidade` | Recebimento de Unidade | RELATÓRIO DE INSPEÇÃO DE RECEBIMENTO DE UNIDADE AUTÔNOMA |
| `escopo_tecnico` | Escopo de Serviço | ESCOPO DE SERVIÇO PARA {ÁREA} |
| `parecer_tecnico` | Parecer Técnico | PARECER TÉCNICO DE VISTORIA DE {ÁREA} |
| `laudo_spci` | Laudo SPCI | LAUDO TÉCNICO DE SPCI – SISTEMA DE PROTEÇÃO E COMBATE A INCÊNDIO |
| `laudo_spda` | Laudo SPDA | LAUDO TÉCNICO DE SPDA – SISTEMA DE PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS |

---

### Fase 2: Checklist de Recebimento de Unidade ✅

**Arquivos Criados:**
- `src/components/os/assessoria/os-8/components/checklist-recebimento.tsx`

**Arquivos Modificados:**
- `src/components/os/assessoria/os-8/steps/step-formulario-pos-visita.tsx`

**Funcionalidades:**
- 8 blocos em Accordion
- 27 itens de verificação
- Status por item: C (Conforme) | NC (Não Conforme) | NA (Não se Aplica)
- Observação obrigatória para itens NC
- Upload de fotos por item (máx. 2)
- Estatísticas de conformidade em tempo real

**Blocos do Checklist:**

| # | Bloco | Itens |
|:-:|-------|:-----:|
| 1 | Documentação Geral | 3 |
| 2 | Pisos e Revestimentos | 4 |
| 3 | Paredes e Tetos | 4 |
| 4 | Portas e Vidros | 4 |
| 5 | Louças e Metais | 4 |
| 6 | Áreas Molhadas | 4 |
| 7 | Elétrica e Comunicação | 4 |
| 8 | Áreas Externas | 3 |
| **Total** | | **27** |

---

### Fase 3: Regras de Negócio ⏳ PENDENTE

**Status:** Não iniciada

#### RN-001: Aprovação Hierárquica

**Requisito:** Após preenchimento da Etapa 5, status deve mudar para "⏳ Aguard. Aprovação". Avanço para Etapa 6 bloqueado até aprovação.

**Aprovadores:** `coord_administrativo` OU `diretor`

**Implementação Necessária:**
- [ ] Migration Supabase: campo `status_aprovacao` em `os_etapas`
- [ ] RLS policy para aprovação
- [ ] UI de bloqueio na Etapa 6
- [ ] Componente de aprovação para coordenador/diretor

```sql
-- Migration pendente
ALTER TABLE os_etapas 
ADD COLUMN status_aprovacao TEXT CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado'));
```

---

#### RN-002: Alerta de Recorrência OS-05

**Requisito:** Se cliente possui contrato OS-05 (assessoria anual), exibir alerta no calendário caso não haja OS-08 agendada na semana vigente.

**Implementação Necessária:**
- [ ] Query para clientes com OS-05 ativa
- [ ] Verificação de OS-08 agendadas na semana
- [ ] Alerta visual no componente CalendarioIntegracao

---

#### RN-003: Cálculo de Custo Dia

**Requisito:** Ao concluir Etapa 4 (Realizar Visita), disparar lógica de rateio de custo do colaborador para o Centro de Custo do cliente.

**Implementação Necessária:**
- [ ] Hook de rateio de custo
- [ ] Integração com tabela `centro_custo`
- [ ] Trigger na conclusão da Etapa 4

---

## 🧪 Verificação

### Testes Manuais Realizados

- [x] Build passou (18.74s)
- [x] Seleção de finalidade funciona
- [x] Preview de título atualiza em tempo real
- [x] Checklist renderiza quando finalidade = recebimento_unidade
- [x] Formulário genérico renderiza para outras finalidades
- [x] Navegação via Detalhes da OS funciona corretamente (initialStep)
- [x] Título do cabeçalho exibe codigoOS + tipoOSNome
- [x] Botão Voltar navega para página de Detalhes da OS

### Testes Pendentes (Fase 3)

- [ ] Fluxo de aprovação
- [ ] Alerta de recorrência
- [ ] Rateio de custo

---

## 📁 Estrutura de Arquivos Atualizada

```
src/components/os/assessoria/os-8/
├── components/
│   └── checklist-recebimento.tsx     ← NOVO
├── pages/
│   └── os08-workflow-page.tsx        ← MODIFICADO (v1.1)
├── steps/
│   ├── step-detalhes-solicitacao.tsx ← MODIFICADO
│   ├── step-formulario-pos-visita.tsx ← MODIFICADO
│   └── ... (outros steps)
└── types/
    └── os08-types.ts                  ← NOVO
```

---

## 🔄 Correções e Melhorias (v1.1 - 2026-01-13)

### Navegação via Detalhes da OS

**Problema:** Ao clicar em uma etapa concluída na aba "Etapas" dos Detalhes da OS, o usuário era direcionado para a Etapa 1 ao invés da etapa selecionada.

**Causa:** O componente `OS08WorkflowPage` não recebia o parâmetro `step` da URL.

**Correção:**
```tsx
// details-workflow.$id.tsx
<OS08WorkflowPage
  osId={id}
  initialStep={step}        // ✅ ADICIONADO
  readonly={readonly}       // ✅ ADICIONADO
  codigoOS={os.codigo_os}   // ✅ ADICIONADO
  tipoOSNome={os.tipo_os_nome} // ✅ ADICIONADO
  onBack={handleBack}
/>
```

### Cabeçalho Padronizado

**Problema:** O cabeçalho exibia título genérico "OS-08: Visita Técnica / Parecer Técnico".

**Correção:** Cabeçalho agora exibe o mesmo formato da página de Detalhes:
- `codigoOS` como título principal (ex: "OS0800047")
- `tipoOSNome` como subtítulo (ex: "Visita Técnica / Parecer Técnico")

### Botão Voltar

**Problema:** Usava `router.history.back()` que não garantia navegação correta.

**Correção:** Usa `Link` para navegar diretamente para `/os/$osId` (página de Detalhes).

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 5 |
| Linhas adicionadas | ~1.300 |
| Build time | 18.74s |
| Itens de checklist | 27 |
| Finalidades de inspeção | 5 |

---

**Última Atualização:** 2026-01-13  
**Versão:** 1.1
