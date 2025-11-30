# Componente: ClienteHistoricoCompleto

## 🎯 Objetivo
Implementar componente unificado para visualização completa do histórico de um cliente, incluindo todas as OS (ativas/concluídas/canceladas), contratos, propostas, interações (como lead) e documentos gerados.

## 📋 Requisitos Funcionais

### Histórico Consolidado
- **OS Ativas**: Lista todas as ordens de serviço em andamento
- **OS Concluídas**: Histórico de projetos finalizados
- **OS Canceladas**: Registro de projetos cancelados
- **Contratos**: Todos os contratos assinados
- **Propostas**: Histórico de propostas enviadas
- **Leads**: Interações iniciais e conversões
- **Documentos**: Todos os arquivos gerados (PDFs, anexos)

### Interface Unificada
- **Timeline Visual**: Cronologia de todas as interações
- **Filtros Avançados**: Por tipo, status, período, responsável
- **Busca Global**: Pesquisa em todo o histórico
- **Export**: Relatório completo em PDF

## 🏗️ Arquitetura do Componente

### Estrutura de Componentes
```
ClienteHistoricoCompleto/
├── ClienteHistoricoCompleto.tsx       # Componente principal
├── sections/
│   ├── ResumoCliente.tsx              # Header com métricas
│   ├── TimelineInteracoes.tsx         # Timeline visual
│   ├── ListaOrdensServico.tsx         # Grid de OS
│   ├── HistoricoFinanceiro.tsx        # Resumo financeiro
│   ├── DocumentosCliente.tsx          # Gestão de documentos
│   └── InteracoesLead.tsx             # Histórico de leads
├── hooks/
│   ├── useClienteHistorico.ts         # Hook principal
│   ├── useTimelineCliente.ts          # Hook para timeline
│   └── useDocumentosCliente.ts        # Hook para documentos
├── types/
│   └── cliente-historico.types.ts     # Tipos TypeScript
└── utils/
    ├── formatters.ts                  # Funções de formatação
    └── filters.ts                     # Lógica de filtros
```

### Props Interface
```typescript
interface ClienteHistoricoCompletoProps {
  clienteId: string;
  initialTab?: 'resumo' | 'timeline' | 'os' | 'financeiro' | 'documentos';
  showFilters?: boolean;
  enableExport?: boolean;
  onOSClick?: (osId: string) => void;
  onDocumentoClick?: (documentoId: string) => void;
}
```

### Estado Interno
```typescript
interface ClienteHistoricoState {
  cliente: Cliente | null;
  resumo: ResumoCliente;
  timeline: TimelineItem[];
  ordensServico: OrdemServico[];
  financeiro: ResumoFinanceiro;
  documentos: Documento[];
  loading: {
    cliente: boolean;
    timeline: boolean;
    os: boolean;
    financeiro: boolean;
    documentos: boolean;
  };
  filters: {
    tipo: string[];
    status: string[];
    periodo: { inicio: Date; fim: Date };
    responsavel: string[];
  };
  pagination: {
    timeline: { page: number; pageSize: number };
    os: { page: number; pageSize: number };
    documentos: { page: number; pageSize: number };
  };
}
```

## 🔄 Fluxo de Dados

### Hook Principal: `useClienteHistorico`
```typescript
function useClienteHistorico(clienteId: string) {
  // Queries paralelas para performance
  const clienteQuery = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => fetchCliente(clienteId),
  });

  const resumoQuery = useQuery({
    queryKey: ['cliente-resumo', clienteId],
    queryFn: () => fetchResumoCliente(clienteId),
  });

  const timelineQuery = useInfiniteQuery({
    queryKey: ['cliente-timeline', clienteId],
    queryFn: ({ pageParam }) => fetchTimelineCliente(clienteId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Computeds
  const resumo = useMemo(() => ({
    totalOS: resumoQuery.data?.totalOS ?? 0,
    valorTotalContratos: resumoQuery.data?.valorTotal ?? 0,
    projetosAtivos: resumoQuery.data?.ativos ?? 0,
    ultimoContato: resumoQuery.data?.ultimoContato,
  }), [resumoQuery.data]);

  return {
    cliente: clienteQuery.data,
    resumo,
    timeline: timelineQuery.data,
    isLoading: clienteQuery.isLoading || resumoQuery.isLoading,
    error: clienteQuery.error || resumoQuery.error,
  };
}
```

### Queries Otimizadas

#### Resumo do Cliente
```sql
-- Query principal com agregações
SELECT
  c.id,
  c.nome_razao_social,
  c.status,
  COUNT(DISTINCT os.id) as total_os,
  COUNT(DISTINCT CASE WHEN os.status_geral = 'em_andamento' THEN os.id END) as os_ativas,
  COUNT(DISTINCT CASE WHEN os.status_geral = 'concluida' THEN os.id END) as os_concluidas,
  COUNT(DISTINCT CASE WHEN os.status_geral = 'cancelada' THEN os.id END) as os_canceladas,
  SUM(ctr.valor_total) as valor_total_contratos,
  MAX(os.updated_at) as ultimo_contato,
  COUNT(DISTINCT doc.id) as total_documentos
FROM clientes c
LEFT JOIN ordens_servico os ON c.id = os.cliente_id
LEFT JOIN contratos ctr ON os.id = ctr.os_id
LEFT JOIN documentos doc ON doc.cliente_id = c.id
WHERE c.id = $1
GROUP BY c.id, c.nome_razao_social, c.status;
```

#### Timeline Consolidada
```sql
-- Timeline com paginação e tipos diversos
SELECT * FROM (
  -- Ordens de Serviço
  SELECT
    'os' as tipo,
    os.id,
    os.codigo_os as titulo,
    os.descricao,
    os.data_entrada as data,
    os.status_geral as status,
    os.valor_proposta as valor,
    col.nome_completo as responsavel_nome,
    json_build_object('os_id', os.id, 'tipo_os', tos.nome) as metadata
  FROM ordens_servico os
  JOIN colaboradores col ON os.responsavel_id = col.id
  JOIN tipos_os tos ON os.tipo_os_id = tos.id
  WHERE os.cliente_id = $1

  UNION ALL

  -- Contratos
  SELECT
    'contrato' as tipo,
    ctr.id,
    'Contrato Assinado' as titulo,
    ctr.descricao,
    ctr.data_assinatura as data,
    'concluido' as status,
    ctr.valor_total as valor,
    col.nome_completo as responsavel_nome,
    json_build_object('contrato_id', ctr.id, 'os_id', ctr.os_id) as metadata
  FROM contratos ctr
  JOIN ordens_servico os ON ctr.os_id = os.id
  JOIN colaboradores col ON ctr.assinado_por_id = col.id
  WHERE os.cliente_id = $1

  UNION ALL

  -- Leads/Interações
  SELECT
    'lead' as tipo,
    l.id,
    l.titulo,
    l.descricao,
    l.data_criacao as data,
    l.status,
    NULL as valor,
    col.nome_completo as responsavel_nome,
    json_build_object('lead_id', l.id, 'canal', l.canal) as metadata
  FROM leads l
  JOIN colaboradores col ON l.responsavel_id = col.id
  WHERE l.cliente_id = $1

) combined
ORDER BY data DESC
LIMIT $2 OFFSET $3;
```

## 🎨 Interface do Usuário

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Cliente: João Silva                                      │
│  Status: Ativo | Último Contato: 15/11/2025                 │
├─────────────────────────────────────────────────────────────┤
│  📈 Métricas Rápidas                                        │
│  🏗️ OS Ativas: 3    💰 Valor Total: R$ 450.000              │
│  📄 Documentos: 23   📞 Interações: 15                      │
├─────────────────────────────────────────────────────────────┤
│  🔍 [Filtros] [Buscar...] [Exportar PDF]                   │
├─────────────────────────────────────────────────────────────┤
│  📋 Timeline | 📊 OS | 💰 Financeiro | 📄 Documentos       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 28/11 - OS-2024-001 criada (Reforma Fachada)           │
│      Responsável: Maria Silva                               │
│                                                             │
│  📅 25/11 - Contrato assinado (R$ 45.000)                  │
│      OS-2024-001 - Reforma Fachada                          │
│                                                             │
│  📅 20/11 - Proposta enviada                                │
│      Valor: R$ 45.000 | Status: Aguardando Aprovação       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Componentes de Seção

#### Timeline Interações
```typescript
function TimelineInteracoes({ items, onItemClick }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
```

#### Filtros Avançados
```typescript
function FiltrosHistorico({ filters, onFiltersChange }: FiltrosProps) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <Select
        value={filters.tipo}
        onValueChange={(value) => onFiltersChange({ ...filters, tipo: value })}
        options={[
          { value: 'os', label: 'Ordens de Serviço' },
          { value: 'contrato', label: 'Contratos' },
          { value: 'lead', label: 'Leads' },
          { value: 'documento', label: 'Documentos' },
        ]}
      />

      <DateRangePicker
        value={filters.periodo}
        onChange={(periodo) => onFiltersChange({ ...filters, periodo })}
      />

      <Button variant="outline" onClick={() => onFiltersChange({})}>
        Limpar Filtros
      </Button>
    </div>
  );
}
```

## 🔧 Funcionalidades Avançadas

### Busca Global
```typescript
function useBuscaGlobal(clienteId: string, termo: string) {
  return useQuery({
    queryKey: ['cliente-busca', clienteId, termo],
    queryFn: () => searchClienteHistorico(clienteId, termo),
    enabled: termo.length > 2,
  });
}
```

### Export PDF
```typescript
async function exportarHistoricoPDF(clienteId: string, filters: Filters) {
  const dados = await fetchHistoricoCompleto(clienteId, filters);

  const doc = new jsPDF();
  // Lógica de geração do PDF
  // ...

  doc.save(`historico-cliente-${clienteId}.pdf`);
}
```

### Virtualização para Performance
```typescript
function TimelineVirtualizada({ items }: { items: TimelineItem[] }) {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 80,
  });

  return (
    <div ref={scrollElement} style={{ height: 400 }}>
      <div style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <TimelineItem
            key={items[virtualItem.index].id}
            item={items[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## 📊 Métricas e Performance

### KPIs do Componente
- **Tempo de Carregamento**: < 2 segundos para dados básicos
- **Timeline**: Carregamento lazy com paginação
- **Busca**: Resultados em < 500ms
- **Export**: PDF gerado em < 5 segundos

### Otimizações Implementadas
- **React Query**: Cache inteligente e invalidação automática
- **Virtualização**: Para listas grandes (> 100 itens)
- **Lazy Loading**: Componentes carregados sob demanda
- **Debounce**: Para busca e filtros (300ms)

## ✅ Testes e Qualidade

### Casos de Teste
- [ ] Carregamento inicial com dados completos
- [ ] Filtros aplicados corretamente
- [ ] Paginação funcionando
- [ ] Busca retornando resultados relevantes
- [ ] Export PDF com formatação correta
- [ ] Estados de loading e erro
- [ ] Responsividade mobile/desktop

### Cobertura de Código
- Componentes: > 80%
- Hooks: > 90%
- Utilitários: > 95%

## 🚀 Próximos Passos

1. **Implementar componente base** com estrutura skeleton
2. **Desenvolver hooks de dados** com queries otimizadas
3. **Criar interface visual** com design system
4. **Implementar filtros e busca** avançada
5. **Adicionar funcionalidade de export** PDF
6. **Testes e otimização** de performance
7. **Integração com navegação** principal

---

**Status**: 🟡 Especificado - Pronto para implementação
**Prioridade**: 🔴 ALTA
**Complexidade**: 🔴 ALTA
**Dependências**: Modelo de dados centro_custo por OS
**Prazo Estimado**: 3 sprints