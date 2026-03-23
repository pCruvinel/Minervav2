# Calendário — Documentação Técnica

## Visão Geral

O módulo Calendário gerencia turnos, agendamentos, bloqueios/feriados e aniversários em visualizações semanal e mensal.

## Arquitetura de Componentes

```
CalendarioPage (toggle semana/mês)
├── CalendarioSemanaCustom  → visão semanal (grid hora × dia)
└── CalendarioMes           → visão mensal (grid 7×6)
    ├── CalendarioHeaderMes   → navegação + legenda de cores
    ├── CalendarioGridMes     → grid responsivo com header sticky
    │   └── CelulaMes         → célula individual (feriados, aniversários, turnos, agendamentos)
    └── ModalDetalhesDia      → detalhes do dia selecionado
        └── ModalNovoAgendamento → criação de agendamento
```

## Feriados vs Ponto Facultativo

| Tipo | `motivo` | Badge | Reduz Dias Úteis? |
|---|---|---|---|
| Feriado Nacional | `feriado` | 🏛️ Vermelho | ✅ Sim |
| Ponto Facultativo | `ponto_facultativo` | ⚡ Âmbar (dashed) | ❌ Não |

### Classificação Automática (sync-feriados v4)

A Edge Function `sync-feriados` classifica automaticamente:
- **Feriado**: todos os feriados nacionais da BrasilAPI (exceto abaixo)
- **Ponto Facultativo**: Carnaval, Corpus Christi, Quarta de Cinzas, Véspera de Natal (24/12), Véspera de Ano Novo (31/12)

## Hooks de Dados

| Hook | Arquivo | Retorno |
|---|---|---|
| `useMesCalendario` | `use-mes-calendario.ts` | `MesData` com 42 `CelulaDia[]` |
| `useSemanaCalendario` | `use-semana-calendario.ts` | `SemanaData` com turnos + agendamentos |
| `useDiasUteisMes` | `use-dias-uteis.ts` | Dias úteis do mês (exclui feriados, **não** ponto facultativo) |

## Design Tokens (design-tokens.ts)

- `bloqueioColors` → cores para cada `BloqueioMotivo` (feriado, ponto_facultativo, etc.)
- `turnoColors` → verde/verm/azul para turnos
- `setorColors` → obras/assessoria/comercial/etc. para agendamentos por setor
- `getBloqueioColor(motivo)` → helper com fallback

## Banco de Dados

### Tabela: `calendario_bloqueios`

| Coluna | Tipo | Descrição |
|---|---|---|
| `motivo` | CHECK | `feriado`, `ponto_facultativo`, `manutencao`, `evento`, `ferias_coletivas`, `outro` |
| `data_inicio` | date | Início do bloqueio |
| `data_fim` | date | Fim do bloqueio |
| `dia_inteiro` | boolean | Se bloqueia o dia inteiro |

**Índice parcial**: `idx_bloqueio_feriado_data` garante unicidade de data para `feriado` + `ponto_facultativo`.

### RPC: `contar_dias_uteis_mes(p_ano, p_mes)`

Retorna contagem de dias úteis (seg-sex) excluindo apenas `motivo = 'feriado'`.
