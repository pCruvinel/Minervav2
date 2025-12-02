# 🚀 Deploy Manual da Edge Function - Correção de Proposta

## ❗ O QUE ACONTECEU

A geração de proposta na Etapa 9 estava falhando com erro 500:
```
clienteCpfCnpj: CNPJ inválido
dadosFinanceiros.precoFinal: Valor da proposta deve ser maior que zero
```

## ✅ O QUE FOI CORRIGIDO

### 1. Frontend (✅ Já aplicado)
- CNPJ agora é enviado SEM máscara
- Estrutura `dadosFinanceiros` completa
- Logs detalhados adicionados

### 2. Edge Function (⚠️ PRECISA DEPLOY MANUAL)
Arquivo: `supabase/functions/generate-pdf/handlers/proposta-handler.ts`

**Mudança:** Ler dados corretamente do parâmetro `dados`:

```typescript
// ❌ ANTES - Tentava ler de parâmetro que não existia
clienteCpfCnpj: dadosDoFrontend?.clienteCpfCnpj || clienteData.cpf_cnpj,
precoFinal: dadosDoFrontend?.valorProposta || parseFloat(dadosPrecificacao.precoFinal),

// ✅ DEPOIS - Lê corretamente de 'dados'
clienteCpfCnpj: (dados.clienteCpfCnpj as string) || clienteData.cpf_cnpj,
precoFinal: (dados.dadosFinanceiros as any)?.precoFinal ? 
  parseFloat((dados.dadosFinanceiros as any).precoFinal) : 
  (parseFloat(dadosPrecificacao.precoFinal) || os.valor_proposta || 0),
```

---

## 📋 COMO FAZER O DEPLOY MANUAL

### Opção 1: Via Supabase Dashboard (Mais Fácil)

1. **Acesse:** https://supabase.com/dashboard/project/mxcqutdbbhilqnqeelqi/functions

2. **Clique** na function `generate-pdf`

3. **Clique** em "Edit Function"

4. **Navegue** até o arquivo `handlers/proposta-handler.ts`

5. **Substitua as linhas 14-23** por:
```typescript
export async function handlePropostaGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // DEBUG: Log do osId e dados recebidos
    console.log('[Proposta Handler] ======== INÍCIO ========');
    console.log('[Proposta Handler] osId:', osId);
    console.log('[Proposta Handler] dados recebidos:', JSON.stringify(dados, null, 2));
    console.log('[Proposta Handler] dados.clienteCpfCnpj:', dados.clienteCpfCnpj);
    console.log('[Proposta Handler] dados.dadosFinanceiros:', dados.dadosFinanceiros);
    console.log('[Proposta Handler] ==============================');
```

6. **Substitua as linhas 112-151** por:
```typescript
    // 7. Montar PropostaData completo
    const propostaData: PropostaData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,
      objetivo: dadosMemorial.objetivo || os.descricao,
      tituloProposta: dadosMemorial.tituloProposta,

      // Cliente
      clienteNome: clienteData.nome_razao_social,
      // ✅ FIX: Usar dados do parâmetro 'dados' que vem do frontend
      clienteCpfCnpj: (dados.clienteCpfCnpj as string) || clienteData.cpf_cnpj,
      clienteEmail: clienteData.email,
      clienteTelefone: clienteData.telefone,
      clienteEndereco: endereco.logradouro,
      clienteBairro: endereco.bairro,
      clienteCidade: endereco.cidade,
      clienteEstado: endereco.estado,
      clienteResponsavel: undefined,
      quantidadeUnidades: parseInt(endereco.qtd_unidades || '0') || undefined,
      quantidadeBlocos: parseInt(endereco.qtd_blocos || '0') || undefined,

      // Cronograma
      dadosCronograma: {
        preparacaoArea: dadosMemorial.preparacaoArea || cronograma.preparacaoArea || 0,
        planejamentoInicial: dadosMemorial.planejamentoInicial || cronograma.planejamentoInicial || 0,
        logisticaTransporte: dadosMemorial.logisticaTransporte || cronograma.logisticaTransporte || 0,
        etapasPrincipais: etapasPrincipais
      },

      // Financeiro
      dadosFinanceiros: {
        // ✅ FIX: Ler de dados.dadosFinanceiros que vem do frontend
        precoFinal: (dados.dadosFinanceiros as any)?.precoFinal ? 
          parseFloat((dados.dadosFinanceiros as any).precoFinal) : 
          (parseFloat(dadosPrecificacao.precoFinal) || os.valor_proposta || 0),
        percentualImposto: (dados.dadosFinanceiros as any)?.percentualImposto || 
          dadosPrecificacao.percentualImposto || financeiro.percentualImposto || 14,
        percentualEntrada: (dados.dadosFinanceiros as any)?.percentualEntrada || 
          dadosPrecificacao.percentualEntrada || financeiro.percentualEntrada || 40,
        numeroParcelas: (dados.dadosFinanceiros as any)?.numeroParcelas || 
          dadosPrecificacao.numeroParcelas || financeiro.numeroParcelas || 2,
        percentualLucro: (dados.dadosFinanceiros as any)?.percentualLucro || 
          dadosPrecificacao.percentualLucro,
        percentualImprevisto: (dados.dadosFinanceiros as any)?.percentualImprevisto || 
          dadosPrecificacao.percentualImprevisto,
      },

      // Garantias
      garantias: metadata.garantias,

      // Dados da Empresa
      empresaNome: 'MINERVA',
      empresaEndereco: 'Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01',
      empresaTelefone: '(98) 98226-7909 / (98) 98151-3355',
      empresaEmail: 'contato@minerva-eng.com.br',
      empresaSite: 'www.minerva-eng.com.br',
    };
```

7. **Clique** em "Deploy" ou "Save"

8. **Aguarde** o deploy completar (geralmente 30-60 segundos)

---

### Opção 2: Via CLI (Se você tiver permissões de admin)

1. **Login no Supabase:**
```bash
npx supabase login
```

2. **Link ao projeto:**
```bash
npx supabase link --project-ref mxcqutdbbhilqnqeelqi
```

3. **Deploy:**
```bash
npx supabase functions deploy generate-pdf
```

---

## ✅ TESTE APÓS O DEPLOY

1. **Volte para a aplicação** (localhost:3000)
2. **Navegue até Etapa 9**
3. **Clique em "Gerar Proposta Comercial"**
4. **Verifique o console** - deve mostrar:
   ```
   [Step 9] ======== PAYLOAD COMPLETO ========
   [Proposta Handler] ======== INÍCIO ========
   [Proposta Handler] dados recebidos: {
     "clienteCpfCnpj": "12345678000190",
     "dadosFinanceiros": {
       "precoFinal": "15000.00",
       ...
     }
   }
   ```

5. **Sucesso esperado:** PDF gerado sem erros!

---

## 🔍 SE AINDA DER ERRO

Verifique no console:

**Se CNPJ continuar inválido:**
- Verifique se tem 14 dígitos sem máscara
- Exemplo válido: "12345678000190"

**Se precoFinal continuar zerado:**
- Verifique se preencheu a Etapa 7 (Memorial) com valores
- Verifique se preencheu a Etapa 8 (Precificação)
- Verifique se `valorTotal` calculado > 0

**Se precisar de ajuda:**
- Me envie os logs completos do console
- Especialmente as linhas com "PAYLOAD COMPLETO"

---

## 📚 ARQUIVOS MODIFICADOS

### Frontend (Já em produção via hot-reload)
1. ✅ `src/components/os/os-details-workflow-page.tsx`
2. ✅ `src/components/os/steps/shared/step-followup-1.tsx`
3. ✅ `src/components/os/steps/shared/step-gerar-proposta-os01-04.tsx`
4. ✅ `src/components/ui/file-upload-unificado.tsx`

### Backend (Precisa deploy manual)
5. ⚠️ `supabase/functions/generate-pdf/handlers/proposta-handler.ts`

---

**Data:** 2025-12-02  
**Status:** ⚠️ Aguardando deploy manual da Edge Function