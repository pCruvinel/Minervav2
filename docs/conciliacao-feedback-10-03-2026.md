# Feedback Conciliação Bancária — 10/03/2026

> Levantamento de ajustes necessários no módulo de conciliação bancária.
> Componentes afetados: `conciliacao-bancaria-page.tsx`, `modal-conciliacao.tsx`, `modal-classificar-lancamento.tsx`

---

## 🐛 Bug

- [ ] **#48** Ao selecionar "mão de obra", o anexo não fica disponível após o lançamento ser conciliado.

---

## ⚙️ Automação

- [ ] **#49** Programar atualização automática do extrato bancário (ex: a cada 1h). Atualmente o sistema só baixa o extrato quando o usuário clica em "Atualizar".

---

## 📊 Painel / Dashboard

- [ ] **#50** Falta painel de **previsão**: receita / fatura / mês / hoje.

---

## 📝 Regras por Tipo de Lançamento

### Saída

| Tipo | Setor | CC | Anexo | Detalhamento |
|------|-------|----|-------|-------------|
| Escritório / Setor Obras / Setor Assessoria | ❌ Não perguntar | ❌ Não perguntar | ✅ Obrigatório | ❌ Não descrever |
| Tributo Empresa | ❌ Não selecionar | ❌ Não selecionar | ✅ Só anexo | ❌ Não descrever |
| Aplicação | ❌ Não selecionar | ❌ Não selecionar | ❌ Sem anexo | ❌ Não descrever |

- [ ] **#51** Escritório / Setor Obras / Setor Assessoria: não perguntar setor nem CC, cobrar anexo, sem "detalhamento"
- [ ] **#54** Tributo Empresa: não seleciona setor nem CC, SÓ anexo, sem "detalhamento"
- [ ] **#55** Aplicação: não seleciona setor, CC nem anexo, sem "detalhamento"

### Entrada

| Tipo | Setor | CC | Anexo | Detalhamento |
|------|-------|----|-------|-------------|
| Fatura recorrente / Receita | — | — | NF opcional | — |
| Aplicação | ❌ Não selecionar | ❌ Não selecionar | ❌ Sem anexo | ❌ Não descrever |

- [ ] **#57** Entrada: atribuir a fatura recorrente ou APLICAÇÃO
- [ ] **#58** Entrada: **não** dar opção de "criar novo"
- [ ] **#59** Entrada: opção de anexar NF (não obrigatório)

---

## 🏷️ UX / Legendas

- [ ] **#52** Alterar legenda:
  - Saída: "Vincular Existente" → **"Vincular Fatura Recorrente"**
  - Entrada: "Vincular Existente" → **"Vincular Receita Recorrente"**
  - Abrir lista de faturas/receitas do mês a serem conciliadas
- [ ] **#53** Incluir coluna/campo **"Detalhamento"** para descrição livre do lançamento
- [ ] **#56** Setor: remover setores extras — manter somente **"OBRAS"** e **"ASSESSORIA"** (5 aparecem hoje)
- [ ] **#60** Entrada: remover duplicidade "Cliente vinculado" / "Vincular Existente" — manter somente **"Vincular Fatura Recorrente"**

---

## Resumo

| Categoria | Qtd |
|-----------|-----|
| Bug | 1 |
| Automação | 1 |
| Painel | 1 |
| Regras por tipo | 6 |
| UX / Legendas | 4 |
| **Total** | **13** |
