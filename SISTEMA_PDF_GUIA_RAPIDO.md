# 📄 Sistema de Geração de PDFs - Guia Rápido

## ✅ Status: IMPLEMENTADO E DEPLOYADO

A Edge Function `generate-pdf` foi deployada com sucesso no Supabase!

---

## 🚀 Como Usar no Sistema

### 1. Em Qualquer Componente

```tsx
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MeuComponente() {
  const { generating, generate } = usePDFGeneration();

  const handleGerar = async () => {
    const result = await generate('proposta', 'os-123', {
      codigoOS: 'OS-001',
      clienteNome: 'João Silva',
      clienteCpfCnpj: '123.456.789-00',
      valorProposta: 5000
    });

    if (result?.success) {
      console.log('PDF gerado:', result.url);
    }
  };

  return (
    <button onClick={handleGerar} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar PDF'}
    </button>
  );
}
```

### 2. Usando Botão Pronto

```tsx
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';

<PDFDownloadButton
  tipo="proposta"
  osId="123"
  dados={{
    codigoOS: 'OS-001',
    clienteNome: 'João Silva',
    valorProposta: 5000
  }}
/>
```

### 3. Com Modal de Preview

```tsx
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';

<PDFPreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  tipo="proposta"
  osId="123"
  dados={propostaData}
/>
```

---

## 📋 Tipos de PDF Disponíveis

### ✅ Proposta Comercial
**Tipo:** `proposta`

**Dados mínimos:**
```typescript
{
  codigoOS: 'OS-001',
  clienteNome: 'Nome do Cliente',
  clienteCpfCnpj: '123.456.789-00',
  valorProposta: 5000,
  descricaoServico: 'Descrição dos serviços'
}
```

### ✅ Contrato
**Tipo:** `contrato`

**Dados mínimos:**
```typescript
{
  codigoOS: 'OS-001',
  contratanteNome: 'Nome do Cliente',
  contratanteCpfCnpj: '123.456.789-00',
  valorContrato: 10000,
  dataInicio: '2025-01-01',
  objetoContrato: 'Prestação de serviços...'
}
```

### ✅ Memorial Descritivo
**Tipo:** `memorial`

**Dados mínimos:**
```typescript
{
  codigoOS: 'OS-001',
  titulo: 'Memorial Descritivo',
  clienteNome: 'Nome do Cliente',
  secoes: [
    {
      titulo: 'Introdução',
      conteudo: 'Texto da seção...'
    }
  ]
}
```

### ✅ Documento SST
**Tipo:** `documento-sst`

**Dados mínimos:**
```typescript
{
  codigoOS: 'OS-001',
  tipoDocumento: 'Checklist de Segurança',
  clienteNome: 'Nome do Cliente',
  local: 'Endereço da obra',
  itens: [
    {
      descricao: 'EPI adequado',
      status: 'conforme'
    }
  ]
}
```

---

## 🔧 Onde Está Integrado

### Workflows de OS
Os seguintes steps já estão integrados:

1. **[step-gerar-proposta.tsx](src/components/os/steps/shared/step-gerar-proposta.tsx:1)**
   - Botão de gerar proposta
   - Preview modal
   - Download automático

2. **[step-gerar-contrato.tsx](src/components/os/steps/shared/step-gerar-contrato.tsx:1)**
   - Botão de gerar contrato
   - Preview modal
   - Download automático

---

## 📁 Onde os PDFs São Salvos

**Bucket Supabase:** `uploads`

**Estrutura de pastas:**
```
uploads/
└── os/
    └── {osId}/
        └── documentos/
            ├── proposta/
            │   └── proposta_2025-01-15T10-30-00.pdf
            ├── contrato/
            │   └── contrato_2025-01-15T11-00-00.pdf
            ├── memorial/
            │   └── memorial_2025-01-15T11-30-00.pdf
            └── documento-sst/
                └── documento-sst_2025-01-15T12-00-00.pdf
```

**Metadados:** Salvos na tabela `os_documentos`

---

## 🧪 Testar o Sistema

### Opção 1: Via Workflow de OS

1. Acesse uma OS existente
2. Navegue até o step "Gerar Proposta" ou "Gerar Contrato"
3. Clique no botão "Gerar Proposta Comercial"
4. O PDF será gerado e baixado automaticamente

### Opção 2: Via Console do Navegador

```javascript
// Abra o DevTools (F12) em qualquer página autenticada
const response = await fetch('https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_AQUI'
  },
  body: JSON.stringify({
    tipo: 'proposta',
    osId: 'test-123',
    dados: {
      codigoOS: 'OS-001',
      clienteNome: 'Teste Silva',
      clienteCpfCnpj: '123.456.789-00',
      valorProposta: 5000,
      descricaoServico: 'Teste de geração de PDF'
    }
  })
});

const result = await response.json();
console.log(result);
```

### Opção 3: Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/functions
2. Clique em `generate-pdf`
3. Use o "Invoke function" com o body de exemplo acima

---

## 📊 Performance Esperada

- **Tempo médio**: 1-3 segundos por PDF
- **Timeout**: 20 segundos (máximo)
- **Tamanho médio**: 50-200 KB por PDF
- **Custo**: ~$0.002-0.006/mês (10-20 PDFs/dia)

---

## 🐛 Troubleshooting

### PDF não gera

**Possíveis causas:**
- Dados obrigatórios faltando
- Token de autenticação inválido
- Edge Function offline

**Solução:**
1. Verifique os logs: `npx supabase functions logs generate-pdf --tail`
2. Verifique se os dados obrigatórios estão presentes
3. Teste o endpoint `/health` primeiro

### Erro de autenticação

**Solução:**
- Certifique-se de que o token JWT está sendo enviado no header `Authorization`
- Verifique se o usuário tem permissão para acessar a OS

### PDF em branco

**Possíveis causas:**
- Template React com erro
- Dados malformados

**Solução:**
- Verifique os logs da Edge Function
- Teste com dados mínimos primeiro

---

## 📚 Documentação Completa

- **README da Edge Function**: [supabase/functions/generate-pdf/README.md](supabase/functions/generate-pdf/README.md:1)
- **Hook de geração**: [src/lib/hooks/use-pdf-generation.ts](src/lib/hooks/use-pdf-generation.ts:1)
- **Tipos TypeScript**: [src/lib/types.ts](src/lib/types.ts:739) (linhas 735-756)

---

## 🎨 Personalizar Templates

Os templates estão em `supabase/functions/generate-pdf/templates/`:

1. **[proposta-template.tsx](supabase/functions/generate-pdf/templates/proposta-template.tsx:1)** - Edite para customizar layout de propostas
2. **[contrato-template.tsx](supabase/functions/generate-pdf/templates/contrato-template.tsx:1)** - Edite para customizar layout de contratos
3. **[shared-styles.ts](supabase/functions/generate-pdf/templates/shared-styles.ts:1)** - Edite para mudar cores, fontes, etc.

Após editar, redeploy:
```bash
npx supabase functions deploy generate-pdf
```

---

## ✨ Próximas Melhorias (Futuro)

- [ ] Suporte a múltiplas páginas
- [ ] Cabeçalho e rodapé customizáveis
- [ ] Tabelas dinâmicas com paginação
- [ ] Gráficos e charts
- [ ] Geração em batch (múltiplos PDFs de uma vez)
- [ ] Preview em tempo real antes de gerar
- [ ] Assinatura digital com certificado

---

**Sistema 100% funcional e pronto para produção!** 🚀
