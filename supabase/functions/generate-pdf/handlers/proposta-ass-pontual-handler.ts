/**
 * Handler para geração de PDFs de Propostas de Laudo Pontual (OS 11)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PropostaAssPontualTemplate, type PropostaAssPontualData, type Entregavel } from '../templates/proposta-ass-pontual.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handlePropostaAssPontualGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Laudo Pontual Handler] Iniciando geração de PDF...');
    console.log('[Laudo Pontual Handler] osId:', osId);
    console.log('[Laudo Pontual Handler] dados recebidos:', JSON.stringify(dados, null, 2));

    // 1. Buscar dados da OS
    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        descricao,
        data_entrada,
        metadata,
        cliente:clientes (
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco
        )
      `)
      .eq('id', osId)
      .single();

    if (osError || !os) {
      throw new Error(
        `Erro ao buscar OS: ${osError?.message || 'OS não encontrada'}`
      );
    }

    // 2. Extrair dados do cliente
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }

    // 3. Entregáveis padrão
    const entregaveisDefault: Entregavel[] = [
      { nome: 'Laudo Técnico Completo', prazo: '10 dias úteis' },
      { nome: 'ART / RRT', prazo: '3 dias após laudo' },
      { nome: 'Fotos Técnicas', prazo: 'Junto com laudo' },
      { nome: 'Recomendações Técnicas', prazo: 'Incluído no laudo' },
    ];

    // 4. Montar dados para o template
    const propostaData: PropostaAssPontualData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,

      // Cliente
      clienteNome: clienteData.nome_razao_social,
      clienteCpfCnpj: (dados.clienteCpfCnpj as string) || clienteData.cpf_cnpj,
      clienteEmail: clienteData.email,
      clienteTelefone: clienteData.telefone,
      clienteEndereco: clienteData.endereco?.logradouro,
      clienteResponsavel: (dados.clienteResponsavel as string) || undefined,

      // Escopo Técnico
      objetoAvaliacao: (dados.objetoAvaliacao as string) ||
        'Avaliação técnica da edificação conforme normas NBR vigentes.',
      metodologia: (dados.metodologia as string) ||
        'Inspeção visual, medições, testes não-destrutivos quando aplicável, e análise técnica.',

      // Entregáveis
      entregaveis: (dados.entregaveis as Entregavel[]) || entregaveisDefault,

      // Prazo
      prazoDias: (dados.prazoDias as number) || 10,

      // Investimento
      valorTotal: (dados.valorTotal as string | number) || 0,

      // Pagamento
      percentualEntrada: (dados.percentualEntrada as number) || 40,
      percentualEntrega: (dados.percentualEntrega as number) || 60,
    };

    console.log('[Laudo Pontual Handler] Dados preparados para template');

    // 5. Renderizar template
    const doc = React.createElement(PropostaAssPontualTemplate, { data: propostaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 6. Upload para Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      pdfBuffer,
      `propostas/proposta-ass-pontual-${os.codigo_os}-${Date.now()}.pdf`
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Erro ao fazer upload do PDF');
    }

    console.log('[Laudo Pontual Handler] ✅ PDF gerado com sucesso');

    return {
      success: true,
      url: uploadResult.url,
      error: null,
      metadata: {
        tipoDocumento: 'proposta-ass-pontual',
        osId: os.id,
        codigoOS: os.codigo_os,
        dataGeração: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('[Laudo Pontual Handler] ❌ Erro:', error);
    return {
      success: false,
      url: null,
      error: error.message || 'Erro desconhecido ao gerar PDF',
      metadata: null,
    };
  }
}
