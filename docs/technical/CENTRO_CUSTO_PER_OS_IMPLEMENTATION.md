# Implementação: Centro de Custo por OS

## 🎯 Objetivo
Garantir que cada Ordem de Serviço tenha exatamente 1 Centro de Custo, conforme regra de negócio: "Um cliente pode ter mais de uma Ordem de Serviço, consequentemente mais de um Centro de Custo".

## 📊 Modelo de Dados Atual

### Relacionamentos Atuais
```
clientes (1) ↔ (N) ordens_servico (1) ↔ (1) centros_custo
```

### Tabela `centros_custo`
```sql
public.centros_custo (
  id uuid PK,
  nome text,                    -- Ex: CC1300001
  valor_global numeric,         -- Orçamento total do CC
  cliente_id uuid FK(clientes), -- Cliente proprietário
  tipo_os_id uuid FK(tipos_os), -- Tipo que originou o CC
  descricao text,               -- Descrição opcional
  ativo boolean                 -- Status do CC
);
```

### Tabela `ordens_servico`
```sql
public.ordens_servico (
  id uuid PK,
  cc_id uuid FK(centros_custo), -- Centro de Custo da OS
  -- ... outros campos
);
```

## 🔧 Mudanças Necessárias

### 1. Constraint de Integridade
```sql
-- Garantir que cada OS tenha exatamente 1 CC
ALTER TABLE public.ordens_servico
ADD CONSTRAINT ordens_servico_cc_id_not_null
CHECK (cc_id IS NOT NULL);

-- Índice para performance
CREATE INDEX idx_ordens_servico_cc_id ON ordens_servico(cc_id);
```

### 2. Trigger Automático de Criação
```sql
CREATE OR REPLACE FUNCTION criar_centro_custo_para_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Se cc_id não foi fornecido, criar automaticamente
  IF NEW.cc_id IS NULL THEN
    -- Chamar função gerar_centro_custo existente
    SELECT cc_id INTO NEW.cc_id
    FROM gerar_centro_custo(NEW.tipo_os_id, NEW.cliente_id, 'Criado automaticamente para OS');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER trigger_criar_cc_para_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION criar_centro_custo_para_os();
```

### 3. Validações de Negócio

#### Regra: Centro de Custo deve pertencer ao mesmo cliente da OS
```sql
CREATE OR REPLACE FUNCTION validar_cc_cliente_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o CC pertence ao cliente da OS
  IF NOT EXISTS (
    SELECT 1 FROM centros_custo cc
    WHERE cc.id = NEW.cc_id
    AND cc.cliente_id = NEW.cliente_id
  ) THEN
    RAISE EXCEPTION 'Centro de Custo % não pertence ao cliente da OS', NEW.cc_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_cc_cliente_os
  BEFORE INSERT OR UPDATE ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION validar_cc_cliente_os();
```

## 🔄 Fluxo de Criação de OS

### Fluxo Atual (Manual)
1. Usuário cria OS
2. Sistema solicita seleção de Centro de Custo
3. Usuário seleciona CC existente ou cria novo

### Fluxo Proposto (Automático)
1. Usuário cria OS informando tipo_os e cliente
2. Sistema **automaticamente** cria Centro de Custo usando `gerar_centro_custo()`
3. OS é vinculada ao CC recém-criado
4. Usuário pode editar descrição do CC se necessário

## 📈 Benefícios da Implementação

### 1. Integridade de Dados
- **Garantia**: Toda OS terá exatamente 1 CC
- **Consistência**: CC sempre pertence ao cliente correto
- **Auditoria**: Histórico completo de custos por OS

### 2. Experiência do Usuário
- **Automação**: Não precisa escolher CC manualmente
- **Clareza**: Cada OS tem seu próprio centro de custos
- **Rastreabilidade**: Custos 100% isolados por projeto

### 3. Relatórios e Analytics
- **Análises por OS**: Custos detalhados por projeto específico
- **Comparativos**: Performance financeira por tipo de serviço
- **Orçamentos**: Controle preciso por centro de custo

## 🎨 Interface do Usuário

### Dashboard do Cliente
```
📊 Cliente: João Silva

Centro de Custos Ativos: 3
├── CC1300001 - Reforma Fachada (OS-2024-001)
├── CC0900005 - Instalação Elétrica (OS-2024-002)
└── CC0500012 - Manutenção Geral (OS-2024-003)
```

### Detalhes da OS
```
🏗️ OS-2024-001 - Reforma Fachada

Centro de Custo: CC1300001
Valor Orçado: R$ 15.000,00
Valor Executado: R$ 12.500,00
Status: Em Andamento
```

## 🔍 Queries de Histórico Consolidado

### Histórico Completo do Cliente
```sql
SELECT
  c.nome_razao_social as cliente,
  os.codigo_os,
  os.descricao,
  cc.nome as centro_custo,
  os.status_geral,
  os.valor_contrato,
  os.data_entrada,
  os.data_conclusao
FROM clientes c
LEFT JOIN ordens_servico os ON c.id = os.cliente_id
LEFT JOIN centros_custo cc ON os.cc_id = cc.id
WHERE c.id = $1
ORDER BY os.data_entrada DESC;
```

### Timeline Consolidada
```sql
SELECT 'os_criada' as tipo, os.id, os.codigo_os as titulo, os.descricao, os.data_entrada as data, os.status_geral as status
FROM ordens_servico os WHERE os.cliente_id = $1

UNION ALL

SELECT 'contrato_assinado' as tipo, ctr.id, 'Contrato Assinado' as titulo, ctr.descricao, ctr.data_assinatura as data, 'concluido' as status
FROM contratos ctr WHERE ctr.os_id IN (SELECT id FROM ordens_servico WHERE cliente_id = $1)

ORDER BY data DESC;
```

## ✅ Checklist de Implementação

- [ ] Criar migration para constraint NOT NULL em cc_id
- [ ] Implementar trigger automático de criação de CC
- [ ] Adicionar validação de cliente-CC
- [ ] Atualizar função `gerar_centro_custo` se necessário
- [ ] Criar componente `ClienteHistoricoCompleto`
- [ ] Implementar queries otimizadas para histórico
- [ ] Atualizar navegação cliente → OS → CC
- [ ] Adicionar testes de integridade
- [ ] Documentar novas regras de negócio

## 🚨 Riscos e Mitigações

### Risco: Dados existentes sem CC
**Mitigação**: Script de migração para criar CCs retroativos

### Risco: Performance de queries complexas
**Mitigação**: Índices otimizados + cache estratégico

### Risco: Mudanças breaking na API
**Mitigação**: Versionamento adequado + comunicação com frontend

---

**Status**: 🟡 Planejado - Aguardando implementação
**Prioridade**: 🔴 CRÍTICA
**Responsável**: Equipe de Backend
**Prazo**: 2 sprints