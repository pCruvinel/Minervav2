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
    // DEBUG: Log do osId e dados recebidos
    console.log('[Proposta Handler] ======== INÍCIO ========');
    console.log('[Proposta Handler] osId:', osId);
    console.log('[Proposta Handler] dados recebidos:', JSON.stringify(dados, null, 2));
    console.log('[Proposta Handler] dados.clienteCpfCnpj:', dados.clienteCpfCnpj);
    console.log('[Proposta Handler] dados.dadosFinanceiros:', dados.dadosFinanceiros);
    console.log('[Proposta Handler] ==============================');

    // 1. Buscar dados completos da OS do banco
    console.log('[Proposta Handler] Executando query para buscar OS...');

    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        descricao,
        tipo_os_id,
        valor_proposta,
        data_entrada,
        metadata,
        cliente:clientes (
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco,
          nome_responsavel
        ),
        tipo_os:tipos_os (
          codigo,
          nome
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

    // 2. Buscar etapas específicas (1 = Lead, 7 = Memorial, 8 = Precificação)
    const { data: etapas, error: etapasError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .in('ordem', [1, 7, 8])
      .order('ordem');

    if (etapasError) {
      throw new Error('Erro ao buscar etapas');
    }

    // Separar etapas
    const etapaLead = etapas?.find(e => e.ordem === 1);
    const etapaMemorial = etapas?.find(e => e.ordem === 7);
    const etapaPrecificacao = etapas?.find(e => e.ordem === 8);
    
    // Dados da etapa 1 (Lead) - contém informações adicionais do cliente
    const dadosLead = (etapaLead?.dados_etapa as any) || {};

    // Verificação de dados: Aceitar se vier do DB ou do Frontend (dados)
    const temDadosMemorialFrontend = !!(dados.dadosCronograma as any)?.etapasPrincipais;
    const temDadosMemorialDB = !!etapaMemorial?.dados_etapa?.etapasPrincipais;
    
    if (!temDadosMemorialFrontend && !temDadosMemorialDB) {
      throw new Error('Memorial descritivo não preenchido (Etapa 7). Preencha os dados na interface.');
    }

    const temDadosPrecificacaoFrontend = !!(dados.dadosFinanceiros as any)?.precoFinal;
    const temDadosPrecificacaoDB = !!etapaPrecificacao?.dados_etapa;

    if (!temDadosPrecificacaoFrontend && !temDadosPrecificacaoDB) {
      throw new Error('Precificação não preenchida (Etapa 8). Preencha os dados na interface.');
    }

    // 3. Extrair dados do cliente (Supabase retorna array ou objeto dependendo da query)
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }
    const endereco = (clienteData.endereco as any) || {};

    // 4. Extrair dados do memorial (Etapa 7) - Fallback seguro
    const dadosMemorial = (etapaMemorial?.dados_etapa as any) || {};
    const etapasPrincipais = dadosMemorial.etapasPrincipais || [];

    // 5. Extrair dados de precificação (Etapa 8) - Fallback seguro
    const dadosPrecificacao = (etapaPrecificacao?.dados_etapa as any) || {};

    // 6. Extrair metadata
    const metadata = (os.metadata as any) || {};
    const cronograma = metadata.cronograma || {};
    const financeiro = metadata.financeiro || {};

    // 7. Gerar título baseado no tipo da OS
    const TITULOS_OS: Record<string, string> = {
      'OS-01': 'PERÍCIA DE FACHADA',
      'OS-02': 'REVITALIZAÇÃO DE FACHADA',
      'OS-03': 'REFORÇO ESTRUTURAL',
      'OS-04': 'SERVIÇOS DE OBRAS',
    };
    // Extrair codigo do tipo_os (resultado do JOIN pode ser array ou objeto)
    const tipoOSData = Array.isArray(os.tipo_os) ? os.tipo_os[0] : os.tipo_os;
    const codigoTipo = tipoOSData?.codigo || '';
    const nomeTipo = tipoOSData?.nome || '';
    const tituloAutoGerado = TITULOS_OS[codigoTipo] || nomeTipo?.toUpperCase() || os.descricao?.toUpperCase() || 'PROPOSTA COMERCIAL';

    // 8. Montar PropostaData completo
    const propostaData: PropostaData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,
      objetivo: dadosMemorial.objetivo || os.descricao,
      tituloProposta: tituloAutoGerado,

      // Cliente - usa dados da etapa 1 (dadosLead) como fallback para dados do cliente
      // Cliente - priorizar dados enviados pelo frontend
      clienteNome: (dados.clienteNome as string) || clienteData.nome_razao_social || dadosLead.nome || '',
      clienteCpfCnpj: (dados.clienteCpfCnpj as string) || clienteData.cpf_cnpj || dadosLead.cpfCnpj || '',
      clienteEmail: (dados.clienteEmail as string) || clienteData.email || dadosLead.email || '',
      clienteTelefone: (dados.clienteTelefone as string) || clienteData.telefone || dadosLead.telefone || '',
      clienteEndereco: (dados.clienteEndereco as string) || endereco.logradouro || endereco.rua || dadosLead.endereco || '',
      clienteBairro: (dados.clienteBairro as string) || endereco.bairro || dadosLead.bairro || '',
      clienteCidade: (dados.clienteCidade as string) || endereco.cidade || dadosLead.cidade || '',
      clienteEstado: (dados.clienteEstado as string) || endereco.estado || dadosLead.estado || '',
      clienteResponsavel: (dados.clienteResponsavel as string) || clienteData.nome_responsavel || dadosLead.nomeResponsavel || endereco.cargo_responsavel || '',
      quantidadeUnidades: parseInt((dados.quantidadeUnidades as string) || endereco.qtd_unidades || dadosLead.qtdUnidades || '0') || undefined,
      quantidadeBlocos: parseInt((dados.quantidadeBlocos as string) || endereco.qtd_blocos || dadosLead.qtdBlocos || '0') || undefined,

      // Cronograma
      dadosCronograma: (dados.dadosCronograma as any) || {
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
