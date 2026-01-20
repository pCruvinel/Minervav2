# 🧠 Memória do Projeto

> **Status**: Ativo  
> **Última Atualização**: 2026-01-19

## 📌 Contexto Atual
O projeto está em fase de **Estabilidade e Produção**. O foco recente foi na implementação do **Módulo Financeiro Integrado** e funcionalidades críticas de workflow.

---

## 💰 Módulo Financeiro Integrado (Jan/2026)

### Objetivo
Estruturar o módulo financeiro para integração total com OS, Contratos e Presença, permitindo calcular a **lucratividade exata** de cada Ordem de Serviço e Cliente.

### Novas Tabelas

| Tabela | Descrição |
|--------|-----------|
| `plano_contas` | Estrutura hierárquica de contas contábeis (DRE) |
| `categorias_financeiras` | Categorias para classificação de lançamentos financeiros |

### Alterações em Tabelas Existentes

| Tabela | Alteração |
|--------|-----------|
| `contas_pagar` | Adicionado `categoria_id` (FK para `categorias_financeiras`) |
| `contas_receber` | Adicionado `contrato_id` e `categoria_id` |

### Novas Funções

| Função | Descrição |
|--------|-----------|
| `gerar_parcelas_contrato(UUID)` | Gera automaticamente parcelas em `contas_receber` ao criar contrato |

### Novas Views

| View | Descrição |
|------|-----------|
| `view_custo_mo_detalhado_os` | Custo de MO detalhado por OS com breakdown por colaborador |
| `view_financeiro_os_resumo` | Resumo consolidado: receitas, despesas, custo MO, lucro e margem por OS |
| `view_financeiro_cliente_resumo` | Resumo financeiro agregado por cliente |

### Diagrama de Integração

```
Contratos → gerar_parcelas_contrato() → contas_receber
                                              ↓
registros_presenca → alocacao_horas_cc ─────────────┐
                                                     ↓
contas_pagar ─────────────────────────→ view_financeiro_os_resumo
                                              ↓
                                    Lucro Bruto + Margem %
```

---

## 🚀 Funcionalidades Anteriores

### Sistema de Delegação (Jan/2026)
- **Componente**: `OSHeaderDelegacao` (refatorado para autonomia)
- **Interface**: Menu "três pontos" na tela de detalhes da OS
- **Banco de Dados**: Tabelas `os_participantes` e `os_etapas_responsavel`

---

## 🛠 Decisões Técnicas
1. **Plano de Contas Hierárquico**: Estrutura de 4 níveis (Grupo → Subgrupo → Conta → Subconta) seguindo padrão DRE brasileiro.
2. **Centro de Custo Obrigatório**: Todo lançamento financeiro deve estar vinculado a um CC. Despesas administrativas vão para CC "ADMINISTRATIVO" (tipo 00).
3. **Campos Legado**: Campos texto `categoria/subcategoria` em `contas_pagar` mantidos para retrocompatibilidade, marcados como DEPRECATED.
4. **Geração de Parcelas**: Função SQL com idempotência (verifica se parcelas já existem antes de gerar).

---

## 🐛 Bugs Conhecidos e Correções
- **Erro 400 em Fetch de Etapas**: Corrigido (nome de coluna `os_id` vs `ordem_servico_id`)
- **Acessibilidade Dialog**: Avisos de `DialogDescription` corrigidos

---

## 📝 Próximos Passos
- [ ] Aplicar migrações do Módulo Financeiro via Supabase
- [ ] Criar componentes React para seleção de categorias financeiras
- [ ] Implementar dashboard de lucratividade por OS/Cliente
- [ ] Adicionar triggers para geração automática de parcelas ao criar contrato
