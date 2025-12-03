/**
 * Handler para geração de PDFs de Propostas de Assessoria Recorrente Anual (OS 12)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PropostaAssAnualTemplate, type PropostaAssAnualData } from '../templates/proposta-ass-anual.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handlePropostaAssAnualGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Assessoria Anual Handler] Iniciando geração de PDF...');
    console.log('[Assessoria Anual Handler] osId:', osId);
    console.log('[Assessoria Anual Handler] dados recebidos:', JSON.stringify(dados, null, 2));

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

    // 3. Montar dados para o template
    const propostaData: PropostaAssAnualData = {
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

      // Escopo do Serviço
      escopoServico: (dados.escopoServico as string) ||
        'Assessoria técnica recorrente mensal para acompanhamento e suporte em questões de engenharia.',

      // SLA
      prazoResposta: (dados.prazoResposta as string) || '24 horas',
      frequenciaVisita: (dados.frequenciaVisita as string) || 'Mensal',
      visitasMes: (dados.visitasMes as number) || 4,

      // Investimento
      valorMensal: (dados.valorMensal as string | number) || 0,
      valorAnual: (dados.valorAnual as string | number) || undefined,

      // Pagamento
      formasPagamento: (dados.formasPagamento as string[]) || ['Boleto', 'PIX'],
    };

    console.log('[Assessoria Anual Handler] Dados preparados para template');

    // 4. Renderizar template
    const doc = React.createElement(PropostaAssAnualTemplate, { data: propostaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 5. Upload para Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      pdfBuffer,
      `propostas/proposta-ass-anual-${os.codigo_os}-${Date.now()}.pdf`
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Erro ao fazer upload do PDF');
    }

    console.log('[Assessoria Anual Handler] ✅ PDF gerado com sucesso');

    return {
      success: true,
      url: uploadResult.url,
      error: null,
      metadata: {
        tipoDocumento: 'proposta-ass-anual',
        osId: os.id,
        codigoOS: os.codigo_os,
        dataGeração: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('[Assessoria Anual Handler] ❌ Erro:', error);
    return {
      success: false,
      url: null,
      error: error.message || 'Erro desconhecido ao gerar PDF',
      metadata: null,
    };
  }
}
