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
  nome text,                    -- Ex: CC13001-SOLAR_I (novo formato)
  valor_global numeric,         -- Orçamento total do CC
  cliente_id uuid FK(clientes), -- Cliente proprietário
  tipo_os_id uuid FK(tipos_os), -- Tipo que originou o CC
  os_id uuid UNIQUE FK(ordens_servico), -- OS vinculada (1:1)
  descricao text,               -- Descrição opcional
  ativo boolean,                -- Status do CC
  data_inicio date,             -- Início do contrato
  data_fim date,                -- Fim do contrato
  created_at timestamptz,
  updated_at timestamptz
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

---

## 🏷️ Convenção de Nomenclatura

### Formato Atual (✅ Implementado)

**Padrão:** `CC{NUMERO_TIPO_OS}{SEQUENCIAL_3_DIGITOS}-{APELIDO_OU_PRIMEIRO_NOME}`

| Tipo OS | Seq | Cliente | Apelido | Resultado |
|---------|-----|---------|---------|-----------|
| OS-13 | 1 | João Silva | - | `CC13001-JOAO` |
| OS-13 | 2 | Construtora ABC | Solar I | `CC13002-SOLAR_I` |
| OS-11 | 15 | Maria Santos | Edifício Estrela | `CC11015-EDIFICIO_ESTRELA` |
| OS-09 | 123 | Empresa XYZ S.A. | - | `CC09123-EMPRESA` |

### Regras de Normalização

1. **Prioridade do texto:**
   - Se `apelido` existe e não está vazio → usar `apelido`
   - Senão → usar primeira palavra de `nome_razao_social`

2. **Normalização:**
   - Converter para UPPERCASE
   - Remover acentos (NFD normalize)
   - Substituir espaços/caracteres especiais por underscore
   - Limitar a 20 caracteres

3. **Sequencial:**
   - Sempre 3 dígitos (001, 002, ..., 999)
   - Reinicia por tipo de OS

### Função de Normalização

```typescript
// src/lib/hooks/use-centro-custo.ts
export function normalizarNomeCentroCusto(texto: string): string {
  return texto
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^A-Z0-9]/g, '_')       // Caracteres inválidos → _
    .replace(/_+/g, '_')              // Remove duplicados
    .replace(/^_|_$/g, '')            // Remove nas pontas
    .substring(0, 20);                 // Limita tamanho
}
```

---

## 🧩 Componente Reutilizável

### `CentroCustoSelector`

**Localização:** `src/components/shared/centro-custo-selector.tsx`

**Uso:**
```tsx
import { CentroCustoSelector } from '@/components/shared/centro-custo-selector';

<CentroCustoSelector
  value={selectedCCId}
  onChange={(ccId, ccData) => setSelectedCC(ccId)}
  showDetails           // Mostrar card de detalhes
  required              // Campo obrigatório
  label="Centro de Custo"
  clienteId={clienteId} // Filtrar por cliente (opcional)
/>
```

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `string` | ID do CC selecionado |
| `onChange` | `(ccId, ccData) => void` | Callback de mudança |
| `disabled` | `boolean` | Desabilitar seleção |
| `placeholder` | `string` | Placeholder customizado |
| `clienteId` | `string` | Filtrar por cliente |
| `showDetails` | `boolean` | Mostrar card de detalhes |
| `required` | `boolean` | Campo obrigatório |
| `error` | `string` | Mensagem de erro |
| `label` | `string` | Label do campo |

**Usado em:**
- OS-09: Requisição de Compras
- OS-10: Requisição de Mão de Obra

---

## 🔄 Fluxo de Criação de CC

### OSs que Geram CC Automaticamente
- **OS-11**: Start Contrato Assessoria Mensal
- **OS-12**: Start Contrato Assessoria Avulsa
- **OS-13**: Start de Contrato de Obra

### OSs que Selecionam CC Existente
- **OS-09**: Requisição de Compras
- **OS-10**: Requisição de Mão de Obra

### Fluxo Automático (OS-11, 12, 13)
1. Usuário preenche dados do cliente
2. Sistema cria OS com cliente vinculado
3. Hook `createCentroCustoWithId()` é chamado:
   - Busca `apelido` ou primeiro nome do cliente
   - Normaliza texto
   - Gera nome: `CC{TIPO}{SEQ:3}-{TEXTO}`
   - Insere CC vinculado à OS

### Fluxo Manual (OS-09, 10)
1. Usuário abre workflow
2. Sistema exibe `CentroCustoSelector` com CCs ativos
3. Usuário seleciona CC
4. Sistema vincula OS ao CC selecionado

---

## 📈 Benefícios da Implementação

### 1. Integridade de Dados
- ✅ Toda OS de contrato tem exatamente 1 CC
- ✅ Nome do CC é rastreável (contém apelido/nome do cliente)
- ✅ Histórico completo de custos por projeto

### 2. Experiência do Usuário
- ✅ Nomenclatura humanizada (não apenas códigos)
- ✅ Componente padronizado em todo o sistema
- ✅ Detalhes do CC visíveis na seleção

### 3. Relatórios e Analytics
- ✅ Fácil identificação visual do CC
- ✅ Agrupamento por tipo de OS
- ✅ Filtro por cliente

---

## ✅ Checklist de Implementação

- [x] Definir convenção de nomenclatura
- [x] Implementar função `normalizarNomeCentroCusto()`
- [x] Atualizar hook `createCentroCustoWithId()`
- [x] Criar componente `CentroCustoSelector`
- [x] Migrar OS-09 para usar componente
- [x] Migrar OS-10 para usar componente
- [x] Atualizar documentação
- [ ] Testes automatizados (opcional)

---

**Status**: 🟢 Implementado
**Última Atualização**: 2026-01-08