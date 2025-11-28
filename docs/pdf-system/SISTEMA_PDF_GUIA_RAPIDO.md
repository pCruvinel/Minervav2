# 🚀 Sistema de Geração de PDFs - Guia Rápido

> **Status Atual**: ✅ Produção | Todos os 4 tipos de PDF funcionando

## 📋 Índice

- [Status do Sistema](#-status-do-sistema)
- [Tipos de PDF Disponíveis](#-tipos-de-pdf-disponíveis)
- [Uso Rápido](#-uso-rápido)
- [Comandos Úteis](#-comandos-úteis)
- [Documentação Completa](#-documentação-completa)
- [Teste e Desenvolvimento](#-teste-e-desenvolvimento)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Status do Sistema

| Componente | Status | Observações |
|------------|--------|-------------|
| **Edge Function** | ✅ Deployed | `generate-pdf` (Produção) |
| **Autenticação** | ✅ Corrigido | Race condition resolvido |
| **Validação** | ✅ Corrigido | CPF/CNPJ + campos flexíveis |
| **Proposta** | ✅ Funcionando | Geração e download OK |
| **Contrato** | ✅ Funcionando | Geração e download OK |
| **Memorial** | ✅ Funcionando | Geração e download OK |
| **Documento SST** | ✅ Funcionando | Geração e download OK |
| **Storage** | ✅ Configurado | Bucket `uploads` com RLS |
| **Metadata** | ✅ Configurado | Tabela `os_documentos` |
| **Página de Teste** | ✅ Disponível | [/teste-pdf](../routes/_auth/teste-pdf.tsx) |

**Última atualização**: 2025-11-27
**Versão Edge Function**: 1.0.0
**Custo mensal estimado**: <$0.02/mês (10-20 PDFs/dia)

---

## 📄 Tipos de PDF Disponíveis

### 1. Proposta Comercial
**Tipo**: `proposta`
**Uso**: Apresentação de serviços e valores ao cliente
**Campos principais**: Cliente, serviços, valores, condições
**Template**: [proposta-template.tsx](../../supabase/functions/generate-pdf/templates/proposta-template.tsx)

### 2. Contrato
**Tipo**: `contrato`
**Uso**: Formalização de acordo comercial
**Campos principais**: Contratante, contratada, objeto, valor, prazo
**Template**: [contrato-template.tsx](../../supabase/functions/generate-pdf/templates/contrato-template.tsx)

### 3. Memorial Descritivo
**Tipo**: `memorial`
**Uso**: Descrição técnica detalhada dos serviços
**Campos principais**: Seções customizáveis, descrições técnicas
**Template**: [memorial-template.tsx](../../supabase/functions/generate-pdf/templates/memorial-template.tsx)

### 4. Documento SST
**Tipo**: `documento-sst`
**Uso**: Documentos de Segurança e Saúde no Trabalho
**Campos principais**: Checklist, itens de segurança, responsáveis
**Template**: [documento-sst-template.tsx](../../supabase/functions/generate-pdf/templates/documento-sst-template.tsx)

---

## 🎯 Uso Rápido

### Frontend (React)

```tsx
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MyComponent() {
  const { generate, generating, error } = usePDFGeneration();

  const handleGerarPDF = async () => {
    const result = await generate('proposta', 'OS-123', {
      codigoOS: 'OS-123',
      clienteNome: 'Cliente Exemplo',
      clienteCpfCnpj: '111.444.777-35',
      valorTotal: 5000,
      // ... outros campos
    });

    if (result.success) {
      console.log('PDF gerado:', result.url);
      // Download automático já ocorreu
    }
  };

  return (
    <button onClick={handleGerarPDF} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar Proposta'}
    </button>
  );
}
```

### API Direta (cURL)

```bash
# Obter token JWT do Supabase Auth
TOKEN="seu_jwt_token_aqui"

# Gerar Proposta
curl -X POST https://seu-projeto.supabase.co/functions/v1/generate-pdf/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "proposta",
    "osId": "OS-123",
    "dados": {
      "codigoOS": "OS-123",
      "clienteNome": "Cliente Exemplo",
      "clienteCpfCnpj": "111.444.777-35",
      "valorTotal": 5000
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "url": "https://...signed-url...",
  "metadata": {
    "filename": "proposta_2025-01-27T10-30-00.pdf",
    "size": 156789,
    "tipo": "proposta"
  }
}
```

---

## 🛠 Comandos Úteis

### Deploy da Edge Function
```bash
# Deploy completo
npx supabase functions deploy generate-pdf

# Deploy com logs
npx supabase functions deploy generate-pdf --debug
```

### Monitoramento
```bash
# Ver logs em tempo real
npx supabase functions logs generate-pdf

# Filtrar apenas erros
npx supabase functions logs generate-pdf --level error

# Ver últimos N logs
npx supabase functions logs generate-pdf --tail 50
```

### Teste Local (Opcional)
```bash
# Servir Edge Function localmente
npx supabase functions serve generate-pdf

# Fazer request de teste
curl -X POST http://localhost:54321/functions/v1/generate-pdf/generate \
  -H "Authorization: Bearer YOUR_LOCAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### Atualizar TypeScript Types
```bash
# Após modificar tabelas/funções no Supabase
npm run update-types
```

---

## 📚 Documentação Completa

### Arquitetura e Decisões Técnicas
**[ARQUITETURA.md](./ARQUITETURA.md)** - 600 linhas
- Visão geral do sistema
- Stack tecnológica e justificativas
- Fluxo de geração (diagramas ASCII)
- Estrutura de arquivos detalhada
- Performance, custos e escalabilidade
- Segurança e RLS

### Guia do Desenvolvedor
**[GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md)** - 500 linhas
- Setup do ambiente
- Tutorial completo: Adicionar novo tipo de PDF
- Customização de templates existentes
- Testes locais e deploy
- Debugging e troubleshooting

### Referência da API
**[API_REFERENCE.md](./API_REFERENCE.md)** - 550 linhas
- Endpoints (`/health`, `/generate`)
- Tipos TypeScript completos
- Request/Response para os 4 tipos de PDF
- Exemplos cURL para cada tipo
- Códigos de erro
- Autenticação JWT

### Guia de Templates
**[TEMPLATES.md](./TEMPLATES.md)** - 400 linhas
- Anatomia de um template @react-pdf/renderer
- Componentes disponíveis (Document, Page, View, Text, Image, Link)
- Sistema de estilos compartilhados
- Formatação de dados
- Padrões comuns (tabelas, cards, badges)
- Limitações e workarounds

---

## 🧪 Teste e Desenvolvimento

### Página de Teste
**URL**: `/teste-pdf` (requer autenticação)
**Arquivo**: [src/routes/_auth/teste-pdf.tsx](../../src/routes/_auth/teste-pdf.tsx)

**Funcionalidades**:
- ✅ Teste dos 4 tipos de PDF
- ✅ Dados pré-preenchidos (modificáveis)
- ✅ Loading states e error handling
- ✅ Download automático após geração
- ✅ Console logs para debugging

**Como usar**:
1. Fazer login no sistema
2. Navegar para `/teste-pdf`
3. Clicar em "Gerar {Tipo}" para testar cada PDF
4. Verificar console do navegador para logs detalhados
5. PDFs são baixados automaticamente

**Sincronização com Templates**:
- Templates ficam em `supabase/functions/generate-pdf/templates/`
- Após editar um template, rode `npx supabase functions deploy generate-pdf`
- A página de teste automaticamente usa a versão mais recente (deployed)
- **Não é necessário** modificar a página de teste para ver mudanças de template

### Dados de Teste

Os dados de teste usam CPFs válidos para passar validação:

```typescript
// Proposta
clienteCpfCnpj: '111.444.777-35'

// Contrato
contratanteCpfCnpj: '391.799.790-77'

// Memorial
// Não requer CPF

// Documento SST
// Não requer CPF
```

**Nota**: Para trocar CPFs de teste, use geradores online de CPF válido.

---

## 🔧 Troubleshooting

### Problema: "Validation failed" (HTTP 500)

**Possíveis causas**:
- CPF/CNPJ inválido (não passa verificador)
- Campos obrigatórios faltando
- Tipo de dado incorreto

**Solução**:
1. Verificar logs da Edge Function: `npx supabase functions logs generate-pdf`
2. Validar CPF/CNPJ com algoritmo verificador
3. Conferir campos obrigatórios em [API_REFERENCE.md](./API_REFERENCE.md)

### Problema: "Unauthorized" (HTTP 401)

**Possíveis causas**:
- Token JWT expirado ou inválido
- Header `Authorization` faltando

**Solução**:
1. Verificar se token JWT está presente: `Authorization: Bearer {token}`
2. Fazer novo login se token expirou
3. Verificar se Supabase Auth está configurado

### Problema: PDF gerado mas download não inicia

**Possíveis causas**:
- Bloqueio de popup pelo navegador
- Signed URL expirado

**Solução**:
1. Permitir popups para o site
2. Verificar console do navegador para erros
3. Regenerar PDF (signed URL tem validade de 1 hora)

### Problema: Template não reflete mudanças

**Possíveis causas**:
- Edge Function não foi redeployed
- Cache do navegador

**Solução**:
```bash
# 1. Redeploy da Edge Function
npx supabase functions deploy generate-pdf

# 2. Limpar cache do navegador (Ctrl+Shift+Delete)

# 3. Verificar logs se deploy foi bem-sucedido
npx supabase functions logs generate-pdf
```

### Problema: Cold start muito lento (>5s)

**Possíveis causas**:
- Primeira chamada após período de inatividade
- Imagens grandes no template

**Solução**:
- Cold starts são normais (50-150ms)
- Para produção, considere:
  - Otimizar imagens (comprimir, reduzir tamanho)
  - Upgrade para Supabase Pro (cold starts mais rápidos)
  - Keep-alive periódico (chamar `/health` a cada 5min)

### Problema: "Storage error" ao fazer upload

**Possíveis causas**:
- Bucket `uploads` não existe
- RLS policies bloqueando upload
- Tamanho do arquivo excede limite

**Solução**:
1. Verificar bucket existe: Dashboard Supabase → Storage
2. Verificar RLS policies permitem upload
3. Verificar tamanho do PDF (<10MB recomendado)

---

## 🎓 Fluxo de Trabalho Recomendado

### Para Desenvolvedores

1. **Entender Arquitetura**
   - Ler [ARQUITETURA.md](./ARQUITETURA.md)
   - Entender fluxo: Frontend → Edge Function → Storage → DB

2. **Customizar Templates**
   - Ler [TEMPLATES.md](./TEMPLATES.md)
   - Editar templates em `supabase/functions/generate-pdf/templates/`
   - Testar localmente (opcional)
   - Deploy: `npx supabase functions deploy generate-pdf`
   - Verificar em `/teste-pdf`

3. **Adicionar Novo Tipo**
   - Seguir tutorial em [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md)
   - Criar template
   - Criar handler
   - Adicionar roteamento em `index.ts`
   - Atualizar types
   - Deploy e teste

4. **Integrar com Workflow**
   - Usar `usePDFGeneration` hook
   - Chamar `generate(tipo, osId, dados)`
   - Tratar estados: `generating`, `error`
   - Download é automático

### Para Product Owners

1. **Avaliar Necessidade**
   - Verificar se tipo de PDF já existe
   - Se não, definir campos necessários
   - Validar layout com designer

2. **Solicitar Implementação**
   - Fornecer exemplo de dados completos
   - Definir campos obrigatórios vs opcionais
   - Especificar formatação (data, moeda, etc.)

3. **Validar Resultado**
   - Testar em `/teste-pdf` com dados reais
   - Verificar formatação, layout, dados
   - Aprovar ou solicitar ajustes

---

## 🔗 Links Úteis

- **Repositório Edge Functions**: `supabase/functions/generate-pdf/`
- **Hook Frontend**: [use-pdf-generation.ts](../../src/lib/hooks/use-pdf-generation.ts)
- **Página de Teste**: [teste-pdf.tsx](../../src/routes/_auth/teste-pdf.tsx)
- **Validações**: [validation.ts](../../supabase/functions/generate-pdf/utils/validation.ts)
- **Storage Utils**: [pdf-storage.ts](../../supabase/functions/generate-pdf/utils/pdf-storage.ts)

### Recursos Externos

- [@react-pdf/renderer Docs](https://react-pdf.org/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)

---

## 📞 Suporte

**Para dúvidas técnicas**:
1. Verificar [Troubleshooting](#-troubleshooting) acima
2. Consultar documentação detalhada nos arquivos linkados
3. Verificar logs: `npx supabase functions logs generate-pdf`

**Para reportar bugs**:
1. Coletar logs da Edge Function
2. Incluir payload de request (sem dados sensíveis)
3. Descrever comportamento esperado vs atual

---

**Última revisão**: 2025-11-27
**Próxima revisão planejada**: Quando adicionar novos tipos de PDF
