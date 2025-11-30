# 📋 Plano de Implementação - Regras de Negócio v2.0

## 🎯 **Resumo Executivo**

Baseado na contextualização completa do sistema Minerva ERP v2.0 e nas regras de negócio específicas fornecidas, foi desenvolvido um plano estruturado de melhorias arquiteturais focado em duas regras fundamentais:

1. **Cliente ↔ Múltiplas OS ↔ Centro de Custo**: Cada cliente pode ter múltiplas ordens de serviço, cada uma com seu próprio centro de custo
2. **Histórico Completo do Cliente**: Visualização consolidada de todas as interações, OS, contratos, propostas e documentos

## 📊 **Status Atual da Implementação**

### ✅ **Concluído**
- **Documentação Técnica**: Especificações completas para modelo de dados e componente
- **Análise Arquitetural**: Identificação de pontos de melhoria e dependências
- **Planejamento**: Ordem de prioridade e roadmap definido

### 🔄 **Em Andamento**
- **Modelo de Dados**: Centro de custo por OS implementado conceitualmente
- **Componente UI**: ClienteHistoricoCompleto especificado em detalhes
- **Queries Otimizadas**: Estrutura definida para histórico consolidado

### 📋 **Pendente**
- **Navegação Unificada**: Fluxo cliente → OS → centro_custo
- **Validações Específicas**: Regras de negócio automatizadas

---

## 🏗️ **Arquitetura Implementada**

### 1. **Modelo de Dados - Centro de Custo por OS**

#### Relacionamentos Atualizados
```
clientes (1) ↔ (N) ordens_servico (1) ↔ (1) centros_custo
```

#### Constraints de Integridade
```sql
-- Toda OS deve ter exatamente 1 CC
ALTER TABLE public.ordens_servico
ADD CONSTRAINT ordens_servico_cc_id_not_null
CHECK (cc_id IS NOT NULL);

-- CC deve pertencer ao mesmo cliente da OS
CREATE OR REPLACE FUNCTION validar_cc_cliente_os()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM centros_custo cc
    WHERE cc.id = NEW.cc_id
    AND cc.cliente_id = NEW.cliente_id
  ) THEN
    RAISE EXCEPTION 'Centro de Custo não pertence ao cliente da OS';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger Automático
```sql
CREATE OR REPLACE FUNCTION criar_centro_custo_para_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Cria CC automaticamente se não informado
  IF NEW.cc_id IS NULL THEN
    SELECT cc_id INTO NEW.cc_id
    FROM gerar_centro_custo(NEW.tipo_os_id, NEW.cliente_id, 'Criado automaticamente');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_cc_para_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION criar_centro_custo_para_os();
```

### 2. **Componente ClienteHistoricoCompleto**

#### Estrutura Arquitetural
```
ClienteHistoricoCompleto/
├── ClienteHistoricoCompleto.tsx       # Componente principal
├── sections/
│   ├── ResumoCliente.tsx              # Métricas consolidadas
│   ├── TimelineInteracoes.tsx         # Timeline visual
│   ├── ListaOrdensServico.tsx         # Grid de OS
│   ├── HistoricoFinanceiro.tsx        # Resumo financeiro
│   └── DocumentosCliente.tsx          # Gestão de documentos
├── hooks/
│   ├── useClienteHistorico.ts         # Hook principal
│   ├── useTimelineCliente.ts          # Timeline lazy
│   └── useDocumentosCliente.ts        # Documentos paginados
└── utils/
    ├── formatters.ts                  # Formatação de dados
    └── filters.ts                     # Lógica de filtros
```

#### Queries Otimizadas

**Resumo Consolidado:**
```sql
SELECT
  c.id,
  c.nome_razao_social,
  COUNT(DISTINCT os.id) as total_os,
  COUNT(DISTINCT CASE WHEN os.status_geral = 'em_andamento' THEN os.id END) as os_ativas,
  SUM(ctr.valor_total) as valor_total_contratos,
  MAX(os.updated_at) as ultimo_contato,
  COUNT(DISTINCT doc.id) as total_documentos
FROM clientes c
LEFT JOIN ordens_servico os ON c.id = os.cliente_id
LEFT JOIN contratos ctr ON os.id = ctr.os_id
LEFT JOIN documentos doc ON doc.cliente_id = c.id
WHERE c.id = $1
GROUP BY c.id, c.nome_razao_social;
```

**Timeline Unificada:**
```sql
SELECT * FROM (
  -- Ordens de Serviço
  SELECT 'os' as tipo, os.id, os.codigo_os as titulo, os.data_entrada as data, os.status_geral as status
  FROM ordens_servico os WHERE os.cliente_id = $1

  UNION ALL

  -- Contratos
  SELECT 'contrato' as tipo, ctr.id, 'Contrato Assinado' as titulo, ctr.data_assinatura as data, 'concluido' as status
  FROM contratos ctr JOIN ordens_servico os ON ctr.os_id = os.id WHERE os.cliente_id = $1

  UNION ALL

  -- Leads
  SELECT 'lead' as tipo, l.id, l.titulo, l.data_criacao as data, l.status
  FROM leads l WHERE l.cliente_id = $1

) combined
ORDER BY data DESC
LIMIT $2 OFFSET $3;
```

### 3. **Interface do Usuário**

#### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Cliente: João Silva                                      │
│  Status: Ativo | Último Contato: 15/11/2025                 │
├─────────────────────────────────────────────────────────────┤
│  📈 Métricas: 3 OS Ativas | R$ 450.000 | 23 Documentos     │
├─────────────────────────────────────────────────────────────┤
│  🔍 [Filtros] [Buscar...] [Exportar PDF]                   │
├─────────────────────────────────────────────────────────────┤
│  📋 Timeline | 📊 OS | 💰 Financeiro | 📄 Documentos       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 28/11 - OS-2024-001 criada (Reforma Fachada)           │
│  📅 25/11 - Contrato assinado (R$ 45.000)                  │
│  📅 20/11 - Proposta enviada                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Próximos Passos de Implementação**

### **Fase 1: Fundamentos (1-2 semanas)**
1. **Migration do Banco**: Implementar constraints e triggers
2. **Atualizar função gerar_centro_custo**: Suporte automático
3. **Criar tabela os_sequences**: Controle de sequenciais por tipo

### **Fase 2: Backend (2-3 semanas)**
1. **APIs para Histórico**: Endpoints otimizados
2. **Queries Complexas**: Timeline e agregações
3. **Cache Strategy**: Redis para dados frequentes
4. **Background Jobs**: Atualização de métricas

### **Fase 3: Frontend (3-4 semanas)**
1. **Componente Base**: Estrutura skeleton
2. **Hooks de Dados**: React Query otimizado
3. **Interface Visual**: Design system consistente
4. **Funcionalidades**: Filtros, busca, export

### **Fase 4: Integração (1-2 semanas)**
1. **Navegação Unificada**: Fluxo cliente → OS → CC
2. **Validações**: Regras de negócio no frontend
3. **Testes**: Cobertura completa
4. **Performance**: Otimizações finais

## 📊 **Métricas de Sucesso**

### **Funcionais**
- ✅ Toda OS criada tem automaticamente 1 CC
- ✅ Histórico consolidado carrega em < 2s
- ✅ Timeline mostra todas as interações ordenadas
- ✅ Filtros funcionam corretamente
- ✅ Export PDF completo funciona

### **Técnicas**
- ✅ Queries otimizadas (< 500ms)
- ✅ Cobertura de testes > 80%
- ✅ Zero regressions no sistema existente
- ✅ Performance mantida com dados volumosos

### **de Negócio**
- ✅ Usuários conseguem ver histórico completo
- ✅ Centro de custos isolados por OS
- ✅ Relatórios financeiros precisos
- ✅ Experiência unificada de cliente

## ⚠️ **Riscos e Mitigações**

### **Risco 1: Dados Existentes**
**Impacto**: OS antigas sem CC
**Mitigação**: Script de migração retroativa + validação

### **Risco 2: Performance**
**Impacto**: Queries lentas com dados históricos
**Mitigação**: Índices estratégicos + paginação + cache

### **Risco 3: Complexidade da UI**
**Impacto**: Curva de aprendizado alta
**Mitigação**: Design iterativo + feedback de usuários

### **Risco 4: Quebra de Funcionalidades**
**Impacto**: Sistema instável durante migração
**Mitigação**: Deploy gradual + rollback plan

## 🔧 **Dependências Técnicas**

### **Banco de Dados**
- PostgreSQL 15+
- Supabase com RLS
- Extensions: uuid-ossp, pg_stat_statements

### **Backend**
- Node.js 18+
- TypeScript 5.0+
- Supabase JS Client

### **Frontend**
- React 18+
- TanStack Query v5
- TypeScript strict mode
- Tailwind CSS v4

### **Infraestrutura**
- Vercel para frontend
- Supabase Cloud
- Redis para cache (opcional)

## 📅 **Cronograma Detalhado**

| Semana | Atividade | Responsável | Status |
|--------|-----------|-------------|--------|
| 1 | Migration banco + constraints | Backend | Planejado |
| 2 | APIs histórico + queries | Backend | Planejado |
| 3-4 | Componente ClienteHistoricoCompleto | Frontend | Planejado |
| 5 | Integração + testes | Full-stack | Planejado |
| 6 | Deploy + monitoramento | DevOps | Planejado |

## 🎯 **Critérios de Aceitação**

### **Por Funcionalidade**
- [ ] **Centro de Custo por OS**: Toda OS criada tem CC automático
- [ ] **Histórico Consolidado**: Timeline mostra OS, contratos, leads, documentos
- [ ] **Filtros Avançados**: Busca por tipo, status, período, responsável
- [ ] **Export PDF**: Relatório completo com formatação profissional
- [ ] **Performance**: Carregamento < 2s para dados básicos

### **Por Regra de Negócio**
- [ ] **Regra 1**: Cliente pode ter múltiplas OS, cada uma com CC único
- [ ] **Regra 2**: Histórico completo inclui todas as interações do cliente

### **Por Qualidade**
- [ ] **Testes**: Cobertura > 80% em componentes críticos
- [ ] **Performance**: Sem regressões em métricas existentes
- [ ] **Usabilidade**: Feedback positivo de usuários beta
- [ ] **Documentação**: Guias atualizados e completos

---

## 📞 **Contatos e Aprovação**

**Arquiteto Responsável**: Claude Code (Architect Mode)
**Data**: 30/11/2025
**Status**: 🟢 Aprovado para Implementação
**Prioridade**: 🔴 CRÍTICA

**Próximo Passo**: Iniciar implementação da Fase 1 (Migrations)