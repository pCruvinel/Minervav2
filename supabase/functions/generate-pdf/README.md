# Sistema de Geração de PDFs - MinervaV2

Sistema centralizado de geração de PDFs utilizando Edge Functions (Deno) + @react-pdf/renderer.

## Visão Geral

Todos os PDFs (Propostas, Contratos, Memoriais, Documentos SST) são gerados em uma única Edge Function, com templates React reutilizáveis e armazenamento automático no Supabase Storage.

## Estrutura de Arquivos

```
supabase/functions/generate-pdf/
├── index.ts                         # Handler principal (Hono)
├── deno.json                        # Dependências Deno
├── templates/
│   ├── proposta-template.tsx        # Template de Proposta
│   ├── contrato-template.tsx        # Template de Contrato
│   ├── memorial-template.tsx        # Template de Memorial
│   ├── documento-sst-template.tsx   # Template de SST
│   └── shared-styles.ts             # Estilos compartilhados
├── handlers/
│   ├── proposta-handler.ts
│   ├── contrato-handler.ts
│   ├── memorial-handler.ts
│   └── documento-sst-handler.ts
└── utils/
    ├── pdf-formatter.ts             # Formatação (moeda, data, CPF/CNPJ)
    ├── pdf-storage.ts               # Upload Supabase Storage
    └── validation.ts                # Validação de dados
```

## Como Usar

### 1. Deploy da Edge Function

```bash
# No diretório raiz do projeto
npx supabase functions deploy generate-pdf
```

### 2. Usar no Frontend

#### Usando o Hook

```tsx
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MyComponent() {
  const { generating, generate } = usePDFGeneration();

  const handleGenerate = async () => {
    const result = await generate('proposta', 'os-123', {
      codigoOS: 'OS-001',
      clienteNome: 'João Silva',
      clienteCpfCnpj: '123.456.789-00',
      valorProposta: 5000,
      descricaoServico: 'Serviços de engenharia'
    });

    if (result?.success) {
      console.log('PDF gerado:', result.url);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar PDF'}
    </button>
  );
}
```

#### Usando o Componente PDFDownloadButton

```tsx
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';

function MyComponent() {
  return (
    <PDFDownloadButton
      tipo="proposta"
      osId="123"
      dados={{
        codigoOS: 'OS-001',
        clienteNome: 'João Silva',
        valorProposta: 5000
      }}
      onSuccess={(url) => console.log('PDF gerado:', url)}
    />
  );
}
```

#### Usando o Modal de Preview

```tsx
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';
import { useState } from 'react';

function MyComponent() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview PDF
      </button>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        tipo="proposta"
        osId="123"
        dados={{ /* dados da proposta */ }}
      />
    </>
  );
}
```

## Tipos de PDF Disponíveis

### 1. Proposta Comercial

**Tipo:** `proposta`

**Dados necessários:**
```typescript
{
  codigoOS: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  valorProposta: number;
  descricaoServico: string;
  // Opcionais
  clienteEmail?: string;
  clienteTelefone?: string;
  prazoEntrega?: string;
  observacoes?: string;
  itens?: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}
```

### 2. Contrato

**Tipo:** `contrato`

**Dados necessários:**
```typescript
{
  codigoOS: string;
  numeroContrato?: string;
  contratanteNome: string;
  contratanteCpfCnpj: string;
  valorContrato: number;
  dataInicio: string;
  objetoContrato: string;
  // Opcionais
  dataTermino?: string;
  formaPagamento?: string;
  clausulas?: Array<{
    numero: number;
    titulo: string;
    texto: string;
  }>;
}
```

### 3. Memorial Descritivo

**Tipo:** `memorial`

**Dados necessários:**
```typescript
{
  codigoOS: string;
  titulo: string;
  clienteNome: string;
  secoes: Array<{
    titulo: string;
    conteudo: string;
  }>;
  // Opcionais
  local?: string;
}
```

### 4. Documento SST

**Tipo:** `documento-sst`

**Dados necessários:**
```typescript
{
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
  responsavelTecnico?: string;
  conclusao?: string;
}
```

## Armazenamento

Os PDFs são automaticamente salvos em:
- **Bucket**: `uploads`
- **Path**: `os/{osId}/documentos/{tipo}/{timestamp}.pdf`
- **Metadados**: Salvos na tabela `os_documentos`

## Performance

- **Tempo médio**: 1-3 segundos por PDF
- **Timeout**: 20 segundos
- **Memória**: 512MB padrão
- **Custo**: ~$0.002-0.006/mês (10-20 PDFs/dia)

## Personalização

### Editar Templates

Os templates estão em `templates/*.tsx` e usam `@react-pdf/renderer`. Para personalizar:

1. Edite o template desejado
2. Use os estilos compartilhados de `shared-styles.ts`
3. Redeploy a Edge Function

### Adicionar Novo Tipo de PDF

1. Criar template em `templates/novo-tipo-template.tsx`
2. Criar handler em `handlers/novo-tipo-handler.ts`
3. Adicionar rota em `index.ts`
4. Atualizar tipo `PDFType` em `src/lib/types.ts`

## Troubleshooting

### PDF não gera

- Verificar se o Supabase está configurado corretamente
- Verificar se os dados obrigatórios foram fornecidos
- Conferir os logs da Edge Function: `npx supabase functions logs generate-pdf`

### Erro de autenticação

- Verificar se o token de autenticação está sendo enviado
- Conferir se o usuário tem permissão para acessar a OS

### Erro de upload

- Verificar se o bucket 'uploads' existe
- Conferir as políticas RLS do bucket

## Comandos Úteis

```bash
# Deploy da função
npx supabase functions deploy generate-pdf

# Ver logs em tempo real
npx supabase functions logs generate-pdf --tail

# Testar localmente
npx supabase functions serve generate-pdf
```

## Links Úteis

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Documentação Edge Functions Supabase](https://supabase.com/docs/guides/functions)
- [Documentação Hono](https://hono.dev/)
