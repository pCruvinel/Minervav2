/**
 * Handler para geração de PDFs de Propostas de Assessoria Anual (OS 05)
 * 
 * Busca dados das etapas de escopo (4) e precificação (5) do workflow OS 5-6
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { 
  PropostaAssAnualTemplate, 
  type PropostaAssAnualData,
  type EspecificacaoTecnica,
  type DadosPrazoAnual,
  type DadosPrecificacao,
  type DadosPagamento,
} from '../templates/proposta-ass-anual.tsx';
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

    console.log('[Assessoria Anual Handler] OS encontrada:', os.codigo_os);

    // 2. Buscar etapas específicas (4 = Escopo, 5 = Precificação)
    const { data: etapas, error: etapasError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .in('ordem', [4, 5])
      .order('ordem');

    if (etapasError) {
      console.error('[Assessoria Anual Handler] Erro ao buscar etapas:', etapasError);
    }

    // Separar etapas
    const etapaEscopo = etapas?.find(e => e.ordem === 4);
    const etapaPrecificacao = etapas?.find(e => e.ordem === 5);

    // 3. Extrair dados das etapas
    const dadosEscopo = (etapaEscopo?.dados_etapa as any) || {};
    const dadosPrecificacao = (etapaPrecificacao?.dados_etapa as any) || {};

    console.log('[Assessoria Anual Handler] Dados escopo:', dadosEscopo);
    console.log('[Assessoria Anual Handler] Dados precificação:', dadosPrecificacao);

    // 4. Extrair dados do cliente
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }

    // Extrair endereço
    const endereco = clienteData.endereco || {};

    // 5. Processar especificações técnicas
    const especificacoes = dadosEscopo.especificacoesTecnicas || dados.especificacoesTecnicas || [];
    const especificacoesTecnicas: EspecificacaoTecnica[] = especificacoes.map((e: any) => ({
      descricao: e.descricao || e,
    }));

    // 6. Processar prazo (formato diferente do pontual - horário de funcionamento)
    const prazoFromEscopo = dadosEscopo.prazo || {};
    const prazo: DadosPrazoAnual = {
      horarioFuncionamento: (dados.horarioFuncionamento as string) || 
        prazoFromEscopo.horarioFuncionamento || 
        'Segunda a sexta de 8h às 18h',
      suporteEmergencial: (dados.suporteEmergencial as string) || 
        prazoFromEscopo.suporteEmergencial || 
        'Suporte técnico emergencial - atuação máxima de 2h',
    };

    // 7. Processar precificação
    // Tentar extrair custoBase do step ou dos dados diretos
    const custoBaseStr = dadosPrecificacao.custoBase || dados.custoBase || '0';
    const custoBase = typeof custoBaseStr === 'string' 
      ? parseFloat(custoBaseStr.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
      : custoBaseStr;

    const precificacao: DadosPrecificacao = {
      valorParcial: custoBase,
      percentualImposto: parseFloat(dadosPrecificacao.percentualImposto || dados.percentualImposto || '14') || 14,
    };

    // 8. Processar pagamento
    const pagamento: DadosPagamento = {
      percentualDesconto: parseFloat(dadosPrecificacao.percentualDesconto || dados.percentualDesconto || '3') || 3,
      diaVencimento: parseInt(dadosPrecificacao.diaVencimento || dados.diaVencimento || '5') || 5,
    };

    // 9. Montar dados completos para o template
    const propostaData: PropostaAssAnualData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,

      // Cliente
      clienteNome: clienteData.nome_razao_social,
      clienteCpfCnpj: (dados.clienteCpfCnpj as string) || clienteData.cpf_cnpj || '',
      clienteEmail: clienteData.email,
      clienteTelefone: clienteData.telefone,
      clienteEndereco: endereco.logradouro || endereco.rua || '',
      clienteBairro: endereco.bairro || '',
      clienteCidade: endereco.cidade || 'São Luís',
      clienteEstado: endereco.estado || 'MA',
      clienteResponsavel: (dados.clienteResponsavel as string) || '',

      // Dados de Quantitativos (Imagem OS 05)
      quantidadeUnidades: Number(dados.quantidadeUnidades) || 0,
      quantidadeBlocos: Number(dados.quantidadeBlocos) || 0,

      // Conteúdo
      objetivo: (dados.objetivo as string) || dadosEscopo.objetivo || os.descricao || '',
      especificacoesTecnicas,
      metodologia: (dados.metodologia as string) || dadosEscopo.metodologia || '',
      prazo,
      garantia: (dados.garantia as string) || dadosEscopo.garantia || '',
      precificacao,
      pagamento,
    };

    console.log('[Assessoria Anual Handler] Dados preparados:', {
      codigoOS: propostaData.codigoOS,
      clienteNome: propostaData.clienteNome,
      qtdEspecificacoes: propostaData.especificacoesTecnicas.length,
      valorParcial: propostaData.precificacao.valorParcial,
    });

    // 10. Validar dados mínimos
    if (!propostaData.objetivo) {
      throw new Error('Objetivo da proposta não definido');
    }
    if (propostaData.especificacoesTecnicas.length === 0) {
      throw new Error('Nenhuma especificação técnica definida');
    }
    if (propostaData.precificacao.valorParcial <= 0) {
      throw new Error('Valor da proposta deve ser maior que zero');
    }

    // 11. Renderizar template
    console.log('[Assessoria Anual Handler] Renderizando template...');
    const doc = React.createElement(PropostaAssAnualTemplate, { data: propostaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 12. Upload para Storage
    console.log('[Assessoria Anual Handler] Fazendo upload...');
    const uploadResult = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'proposta-ass-anual',
      {
        codigoOS: propostaData.codigoOS,
        clienteNome: propostaData.clienteNome,
        valorProposta: propostaData.precificacao.valorParcial,
        dataEmissao: propostaData.dataEmissao,
      }
    );

    console.log('[Assessoria Anual Handler] ✅ PDF gerado com sucesso');

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'proposta-ass-anual',
      },
    };
  } catch (error: any) {
    console.error('[Assessoria Anual Handler] ❌ Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao gerar PDF',
    };
  }
}
