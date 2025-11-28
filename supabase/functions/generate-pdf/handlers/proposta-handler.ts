/**
 * Handler para geração de PDFs de Propostas Comerciais
 * Busca dados das etapas 7 (Memorial) e 8 (Precificação) do workflow OS 1-4
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PropostaTemplate, type PropostaData } from '../templates/proposta-template.tsx';
import { validatePropostaDataComplete, ValidationException } from '../utils/validation.ts';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handlePropostaGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // DEBUG: Log do osId recebido
    console.log('[Proposta Handler] Iniciando geração para osId:', osId);
    console.log('[Proposta Handler] Tipo de osId:', typeof osId);
    console.log('[Proposta Handler] osId é válido?:', osId && osId.length > 0);

    // 1. Buscar dados completos da OS do banco
    console.log('[Proposta Handler] Executando query para buscar OS...');

    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        descricao,
        valor_proposta,
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

    // DEBUG: Log detalhado do resultado
    console.log('[Proposta Handler] Resultado da query:', {
      encontrou: !!os,
      erro: osError,
      osData: os ? { id: os.id, codigo: os.codigo_os } : null
    });

    if (osError) {
      console.error('[Proposta Handler] Erro ao buscar OS:', osError);
      throw new Error(
        `Erro ao buscar OS do banco: ${osError.message || osError.code || JSON.stringify(osError)}`
      );
    }

    if (!os) {
      throw new Error(
        `OS com ID "${osId}" não foi encontrada no banco de dados. Verifique se o ID está correto e se a OS existe.`
      );
    }

    // 2. Buscar etapas específicas (7 = Memorial, 8 = Precificação)
    const { data: etapas, error: etapasError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .in('ordem', [7, 8])
      .order('ordem');

    if (etapasError) {
      throw new Error('Erro ao buscar etapas');
    }

    // Separar etapas
    const etapaMemorial = etapas?.find(e => e.ordem === 7);
    const etapaPrecificacao = etapas?.find(e => e.ordem === 8);

    if (!etapaMemorial?.dados_etapa?.etapasPrincipais) {
      throw new Error('Memorial descritivo não preenchido (Etapa 7)');
    }

    if (!etapaPrecificacao?.dados_etapa) {
      throw new Error('Precificação não preenchida (Etapa 8)');
    }

    // 3. Extrair dados do cliente (Supabase retorna array ou objeto dependendo da query)
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }
    const endereco = (clienteData.endereco as any) || {};

    // 4. Extrair dados do memorial (Etapa 7)
    const dadosMemorial = etapaMemorial.dados_etapa as any;
    const etapasPrincipais = dadosMemorial.etapasPrincipais || [];

    // 5. Extrair dados de precificação (Etapa 8)
    const dadosPrecificacao = etapaPrecificacao.dados_etapa as any;

    // 6. Extrair metadata
    const metadata = (os.metadata as any) || {};
    const cronograma = metadata.cronograma || {};
    const financeiro = metadata.financeiro || {};

    // 7. Montar PropostaData completo
    const propostaData: PropostaData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,
      objetivo: dadosMemorial.objetivo || os.descricao,
      tituloProposta: dadosMemorial.tituloProposta,

      // Cliente
      clienteNome: clienteData.nome_razao_social,
      clienteCpfCnpj: clienteData.cpf_cnpj,
      clienteEmail: clienteData.email,
      clienteTelefone: clienteData.telefone,
      clienteEndereco: endereco.logradouro,
      clienteBairro: endereco.bairro,
      clienteCidade: endereco.cidade,
      clienteEstado: endereco.estado,
      clienteResponsavel: undefined, // Campo não existe na tabela clientes
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
        precoFinal: os.valor_proposta || 0,
        percentualImposto: dadosPrecificacao.percentualImposto || financeiro.percentualImposto || 14,
        percentualEntrada: dadosPrecificacao.percentualEntrada || financeiro.percentualEntrada || 40,
        numeroParcelas: dadosPrecificacao.numeroParcelas || financeiro.numeroParcelas || 2,
        percentualLucro: dadosPrecificacao.percentualLucro,
        percentualImprevisto: dadosPrecificacao.percentualImprevisto,
      },

      // Garantias (usar padrão se não fornecido)
      garantias: metadata.garantias,

      // Dados da Empresa (hardcoded)
      empresaNome: 'MINERVA',
      empresaEndereco: 'Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01',
      empresaTelefone: '(98) 98226-7909 / (98) 98151-3355',
      empresaEmail: 'contato@minerva-eng.com.br',
      empresaSite: 'www.minerva-eng.com.br',
    };

    // 8. Validar dados antes de renderizar
    console.log('[Proposta Handler] Validando dados da proposta...');
    console.log('[Proposta Handler] Dados a validar:', {
      codigoOS: propostaData.codigoOS,
      clienteNome: propostaData.clienteNome,
      clienteCpfCnpj: propostaData.clienteCpfCnpj,
      objetivo: propostaData.objetivo,
      temEtapas: !!propostaData.dadosCronograma?.etapasPrincipais?.length,
      qtdEtapas: propostaData.dadosCronograma?.etapasPrincipais?.length,
      precoFinal: propostaData.dadosFinanceiros?.precoFinal
    });

    try {
      validatePropostaDataComplete(propostaData);
      console.log('[Proposta Handler] ✅ Validação passou!');
    } catch (validationError) {
      console.error('[Proposta Handler] ❌ Validação falhou:', validationError);
      throw validationError;
    }

    // 9. Renderizar template
    const doc = React.createElement(PropostaTemplate, { data: propostaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 10. Upload para Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'proposta',
      {
        codigoOS: propostaData.codigoOS,
        clienteNome: propostaData.clienteNome,
        valorProposta: propostaData.dadosFinanceiros.precoFinal,
        dataEmissao: propostaData.dataEmissao
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'proposta'
      }
    };
  } catch (error) {
    console.error('Error generating proposta PDF:', error);

    // Se for ValidationException, incluir detalhes dos erros
    if (error instanceof ValidationException) {
      const errorDetails = error.errors
        .map(e => `${e.field}: ${e.message}`)
        .join('; ');

      return {
        success: false,
        error: `Validation failed: ${errorDetails}`
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar proposta'
    };
  }
}
