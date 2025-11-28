/**
 * Handler para geração de PDFs de Pareceres de Reforma (OS 07)
 * Busca dados do formulário público e análise do engenheiro
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ParecerReformaTemplate, type ParecerReformaData } from '../templates/parecer-reforma-template.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleParecerReformaGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Parecer Reforma Handler] Iniciando geração para osId:', osId);

    // 1. Buscar dados completos da OS do banco
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

    if (osError) {
      console.error('[Parecer Reforma Handler] Erro ao buscar OS:', osError);
      throw new Error(
        `Erro ao buscar OS do banco: ${osError.message || osError.code || JSON.stringify(osError)}`
      );
    }

    if (!os) {
      throw new Error(
        `OS com ID "${osId}" não foi encontrada no banco de dados.`
      );
    }

    // 2. Buscar dados do formulário público (Etapa OS 07)
    const { data: etapaFormulario, error: etapaError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .eq('ordem', 7)
      .single();

    if (etapaError || !etapaFormulario) {
      throw new Error('Formulário de reforma não preenchido');
    }

    const dadosFormulario = etapaFormulario.dados_etapa as any;

    if (!dadosFormulario.alteracoes || dadosFormulario.alteracoes.length === 0) {
      throw new Error('Formulário de reforma incompleto - sem alterações propostas');
    }

    // 3. Buscar dados da análise do engenheiro (pode estar em metadata ou outra etapa)
    const analise = (os.metadata as any)?.analise || {
      aprovado: false,
      comentario: 'Análise pendente',
      dataAnalise: new Date().toISOString(),
      analista: 'Sistema'
    };

    // 4. Extrair dados do cliente
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }
    const endereco = (clienteData.endereco as any) || {};

    // 5. Montar ParecerReformaData completo
    const parecerData: ParecerReformaData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,

      // Cliente
      clienteNome: clienteData.nome_razao_social,
      clienteCpfCnpj: clienteData.cpf_cnpj,
      condominio: dadosFormulario.condominio || endereco.condominio || '',
      bloco: dadosFormulario.bloco,
      unidade: dadosFormulario.unidade,

      // Solicitante
      solicitacao: {
        nomeSolicitante: dadosFormulario.nomeSolicitante || '',
        contato: dadosFormulario.contato || clienteData.telefone || '',
        email: dadosFormulario.email || clienteData.email || ''
      },

      // Alterações propostas
      alteracoes: dadosFormulario.alteracoes || [],

      // Executores
      executores: dadosFormulario.executores || [],

      // Plano de descarte
      planoDescarte: dadosFormulario.planoDescarte || '',

      // Tipos de obra
      tiposObra: dadosFormulario.tiposObra || [],
      precisaART: dadosFormulario.precisaART || false,

      // Análise do engenheiro
      analise: {
        aprovado: analise.aprovado || false,
        comentario: analise.comentario || '',
        dataAnalise: analise.dataAnalise || new Date().toISOString(),
        analista: analise.analista || 'Engenheiro Responsável'
      },

      // Dados da Empresa (hardcoded)
      empresaNome: 'MINERVA',
      empresaEndereco: 'Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01',
      empresaTelefone: '(98) 98226-7909 / (98) 98151-3355',
      empresaEmail: 'contato@minerva-eng.com.br',
      empresaSite: 'www.minerva-eng.com.br',
    };

    console.log('[Parecer Reforma Handler] Dados montados:', {
      codigoOS: parecerData.codigoOS,
      clienteNome: parecerData.clienteNome,
      qtdAlteracoes: parecerData.alteracoes.length,
      aprovado: parecerData.analise.aprovado
    });

    // 6. Renderizar template
    const doc = React.createElement(ParecerReformaTemplate, { data: parecerData });
    const pdfBuffer = await renderToBuffer(doc);

    // 7. Upload para Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'parecer-reforma',
      {
        codigoOS: parecerData.codigoOS,
        clienteNome: parecerData.clienteNome,
        aprovado: parecerData.analise.aprovado
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'parecer-reforma'
      }
    };
  } catch (error) {
    console.error('Error generating parecer reforma PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar parecer de reforma'
    };
  }
}
