/**
 * Handler para geração de PDFs de Visita Técnica / Parecer Técnico (OS 08)
 * Busca dados das etapas 1 (Identificação) e 5 (Formulário Pós-Visita)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { VisitaTecnicaTemplate, type VisitaTecnicaData } from '../templates/visita-tecnica-template.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleVisitaTecnicaGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    console.log('[Visita Técnica Handler] Iniciando geração para osId:', osId);

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
          telefone
        )
      `)
      .eq('id', osId)
      .single();

    if (osError) {
      console.error('[Visita Técnica Handler] Erro ao buscar OS:', osError);
      throw new Error(
        `Erro ao buscar OS do banco: ${osError.message || osError.code || JSON.stringify(osError)}`
      );
    }

    if (!os) {
      throw new Error(
        `OS com ID "${osId}" não foi encontrada no banco de dados.`
      );
    }

    // 2. Buscar etapas específicas (1 = Identificação, 5 = Pós-Visita)
    const { data: etapas, error: etapasError } = await supabase
      .from('os_etapas')
      .select('*')
      .eq('os_id', osId)
      .in('ordem', [1, 3, 4, 5])
      .order('ordem');

    if (etapasError) {
      throw new Error('Erro ao buscar etapas');
    }

    // Separar etapas
    const etapaIdentificacao = etapas?.find(e => e.ordem === 1);
    const etapaAgendamento = etapas?.find(e => e.ordem === 3);
    const etapaRealizacao = etapas?.find(e => e.ordem === 4);
    const etapaPosVisita = etapas?.find(e => e.ordem === 5);

    if (!etapaIdentificacao?.dados_etapa) {
      throw new Error('Etapa de Identificação não preenchida (Etapa 1)');
    }

    if (!etapaPosVisita?.dados_etapa) {
      throw new Error('Formulário Pós-Visita não preenchido (Etapa 5)');
    }

    // 3. Extrair dados do cliente
    const clienteData = Array.isArray(os.cliente) ? os.cliente[0] : os.cliente;
    if (!clienteData) {
      throw new Error('Dados do cliente não encontrados');
    }

    // 4. Extrair dados da identificação (Etapa 1)
    const dadosIdentificacao = etapaIdentificacao.dados_etapa as any;

    // 5. Extrair dados do pós-visita (Etapa 5)
    const dadosPosVisita = etapaPosVisita.dados_etapa as any;

    // 6. Extrair dados de agendamento e realização
    const dadosAgendamento = etapaAgendamento?.dados_etapa as any;
    const dadosRealizacao = etapaRealizacao?.dados_etapa as any;

    // 7. Montar VisitaTecnicaData completo
    const visitaData: VisitaTecnicaData = {
      // Dados da OS
      codigoOS: os.codigo_os,
      dataEmissao: os.data_entrada,
      clienteNome: clienteData.nome_razao_social,

      // Solicitante
      solicitante: {
        nomeCompleto: dadosIdentificacao.nomeCompleto || '',
        contatoWhatsApp: dadosIdentificacao.contatoWhatsApp || '',
        condominio: dadosIdentificacao.condominio || '',
        cargo: dadosIdentificacao.cargo || ''
      },

      // Visita
      visita: {
        tipoDocumento: dadosIdentificacao.tipoDocumento || 'parecer',
        areaVistoriada: dadosIdentificacao.areaVistoriada || dadosPosVisita.areaVistoriada || '',
        detalhesSolicitacao: dadosIdentificacao.detalhesSolicitacao || '',
        dataAgendamento: dadosAgendamento?.dataVisita || '',
        dataRealizacao: dadosRealizacao?.dataRealizacao || etapaPosVisita.data_conclusao || ''
      },

      // Fotos (limite de 10 fotos no total)
      fotosIniciais: (dadosIdentificacao.fotosAnexadas || []).slice(0, 5),
      fotosLocal: (dadosPosVisita.fotosLocal || []).slice(0, 5),

      // Análise técnica
      analise: {
        pontuacaoEngenheiro: dadosPosVisita.pontuacaoEngenheiro || 'nao',
        pontuacaoMorador: dadosPosVisita.pontuacaoMorador || 'nao',
        manifestacaoPatologica: dadosPosVisita.manifestacaoPatologica || '',
        recomendacoesPrevias: dadosPosVisita.recomendacoesPrevias || '',
        gravidade: dadosPosVisita.gravidade || 'baixa',
        origemNBR: dadosPosVisita.origemNBR,
        resultadoVisita: dadosPosVisita.resultadoVisita || '',
        justificativa: dadosPosVisita.justificativa
      },

      // Dados da Empresa (hardcoded)
      empresaNome: 'MINERVA',
      empresaEndereco: 'Av. Colares Moreira, Edifício Los Angeles, Nº100, Loja 01',
      empresaTelefone: '(98) 98226-7909 / (98) 98151-3355',
      empresaEmail: 'contato@minerva-eng.com.br',
      empresaSite: 'www.minerva-eng.com.br',
    };

    console.log('[Visita Técnica Handler] Dados montados:', {
      codigoOS: visitaData.codigoOS,
      clienteNome: visitaData.clienteNome,
      solicitante: visitaData.solicitante.nomeCompleto,
      qtdFotosIniciais: visitaData.fotosIniciais.length,
      qtdFotosLocal: visitaData.fotosLocal.length,
      gravidade: visitaData.analise.gravidade
    });

    // 8. Renderizar template
    const doc = React.createElement(VisitaTecnicaTemplate, { data: visitaData });
    const pdfBuffer = await renderToBuffer(doc);

    // 9. Upload para Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'visita-tecnica',
      {
        codigoOS: visitaData.codigoOS,
        clienteNome: visitaData.clienteNome,
        gravidade: visitaData.analise.gravidade
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'visita-tecnica'
      }
    };
  } catch (error) {
    console.error('Error generating visita tecnica PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar relatório de visita técnica'
    };
  }
}
