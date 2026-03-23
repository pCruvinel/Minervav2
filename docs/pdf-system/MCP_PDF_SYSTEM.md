# 📄 MCP - Sistema de Geração de PDF

> **Última Atualização:** 2026-01-14
> **Arquitetura:** Client-Side (100% Frontend)
> **Engine:** `@react-pdf/renderer` v3.x
> **Status:** ✅ Produção

---

## 📚 Índice de Arquivos (Para IA)

Este documento serve como **ponto de entrada** para IAs que precisam trabalhar com o sistema de geração de PDF do MinervaV2. Leia esta seção primeiro para entender a estrutura completa.

### 🔧 Código Principal

| Arquivo | Caminho | Descrição |
|---------|---------|-----------|
| **Hook Principal** | `src/lib/hooks/use-pdf-generation.tsx` | ⭐ **LEIA PRIMEIRO** - Hook React que orquestra toda a geração de PDF. Contém o switch de templates e lógica de upload. |
| **Uploader** | `src/lib/pdf/pdf-uploader.ts` | Faz upload do blob PDF para Supabase Storage e retorna URL assinada. |
| **Estilos Globais** | `src/lib/pdf/shared-styles.ts` | Design system para PDFs: cores, fontes, espaçamentos. Todos os templates importam daqui. |
| **Assets** | `src/lib/pdf/assets.ts` | Imagens em Base64 (logo Minerva, etc.) para uso nos templates. |
| **Tipos PDF** | `src/lib/types.ts` | Contém `PDFType`, `PDFGenerationRequest` e `PDFGenerationResponse`. |

### 📑 Templates (8 Templates)

| Template | Caminho | OS Relacionada | Descrição |
|----------|---------|----------------|-----------|
| **Proposta Comercial** | `src/lib/pdf/templates/proposta-template.tsx` | OS 1-4 | Proposta completa com cronograma, memorial e investimentos. ~32KB |
| **Contrato** | `src/lib/pdf/templates/contrato-template.tsx` | Geral | Minuta de contrato de prestação de serviços. ~11KB |
| **Memorial** | `src/lib/pdf/templates/memorial-template.tsx` | OS 1-4 | Memorial descritivo técnico (sem valores). ~3KB |
| **Documento SST** | `src/lib/pdf/templates/documento-sst-template.tsx` | Geral | Checklist de Segurança e Saúde no Trabalho. ~8KB |
| **Parecer Reforma** | `src/lib/pdf/templates/parecer-reforma-template.tsx` | OS-07 | Parecer técnico para aprovação de reforma. ~9KB |
| **Visita Técnica** | `src/lib/pdf/templates/visita-tecnica-template.tsx` | OS-08 | Relatório de visita técnica com checklist. ~31KB |
| **Proposta Ass. Anual** | `src/lib/pdf/templates/proposta-ass-anual.tsx` | OS-05 | Proposta para contrato de assessoria recorrente. ~23KB |
| **Proposta Ass. Pontual** | `src/lib/pdf/templates/proposta-ass-pontual.tsx` | OS-06 | Proposta para assessoria pontual/avulsa. ~25KB |

### 🧩 Componentes Compartilhados (PDF)

| Componente | Caminho | Descrição |
|------------|---------|-----------|
| **SharedHeader** | `src/lib/pdf/components/shared-header.tsx` | Cabeçalho padrão Minerva com logo, título e código OS. |
| **SharedFooter** | `src/lib/pdf/components/shared-footer.tsx` | Rodapé com paginação e dados da empresa. |
| **TableComponents** | `src/lib/pdf/components/table-components.tsx` | Componentes de tabela: `Table`, `TableHeaderCell`, `TableCell`, `CategoryRow`, `SummaryRow`. |
| **Index** | `src/lib/pdf/components/index.ts` | Re-export de todos os componentes. |

### 🎛️ Componentes UI (Frontend)

| Componente | Caminho | Descrição |
|------------|---------|-----------|
| **PDFDownloadButton** | `src/components/pdf/pdf-download-button.tsx` | Botão reutilizável para gerar e baixar PDF. |
| **PDFPreviewModal** | `src/components/pdf/pdf-preview-modal.tsx` | Modal com preview e botões de download. |
| **TestandoPDF** | `src/routes/_auth/configuracoes/teste-pdf.tsx` | Página de testes dos 8 tipos de PDF. |

### 📂 Integrações por OS

| Componente | Caminho | Descrição |
|------------|---------|-----------|
| **OS 1-4 Proposta** | `src/components/os/obras/os-1-4/steps/step-gerar-proposta-os01-04.tsx` | Gera proposta comercial para obras. |
| **OS-07 Parecer** | `src/components/os/assessoria/os-7/pages/os07-analise-page.tsx` | Gera parecer de reforma. |
| **OS-08 Visita** | `src/components/os/assessoria/os-8/steps/step-gerar-documento.tsx` | Gera relatório de visita técnica. |
| **OS-11 Laudo** | `src/components/os/assessoria/os-11/steps/step-gerar-documento.tsx` | Gera laudo técnico pontual. |
| **Shared Proposta** | `src/components/os/shared/steps/step-gerar-proposta.tsx` | Componente genérico para propostas. |

### 📖 Documentação

| Documento | Caminho | Descrição |
|-----------|---------|-----------|
| **Este Arquivo** | `docs/pdf-system/MCP_PDF_SYSTEM.md` | ⭐ Ponto de entrada para IAs. |
| **Guia Rápido** | `docs/pdf-system/SISTEMA_PDF_GUIA_RAPIDO.md` | Visão geral e troubleshooting. |
| **Arquitetura** | `docs/pdf-system/ARQUITETURA.md` | Decisões de design e fluxos. |
| **API Reference** | `docs/pdf-system/API_REFERENCE.md` | Referência completa do hook e tipos. |
| **Guia Desenvolvedor** | `docs/pdf-system/GUIA_DESENVOLVEDOR.md` | Tutorial para adicionar novo PDF. |
| **Templates Guide** | `docs/pdf-system/TEMPLATES.md` | Como criar e customizar templates. |
| **Doc Técnica Completa** | `docs/pdf-system/PDF_GENERATION_SYSTEM.md` | Documentação técnica detalhada. |

---

## ✅ Status de Integração por OS

| OS | Nome | Template | Integrado | Componente |
|:--:|------|----------|:---------:|------------|
| 01-04 | Obras (Perícia/Revitalização/Reforço) | `proposta` | ✅ | `step-gerar-proposta-os01-04.tsx` |
| 05 | Assessoria Lead Mensal | `proposta-ass-anual` | ✅ | `step-gerar-proposta.tsx` |
| 06 | Assessoria Lead Avulsa | `proposta-ass-pontual` | ✅ | `step-gerar-proposta.tsx` |
| 07 | Aprovação de Reforma | `parecer-reforma` | ✅ | `os07-analise-page.tsx` |
| 08 | Visita Técnica / Parecer | `visita-tecnica` | ✅ | `step-gerar-documento.tsx` |
| 09 | Requisição de Compras | - | ❌ | Não necessita PDF |
| 10 | Requisição Mão de Obra | - | ❌ | Não necessita PDF |
| 11 | Laudo Pontual Assessoria | `proposta-ass-pontual` | ⚠️ | `step-gerar-documento.tsx` |
| 12 | Assessoria Anual (Contrato) | - | ❌ | Não necessita PDF |
| 13 | Start de Contrato de Obra | - | ❌ | Não necessita PDF |

**Legenda:** ✅ Completo | ⚠️ Usando template genérico | ❌ Não aplicável

---

## 🚀 Uso Rápido

### Importar e Usar o Hook

```typescript
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MeuComponente() {
  const { generating, generate, error } = usePDFGeneration();

  const handleGerar = async () => {
    const result = await generate('proposta', osId, {
      codigoOS: 'OS0100001',
      cliente: { nome: 'Cliente Exemplo', cpfCnpj: '123.456.789-00' },
      // ... dados específicos do template
    });

    if (result?.success) {
      console.log('PDF URL:', result.url);
      // URL assinada válida por 1 hora
    }
  };

  return (
    <Button onClick={handleGerar} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar PDF'}
    </Button>
  );
}
```

### Tipos de PDF Disponíveis

```typescript
type PDFType =
  | 'proposta'           // OS 1-4 - Proposta comercial completa
  | 'contrato'           // Geral - Contrato de prestação de serviços
  | 'memorial'           // OS 1-4 - Memorial descritivo
  | 'documento-sst'      // Geral - Documento SST
  | 'parecer-reforma'    // OS-07 - Parecer técnico reforma
  | 'visita-tecnica'     // OS-08 - Relatório visita técnica
  | 'proposta-ass-anual' // OS-05 - Proposta assessoria anual
  | 'proposta-ass-pontual'; // OS-06 - Proposta assessoria pontual
```

---

## 🏗️ Arquitetura (v2.0 Client-Side)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Componente React                                            │  │
│  │  └── usePDFGeneration() Hook                                │  │
│  │       ├── Seleciona Template (.tsx)                         │  │
│  │       ├── @react-pdf/renderer → Renderiza para Blob         │  │
│  │       └── pdf-uploader.ts → Upload Supabase Storage         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                    │                               │
│                                    ▼                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Resultado: { success, url, path, metadata }                 │  │
│  │  - url: Signed URL válida por 1 hora                        │  │
│  │  - path: Caminho no Storage para persistir no banco         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE                                      │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐  │
│  │  Storage         │  │  PostgreSQL                          │  │
│  │  Bucket: uploads │  │  Tabela: os_documentos               │  │
│  │  Path: os/{id}/  │  │  - os_id, tipo, caminho, tamanho     │  │
│  └──────────────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Como Adicionar Novo Tipo de PDF

### 1. Criar Template

```tsx
// src/lib/pdf/templates/meu-template.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { colors, fonts, commonStyles } from '../shared-styles';
import { SharedHeader, SharedFooter } from '../components';

export interface MeuTemplateData {
  codigoOS: string;
  // ... campos necessários
}

export default function MeuTemplate({ data }: { data: MeuTemplateData }) {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <SharedHeader 
          codigoOS={data.codigoOS} 
          documentTitle="MEU DOCUMENTO" 
        />
        
        <View style={commonStyles.body}>
          {/* Conteúdo do PDF */}
        </View>
        
        <SharedFooter />
      </Page>
    </Document>
  );
}
```

### 2. Registrar no Hook

```tsx
// src/lib/hooks/use-pdf-generation.tsx

// Adicionar import
import MeuTemplate from '@/lib/pdf/templates/meu-template';

// Adicionar case no switch
case 'meu-tipo':
  DocumentComponent = <MeuTemplate data={dados} />;
  break;
```

### 3. Atualizar Tipos

```typescript
// src/lib/types.ts
export type PDFType =
  | 'proposta'
  | /* ... outros ... */
  | 'meu-tipo'; // Adicionar aqui
```

---

## 🔧 Troubleshooting

### Erro: "ReferenceError: window is not defined"
- **Causa:** Tentativa de renderizar PDF no Server Component
- **Solução:** Use `usePDFGeneration` apenas em componentes client-side (`"use client"`)

### Erro: Estilos não aplicados
- **Causa:** React PDF não suporta herança CSS
- **Solução:** Passe estilos explicitamente via `style={[style1, style2]}`

### PDF em branco
- **Causa:** Valor `undefined` ou `null` dentro de `<Text>`
- **Solução:** Use fallback: `{valor || ''}`

### Imagens quebradas
- **Causa:** CORS em URLs externas
- **Solução:** Use imagens em Base64 de `assets.ts`

### Upload falha
- **Causa:** Bucket não existe ou RLS bloqueando
- **Solução:** Verificar bucket `uploads` e policies no Supabase

---

## 📊 Métricas e Performance

| Métrica | Valor Típico |
|---------|--------------|
| Tempo de geração | 500ms - 2s |
| Tamanho médio PDF | 50KB - 200KB |
| Validade URL assinada | 1 hora |
| Storage path | `os/{osId}/documentos/{tipo}/{timestamp}.pdf` |

---

## 📞 Referências Rápidas

- **Documentação @react-pdf/renderer:** https://react-pdf.org/
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **Design System:** `src/lib/pdf/shared-styles.ts`
- **Página de Testes:** `/configuracoes/teste-pdf` (requer auth)
