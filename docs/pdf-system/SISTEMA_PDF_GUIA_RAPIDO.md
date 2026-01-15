# 🚀 Sistema de Geração de PDFs - Guia Rápido

> **Versão:** 2.0 (Client-Side)
> **Status:** ✅ Produção
> **Última Atualização:** 2026-01-14

---

## 📋 Índice

- [Status do Sistema](#-status-do-sistema)
- [Arquitetura](#-arquitetura)
- [Tipos de PDF Disponíveis](#-tipos-de-pdf-disponíveis)
- [Uso Rápido](#-uso-rápido)
- [Integrações por OS](#-integrações-por-os)
- [Documentação Completa](#-documentação-completa)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Status do Sistema

| Componente | Status | Observações |
|------------|--------|-------------|
| **Arquitetura** | ✅ v2.0 Client-Side | 100% no browser |
| **Hook** | ✅ Funcionando | `usePDFGeneration` |
| **Storage** | ✅ Configurado | Bucket `uploads` |
| **Proposta Comercial** | ✅ | OS 1-4 |
| **Contrato** | ✅ | Geral |
| **Memorial** | ✅ | OS 1-4 |
| **Documento SST** | ✅ | Geral |
| **Parecer Reforma** | ✅ | OS-07 |
| **Visita Técnica** | ✅ | OS-08 |
| **Proposta Ass. Anual** | ✅ | OS-05 |
| **Proposta Ass. Pontual** | ✅ | OS-06 |

---

## 🏗 Arquitetura

### v2.0 - Client-Side (Atual)

O sistema gera PDFs **100% no navegador** usando `@react-pdf/renderer`:

```
Browser → usePDFGeneration Hook → Template React → Blob PDF → Supabase Storage
```

**Vantagens:**
- ✅ Sem custos de Edge Function
- ✅ Performance melhor (sem latência de rede)
- ✅ Desenvolvimento mais simples
- ✅ Sem cold starts

### Estrutura de Arquivos

```
src/lib/
├── hooks/
│   └── use-pdf-generation.tsx    # Hook principal
├── pdf/
│   ├── pdf-uploader.ts           # Upload para Storage
│   ├── shared-styles.ts          # Design system
│   ├── assets.ts                 # Imagens Base64
│   ├── components/               # Componentes compartilhados
│   │   ├── shared-header.tsx
│   │   ├── shared-footer.tsx
│   │   └── table-components.tsx
│   └── templates/                # 8 templates
│       ├── proposta-template.tsx
│       ├── contrato-template.tsx
│       ├── memorial-template.tsx
│       ├── documento-sst-template.tsx
│       ├── parecer-reforma-template.tsx
│       ├── visita-tecnica-template.tsx
│       ├── proposta-ass-anual.tsx
│       └── proposta-ass-pontual.tsx
```

---

## 📄 Tipos de PDF Disponíveis

| Tipo | Template | OS | Descrição |
|------|----------|:--:|-----------|
| `proposta` | `proposta-template.tsx` | 1-4 | Proposta comercial completa |
| `contrato` | `contrato-template.tsx` | Geral | Contrato de serviços |
| `memorial` | `memorial-template.tsx` | 1-4 | Memorial descritivo |
| `documento-sst` | `documento-sst-template.tsx` | Geral | Documento SST |
| `parecer-reforma` | `parecer-reforma-template.tsx` | 07 | Parecer técnico |
| `visita-tecnica` | `visita-tecnica-template.tsx` | 08 | Relatório visita |
| `proposta-ass-anual` | `proposta-ass-anual.tsx` | 05 | Assessoria anual |
| `proposta-ass-pontual` | `proposta-ass-pontual.tsx` | 06 | Assessoria pontual |

---

## 🎯 Uso Rápido

### Hook `usePDFGeneration`

```tsx
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MeuComponente({ osId }: { osId: string }) {
  const { generating, generate, error } = usePDFGeneration();

  const handleGerar = async () => {
    const result = await generate('proposta', osId, {
      codigoOS: 'OS0100001',
      cliente: { nome: 'Cliente', cpfCnpj: '123.456.789-00' },
      valorProposta: 50000,
      // ... outros dados
    });

    if (result?.success) {
      console.log('PDF URL:', result.url);
      window.open(result.url, '_blank');
    }
  };

  return (
    <Button onClick={handleGerar} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar Proposta'}
    </Button>
  );
}
```

### Retorno do Hook

```typescript
interface PDFGenerationResponse {
  success: boolean;
  url?: string;        // URL assinada (válida 1h)
  path?: string;       // Caminho no Storage
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}
```

---

## 🔗 Integrações por OS

| OS | Componente | Status |
|:--:|------------|:------:|
| 01-04 | `step-gerar-proposta-os01-04.tsx` | ✅ |
| 05 | `step-gerar-proposta.tsx` | ✅ |
| 06 | `step-gerar-proposta.tsx` | ✅ |
| 07 | `os07-analise-page.tsx` | ✅ |
| 08 | `step-gerar-documento.tsx` | ✅ |
| 11 | `step-gerar-documento.tsx` | ⚠️ |

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) | ⭐ Ponto de entrada para IAs |
| [ARQUITETURA.md](./ARQUITETURA.md) | Decisões de design |
| [API_REFERENCE.md](./API_REFERENCE.md) | Referência do hook |
| [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md) | Tutorial completo |
| [TEMPLATES.md](./TEMPLATES.md) | Guia de templates |
| [PDF_GENERATION_SYSTEM.md](./PDF_GENERATION_SYSTEM.md) | Documentação técnica |

---

## 🔧 Troubleshooting

### PDF não gera

1. Verifique se está em componente client-side (`"use client"`)
2. Verifique se todos os dados obrigatórios foram passados
3. Veja o console do navegador para erros

### Erro: "ReferenceError: window is not defined"

- **Causa:** Tentativa de usar hook em Server Component
- **Solução:** Adicione `"use client"` no topo do arquivo

### Estilos não aplicados

- **Causa:** React PDF não suporta herança CSS
- **Solução:** Passe estilos explicitamente: `style={[style1, style2]}`

### PDF em branco

- **Causa:** Valor `undefined` dentro de `<Text>`
- **Solução:** Use fallback: `{valor || ''}`

### Imagens quebradas

- **Causa:** CORS em URLs externas
- **Solução:** Use Base64 de `assets.ts`

---

## 🧪 Página de Testes

**URL:** `/configuracoes/teste-pdf` (requer autenticação)

Permite testar todos os 8 tipos de PDF com dados de exemplo.

---

**Última revisão:** 2026-01-14
