# Plano de Implementação: Melhorias no Controle de Presença

> **Documento Relacionado:** [PRESENCE_CONTROL_SYSTEM.md](./PRESENCE_CONTROL_SYSTEM.md)  
> **Prioridade:** Alta  
> **Data de Atualização:** 12/01/2026  
> **Esforço Estimado:** 12-16 horas

> [!NOTE]
> ## Status de Implementação
> | Parte | Descrição | Status |
> |-------|-----------|--------|
> | PARTE 1 | Melhorias na Tabela Principal | ✅ **COMPLETO** |
> | PARTE 2 | Página de Detalhes do Dia | ✅ **COMPLETO** |
> | PARTE 3 | Página de Histórico | ✅ **COMPLETO** |

## 📋 Visão Geral

Este documento descreve as melhorias planejadas para o sistema de Controle de Presença, incluindo:

1. **Melhorias na Tabela Principal** - Página existente `/colaboradores/presenca-tabela` ✅ Implementado
2. **Página de Detalhes do Dia** - Nova página `/colaboradores/presenca-tabela/$data` ⏳ Pendente
3. **Página de Histórico de Presenças** - Nova página `/colaboradores/presenca-historico` ✅ Implementado

---

# 🔧 PARTE 1: Melhorias na Tabela Principal

## 1.1 Desativar Performance quando Status = FALTA

### Comportamento Esperado
- Quando o status de um colaborador for alterado para `FALTA`, o campo de Performance deve ser **desabilitado e limpo**
- O campo fica com valor vazio ou "N/A" e não é editável
- Quando o status voltar para `OK` ou `ATRASADO`, o campo Performance volta a ser editável

### Implementação

```tsx
// Em controle-presenca-tabela-page.tsx - handleStatusChange
const handleStatusChange = (colaboradorId: string, status: RegistroPresenca['status']) => {
  // Se status é FALTA, limpar performance (não faz sentido avaliar quem faltou)
  const novaPerformance = status === 'FALTA' ? undefined : registros[colaboradorId].performance;
  
  if (status === 'FALTA' || status === 'ATRASADO') {
    setColaboradorAtual(colaboradorId);
    setTipoJustificativa('STATUS');
    setModalJustificativaOpen(true);
  }

  setRegistros(prev => ({
    ...prev,
    [colaboradorId]: {
      ...prev[colaboradorId],
      status,
      performance: novaPerformance,  // ← Limpar se FALTA
      justificativaStatus: status === 'OK' ? undefined : prev[colaboradorId].justificativaStatus,
      minutosAtraso: status === 'ATRASADO' ? prev[colaboradorId].minutosAtraso : undefined,
    }
  }));
};

// No Select de Performance na tabela
<Select
  value={registro.performance || ''}
  onValueChange={(value) => handlePerformanceChange(colaborador.id, value as RegistroPresenca['performance'])}
  disabled={isRegistroConfirmado(registro) || registro.status === 'FALTA'}  // ← Desabilitar se FALTA
>
  <SelectTrigger className={cn(
    "w-full", 
    getValidationClass(colaborador, registro, 'performance'),
    registro.status === 'FALTA' && "opacity-50 cursor-not-allowed"  // ← Visual de desabilitado
  )}>
    <SelectValue placeholder={registro.status === 'FALTA' ? 'N/A' : 'Selecione'} />
  </SelectTrigger>
  ...
</Select>
```

---

## 1.2 Anexar Arquivos na Justificativa de Falta

### Comportamento Esperado
- No modal de justificativa, adicionar opção de anexar arquivo (atestado, comprovante, etc.)
- Aceitar formatos: PDF, JPG, PNG
- Limite de tamanho: 5MB
- Upload para Supabase Storage no bucket `comprovantes-presenca`
- Salvar URL no campo `anexo_url` do registro

### Interface Atualizada

```typescript
interface RegistroPresenca {
  // ... campos existentes
  anexoUrl?: string;
  anexoNome?: string;  // NOVO: Nome original do arquivo
}
```

### Alteração no Modal

```tsx
function ModalJustificativa({ open, onClose, onSalvar, tipo, colaboradorNome, status }: ModalJustificativaProps) {
  const [justificativa, setJustificativa] = useState('');
  const [minutosAtraso, setMinutosAtraso] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);  // NOVO
  const [uploading, setUploading] = useState(false);  // NOVO

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato não suportado. Use PDF, JPG ou PNG.');
        return;
      }
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setArquivo(file);
    }
  };

  const handleSalvar = async () => {
    if (!justificativa.trim()) {
      toast.error('Preencha a justificativa');
      return;
    }

    let anexoUrl: string | undefined;
    
    // Upload do arquivo se existir
    if (arquivo) {
      setUploading(true);
      try {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${colaboradorId}/${Date.now()}_${arquivo.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('comprovantes-presenca')
          .upload(fileName, arquivo);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes-presenca')
          .getPublicUrl(fileName);
          
        anexoUrl = publicUrl;
      } catch (error) {
        toast.error('Erro ao fazer upload do arquivo');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSalvar(justificativa, minutosAtraso ? parseInt(minutosAtraso) : undefined, anexoUrl);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* ... campos existentes ... */}
        
        {/* NOVO: Campo de anexo */}
        {tipo === 'STATUS' && (status === 'FALTA' || status === 'ATRASADO') && (
          <div className="space-y-2">
            <Label>Anexar Comprovante (Opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="flex-1"
              />
              {arquivo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setArquivo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {arquivo && (
              <p className="text-xs text-muted-foreground">
                📎 {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Justificativa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Schema do Storage Bucket

```sql
-- Criar bucket se não existir (via dashboard ou migration)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-presenca', 'comprovantes-presenca', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para permitir upload autenticado
CREATE POLICY "Authenticated users can upload comprovantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprovantes-presenca');

CREATE POLICY "Public can view comprovantes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'comprovantes-presenca');
```

---

## 1.3 Bulk Options (Ações em Massa)

### Comportamento Esperado
- **Barra de ações em massa** aparece quando pelo menos 1 colaborador está selecionado
- Ações disponíveis:
  - Marcar todos como OK
  - Marcar todos como Falta
  - Atribuir CC em massa
  - Atribuir Performance em massa
- Opção de "Selecionar por setor"

### Layout da Bulk Actions Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ✓ 15 selecionados    [Marcar OK] [Marcar Falta] [Atribuir CC ▼] [Performance ▼] [❌]│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Implementação

```tsx
// Estado para bulk actions
const [bulkCCOpen, setBulkCCOpen] = useState(false);
const [bulkPerformanceOpen, setBulkPerformanceOpen] = useState(false);

// Funções de bulk action
const handleBulkSetStatus = (status: RegistroPresenca['status']) => {
  if (status === 'FALTA') {
    // Abrir modal para justificativa em massa
    setModalJustificativaBulkOpen(true);
    setTipoJustificativa('STATUS');
    return;
  }
  
  setRegistros(prev => {
    const novos = { ...prev };
    selecionados.forEach(id => {
      novos[id] = {
        ...novos[id],
        status,
        performance: status === 'FALTA' ? undefined : novos[id].performance,
      };
    });
    return novos;
  });
  
  toast.success(`${selecionados.size} colaboradores marcados como ${status}`);
};

const handleBulkSetCC = (ccIds: string[]) => {
  setRegistros(prev => {
    const novos = { ...prev };
    selecionados.forEach(id => {
      // Só atribui CC se não estiver como FALTA
      if (novos[id].status !== 'FALTA') {
        novos[id] = {
          ...novos[id],
          centrosCusto: ccIds,
        };
      }
    });
    return novos;
  });
  
  setBulkCCOpen(false);
  toast.success(`CCs atribuídos a ${selecionados.size} colaboradores`);
};

const handleBulkSetPerformance = (performance: RegistroPresenca['performance']) => {
  setRegistros(prev => {
    const novos = { ...prev };
    selecionados.forEach(id => {
      // Só atribui performance se não estiver como FALTA
      if (novos[id].status !== 'FALTA') {
        novos[id] = {
          ...novos[id],
          performance,
        };
      }
    });
    return novos;
  });
  
  setBulkPerformanceOpen(false);
  toast.success(`Performance atribuída a ${selecionados.size} colaboradores`);
};

const handleSelectBySetor = (setor: string) => {
  const idsDoSetor = colaboradores
    .filter(c => c.setor === setor)
    .map(c => c.id);
  setSelecionados(new Set(idsDoSetor));
  toast.info(`${idsDoSetor.length} colaboradores de ${setor} selecionados`);
};

// Componente Bulk Actions Bar
{selecionados.size > 0 && (
  <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">
        <CheckCircle className="inline-block mr-2 h-4 w-4 text-primary" />
        {selecionados.size} selecionado{selecionados.size > 1 ? 's' : ''}
      </span>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkSetStatus('OK')}
          className="bg-success/10 border-success/30 text-success hover:bg-success/20"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Marcar OK
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkSetStatus('FALTA')}
          className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Marcar Falta
        </Button>
        
        <Popover open={bulkCCOpen} onOpenChange={setBulkCCOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Building className="mr-2 h-4 w-4" />
              Atribuir CC
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label>Selecione os CCs</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {centrosCusto.map(cc => (
                  <label key={cc.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={bulkCCSelection.includes(cc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkCCSelection([...bulkCCSelection, cc.id]);
                        } else {
                          setBulkCCSelection(bulkCCSelection.filter(id => id !== cc.id));
                        }
                      }}
                    />
                    <span className="text-sm">{cc.nome}</span>
                  </label>
                ))}
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={() => handleBulkSetCC(bulkCCSelection)}
                disabled={bulkCCSelection.length === 0}
              >
                Aplicar a {selecionados.size} colaboradores
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover open={bulkPerformanceOpen} onOpenChange={setBulkPerformanceOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Star className="mr-2 h-4 w-4" />
              Performance
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-1">
              {['OTIMA', 'BOA', 'REGULAR', 'RUIM'].map(perf => (
                <Button
                  key={perf}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleBulkSetPerformance(perf as RegistroPresenca['performance'])}
                >
                  {perf === 'OTIMA' ? 'Ótima' : perf === 'BOA' ? 'Boa' : perf === 'REGULAR' ? 'Regular' : 'Ruim'}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      {/* Selecionar por Setor */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            Selecionar por Setor
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-1">
            {setoresUnicos.map(setor => (
              <Button
                key={setor}
                variant="ghost"
                className="w-full justify-start capitalize"
                onClick={() => handleSelectBySetor(setor)}
              >
                {setor}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Limpar seleção */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSelecionados(new Set())}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}
```

---

# 📄 PARTE 2: Página de Detalhes do Dia

## 🎯 Funcionalidades Propostas

### MVP (Versão Inicial)

1. **Visualização Detalhada do Dia**
   - Cabeçalho com data, status de confirmação e KPIs
   - Lista completa de registros com todos os campos
   - Filtros por status, performance, setor

2. **Análise de Custos**
   - Custo total por Centro de Custo
   - Gráfico de distribuição de custos
   - Breakdown de colaboradores por CC

3. **Histórico de Alterações (Auditoria)**
   - Timeline de `confirmed_changes`
   - Quem confirmou e quando
   - Alterações feitas após confirmação

4. **Ações Administrativas**
   - Reverter confirmação (se permitido)
   - Editar registro individual (modal)
   - Exportar para Excel/PDF

### Futuras Melhorias

- Comparativo com dias anteriores
- Integração com sistema de notificações
- Reconhecimento de padrões (colaboradores com muitos atrasos)

---

## 🗂️ Arquivos a Criar

### 1. Rota: `src/routes/_auth/colaboradores/presenca-tabela.$data.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { PresencaDetalhesPage } from '@/components/colaboradores/presenca-detalhes-page'

export const Route = createFileRoute('/_auth/colaboradores/presenca-tabela/$data')({
  component: PresencaDetalhesPage,
  parseParams: ({ data }) => ({ data }),
  stringifyParams: ({ data }) => ({ data }),
})
```

---

### 2. Componente: `src/components/colaboradores/presenca-detalhes-page.tsx`

#### Estrutura do Componente

```tsx
export function PresencaDetalhesPage() {
  const { data } = useParams({ from: '/_auth/colaboradores/presenca-tabela/$data' })
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [registros, setRegistros] = useState<RegistroPresencaDetalhes[]>([])
  const [filtros, setFiltros] = useState({ status: 'todos', setor: 'todos' })
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [registroSelecionado, setRegistroSelecionado] = useState<string | null>(null)
  
  // ... resto do componente
}
```

#### Interface de Dados

```typescript
interface RegistroPresencaDetalhes {
  id: string;
  colaborador_id: string;
  data: string;
  status: 'OK' | 'ATRASADO' | 'FALTA';
  minutos_atraso?: number;
  justificativa?: string;
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
  performance_justificativa?: string;
  centros_custo: string[];
  anexo_url?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  confirmed_changes?: ConfirmedChange[];
  // Dados do colaborador (JOIN)
  colaborador: {
    nome_completo: string;
    funcao: string;
    setor: string;
    tipo_contratacao: string;
    custo_dia: number;
    salario_base: number;
    avatar_url?: string;
  };
  // Alocações (JOIN)
  alocacoes: {
    cc_id: string;
    cc_nome: string;
    percentual: number;
    valor_calculado: number;
  }[];
}

interface ConfirmedChange {
  timestamp: string;
  action: string;
  previous_state: string;
  user_id?: string;
  user_name?: string;
}

interface CustoPorCC {
  cc_id: string;
  cc_nome: string;
  custo_total: number;
  colaboradores_count: number;
  percentual_do_total: number;
}
```

---

## 🎨 Layout da Página

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header                                                               │
│ ← Voltar    Presenças do dia 09/01/2026    [Confirmado] [Exportar ▼]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ Total   │ │Presentes│ │Ausentes │ │Atrasados│ │ Custo Total     │ │
│ │   25    │ │   22    │ │    2    │ │    1    │ │ R$ 8.450,00     │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
│                                                                      │
│ Tabs: [Registros] [Custos por CC] [Auditoria]                       │
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────────┐
│ │ Tab: Registros                                                     │
│ │ ┌─────────────────────────────────────────────────────────────┐   │
│ │ │ Filtros: [Status ▼] [Setor ▼] [Buscar...]            [Limpar]│   │
│ │ └─────────────────────────────────────────────────────────────┘   │
│ │                                                                    │
│ │ ┌────────────────────────────────────────────────────────────────┐│
│ │ │ Avatar | Nome         | Setor  | Status | Perf | CCs | Custo  ││
│ │ ├────────────────────────────────────────────────────────────────┤│
│ │ │   👤   | João Silva   | Obras  |  OK    | Boa  | 2   | R$ 380 ││
│ │ │   👤   | Maria Santos | Admin  | Atraso | Reg  | -   | R$ 220 ││
│ │ └────────────────────────────────────────────────────────────────┘│
│ └───────────────────────────────────────────────────────────────────┘
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────────┐
│ │ Tab: Custos por CC                                                 │
│ │                                                                    │
│ │ ┌────────────────────────────────────────────────────────────────┐│
│ │ │ [Gráfico Pizza]        │ Tabela de Custos                      ││
│ │ │                        │ ────────────────────────────────────  ││
│ │ │    CC-A ████ 45%       │ CC-A     | R$ 3.800 | 12 colab | 45% ││
│ │ │    CC-B ███  30%       │ CC-B     | R$ 2.535 |  8 colab | 30% ││
│ │ │    CC-C ██   25%       │ CC-C     | R$ 2.115 |  5 colab | 25% ││
│ │ └────────────────────────────────────────────────────────────────┘│
│ └───────────────────────────────────────────────────────────────────┘
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────────┐
│ │ Tab: Auditoria                                                     │
│ │                                                                    │
│ │ Timeline:                                                          │
│ │ ●─────── 15:32 - João confirmou as presenças do dia               │
│ │ ●─────── 15:45 - Maria reverteu a confirmação                     │
│ │ ●─────── 16:10 - João confirmou novamente                         │
│ └───────────────────────────────────────────────────────────────────┘
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### Query Principal

```sql
SELECT 
  rp.*,
  c.nome_completo,
  c.funcao,
  c.setor,
  c.tipo_contratacao,
  c.custo_dia,
  c.salario_base,
  c.avatar_url
FROM registros_presenca rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data = :data
ORDER BY c.nome_completo;
```

### Query de Alocações

```sql
SELECT 
  ahc.registro_presenca_id,
  ahc.cc_id,
  cc.nome as cc_nome,
  ahc.percentual,
  ahc.valor_calculado
FROM alocacao_horas_cc ahc
JOIN centros_custo cc ON cc.id = ahc.cc_id
WHERE ahc.registro_presenca_id IN (:registro_ids);
```

### Query de Custos Agregados por CC

```sql
SELECT 
  cc.id as cc_id,
  cc.nome as cc_nome,
  COALESCE(SUM(ahc.valor_calculado), 0) as custo_total,
  COUNT(DISTINCT rp.colaborador_id) as colaboradores_count
FROM centros_custo cc
LEFT JOIN alocacao_horas_cc ahc ON ahc.cc_id = cc.id
LEFT JOIN registros_presenca rp ON rp.id = ahc.registro_presenca_id
WHERE rp.data = :data
GROUP BY cc.id, cc.nome
ORDER BY custo_total DESC;
```

---

## ⚙️ Componentes Reutilizáveis

### Existentes (usar)

| Componente | Uso |
|------------|-----|
| `Card`, `CardContent`, `CardHeader` | Layout de seções |
| `Badge` | Status, Performance |
| `Table`, `TableHeader`, `TableRow` | Lista de registros |
| `Tabs`, `TabsContent` | Navegação entre seções |
| `Select`, `SelectTrigger` | Filtros |
| `Button` | Ações |
| `Popover` | Detalhes expandidos |
| `Dialog` | Modal de edição |

### Novos (criar)

| Componente | Descrição |
|------------|-----------|
| `PresencaAuditTimeline` | Timeline de auditoria |
| `CustosPorCCChart` | Gráfico de pizza (Recharts) |
| `RegistroDetalheCard` | Card expandido de um registro |

---

## 🧪 Testes Sugeridos

| Cenário | Validação |
|---------|-----------|
| Carregar página com data válida | Exibe dados corretamente |
| Carregar página com data inválida | Mostra mensagem de erro |
| Filtrar por status | Atualiza lista corretamente |
| Filtrar por setor | Atualiza lista corretamente |
| Exportar Excel | Gera arquivo com dados |
| Exportar PDF | Gera PDF formatado |
| Reverter confirmação | Atualiza estado e recarrega |

---

## 📐 Props e Estado

```typescript
// Estado principal
const [registros, setRegistros] = useState<RegistroPresencaDetalhes[]>([]);
const [custosPorCC, setCustosPorCC] = useState<CustoPorCC[]>([]);
const [loading, setLoading] = useState(true);
const [diaInfo, setDiaInfo] = useState<{
  data: string;
  isConfirmado: boolean;
  confirmadoPor?: string;
  confirmadoEm?: string;
} | null>(null);

// Filtros
const [filtros, setFiltros] = useState({
  status: 'todos' as 'todos' | 'OK' | 'ATRASADO' | 'FALTA',
  setor: 'todos',
  busca: '',
});

// É melhor separar a lógica de filtro em um hook
const registrosFiltrados = useMemo(() => {
  return registros.filter(r => {
    if (filtros.status !== 'todos' && r.status !== filtros.status) return false;
    if (filtros.setor !== 'todos' && r.colaborador.setor !== filtros.setor) return false;
    if (filtros.busca && !r.colaborador.nome_completo.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    return true;
  });
}, [registros, filtros]);
```

---

## 🔗 Navegação

### Da tabela para detalhes

```tsx
// Em controle-presenca-tabela-page.tsx
import { Link } from '@tanstack/react-router';

// No header com a data
<Link 
  to="/colaboradores/presenca-tabela/$data" 
  params={{ data: format(dataSelecionada, 'yyyy-MM-dd') }}
>
  Ver detalhes do dia
</Link>
```

### Dos detalhes de volta para tabela

```tsx
// Em presenca-detalhes-page.tsx
<Link to="/colaboradores/presenca-tabela">
  <Button variant="ghost">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Voltar
  </Button>
</Link>
```

---

## 📝 Checklist de Implementação

- [ ] Criar rota `presenca-tabela.$data.tsx`
- [ ] Criar componente `presenca-detalhes-page.tsx`
- [ ] Implementar query de registros com JOIN
- [ ] Implementar query de alocações
- [ ] Implementar query de custos por CC
- [ ] Criar tab "Registros" com filtros
- [ ] Criar tab "Custos por CC" com gráfico
- [ ] Criar tab "Auditoria" com timeline
- [ ] Adicionar modal de edição de registro
- [ ] Implementar exportação Excel
- [ ] Implementar exportação PDF
- [ ] Adicionar link de navegação na página de tabela
- [ ] Testes manuais
- [ ] Documentar na documentação técnica

---

## 🎯 Critérios de Aceite

1. ✅ Usuário pode navegar para a página de detalhes a partir da tabela
2. ✅ Página exibe todos os registros do dia com detalhes
3. ✅ Filtros funcionam corretamente
4. ✅ Tab de custos mostra breakdown por CC
5. ✅ Tab de auditoria mostra histórico de alterações
6. ✅ Exportação funciona para Excel e PDF
7. ✅ Design segue o Design System do projeto
