# 🚀 ACESSO RÁPIDO - GESTORES (Nível 3)

## ⚡ IMPLEMENTAÇÃO COMPLETA

### 📊 GESTOR DE ASSESSORIA

#### Dashboard
```typescript
// Componente
/components/dashboard/dashboard-gestor-assessoria.tsx

// Uso
import { DashboardGestorAssessoria } from '../components/dashboard/dashboard-gestor-assessoria';
<DashboardGestorAssessoria />
```

#### Fila de Aprovação de Laudos (OS 06/08)
```typescript
// Componente
/components/assessoria/fila-aprovacao-laudos.tsx

// Página
/app/gestor-assessoria/laudos/page.tsx

// Dados mockados em:
/lib/mock-data-gestores.ts → mockLaudosPendentes (5 registros)
```

#### Análise de Reformas (OS 07)
```typescript
// Componente
/components/assessoria/analise-reformas.tsx

// Página
/app/gestor-assessoria/reformas/page.tsx

// Dados mockados em:
/lib/mock-data-gestores.ts → mockReformasPendentes (5 registros)
```

---

### 🏗️ GESTOR DE OBRAS

#### Dashboard
```typescript
// Componente
/components/dashboard/dashboard-gestor-obras.tsx

// Uso
import { DashboardGestorObras } from '../components/dashboard/dashboard-gestor-obras';
<DashboardGestorObras />
```

#### Lista de Obras Ativas
```typescript
// Componente
/components/obras/lista-obras-ativas.tsx

// Página
/app/gestor-obras/cronogramas/page.tsx

// Dados mockados em:
/lib/mock-data-gestores.ts → mockObrasAtivas (6 registros)
```

#### Modal de Atualizar Cronograma
```typescript
// Componente
/components/obras/modal-atualizar-cronograma.tsx

// Uso
import { ModalAtualizarCronograma } from './modal-atualizar-cronograma';

<ModalAtualizarCronograma
  obra={obraSelecionada}
  aberto={modalAberto}
  onFechar={() => setModalAberto(false)}
  onAtualizar={(obraAtualizada) => handleAtualizar(obraAtualizada)}
/>
```

#### Aprovação de Medições
```typescript
// Componente
/components/obras/aprovacao-medicoes.tsx

// Página
/app/gestor-obras/medicoes/page.tsx

// Dados mockados em:
/lib/mock-data-gestores.ts → mockMedicoesPendentes (5 registros)
```

---

## 📦 DADOS MOCKADOS CENTRALIZADOS

### Arquivo Principal
```typescript
/lib/mock-data-gestores.ts
```

### Exports Disponíveis
```typescript
// ASSESSORIA
export const mockLaudosPendentes: LaudoPendente[];      // 5 laudos
export const mockReformasPendentes: ReformaPendente[];  // 5 reformas
export const mockKPIsAssessoria;                        // KPIs do dashboard

// OBRAS
export const mockObrasAtivas: ObraAtiva[];              // 6 obras
export const mockMedicoesPendentes: MedicaoPendente[];  // 5 medições
export const mockKPIsObras;                             // KPIs do dashboard
export const mockEvolucaoFisicaGeral;                   // Dados do gráfico
```

---

## 🎯 INTERFACES PRINCIPAIS

### Assessoria
```typescript
interface LaudoPendente {
  id: string;
  codigo: string;
  cliente: string;
  tipoLaudo: 'VISTORIA_TECNICA' | 'LAUDO_ESTRUTURAL' | 'PERICIA_ENGENHARIA' | 'AVALIACAO_IMOVEL';
  tipoOS: 'OS_06' | 'OS_08';
  autor: string;
  dataSubmissao: string;
  status: 'PENDENTE_REVISAO' | 'EM_REVISAO' | 'APROVADO' | 'REJEITADO';
}

interface ReformaPendente {
  id: string;
  codigo: string;
  condominio: string;
  unidade: string;
  tipoReforma: 'ESTRUTURAL' | 'NAO_ESTRUTURAL' | 'INSTALACOES' | 'ACABAMENTO';
  statusDocumentacao: 'PENDENTE_ART' | 'ART_ENVIADA' | 'RRT_ENVIADA' | 'COMPLETO';
  statusAprovacao: 'AGUARDANDO_ANALISE' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' | 'PENDENTE_DOCUMENTACAO';
  valorEstimado?: number;
}
```

### Obras
```typescript
interface ObraAtiva {
  id: string;
  codigo: string;
  tipoOS: 'OS_01' | 'OS_02' | 'OS_03' | 'OS_04' | 'OS_13';
  cliente: string;
  tituloObra: string;
  percentualConcluido: number;
  statusCronograma: 'NO_PRAZO' | 'ATENCAO' | 'ATRASADO';
  valorContrato?: number;
}

interface MedicaoPendente {
  id: string;
  codigo: string;
  obraId: string;
  numeroMedicao: number;
  tipoMedicao: 'FISICA' | 'FINANCEIRA' | 'AMBAS';
  percentualMedido: number;
  valorMedicao: number;
  statusAprovacao: 'AGUARDANDO_VALIDACAO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';
}
```

---

## 🎨 CORES DO MINERVA DESIGN SYSTEM

```css
/* Primary (Dourado) - Botões principais */
background: #D3AF37;
hover:background: #D3AF37/90;

/* Secondary (Dourado claro) - Badges */
background: #DDC063;

/* Aplicação nos componentes */
className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

```typescript
import { toast } from 'sonner@2.0.3';

// Sucesso
toast.success('Ação concluída!', {
  description: 'Detalhes da ação...'
});

// Erro
toast.error('Erro ao processar', {
  description: 'Mensagem de erro...'
});
```

---

## 📝 EXEMPLO DE USO COMPLETO

### Gestor de Assessoria - Aprovar Laudo

```typescript
const handleAprovar = () => {
  setLaudos(prev =>
    prev.map(l =>
      l.id === laudoSelecionado.id
        ? { ...l, status: 'APROVADO' }
        : l
    )
  );

  toast.success('Laudo aprovado com sucesso!', {
    description: `O PDF final será gerado para ${laudoSelecionado.cliente}.`
  });
};
```

### Gestor de Obras - Atualizar Cronograma

```typescript
const handleSalvar = () => {
  const obraAtualizada: ObraAtiva = {
    ...obra,
    percentualConcluido: parseFloat(novoPercentual),
    statusCronograma: novoStatus,
    ultimoDiarioObra: new Date().toISOString().split('T')[0],
  };

  onAtualizar(obraAtualizada);
  toast.success('Cronograma atualizado!');
};
```

---

## 🧪 TESTES RÁPIDOS

### Para testar Gestor de Assessoria:
1. Abrir componente: `FilaAprovacaoLaudos`
2. Clicar em "Revisar e Aprovar" em qualquer laudo
3. Modal abre com detalhes
4. Clicar em "Aprovar e Gerar PDF"
5. Toast de sucesso aparece
6. Status do laudo muda para "APROVADO"

### Para testar Gestor de Obras:
1. Abrir componente: `ListaObrasAtivas`
2. Clicar em "Atualizar Cronograma" em qualquer obra
3. Modal abre com formulário
4. Alterar percentual (ex: de 68% para 75%)
5. Clicar em "Salvar Atualização"
6. Toast de sucesso aparece
7. Percentual atualizado na tabela

---

## 📊 KPIs DISPONÍVEIS

### Assessoria
```typescript
{
  vistoriasAgendadasSemana: 8,
  laudosEmRedacao: 12,
  os07PendentesAnalise: 4,
  totalLaudosRevisao: 4,
  totalReformasAprovadas: 15,
  totalReformasRejeitadas: 3
}
```

### Obras
```typescript
{
  obrasEmAndamento: 6,
  medicoesPendentes: 3,
  atrasosNoCronograma: 1,
  percentualMedioExecucao: 61.2,
  valorTotalContratos: 17080000,    // R$ 17.08M
  valorTotalMedido: 9850000         // R$ 9.85M
}
```

---

## 🔗 LINKS ÚTEIS

- **Documentação Completa**: `/FLUXO_GESTORES_COMPLETO.md`
- **Dados Mockados**: `/lib/mock-data-gestores.ts`
- **Design System**: `/DESIGN_SYSTEM.md`
- **Types**: `/lib/types.ts`

---

**Última Atualização**: 17/11/2025  
**Status**: ✅ PRONTO PARA USO
