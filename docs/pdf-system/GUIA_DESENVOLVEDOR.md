# 👨‍💻 Guia do Desenvolvedor - Sistema de Geração de PDFs

## Índice

1. [Setup do Ambiente](#setup-do-ambiente)
2. [Adicionando um Novo Tipo de PDF](#adicionando-um-novo-tipo-de-pdf)
3. [Customizando Templates Existentes](#customizando-templates-existentes)
4. [Testando Localmente](#testando-localmente)
5. [Deploy para Produção](#deploy-para-produção)
6. [Debugging](#debugging)
7. [Troubleshooting](#troubleshooting)

---

## Setup do Ambiente

### Pré-requisitos

- Node.js 18+ e npm
- Conta Supabase (free tier é suficiente)
- Supabase CLI instalado: `npm install -g supabase`
- (Opcional) Docker Desktop para testes locais

### 1. Clone e Instale Dependências

```bash
cd Minervav2
npm install
```

### 2. Configure Supabase

```bash
# Login no Supabase
npx supabase login

# Link ao projeto
npx supabase link --project-ref zxfevlkssljndqqhxkjb

# Verifique o status
npx supabase status
```

### 3. Teste a Edge Function

```bash
# Deploy
npx supabase functions deploy generate-pdf

# Verifique o health endpoint
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2025-01-15T10:30:00.000Z"}
```

---

## Adicionando um Novo Tipo de PDF

Vamos adicionar um novo tipo de PDF chamado "Laudo Técnico" passo a passo.

### Passo 1: Atualizar Tipos TypeScript

**Arquivo**: `src/lib/types.ts`

```typescript
// Adicionar novo tipo
export type PDFType = 'proposta' | 'contrato' | 'memorial' | 'documento-sst' | 'laudo-tecnico';

// Interface para dados do laudo
export interface LaudoTecnicoData {
  codigoOS: string;
  numeroLaudo: string;
  clienteNome: string;
  local: string;
  dataInspecao: string;
  tecnicoResponsavel: string;
  crea: string;
  itensInspecionados: Array<{
    item: string;
    condicao: 'aprovado' | 'reprovado' | 'atencao';
    observacoes?: string;
  }>;
  conclusao: string;
  recomendacoes?: string;
}
```

### Passo 2: Criar Template React

**Arquivo**: `supabase/functions/generate-pdf/templates/laudo-tecnico-template.tsx`

```tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, commonStyles } from './shared-styles.ts';
import type { LaudoTecnicoData } from './types.ts';

interface LaudoTecnicoTemplateProps {
  data: LaudoTecnicoData;
}

const styles = StyleSheet.create({
  page: commonStyles.page,
  header: commonStyles.header,
  section: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: fonts.size.xs,
    fontWeight: 'bold',
  },
  aprovado: {
    backgroundColor: colors.success,
    color: colors.white,
  },
  reprovado: {
    backgroundColor: colors.error,
    color: colors.white,
  },
  atencao: {
    backgroundColor: colors.warning,
    color: colors.neutral900,
  },
});

export function LaudoTecnicoTemplate({ data }: LaudoTecnicoTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={{ fontSize: fonts.size.xl, fontWeight: 'bold', color: colors.primary }}>
            LAUDO TÉCNICO
          </Text>
          <Text style={{ fontSize: fonts.size.md, color: colors.neutral600 }}>
            Nº {data.numeroLaudo}
          </Text>
        </View>

        {/* Informações Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <Text>OS: {data.codigoOS}</Text>
          <Text>Cliente: {data.clienteNome}</Text>
          <Text>Local: {data.local}</Text>
          <Text>Data de Inspeção: {new Date(data.dataInspecao).toLocaleDateString('pt-BR')}</Text>
          <Text>Técnico Responsável: {data.tecnicoResponsavel} - CREA {data.crea}</Text>
        </View>

        {/* Itens Inspecionados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens Inspecionados</Text>
          {data.itensInspecionados.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text>{item.item}</Text>
                {item.observacoes && (
                  <Text style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
                    {item.observacoes}
                  </Text>
                )}
              </View>
              <View style={[styles.statusBadge, styles[item.condicao]]}>
                <Text>
                  {item.condicao === 'aprovado' ? 'APROVADO' :
                   item.condicao === 'reprovado' ? 'REPROVADO' : 'ATENÇÃO'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Conclusão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conclusão</Text>
          <Text>{data.conclusao}</Text>
        </View>

        {/* Recomendações */}
        {data.recomendacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            <Text>{data.recomendacoes}</Text>
          </View>
        )}

        {/* Assinatura */}
        <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral300 }}>
          <Text>_________________________________________</Text>
          <Text style={{ marginTop: spacing.xs }}>{data.tecnicoResponsavel}</Text>
          <Text style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>CREA {data.crea}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

### Passo 3: Criar Validação

**Arquivo**: `supabase/functions/generate-pdf/utils/validation.ts`

Adicionar no final do arquivo:

```typescript
/**
 * Valida dados de laudo técnico
 */
export function validateLaudoTecnicoData(dados: Record<string, unknown>): void {
  const errors: ValidationError[] = [];

  const requiredFields = [
    'codigoOS',
    'numeroLaudo',
    'clienteNome',
    'local',
    'dataInspecao',
    'tecnicoResponsavel',
    'crea',
    'itensInspecionados',
    'conclusao'
  ];

  for (const field of requiredFields) {
    const error = validateRequired(dados[field], field);
    if (error) errors.push(error);
  }

  // Validar array de itens
  if (dados.itensInspecionados && !Array.isArray(dados.itensInspecionados)) {
    errors.push({
      field: 'itensInspecionados',
      message: 'itensInspecionados deve ser um array'
    });
  } else if (dados.itensInspecionados && (dados.itensInspecionados as any[]).length === 0) {
    errors.push({
      field: 'itensInspecionados',
      message: 'Deve haver pelo menos um item inspecionado'
    });
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
}
```

### Passo 4: Criar Handler

**Arquivo**: `supabase/functions/generate-pdf/handlers/laudo-tecnico-handler.ts`

```typescript
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LaudoTecnicoTemplate } from '../templates/laudo-tecnico-template.tsx';
import { validateLaudoTecnicoData } from '../utils/validation.ts';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import type { PDFGenerationResponse } from '../index.ts';

export async function handleLaudoTecnicoGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Laudo Técnico] Validando dados...');
    validateLaudoTecnicoData(dados);

    console.log('[Laudo Técnico] Renderizando template...');
    const doc = React.createElement(LaudoTecnicoTemplate, { data: dados as any });
    const pdfBuffer = await renderToBuffer(doc);

    console.log('[Laudo Técnico] Fazendo upload...');
    const uint8Array = new Uint8Array(pdfBuffer);
    const uploadResult = await uploadPDFToStorage(
      supabase,
      uint8Array,
      osId,
      'laudo-tecnico',
      {
        numeroLaudo: dados.numeroLaudo,
        clienteNome: dados.clienteNome,
        dataInspecao: dados.dataInspecao,
      }
    );

    console.log('[Laudo Técnico] Sucesso!', uploadResult.filename);

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'laudo-tecnico',
      },
    };
  } catch (error: any) {
    console.error('[Laudo Técnico] Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro ao gerar laudo técnico',
    };
  }
}
```

### Passo 5: Registrar no Index

**Arquivo**: `supabase/functions/generate-pdf/index.ts`

```typescript
// Adicionar import
import { handleLaudoTecnicoGeneration } from './handlers/laudo-tecnico-handler.ts';

// Atualizar tipo
export type PDFType = 'proposta' | 'contrato' | 'memorial' | 'documento-sst' | 'laudo-tecnico';

// Adicionar case no switch
switch (tipo) {
  case 'proposta':
    result = await handlePropostaGeneration(supabase, osId, dados);
    break;
  case 'contrato':
    result = await handleContratoGeneration(supabase, osId, dados);
    break;
  case 'memorial':
    result = await handleMemorialGeneration(supabase, osId, dados);
    break;
  case 'documento-sst':
    result = await handleDocumentoSSTGeneration(supabase, osId, dados);
    break;
  case 'laudo-tecnico':  // NOVO
    result = await handleLaudoTecnicoGeneration(supabase, osId, dados);
    break;
  default:
    return new Response(
      JSON.stringify({
        success: false,
        error: `Tipo de PDF inválido: ${tipo}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
}
```

### Passo 6: Deploy e Teste

```bash
# Deploy da Edge Function
npx supabase functions deploy generate-pdf

# Testar via página de testes (/teste-pdf)
# Ou via curl:
curl -X POST \
  https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tipo": "laudo-tecnico",
    "osId": "test-001",
    "dados": {
      "codigoOS": "OS-001",
      "numeroLaudo": "LT-2025-001",
      "clienteNome": "João Silva",
      "local": "Rua Teste, 123",
      "dataInspecao": "2025-01-15",
      "tecnicoResponsavel": "Eng. José Santos",
      "crea": "12345/D-SP",
      "itensInspecionados": [
        {
          "item": "Instalação elétrica",
          "condicao": "aprovado"
        }
      ],
      "conclusao": "Todas as instalações estão em conformidade."
    }
  }'
```

### Passo 7: Adicionar à Página de Testes (Opcional)

**Arquivo**: `src/routes/_auth/teste-pdf.tsx`

Adicionar novo card para laudos técnicos com dados de exemplo.

---

## Customizando Templates Existentes

### Exemplo: Adicionar Logo à Proposta

**Arquivo**: `supabase/functions/generate-pdf/templates/proposta-template.tsx`

```tsx
import { Image } from '@react-pdf/renderer';

// No componente, adicionar no header:
<View style={styles.header}>
  {/* Adicionar logo */}
  <Image
    src="https://seu-bucket.supabase.co/logo-minerva.png"
    style={{ width: 80, height: 40, marginBottom: spacing.sm }}
  />
  <Text style={{ fontSize: fonts.size.xl }}>PROPOSTA COMERCIAL</Text>
</View>
```

### Exemplo: Mudar Cores do Template

**Arquivo**: `supabase/functions/generate-pdf/templates/shared-styles.ts`

```typescript
export const colors = {
  primary: '#0066CC',      // Antes: #FF6B35
  primaryDark: '#004C99',  // Antes: #E85D25
  // ... resto das cores
};
```

Após modificar, redeploy:
```bash
npx supabase functions deploy generate-pdf
```

---

## Testando Localmente

### Opção 1: Usando Supabase Functions Serve

```bash
# Iniciar servidor local
npx supabase functions serve generate-pdf

# Em outro terminal, testar:
curl -X POST http://localhost:54321/functions/v1/generate-pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tipo": "proposta", "osId": "test", "dados": {...}}'
```

**Limitação**: Requer Docker Desktop rodando.

### Opção 2: Deploy e Usar Página de Testes

1. Deploy para produção
2. Navegar para `/teste-pdf`
3. Clicar nos botões de teste

**Vantagens:**
- Não requer Docker
- Testa o fluxo completo (frontend + backend)
- Visualiza PDFs gerados

---

## Deploy para Produção

### Deploy Simples

```bash
npx supabase functions deploy generate-pdf
```

### Deploy com Secrets (se necessário)

```bash
# Definir secret
npx supabase secrets set PDF_WATERMARK="RASCUNHO"

# Usar no código
const watermark = Deno.env.get('PDF_WATERMARK');
```

### Verificar Deploy

```bash
# Listar functions
npx supabase functions list

# Ver logs
npx supabase functions logs generate-pdf
```

---

## Debugging

### 1. Ver Logs em Tempo Real

```bash
npx supabase functions logs generate-pdf --tail
```

### 2. Adicionar Logs no Código

```typescript
console.log('[DEBUG] Dados recebidos:', JSON.stringify(dados, null, 2));
console.log('[DEBUG] Template renderizado com sucesso');
console.error('[ERROR] Falha ao fazer upload:', error);
```

### 3. Testar Endpoint de Health

```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/health
```

### 4. Inspecionar Response da Edge Function

No DevTools do navegador (aba Network):
1. Filtrar por `generate-pdf`
2. Ver Request payload
3. Ver Response (success, error, metadata)

### 5. Validar PDF Gerado

```bash
# Baixar PDF
wget "https://zxfevlkssljndqqhxkjb.supabase.co/storage/v1/object/public/uploads/os/test-001/documentos/proposta/proposta_2025-01-15.pdf"

# Abrir com PDF viewer
```

---

## Troubleshooting

### Problema: "Validation failed"

**Causa:** Dados obrigatórios faltando ou inválidos

**Solução:**
1. Verificar logs: `npx supabase functions logs generate-pdf`
2. Conferir campos obrigatórios no código de validação
3. Verificar formato de dados (CPF, email, etc.)

**Exemplo de log de erro:**
```
[Proposta] Erro: Validation failed
errors: [
  { field: 'clienteCpfCnpj', message: 'CPF inválido' }
]
```

### Problema: PDF em Branco

**Causa:** Erro no template React

**Solução:**
1. Verificar logs da Edge Function
2. Validar sintaxe JSX do template
3. Conferir se dados estão sendo passados corretamente

```typescript
// Adicionar log antes de renderizar
console.log('[DEBUG] Dados para template:', data);
const doc = React.createElement(PropostaTemplate, { data });
```

### Problema: "Module not found"

**Causa:** Import path incorreto

**Solução:**
```typescript
// ❌ Errado
import { colors } from './shared-styles';

// ✅ Correto
import { colors } from './shared-styles.ts';
```

Deno requer extensões de arquivo explícitas (.ts, .tsx).

### Problema: Deploy Falha com "Invalid JWT"

**Causa:** Token de autenticação expirado

**Solução:**
```bash
npx supabase login
npx supabase functions deploy generate-pdf
```

### Problema: PDF Muito Grande (>10MB)

**Causa:** Imagens não otimizadas ou muitos dados

**Solução:**
1. Comprimir imagens antes de usar
2. Limitar quantidade de itens por página
3. Usar paginação para documentos longos

```typescript
// Exemplo: limitar itens
const itensLimitados = data.itens.slice(0, 50);
```

### Problema: "Storage upload failed"

**Causa:** Bucket 'uploads' não existe ou RLS bloqueando

**Solução:**
1. Criar bucket no Supabase Dashboard
2. Configurar políticas RLS:

```sql
-- Política de upload (service role pode fazer upload)
CREATE POLICY "Service role can upload"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'uploads');

-- Política de leitura (usuários podem ver seus próprios PDFs)
CREATE POLICY "Users can read own PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads' AND auth.uid() = owner);
```

### Problema: Timeout (Edge Function excede 20s)

**Causa:** Template muito complexo ou processamento lento

**Solução:**
1. Simplificar template (menos cálculos, menos elementos)
2. Otimizar loops (usar `.map()` eficientemente)
3. Considerar aumentar timeout (Pro tier apenas)

---

## Recursos Adicionais

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://deno.com/deploy/docs)
- [Exemplos de Layouts](https://react-pdf.org/examples)

---

## Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Testes manuais de todos os tipos de PDF
- [ ] Verificar validações de dados
- [ ] Conferir formatação (moeda, data, CPF/CNPJ)
- [ ] Testar com dados reais (não apenas mock)
- [ ] Validar tamanho dos PDFs gerados (<500KB ideal)
- [ ] Conferir logs de erro (não deve haver)
- [ ] Testar RLS policies do Storage
- [ ] Documentar novos tipos de PDF adicionados
- [ ] Atualizar tipos TypeScript em `src/lib/types.ts`
- [ ] Adicionar dados de teste em `/teste-pdf`

---

**Boas práticas:**
- ✅ Sempre adicionar logs (`console.log`) em handlers
- ✅ Validar dados antes de renderizar templates
- ✅ Usar tipos TypeScript para dados de entrada
- ✅ Testar localmente antes de deploy
- ✅ Manter templates simples e reutilizáveis
- ✅ Documentar novos tipos de PDF no README
