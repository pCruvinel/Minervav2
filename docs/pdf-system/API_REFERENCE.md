# 📚 API Reference - Sistema de Geração de PDFs

## Base URL

```
https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf
```

---

## Endpoints

### 1. Health Check

Verifica se a Edge Function está online.

**Endpoint**: `GET /health`

**Headers**: Nenhum obrigatório

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Status Codes**:
- `200`: Function está online

**Exemplo**:
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/health
```

---

### 2. Gerar PDF

Gera um PDF do tipo especificado e faz upload para o Supabase Storage.

**Endpoint**: `POST /generate`

**Headers**:
| Header | Valor | Obrigatório |
|--------|-------|-------------|
| `Content-Type` | `application/json` | ✅ Sim |
| `Authorization` | `Bearer {JWT_TOKEN}` | ✅ Sim |

**Request Body**:
```typescript
{
  tipo: PDFType;          // 'proposta' | 'contrato' | 'memorial' | 'documento-sst'
  osId: string;           // ID da Ordem de Serviço
  dados: Record<string, unknown>;  // Dados específicos do tipo de PDF
}
```

**Response Success** (200):
```json
{
  "success": true,
  "url": "https://zxfevlkssljndqqhxkjb.supabase.co/storage/v1/object/public/uploads/os/OS-001/documentos/proposta/proposta_2025-01-15T10-30-00.pdf",
  "metadata": {
    "filename": "proposta_2025-01-15T10-30-00.pdf",
    "size": 124567,
    "tipo": "proposta"
  }
}
```

**Response Error** (400/500):
```json
{
  "success": false,
  "error": "Validation failed"
}
```

**Status Codes**:
- `200`: PDF gerado com sucesso
- `400`: Dados inválidos ou tipo de PDF inválido
- `401`: Não autenticado (token ausente ou inválido)
- `500`: Erro interno na geração do PDF

---

## Tipos TypeScript

### PDFType

```typescript
type PDFType = 'proposta' | 'contrato' | 'memorial' | 'documento-sst';
```

### PDFGenerationRequest

```typescript
interface PDFGenerationRequest {
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
}
```

### PDFGenerationResponse

```typescript
interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}
```

---

## Dados por Tipo de PDF

### 1. Proposta Comercial

**Tipo**: `'proposta'`

**Campos Obrigatórios**:
```typescript
{
  codigoOS: string;         // Ex: 'OS-001'
  clienteNome: string;      // Ex: 'João Silva'
  clienteCpfCnpj: string;   // Ex: '123.456.789-00' ou '12.345.678/0001-99'
  valorProposta: number;    // Ex: 15000
}
```

**Campos Opcionais**:
```typescript
{
  tipoOS?: string;
  dataEmissao?: string;        // ISO 8601
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  descricaoServico?: string;
  prazoEntrega?: string;
  observacoes?: string;
  itens?: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  empresaNome?: string;
  empresaCnpj?: string;
  empresaEndereco?: string;
  empresaTelefone?: string;
  empresaEmail?: string;
}
```

**Exemplo de Request**:
```bash
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "tipo": "proposta",
    "osId": "OS-001",
    "dados": {
      "codigoOS": "OS-001",
      "clienteNome": "João Silva",
      "clienteCpfCnpj": "111.444.777-35",
      "clienteEmail": "joao@email.com",
      "valorProposta": 15000,
      "descricaoServico": "Projeto elétrico residencial",
      "itens": [
        {
          "descricao": "Projeto elétrico",
          "quantidade": 1,
          "valorUnitario": 8000,
          "valorTotal": 8000
        },
        {
          "descricao": "ART",
          "quantidade": 1,
          "valorUnitario": 500,
          "valorTotal": 500
        }
      ]
    }
  }'
```

**Validações Aplicadas**:
- ✅ `codigoOS`, `clienteNome`, `clienteCpfCnpj`, `valorProposta` são obrigatórios
- ✅ CPF/CNPJ validado por algoritmo verificador
- ✅ Email validado se fornecido

---

### 2. Contrato

**Tipo**: `'contrato'`

**Campos Obrigatórios**:
```typescript
{
  codigoOS: string;
  // Aceita ambos os formatos:
  clienteNome?: string;          // OU contratanteNome
  contratanteNome?: string;      // OU clienteNome
  clienteCpfCnpj?: string;       // OU contratanteCpfCnpj
  contratanteCpfCnpj?: string;   // OU clienteCpfCnpj
  valorContrato: number;
  dataInicio: string;            // ISO 8601 ou 'YYYY-MM-DD'
}
```

**Campos Opcionais**:
```typescript
{
  numeroContrato?: string;
  dataEmissao?: string;
  dataTermino?: string;
  contratanteEndereco?: string;
  contratanteCidade?: string;
  contratanteEstado?: string;
  contratadoNome?: string;
  contratadoCnpj?: string;
  contratadoEndereco?: string;
  contratadoCidade?: string;
  contratadoEstado?: string;
  objetoContrato?: string;
  formaPagamento?: string;
  clausulas?: Array<{
    numero: number;
    titulo: string;
    texto: string;
  }>;
}
```

**Exemplo de Request**:
```bash
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "tipo": "contrato",
    "osId": "OS-001",
    "dados": {
      "codigoOS": "OS-001",
      "numeroContrato": "CONT-2025-001",
      "contratanteNome": "Maria Santos",
      "contratanteCpfCnpj": "391.799.790-77",
      "valorContrato": 15000,
      "dataInicio": "2025-02-01",
      "dataTermino": "2025-03-01",
      "objetoContrato": "Prestação de serviços de engenharia",
      "formaPagamento": "50% no início e 50% na entrega"
    }
  }'
```

**Validações Aplicadas**:
- ✅ `codigoOS`, `valorContrato`, `dataInicio` são obrigatórios
- ✅ Nome e CPF/CNPJ obrigatórios (aceita ambos formatos)
- ✅ CPF/CNPJ validado se fornecido

---

### 3. Memorial Descritivo

**Tipo**: `'memorial'`

**Campos Obrigatórios**:
```typescript
{
  codigoOS: string;
  titulo: string;
  clienteNome: string;
  secoes: Array<{
    titulo: string;
    conteudo: string;
  }>;
}
```

**Campos Opcionais**:
```typescript
{
  dataEmissao?: string;
  local?: string;
}
```

**Exemplo de Request**:
```bash
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "tipo": "memorial",
    "osId": "OS-001",
    "dados": {
      "codigoOS": "OS-001",
      "titulo": "Memorial Descritivo - Projeto Elétrico",
      "clienteNome": "Carlos Alberto",
      "local": "São Paulo/SP",
      "secoes": [
        {
          "titulo": "1. INTRODUÇÃO",
          "conteudo": "O presente memorial descritivo..."
        },
        {
          "titulo": "2. NORMAS APLICÁVEIS",
          "conteudo": "NBR 5410, NBR 5419..."
        }
      ]
    }
  }'
```

**Validações Aplicadas**:
- ✅ `codigoOS`, `titulo`, `clienteNome`, `secoes` são obrigatórios
- ✅ `secoes` deve ser um array com pelo menos 1 elemento

---

### 4. Documento SST

**Tipo**: `'documento-sst'`

**Campos Obrigatórios**:
```typescript
{
  codigoOS: string;
  tipoDocumento: string;    // Ex: 'Checklist de Segurança'
  clienteNome: string;
  local: string;
  itens: Array<{
    descricao: string;
    status?: 'conforme' | 'nao-conforme' | 'n/a';
    categoria?: string;
    observacao?: string;
  }>;
}
```

**Campos Opcionais**:
```typescript
{
  dataEmissao?: string;
  responsavelTecnico?: string;
  conclusao?: string;
}
```

**Exemplo de Request**:
```bash
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "tipo": "documento-sst",
    "osId": "OS-001",
    "dados": {
      "codigoOS": "OS-001",
      "tipoDocumento": "Checklist de Segurança",
      "clienteNome": "Pedro Oliveira",
      "local": "Obra Residencial - São Paulo/SP",
      "responsavelTecnico": "Eng. José Silva - CREA 123456",
      "itens": [
        {
          "categoria": "EPIs",
          "descricao": "Capacete de segurança",
          "status": "conforme"
        },
        {
          "categoria": "EPIs",
          "descricao": "Óculos de proteção",
          "status": "nao-conforme",
          "observacao": "2 colaboradores sem óculos"
        }
      ],
      "conclusao": "Foram identificadas 2 não conformidades."
    }
  }'
```

**Validações Aplicadas**:
- ✅ `codigoOS`, `tipoDocumento`, `clienteNome`, `local`, `itens` são obrigatórios
- ✅ `itens` deve ser um array com pelo menos 1 elemento

---

## Códigos de Erro

### Erro de Validação (400)

```json
{
  "success": false,
  "error": "Validation failed"
}
```

**Possíveis causas:**
- Campos obrigatórios faltando
- CPF/CNPJ inválido
- Email inválido
- Tipo de PDF inválido

### Erro de Autenticação (401)

```json
{
  "success": false,
  "error": "Authorization header missing"
}
```

**Causa:** Header `Authorization` não fornecido ou token inválido.

**Solução:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Erro Interno (500)

```json
{
  "success": false,
  "error": "Erro ao renderizar template"
}
```

**Possíveis causas:**
- Erro no template React (sintaxe inválida)
- Falha ao fazer upload para Storage
- Timeout (>20s)

---

## Autenticação

### Obtendo o Token JWT

```typescript
import { supabase } from '@/lib/supabase-client';

// Obter token da sessão atual
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Usar em requests
const response = await fetch(edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ tipo, osId, dados })
});
```

### Token Expirado

Tokens JWT expiram após 1 hora. O Supabase Auth faz refresh automático.

Se o token expirar durante uma chamada:
```typescript
const { data, error } = await supabase.auth.refreshSession();
if (data.session) {
  const newToken = data.session.access_token;
  // Retry request com novo token
}
```

---

## Rate Limiting

**Limites padrão do Supabase (Free Tier)**:
- 500,000 invocações/mês
- ~16,000 invocações/dia

Para uso típico (10-20 PDFs/dia), não há risco de exceder limites.

---

## CORS

A Edge Function permite requests de qualquer origem:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Preflight requests** (OPTIONS) são automaticamente tratados.

---

## Exemplos de Uso

### JavaScript/TypeScript (Frontend)

```typescript
import { supabase } from '@/lib/supabase-client';

async function gerarProposta(osId: string, dados: PropostaData) {
  // 1. Obter token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');

  // 2. Chamar Edge Function
  const response = await fetch(
    'https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        tipo: 'proposta',
        osId,
        dados
      })
    }
  );

  // 3. Processar resposta
  const result = await response.json();

  if (result.success) {
    console.log('PDF gerado:', result.url);
    // Download automático
    window.open(result.url, '_blank');
  } else {
    console.error('Erro:', result.error);
  }

  return result;
}
```

### React Hook (Recomendado)

```typescript
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MyComponent() {
  const { generating, generate } = usePDFGeneration();

  const handleGenerate = async () => {
    const result = await generate('proposta', 'OS-001', {
      codigoOS: 'OS-001',
      clienteNome: 'João Silva',
      clienteCpfCnpj: '111.444.777-35',
      valorProposta: 15000
    });

    if (result?.success) {
      console.log('PDF gerado com sucesso!');
    }
  };

  return (
    <button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar PDF'}
    </button>
  );
}
```

### cURL (Teste Manual)

```bash
# 1. Obter token (via Supabase Dashboard ou login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Chamar endpoint
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipo": "proposta",
    "osId": "test-001",
    "dados": {
      "codigoOS": "OS-001",
      "clienteNome": "Teste",
      "clienteCpfCnpj": "111.444.777-35",
      "valorProposta": 5000
    }
  }' | jq
```

---

## Webhooks (Futuro)

**Planejado para versão futura**: Notificação via webhook quando PDF é gerado.

```typescript
// Exemplo futuro
{
  "tipo": "proposta",
  "osId": "OS-001",
  "dados": {...},
  "webhook_url": "https://seu-servidor.com/webhook/pdf-gerado"
}
```

---

## Monitoramento

### Logs

Ver todos os logs:
```bash
npx supabase functions logs generate-pdf
```

Ver apenas erros:
```bash
npx supabase functions logs generate-pdf --level error
```

### Métricas Recomendadas

1. **Taxa de sucesso**: `success: true` vs `success: false`
2. **Tempo médio de geração**: Medir tempo entre request e response
3. **Tamanho médio de PDFs**: Monitorar `metadata.size`
4. **Tipos mais gerados**: Contar por `tipo`

---

## Changelog

### v1.0.0 (2025-01-15)
- ✅ Implementação inicial
- ✅ Suporte a 4 tipos: proposta, contrato, memorial, documento-sst
- ✅ Validação de CPF/CNPJ
- ✅ Upload automático para Supabase Storage
- ✅ Metadata em banco de dados

### Próximas Versões
- [ ] v1.1.0: Suporte a múltiplas páginas
- [ ] v1.2.0: Webhooks
- [ ] v1.3.0: Geração em batch

---

## Suporte

- **Documentação**: [docs/pdf-system/](../pdf-system/)
- **Issues**: GitHub Issues do projeto
- **Email**: suporte@minerva.com.br
