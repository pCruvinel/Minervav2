# 🏦 Integração Banco Cora - Edge Function

Edge Function para integração com o Banco Cora via API REST, incluindo:

- ✅ Autenticação mTLS (Mutual TLS) com JWT
- ✅ Emissão e gestão de boletos
- ✅ Consulta de extrato bancário
- ✅ Recebimento de webhooks do Cora
- ✅ Tipagem forte com TypeScript

## 📁 Estrutura do Projeto

```
supabase/functions/cora-integration/
├── index.ts          # Ponto de entrada com rotas HTTP (Hono)
├── auth.ts           # Módulo de autenticação mTLS
├── handlers.ts       # Handlers para API do Cora
├── types.ts          # Interfaces TypeScript
└── README.md         # Esta documentação
```

## 🔐 Configuração de Variáveis de Ambiente

Adicione as seguintes variáveis no Supabase Dashboard (`Settings > Edge Functions > Environment Variables`):

```bash
# Credenciais Cora (obrigatórias)
CORA_CLIENT_ID=seu_client_id
CORA_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----
CORA_CERT=-----BEGIN CERTIFICATE-----\nSEU_CERT_AQUI\n-----END CERTIFICATE-----

# URLs da API Cora
CORA_API_URL=https://api.cora.com.br/v1
CORA_TOKEN_URL=https://auth.cora.com.br/oauth2/token

# Webhook secret (para validar assinatura)
CORA_WEBHOOK_SECRET=seu_webhook_secret

# Supabase (já configuradas automaticamente)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 📝 Como obter as credenciais Cora

1. Acesse o [Portal de Desenvolvedores Cora](https://developers.cora.com.br)
2. Crie uma aplicação
3. Baixe o certificado digital (`.p12` ou `.pem`)
4. Extraia a private key e o certificado:

```bash
# Se você tem um arquivo .p12
openssl pkcs12 -in certificado.p12 -nocerts -out private-key.pem
openssl pkcs12 -in certificado.p12 -clcerts -nokeys -out certificate.pem
```

5. Copie o conteúdo dos arquivos e configure nas variáveis de ambiente

## 🚀 Deploy

```bash
# Fazer deploy da função
npx supabase functions deploy cora-integration

# Ou usar o CLI do Supabase diretamente
supabase functions deploy cora-integration
```

## 📡 Endpoints Disponíveis

### Health Check

```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "service": "cora-integration",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Teste de Autenticação

```http
GET /auth/test
```

**Resposta:**
```json
{
  "success": true,
  "message": "Autenticação bem-sucedida",
  "tokenPrefix": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Emitir Boleto

```http
POST /boleto
Content-Type: application/json

{
  "pagador": {
    "nome": "João Silva",
    "cpfCnpj": "12345678900",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01234-567"
    }
  },
  "valor": 15000,
  "vencimento": "2024-02-20",
  "numeroDocumento": "OS-2024-001",
  "descricao": "Pagamento de serviço",
  "instrucoes": [
    "Não aceitar após o vencimento"
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "bol_abc123",
    "nossoNumero": "00012345678",
    "linhaDigitavel": "34191.79001 01234.567890 12345.678901 1 98760000015000",
    "codigoBarras": "34191987600000150001790001234567890123456789",
    "qrCode": "00020126580014br.gov.bcb.pix...",
    "urlBoleto": "https://cora.com.br/boletos/bol_abc123.pdf",
    "valor": 15000,
    "vencimento": "2024-02-20",
    "status": "PENDENTE"
  }
}
```

### Consultar Boleto

```http
GET /boleto/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "bol_abc123",
    "nossoNumero": "00012345678",
    "status": "PAGO",
    "valor": 15000,
    "valorPago": 15000,
    "dataPagamento": "2024-02-15T14:30:00Z"
  }
}
```

### Cancelar Boleto

```http
DELETE /boleto/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "cancelado": true
  }
}
```

### Consultar Extrato

```http
GET /extrato?dataInicio=2024-01-01&dataFim=2024-01-31&tipo=ENTRADA
```

**Query Parameters:**
- `dataInicio` (required): Data inicial (YYYY-MM-DD)
- `dataFim` (required): Data final (YYYY-MM-DD)
- `tipo` (optional): ENTRADA | SAIDA | TODOS
- `page` (optional): Número da página
- `pageSize` (optional): Tamanho da página (padrão: 50)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "saldoInicial": 100000,
    "saldoFinal": 115000,
    "periodo": {
      "inicio": "2024-01-01",
      "fim": "2024-01-31"
    },
    "transacoes": [
      {
        "id": "txn_123",
        "data": "2024-01-15T10:30:00Z",
        "tipo": "ENTRADA",
        "descricao": "Pagamento de boleto",
        "valor": 15000,
        "saldo": 115000,
        "origem": {
          "tipo": "BOLETO",
          "identificador": "bol_abc123"
        }
      }
    ],
    "paginacao": {
      "paginaAtual": 1,
      "totalPaginas": 1,
      "totalRegistros": 1
    }
  }
}
```

### Webhook

```http
POST /webhook
Content-Type: application/json
X-Cora-Signature: sha256=abc123...

{
  "id": "evt_123",
  "tipo": "BOLETO_PAGO",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "boletoId": "bol_abc123",
    "nossoNumero": "00012345678",
    "numeroDocumento": "OS-2024-001",
    "valor": 15000,
    "valorPago": 15000,
    "dataPagamento": "2024-01-15T14:30:00Z",
    "pagador": {
      "nome": "João Silva",
      "cpfCnpj": "12345678900"
    }
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "eventId": "evt_123"
}
```

## 🗄️ Tabelas do Banco de Dados

A integração utiliza as seguintes tabelas (criar via migration):

### `cora_boletos`

```sql
CREATE TABLE cora_boletos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cora_boleto_id TEXT UNIQUE NOT NULL,
  nosso_numero TEXT NOT NULL,
  linha_digitavel TEXT NOT NULL,
  codigo_barras TEXT NOT NULL,
  qr_code TEXT,
  url_boleto TEXT,
  valor INTEGER NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO')),
  numero_documento TEXT NOT NULL,
  pagador_nome TEXT NOT NULL,
  pagador_cpf_cnpj TEXT NOT NULL,
  valor_pago INTEGER,
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cora_boletos_status ON cora_boletos(status);
CREATE INDEX idx_cora_boletos_numero_doc ON cora_boletos(numero_documento);
```

### `cora_webhook_events`

```sql
CREATE TABLE cora_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cora_webhook_events_type ON cora_webhook_events(event_type);
```

## 🔧 Uso no Frontend

```typescript
// Exemplo: Emitir boleto
const response = await fetch(
  'https://seu-projeto.supabase.co/functions/v1/cora-integration/boleto',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      pagador: {
        nome: 'João Silva',
        cpfCnpj: '12345678900',
      },
      valor: 15000, // R$ 150,00
      vencimento: '2024-02-20',
      numeroDocumento: 'OS-2024-001',
    }),
  }
);

const result = await response.json();
console.log('Boleto emitido:', result.data.linhaDigitavel);
```

## 🧪 Testes Locais

```bash
# Servir a função localmente
npx supabase functions serve cora-integration --env-file supabase/.env.local

# Fazer requisição de teste
curl http://localhost:54321/functions/v1/cora-integration/health
```

## 📊 Logs e Monitoramento

```bash
# Ver logs em tempo real
npx supabase functions logs cora-integration --follow

# Ver logs de um período específico
npx supabase functions logs cora-integration --since 1h
```

## ⚠️ Tratamento de Erros

Todas as respostas de erro seguem o padrão:

```json
{
  "success": false,
  "error": {
    "codigo": "VALIDATION_ERROR",
    "mensagem": "Descrição do erro",
    "detalhes": {},
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

**Códigos de erro comuns:**
- `VALIDATION_ERROR`: Dados inválidos na requisição
- `CORA_API_ERROR`: Erro retornado pela API do Cora
- `INTERNAL_ERROR`: Erro interno da função

## 🔒 Segurança

- ✅ Autenticação mTLS com certificados digitais
- ✅ Validação de assinatura HMAC-SHA256 em webhooks
- ✅ Tokens OAuth2 em cache com renovação automática
- ✅ Service Role Key do Supabase para operações no banco
- ✅ CORS configurado para segurança

## 📚 Referências

- [Documentação API Cora](https://developers.cora.com.br)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Hono Framework](https://hono.dev/)

---

**Desenvolvido para MinervaV2** 🚀
