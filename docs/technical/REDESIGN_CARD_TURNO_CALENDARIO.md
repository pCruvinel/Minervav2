# 🎨 REDESIGN: CARD DE TURNO NO CALENDÁRIO

**Data:** 25 de novembro de 2025
**Status:** Especificações Definidas
**Responsável:** Kilo Code (Architect Mode)

---

## 🎯 OBJETIVO

Redesenhar completamente o card de turno no calendário seguindo especificações detalhadas para melhorar a experiência visual e funcional, integrando dados do backend Supabase.

---

## 📋 ESPECIFICAÇÕES DETALHADAS

### 1. **Remoção de Elementos Visuais**
- ❌ **Remover completamente** exibição de hora de início e hora fim
- ❌ **Remover todas as linhas divisórias** ou bordas visuais no card
- ✅ **Design limpo** focado em informações essenciais

### 2. **Filtragem de Agendamentos**
- ✅ **Mostrar apenas agendamentos efetivamente realizados**
- ✅ **Filtrar por `status_geral != 'cancelado'`** nas ordens_servico
- ✅ **Incluir nome do usuário** que fez o agendamento
- ✅ **Baseado em dados de `dados_novos` ou `audit_log`**

### 3. **Exibição de Vagas**
- ✅ **Formato "0/1"** (0 = ocupado, 1 = disponível)
- ✅ **Lógica baseada em etapas ativas** em `os_etapas`
- ✅ **Cálculo dinâmico** de disponibilidade

### 4. **Design e Responsividade**
- ✅ **Borda da mesma cor mais vibrante**
- ✅ **Estilos CSS/Tailwind** para otimização
- ✅ **Responsivo** em todos os dispositivos
- ✅ **Sem conflitos** com triggers de cancelamento automático

---

## 🏗️ ESTRUTURA DE DADOS NECESSÁRIA

### Interface Atualizada do Componente

```typescript
interface AgendamentoRealizado {
  id: string;
  categoria: string;
  setor: string;
  usuarioNome: string;        // Nome do usuário que agendou
  osId?: string;             // ID da OS vinculada
  osCodigo?: string;         // Código da OS
  clienteNome?: string;      // Nome do cliente
  statusGeral: string;       // Status da OS (não cancelado)
}

interface Turno {
  id: string;
  vagasOcupadas: number;
  vagasTotal: number;
  cor: string;
  agendamentosRealizados?: AgendamentoRealizado[];
  etapasAtivas: number;      // Contagem de etapas ativas para cálculo de vagas
}
```

### Query Supabase Necessária

```sql
-- Agendamentos realizados com dados completos
SELECT
  a.id,
  a.categoria,
  a.setor,
  c.nome_completo as usuario_nome,
  a.os_id,
  os.codigo_os,
  os.status_geral,
  cl.nome_razao_social as cliente_nome,
  -- Contagem de etapas ativas para cálculo de vagas
  (
    SELECT COUNT(*)
    FROM os_etapas oe
    WHERE oe.os_id = a.os_id
    AND oe.status IN ('pendente', 'em_andamento', 'bloqueada')
  ) as etapas_ativas
FROM agendamentos a
JOIN colaboradores c ON a.criado_por = c.id
LEFT JOIN ordens_servico os ON a.os_id = os.id
LEFT JOIN clientes cl ON os.cliente_id = cl.id
WHERE a.data = $1
  AND a.status = 'confirmado'
  AND (os.status_geral IS NULL OR os.status_geral != 'cancelado')
ORDER BY a.horario_inicio;
```

---

## 🎨 DESIGN VISUAL PROPOSTO

### Layout do Card

```
┌─────────────────────────────────────┐
│                                     │
│  [Categoria]                        │
│  [Nome do Usuário]                  │
│                                     │
│  [0/1] ← Vagas disponíveis         │
│                                     │
└─────────────────────────────────────┘
```

### Estilos CSS/Tailwind

```css
/* Card base */
.turno-card {
  @apply w-full h-full rounded-lg shadow-sm border-2 flex flex-col;
  /* Borda vibrante da mesma cor */
  border-color: ${turno.cor}DD; /* 87% opacity para vibrância */
  background-color: ${turno.cor}CC; /* 80% opacity */
}

/* Hover states */
.turno-card:hover {
  @apply shadow-md scale-[1.02];
  border-color: ${turno.cor}; /* 100% vibrância no hover */
  transition: all 0.2s ease;
}

/* Responsividade */
@media (max-width: 768px) {
  .turno-card {
    @apply min-h-[60px];
  }
}

/* Estados especiais */
.turno-card.ocupado {
  @apply opacity-75;
}

.turno-card.disponivel {
  @apply cursor-pointer;
}
```

### Cores e Estados

```typescript
// Cálculo de disponibilidade baseado em etapas ativas
const calcularDisponibilidade = (etapasAtivas: number, vagasTotal: number) => {
  // Lógica: se há etapas ativas, turno está ocupado
  const ocupado = etapasAtivas > 0;
  const vagasDisponiveis = ocupado ? 0 : 1;

  return {
    ocupado,
    vagasDisponiveis,
    textoVagas: `${vagasDisponiveis}/${vagasTotal}`
  };
};

// Aplicação visual
const getCardClasses = (ocupado: boolean, cor: string) => {
  const baseClasses = 'w-full h-full rounded-lg shadow-sm border-2 flex flex-col';
  const colorStyle = {
    backgroundColor: `${cor}CC`,
    borderColor: ocupado ? `${cor}88` : `${cor}DD`
  };

  return ocupado
    ? `${baseClasses} opacity-75`
    : `${baseClasses} cursor-pointer hover:shadow-md hover:scale-[1.02]`;
};
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. **Hook Atualizado para Dados**

```typescript
// Hook personalizado para agendamentos realizados
export function useAgendamentosRealizados(data: string) {
  const { data: agendamentos, loading, error } = useApi(
    async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          categoria,
          setor,
          criado_por,
          os_id,
          ordens_servico!inner (
            codigo_os,
            status_geral,
            cliente:cliente_id (
              nome_razao_social
            )
          ),
          colaboradores!criado_por (
            nome_completo
          )
        `)
        .eq('data', data)
        .eq('status', 'confirmado')
        .neq('ordens_servico.status_geral', 'cancelado');

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        categoria: item.categoria,
        setor: item.setor,
        usuarioNome: item.colaboradores?.nome_completo || 'Usuário',
        osId: item.os_id,
        osCodigo: item.ordens_servico?.codigo_os,
        clienteNome: item.ordens_servico?.cliente?.nome_razao_social,
        statusGeral: item.ordens_servico?.status_geral
      }));
    },
    {
      deps: [data],
      onError: (error) => {
        console.error('Erro ao carregar agendamentos realizados:', error);
      }
    }
  );

  return { agendamentos, loading, error };
}
```

### 2. **Componente Atualizado**

```typescript
interface BlocoTurnoProps {
  turno: TurnoComAgendamentos;
  onClick: () => void;
}

function BlocoTurnoComponent({ turno, onClick }: BlocoTurnoProps) {
  // Filtrar apenas agendamentos realizados (OS não cancelada)
  const agendamentosRealizados = turno.agendamentosRealizados || [];

  // Calcular disponibilidade baseada em etapas ativas
  const { ocupado, vagasDisponiveis, textoVagas } = calcularDisponibilidade(
    turno.etapasAtivas || 0,
    turno.vagasTotal
  );

  const cardClasses = getCardClasses(ocupado, turno.cor);

  return (
    <div
      onClick={!ocupado ? onClick : undefined}
      className={cardClasses}
      style={{
        backgroundColor: `${turno.cor}CC`,
        borderColor: `${turno.cor}${ocupado ? '88' : 'DD'}`
      }}
    >
      {/* Lista de agendamentos realizados */}
      <div className="flex-1 p-3 space-y-2">
        {agendamentosRealizados.length > 0 ? (
          agendamentosRealizados.map((agendamento) => (
            <div
              key={agendamento.id}
              className="bg-white/20 rounded-md p-2 text-xs"
            >
              <div className="font-medium text-white truncate">
                {agendamento.categoria}
              </div>
              <div className="text-white/80 truncate">
                {agendamento.usuarioNome}
              </div>
              {agendamento.osCodigo && (
                <div className="text-white/60 text-[10px] truncate">
                  {agendamento.osCodigo}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-white/60 text-xs">Disponível</span>
          </div>
        )}
      </div>

      {/* Indicador de vagas */}
      <div className="px-3 pb-2">
        <div className="text-right">
          <span className="text-xs font-medium text-white bg-black/20 px-2 py-1 rounded">
            {textoVagas}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### 3. **Integração com Calendário**

```typescript
// No componente CalendarioSemana
const turnosComAgendamentos = turnosDoDia.map(turno => {
  const agendamentosRealizados = agendamentos.filter(a =>
    a.turnoId === turno.id &&
    a.statusGeral !== 'cancelado'
  );

  // Calcular etapas ativas para disponibilidade
  const etapasAtivas = agendamentosRealizados.reduce((total, agendamento) => {
    // Lógica para contar etapas ativas da OS
    return total + (agendamento.etapasAtivas || 0);
  }, 0);

  return {
    ...turno,
    agendamentosRealizados,
    etapasAtivas
  };
});
```

---

## 📱 RESPONSIVIDADE

### Breakpoints Definidos

```css
/* Mobile (< 640px) */
.turno-card-mobile {
  @apply min-h-[80px] p-2;
}

/* Tablet (640px - 1024px) */
.turno-card-tablet {
  @apply min-h-[100px] p-3;
}

/* Desktop (> 1024px) */
.turno-card-desktop {
  @apply min-h-[120px] p-4;
}
```

### Layout Adaptativo

```typescript
const getResponsiveClasses = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  const baseClasses = 'w-full h-full rounded-lg shadow-sm border-2 flex flex-col';

  switch (screenSize) {
    case 'mobile':
      return `${baseClasses} min-h-[80px] p-2`;
    case 'tablet':
      return `${baseClasses} min-h-[100px] p-3`;
    case 'desktop':
      return `${baseClasses} min-h-[120px] p-4`;
    default:
      return baseClasses;
  }
};
```

---

## 🧪 ESTRATÉGIA DE TESTES

### Testes Unitários

```typescript
describe('BlocoTurno - Redesign', () => {
  test('should filter out cancelled OS agendamentos', () => {
    const agendamentos = [
      { id: '1', statusGeral: 'em_andamento', usuarioNome: 'João' },
      { id: '2', statusGeral: 'cancelado', usuarioNome: 'Maria' }
    ];

    const result = filterAgendamentosRealizados(agendamentos);
    expect(result).toHaveLength(1);
    expect(result[0].usuarioNome).toBe('João');
  });

  test('should calculate vagas correctly', () => {
    const etapasAtivas = 2;
    const vagasTotal = 1;

    const result = calcularDisponibilidade(etapasAtivas, vagasTotal);
    expect(result.ocupado).toBe(true);
    expect(result.textoVagas).toBe('0/1');
  });

  test('should apply vibrant border color', () => {
    const cor = '#3B82F6';
    const ocupado = false;

    const borderColor = getBorderColor(cor, ocupado);
    expect(borderColor).toBe('#3B82F6DD'); // 87% opacity
  });
});
```

### Testes de Integração

```typescript
describe('Calendario Integration', () => {
  test('should load agendamentos with user names', async () => {
    const { agendamentos } = await useAgendamentosRealizados('2025-11-25');

    agendamentos.forEach(agendamento => {
      expect(agendamento.usuarioNome).toBeDefined();
      expect(agendamento.statusGeral).not.toBe('cancelado');
    });
  });

  test('should handle responsive layout', () => {
    const mobileClasses = getResponsiveClasses('mobile');
    expect(mobileClasses).toContain('min-h-[80px]');
    expect(mobileClasses).toContain('p-2');
  });
});
```

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### Fase 1: Preparação de Dados
- [ ] Atualizar hook `useAgendamentos` para incluir dados de usuário
- [ ] Criar query Supabase para agendamentos realizados
- [ ] Implementar lógica de filtragem por status OS

### Fase 2: Componente Base
- [ ] Criar nova versão do `BlocoTurno` sem horários
- [ ] Implementar cálculo de vagas baseado em etapas
- [ ] Remover bordas e linhas divisórias

### Fase 3: Design Visual
- [ ] Aplicar borda vibrante da mesma cor
- [ ] Implementar responsividade
- [ ] Adicionar estados hover e interação

### Fase 4: Integração
- [ ] Atualizar `CalendarioSemana` para usar novo componente
- [ ] Testar integração completa
- [ ] Validar performance

---

## 📊 MÉTRICAS DE SUCESSO

### Funcional
- ✅ **Filtragem correta:** 100% dos agendamentos cancelados filtrados
- ✅ **Dados completos:** 100% dos nomes de usuários exibidos
- ✅ **Cálculo preciso:** 100% de acurácia no cálculo de vagas

### Visual
- ✅ **Design limpo:** Zero bordas/linhas divisórias
- ✅ **Responsividade:** 100% funcional em todos os dispositivos
- ✅ **Cores vibrantes:** Bordas com opacidade otimizada

### Performance
- ✅ **Carregamento rápido:** < 500ms para dados
- ✅ **Renderização suave:** Sem lags visuais
- ✅ **Memória eficiente:** Componente memoizado

---

## 🎯 RESULTADO FINAL ESPERADO

### Card Ocupado
```
┌─────────────────────────────────────┐
│  📋 Vistoria Técnica                │
│  👤 João Silva                      │
│  📄 OS-2025-001                     │
│                                     │
│                           [0/1]     │
└─────────────────────────────────────┘
```

### Card Disponível
```
┌─────────────────────────────────────┐
│                                     │
│          📅 Disponível              │
│                                     │
│                           [1/1]     │
└─────────────────────────────────────┘
```

---

**Status:** ✅ **ESPECIFICAÇÕES COMPLETAS**
**Próximo:** Implementação no modo Code