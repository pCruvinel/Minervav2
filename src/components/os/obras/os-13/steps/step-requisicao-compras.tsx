import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { StepRequisicaoCompra } from '@/components/os/administrativo/os-9/steps/step-requisicao-compra';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';

export interface StepRequisicaoComprasProps {
  data: { os09Criada: boolean; os09Id: string; os09CodigoOS?: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  // ⭐ NOVOS PROPS
  parentOSId?: string;   // ID da OS-13
  clienteId?: string;    // Do Step 1
  ccId?: string;         // Do Step 1
}

export function StepRequisicaoCompras({
  data,
  onDataChange,
  readOnly,
  parentOSId,
  clienteId,
  ccId
}: StepRequisicaoComprasProps) {
  // Estado para controlar se mostra formulário ou resumo
  const [showForm, setShowForm] = useState(!data.os09Criada);

  // Estado do formulário OS-9
  const [os9FormData, setOs9FormData] = useState({
    cnpj: '',
    centroCusto: ccId || '',
    tipo: '',
    descricaoMaterial: '',
    quantidade: '',
    parametroPreco: '',
    linkProduto: '',
    localEntrega: '',
    prazoEntrega: '',
    observacoes: '',
    sistema: '',
    item: '',
    geraRuido: '',
    dataPrevistaInicio: '',
    dataPrevistaFim: ''
  });

  const { mutate: createOS, isPending } = useCreateOSWorkflow();

  const handleCriarOS09 = async () => {
    // Validações
    if (!parentOSId) {
      toast.error('ID da OS-13 não encontrado');
      return;
    }
    if (!clienteId || !ccId) {
      toast.error('Complete a Etapa 1 primeiro (Cliente e Centro de Custo)');
      return;
    }

    // Validar campos obrigatórios do formulário OS-9
    const requiredFields = [
      'cnpj', 'centroCusto', 'tipo', 'descricaoMaterial',
      'quantidade', 'parametroPreco', 'linkProduto',
      'localEntrega', 'prazoEntrega', 'sistema', 'item',
      'geraRuido', 'dataPrevistaInicio', 'dataPrevistaFim'
    ];

    const missingFields = requiredFields.filter(field => !os9FormData[field as keyof typeof os9FormData]);
    if (missingFields.length > 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Criar OS-09 com 5 etapas
      const result = await createOS({
        tipoOSCodigo: 'OS-09',
        clienteId,
        ccId,
        parentOSId, // ⭐ Vínculo com OS-13
        descricao: `Requisição de Compras - ${os9FormData.tipo}`,
        metadata: { origem: 'OS-13-Step-10' },
        etapas: [
          {
            nome_etapa: 'Solicitação de Compra',
            ordem: 1,
            dados_etapa: os9FormData // ⭐ Dados do formulário
          },
          { nome_etapa: 'Aprovação', ordem: 2 },
          { nome_etapa: 'Cotação', ordem: 3 },
          { nome_etapa: 'Autorização de Pagamento', ordem: 4 },
          { nome_etapa: 'Recebimento/Entrega', ordem: 5 }
        ]
      });

      // Atualizar estado da Etapa 10
      onDataChange({
        os09Criada: true,
        os09Id: result.os.id,
        os09CodigoOS: result.os.codigo_os
      });

      setShowForm(false);
      toast.success(`OS-09 criada com sucesso! (${result.os.codigo_os})`);
    } catch (error) {
      console.error('Erro ao criar OS-09:', error);
      toast.error('Erro ao criar requisição de compras');
    }
  };

  // Se já criou a OS-09, mostrar resumo
  if (data.os09Criada && !showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-1">Requisição Inicial de Compras</h2>
          <p className="text-sm text-muted-foreground">
            Requisição de compras criada com sucesso
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
              <h3 className="text-base mb-2">Requisição de compras criada!</h3>
              <p className="text-sm text-muted-foreground">
                OS-09 criada: <strong>{data.os09CodigoOS || data.os09Id}</strong>
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
                  <p className="text-sm font-medium">OS-09: Requisição de Compras</p>
                  <p className="text-xs text-muted-foreground">
                    {data.os09CodigoOS || data.os09Id}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navegar para OS-09
                    window.open(`/os/${data.os09Id}`, '_blank');
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
            A requisição de compras foi criada e pode ser acompanhada no workflow da OS-09.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar formulário
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Requisição Inicial de Compras</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para criar uma OS-09 de requisição de compras
        </p>
      </div>

      {/* Status */}
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-base mb-2">Aguardando requisição de compras</h3>
            <p className="text-sm text-muted-foreground">
              Crie uma nova OS-09 para solicitar materiais e equipamentos
            </p>
          </div>
        </div>
      </div>

      {/* Reutilizar componente OS-9 Step 1 */}
      <StepRequisicaoCompra
        data={os9FormData}
        onDataChange={setOs9FormData}
        readOnly={readOnly}
      />

      {/* Botão de criar */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleCriarOS09}
          disabled={isPending || readOnly}
          style={{ backgroundColor: 'var(--primary)' }}
          className="hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando OS-09...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar OS-09
            </>
          )}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A requisição de compras deve incluir todos os materiais, ferramentas e equipamentos necessários para o início das atividades da obra.
        </AlertDescription>
      </Alert>
    </div>
  );
}
