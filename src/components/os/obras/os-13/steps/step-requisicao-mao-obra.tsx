import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, CheckCircle2, AlertCircle, ExternalLink, Loader2, Clock } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { StepAberturaSolicitacao } from '@/components/os/administrativo/os-10/steps/step-abertura-solicitacao';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';

export interface StepRequisicaoMaoObraProps {
  data: { os10Criada: boolean; os10Id: string; os10CodigoOS?: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  // ⭐ NOVOS PROPS
  parentOSId?: string;   // ID da OS-13
  clienteId?: string;    // Do Step 1
  ccId?: string;         // Do Step 1
}

export function StepRequisicaoMaoObra({
  data,
  onDataChange,
  readOnly,
  parentOSId,
  clienteId,
  ccId
}: StepRequisicaoMaoObraProps) {
  // Estado para controlar se mostra formulário ou resumo
  const [showForm, setShowForm] = useState(!data.os10Criada);

  // Estado do formulário OS-10
  const [os10FormData, setOs10FormData] = useState({
    dataAbertura: new Date().toISOString(),
    solicitante: '',
    departamento: '',
    urgencia: 'normal',
    justificativa: ''
  });

  const { mutate: createOS, isPending } = useCreateOSWorkflow();

  const handleCriarOS10 = async () => {
    // Validações
    if (!parentOSId) {
      toast.error('ID da OS-13 não encontrado');
      return;
    }
    if (!clienteId || !ccId) {
      toast.error('Complete a Etapa 1 primeiro (Cliente e Centro de Custo)');
      return;
    }

    // Validar campos obrigatórios do formulário OS-10
    const requiredFields = ['solicitante', 'departamento', 'urgencia', 'justificativa'];
    const missingFields = requiredFields.filter(field => !os10FormData[field as keyof typeof os10FormData]);

    if (missingFields.length > 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar justificativa mínima
    if (os10FormData.justificativa.length < 5) {
      toast.error('A justificativa deve ter pelo menos 5 caracteres');
      return;
    }

    try {
      // Criar OS-10 com 5 etapas
      const result = await createOS({
        tipoOSCodigo: 'OS-10',
        clienteId,
        ccId,
        parentOSId, // ⭐ Vínculo com OS-13
        descricao: `Requisição de Mão de Obra - ${os10FormData.departamento}`,
        metadata: { origem: 'OS-13-Step-11' },
        etapas: [
          {
            nome_etapa: 'Abertura de Solicitação',
            ordem: 1,
            dados_etapa: os10FormData // ⭐ Dados do formulário
          },
          { nome_etapa: 'Informações de Centro de Custo', ordem: 2 },
          { nome_etapa: 'Seleção de Colaborador', ordem: 3 },
          { nome_etapa: 'Detalhes da Vaga', ordem: 4 },
          { nome_etapa: 'Requisição Múltipla', ordem: 5 }
        ]
      });

      // Atualizar estado da Etapa 11
      onDataChange({
        os10Criada: true,
        os10Id: result.os.id,
        os10CodigoOS: result.os.codigo_os
      });

      setShowForm(false);
      toast.success(`OS-10 criada com sucesso! (${result.os.codigo_os})`);
    } catch (error) {
      console.error('Erro ao criar OS-10:', error);
      toast.error('Erro ao criar requisição de mão de obra');
    }
  };

  // Se já criou a OS-10, mostrar resumo
  if (data.os10Criada && !showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-1">Requisição de Mão de Obra</h2>
          <p className="text-sm text-muted-foreground">
            Requisição de mão de obra criada com sucesso
          </p>
        </div>

        {/* Status */}
        <div className="border border-border rounded-lg p-6 bg-background">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--success)' }}
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-base mb-2">Requisição de mão de obra criada!</h3>
              <p className="text-sm text-muted-foreground">
                OS-10 criada: <strong>{data.os10CodigoOS || data.os10Id}</strong>
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">OS-10: Requisição de Mão de Obra</p>
                  <p className="text-xs text-muted-foreground">
                    {data.os10CodigoOS || data.os10Id}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navegar para OS-10
                    window.open(`/os/${data.os10Id}`, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-success/5 border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            A requisição de mão de obra foi criada e pode ser acompanhada no workflow da OS-10.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar formulário
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Requisição de Mão de Obra</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para criar uma OS-10 de requisição de mão de obra
        </p>
      </div>

      {/* Status */}
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            <Clock className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-base mb-2">Aguardando finalização</h3>
            <p className="text-sm text-muted-foreground">
              Crie uma nova OS-10 para solicitar contratação de mão de obra
            </p>
          </div>
        </div>
      </div>

      {/* Reutilizar componente OS-10 Step 1 */}
      <StepAberturaSolicitacao
        data={os10FormData}
        onDataChange={setOs10FormData}
        readOnly={readOnly}
      />

      {/* Botão de criar */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleCriarOS10}
          disabled={isPending || readOnly}
          style={{ backgroundColor: 'var(--primary)' }}
          className="hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando OS-10...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar OS-10
            </>
          )}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A requisição de mão de obra deve especificar as funções necessárias, quantidades, qualificações exigidas e período de contratação.
        </AlertDescription>
      </Alert>
    </div>
  );
}
