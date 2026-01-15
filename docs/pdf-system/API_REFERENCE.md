# 📚 API Reference - Sistema de Geração de PDFs v2.0

> **Arquitetura:** Client-Side (Hook React)
> **Última Atualização:** 2026-01-14

---

## Hook: `usePDFGeneration`

### Localização

```typescript
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
```

### Assinatura

```typescript
function usePDFGeneration(): UsePDFGenerationReturn;

interface UsePDFGenerationReturn {
  generating: boolean;
  error: Error | null;
  generate: (
    tipo: PDFType,
    osId: string,
    dados: any
  ) => Promise<PDFGenerationResponse | null>;
  reset: () => void;
}
```

### Propriedades Retornadas

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `generating` | `boolean` | `true` enquanto o PDF está sendo gerado |
| `error` | `Error \| null` | Erro da última geração, se houver |
| `generate` | `function` | Função para gerar o PDF |
| `reset` | `function` | Limpa estado de erro e generating |

---

## Função: `generate()`

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `tipo` | `PDFType` | ✅ | Tipo de PDF a ser gerado |
| `osId` | `string` | ✅ | UUID da Ordem de Serviço |
| `dados` | `object` | ✅ | Dados específicos do template |

### Retorno

```typescript
interface PDFGenerationResponse {
  success: boolean;
  url?: string;       // Signed URL válida por 1 hora
  path?: string;      // Caminho persistente no Storage
  error?: string;     // Mensagem de erro (se success=false)
  metadata?: {
    filename: string;
    size: number;     // Tamanho em bytes
    tipo: PDFType;
  };
}
```

### Exemplo de Uso

```tsx
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function GerarPropostaButton({ osId, dadosProposta }) {
  const { generating, generate, error } = usePDFGeneration();

  const handleGerar = async () => {
    const result = await generate('proposta', osId, dadosProposta);

    if (result?.success) {
      toast.success('PDF gerado com sucesso!');
      window.open(result.url, '_blank');
    } else {
      toast.error(`Erro: ${result?.error || 'Falha na geração'}`);
    }
  };

  return (
    <Button onClick={handleGerar} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar Proposta'}
    </Button>
  );
}
```

---

## Tipos de PDF (`PDFType`)

```typescript
type PDFType =
  | 'proposta'           // Proposta comercial (OS 1-4)
  | 'contrato'           // Contrato de serviços
  | 'memorial'           // Memorial descritivo (OS 1-4)
  | 'documento-sst'      // Documento SST
  | 'parecer-reforma'    // Parecer técnico (OS-07)
  | 'visita-tecnica'     // Relatório visita (OS-08)
  | 'proposta-ass-anual' // Assessoria anual (OS-05)
  | 'proposta-ass-pontual'; // Assessoria pontual (OS-06)
```

---

## Dados por Tipo de PDF

### 1. Proposta Comercial (`proposta`)

**Template:** `proposta-template.tsx`
**OS:** 1-4

```typescript
interface PropostaData {
  // Obrigatórios
  codigoOS: string;
  cliente: {
    nome: string;
    cpfCnpj: string;
  };
  valorProposta: number;

  // Opcionais
  tipoOS?: string;
  dataEmissao?: string;
  cliente: {
    email?: string;
    telefone?: string;
    endereco?: string;
  };
  descricaoServico?: string;
  prazoEntrega?: string;
  observacoes?: string;
  itens?: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  empresa?: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
  };
}
```

---

### 2. Contrato (`contrato`)

**Template:** `contrato-template.tsx`
**OS:** Geral

```typescript
interface ContratoData {
  // Obrigatórios
  codigoOS: string;
  contratanteNome: string;
  contratanteCpfCnpj: string;
  valorContrato: number;
  dataInicio: string; // ISO 8601

  // Opcionais
  numeroContrato?: string;
  dataEmissao?: string;
  dataTermino?: string;
  contratanteEndereco?: string;
  contratanteCidade?: string;
  contratanteEstado?: string;
  contratado?: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  objetoContrato?: string;
  formaPagamento?: string;
  clausulas?: Array<{
    numero: number;
    titulo: string;
    texto: string;
  }>;
}
```

---

### 3. Memorial Descritivo (`memorial`)

**Template:** `memorial-template.tsx`
**OS:** 1-4

```typescript
interface MemorialData {
  // Obrigatórios
  codigoOS: string;
  titulo: string;
  clienteNome: string;
  secoes: Array<{
    titulo: string;
    conteudo: string;
  }>;

  // Opcionais
  dataEmissao?: string;
  local?: string;
}
```

---

### 4. Documento SST (`documento-sst`)

**Template:** `documento-sst-template.tsx`
**OS:** Geral

```typescript
interface DocumentoSSTData {
  // Obrigatórios
  codigoOS: string;
  tipoDocumento: string;
  clienteNome: string;
  local: string;
  itens: Array<{
    descricao: string;
    status?: 'conforme' | 'nao-conforme' | 'n/a';
    categoria?: string;
    observacao?: string;
  }>;

  // Opcionais
  dataEmissao?: string;
  responsavelTecnico?: string;
  conclusao?: string;
}
```

---

### 5. Parecer Reforma (`parecer-reforma`)

**Template:** `parecer-reforma-template.tsx`
**OS:** 07

```typescript
interface ParecerReformaData {
  // Obrigatórios
  codigoOS: string;
  cliente: {
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  parecer: {
    tipo: 'favoravel' | 'condicionado' | 'desfavoravel';
    descricao: string;
  };

  // Opcionais
  dataVisita?: string;
  descricaoReforma?: string;
  observacoes?: string;
  responsavelTecnico?: {
    nome?: string;
    cargo?: string;
    crea?: string;
  };
}
```

---

### 6. Visita Técnica (`visita-tecnica`)

**Template:** `visita-tecnica-template.tsx`
**OS:** 08

```typescript
interface VisitaTecnicaData {
  // Metadados
  codigoOS: string;
  dataVisita: string;
  dataGeracao: string;
  finalidadeInspecao: FinalidadeInspecao;
  tituloDocumento: string;

  // Cliente
  cliente: {
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    sindico?: string;
  };

  // Solicitante
  solicitante: {
    nome: string;
    contato: string;
    condominio?: string;
  };

  // Objetivo
  objetivo: {
    descricaoSolicitacao: string;
    areaVistoriada: string;
    tempoSituacao?: string;
  };

  // Qualidade
  qualidade: {
    engenheiroPontual: boolean;
    moradorPontual: boolean;
  };

  // Fotos
  fotos?: Array<{
    url: string;
    legenda: string;
    isNaoConforme: boolean;
  }>;

  // Responsável
  responsavelTecnico: {
    nome: string;
    cargo: string;
    crea?: string;
  };

  // Condicional: Parecer ou Checklist
  parecerTecnico?: {
    manifestacaoPatologica: string;
    recomendacoes: string;
    gravidade: 'baixa' | 'media' | 'alta' | 'critica';
    origemNBR: string;
    observacoes: string;
    resultadoVisita: string;
    justificativa: string;
  };

  checklistRecebimento?: {
    items: ChecklistItem[];
    estatisticas: {
      total: number;
      conformes: number;
      naoConformes: number;
      naoAplica: number;
    };
  };
}

type FinalidadeInspecao =
  | 'parecer_tecnico'
  | 'escopo_intervencao'
  | 'recebimento_unidade_autonoma'
  | 'recebimento_areas_comuns';

interface ChecklistItem {
  id: string;
  bloco: string;
  label: string;
  status: 'C' | 'NC' | 'NA';
  observacao?: string;
}
```

---

### 7. Proposta Assessoria Anual (`proposta-ass-anual`)

**Template:** `proposta-ass-anual.tsx`
**OS:** 05

```typescript
interface PropostaAssAnualData {
  // Obrigatórios
  codigoOS: string;
  cliente: {
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  valorMensal: number;
  duracaoContrato: number; // meses

  // Opcionais
  dataEmissao?: string;
  escopo?: string[];
  metodologia?: string;
  sla?: string;
  horarioFuncionamento?: string;
  observacoes?: string;
}
```

---

### 8. Proposta Assessoria Pontual (`proposta-ass-pontual`)

**Template:** `proposta-ass-pontual.tsx`
**OS:** 06

```typescript
interface PropostaAssPontualData {
  // Obrigatórios
  codigoOS: string;
  cliente: {
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  valorTotal: number;

  // Opcionais
  dataEmissao?: string;
  escopo?: string[];
  prazoExecucao?: string;
  entregaveis?: string[];
  observacoes?: string;
}
```

---

## Códigos de Erro Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Template não suportado: X` | Tipo de PDF inválido | Verifique se o tipo está em `PDFType` |
| `Falha ao gerar o blob do PDF` | Erro de renderização | Verifique dados obrigatórios |
| `Upload failed` | Erro de Storage | Verifique bucket `uploads` |
| `ReferenceError: window is not defined` | Usado em Server Component | Use apenas em componentes client-side |

---

## Boas Práticas

### 1. Tratamento de Erros

```tsx
const result = await generate('proposta', osId, dados);

if (!result) {
  // Hook retornou null (erro crítico)
  return;
}

if (!result.success) {
  toast.error(`Erro: ${result.error}`);
  return;
}

// Sucesso
toast.success('PDF gerado!');
```

### 2. Loading State

```tsx
<Button onClick={handleGerar} disabled={generating}>
  {generating ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Gerando...
    </>
  ) : (
    'Gerar PDF'
  )}
</Button>
```

### 3. Validação Prévia

```tsx
const handleGerar = async () => {
  // Validar dados obrigatórios
  if (!dados.cliente?.nome || !dados.valorProposta) {
    toast.error('Preencha todos os campos obrigatórios');
    return;
  }

  const result = await generate('proposta', osId, dados);
  // ...
};
```

### 4. Fallback para Valores Undefined

Nos dados passados ao template, sempre use fallback:

```tsx
{
  cliente: {
    nome: formData.clienteNome || 'Nome não informado',
    cpfCnpj: formData.clienteCpfCnpj || '',
  },
  valorProposta: formData.valor || 0,
}
```

---

## Referências

- [Hook Source](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/src/lib/hooks/use-pdf-generation.tsx)
- [Types Source](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/src/lib/types.ts)
- [Templates Directory](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/src/lib/pdf/templates)
- [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) - Índice completo
