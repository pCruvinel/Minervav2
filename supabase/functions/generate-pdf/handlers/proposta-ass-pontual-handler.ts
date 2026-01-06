/**
 * Handler para geração de PDFs de Propostas de Assessoria Pontual (OS 06)
 *
 * Busca dados das etapas de escopo e precificação do workflow OS 5-6
 * para montar a proposta completa.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import {
  PropostaAssPontualTemplate,
  type PropostaAssPontualData,
  type EspecificacaoTecnica,
  type DadosPrazo,
  type DadosPrecificacao,
  type DadosPagamento,
} from '../templates/proposta-ass-pontual.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handlePropostaAssPontualGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Assessoria Pontual Handler] ======== INÍCIO ========');
    console.log('[Assessoria Pontual Handler] osId:', osId);
    console.log('[Assessoria Pontual Handler] dados recebidos:', JSON.stringify(dados, null, 2));

    // 1. Buscar dados da OS
    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        descricao,
        data_entrada,
        valor_proposta,
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

    // 2. Buscar etapas relevantes (Escopo = ordem 3, Precificação = ordem 4)
    const { data: etapas, error: etapasError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .in('ordem', [3, 4])
      .order('ordem');

    if (etapasError) {
      console.warn('[Assessoria Pontual Handler] Aviso ao buscar etapas:', etapasError);
    }

    // Separar etapas
    const etapaEscopo = etapas?.find(e => e.ordem === 3);
    const etapaPrecificacao = etapas?.find(e => e.ordem === 4);

    // 3. Extrair dados do cliente
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }
    const endereco = (clienteData.endereco as any) || {};

    // 4. Extrair dados do escopo (da etapa ou dos dados recebidos)
    const dadosEscopo = (etapaEscopo?.dados_etapa as any) || {};

    // Especificações Técnicas
    let especificacoesTecnicas: EspecificacaoTecnica[] = [];
    if (dados.especificacoesTecnicas && Array.isArray(dados.especificacoesTecnicas)) {
      especificacoesTecnicas = dados.especificacoesTecnicas as EspecificacaoTecnica[];
    } else if (dadosEscopo.especificacoesTecnicas && Array.isArray(dadosEscopo.especificacoesTecnicas)) {
      especificacoesTecnicas = dadosEscopo.especificacoesTecnicas;
    } else {
      // Fallback: especificações padrão
      especificacoesTecnicas = [
        { descricao: 'Recebimento do condomínio (conciliar itens normativos e de projeto)' },
        { descricao: 'Consultoria técnica de engenharia' },
        { descricao: 'Vistorias, laudos e inspeções periódicas' },
        { descricao: 'Elaborar pareceres técnicos' },
        { descricao: 'Laudo de vistoria geral do condomínio (situação)' },
        { descricao: 'Responsabilidade técnica' },
      ];
    }

    // Prazo
    const prazoFromData = dados.prazo as any;
    const prazoFromEscopo = dadosEscopo.prazo as any;
    const prazo: DadosPrazo = {
      planejamentoInicial: prazoFromData?.planejamentoInicial || prazoFromEscopo?.planejamentoInicial || 2,
      logisticaTransporte: prazoFromData?.logisticaTransporte || prazoFromEscopo?.logisticaTransporte || 1,
      levantamentoCampo: prazoFromData?.levantamentoCampo || prazoFromEscopo?.levantamentoCampo || 3,
      composicaoLaudo: prazoFromData?.composicaoLaudo || prazoFromEscopo?.composicaoLaudo || 5,
      apresentacaoCliente: prazoFromData?.apresentacaoCliente || prazoFromEscopo?.apresentacaoCliente || 1,
    };

    // 5. Extrair dados de precificação
    const dadosPrecificacao = (etapaPrecificacao?.dados_etapa as any) || {};
    const precificacaoFromData = dados.precificacao as any;

    const precificacao: DadosPrecificacao = {
      valorParcial: precificacaoFromData?.valorParcial ||
        dadosPrecificacao.valorParcial ||
        parseFloat(dadosPrecificacao.precoFinal) ||
        os.valor_proposta ||
        0,
      percentualImposto: precificacaoFromData?.percentualImposto ||
        dadosPrecificacao.percentualImposto ||
        14, // 14% padrão
    };

    // 6. Extrair dados de pagamento
    const pagamentoFromData = dados.pagamento as any;

    const pagamento: DadosPagamento = {
      percentualEntrada: pagamentoFromData?.percentualEntrada ||
        dadosPrecificacao.percentualEntrada ||
        40,
      numeroParcelas: pagamentoFromData?.numeroParcelas ||
        dadosPrecificacao.numeroParcelas ||
        2,
      percentualDesconto: pagamentoFromData?.percentualDesconto ||
        dadosPrecificacao.percentualDesconto ||
        3, // 3% desconto padrão
    };

    // 7. Montar dados completos para o template
    const propostaData: PropostaAssPontualData = {
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

      // Dados Quantitativos
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

    console.log('[Assessoria Pontual Handler] Dados preparados:', {
      codigoOS: propostaData.codigoOS,
      clienteNome: propostaData.clienteNome,
      qtdUnidades: propostaData.quantidadeUnidades,
      prazoTotal: Object.values(propostaData.prazo).reduce((a, b) => a + b, 0),
      valorParcial: propostaData.precificacao.valorParcial,
    });

    // 8. Validar dados mínimos
    if (!propostaData.objetivo) {
      throw new Error('Objetivo da proposta não definido');
    }
    if (propostaData.especificacoesTecnicas.length === 0) {
      throw new Error('Nenhuma especificação técnica definida');
    }
    if (propostaData.precificacao.valorParcial <= 0) {
      throw new Error('Valor da proposta deve ser maior que zero');
    }

    // 9. Renderizar template
    console.log('[Assessoria Pontual Handler] Renderizando template...');
    const doc = React.createElement(PropostaAssPontualTemplate, { data: propostaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 10. Upload para Storage
    console.log('[Assessoria Pontual Handler] Fazendo upload...');
    const uploadResult = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'proposta-ass-pontual',
      {
        codigoOS: propostaData.codigoOS,
        clienteNome: propostaData.clienteNome,
        valorProposta: propostaData.precificacao.valorParcial,
        dataEmissao: propostaData.dataEmissao,
      }
    );

    console.log('[Assessoria Pontual Handler] ✅ PDF gerado com sucesso');

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'proposta-ass-pontual',
      },
    };
  } catch (error: any) {
    console.error('[Assessoria Pontual Handler] ❌ Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao gerar PDF',
    };
  }
}
