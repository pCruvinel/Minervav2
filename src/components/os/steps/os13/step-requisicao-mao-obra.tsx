import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Users, Plus, CheckCircle2, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepRequisicaoMaoObraProps {
  data: { os10Criada: boolean; os10Id: string };
  onDataChange: (data: any) => void;
}

export function StepRequisicaoMaoObra({ data, onDataChange }: StepRequisicaoMaoObraProps) {
  const handleCriarOS10 = () => {
    const novoId = `OS-${Math.floor(Math.random() * 10000)}`;
    onDataChange({ os10Criada: true, os10Id: novoId });
    toast.success(`OS-10 criada com sucesso! (${novoId})`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Requisição de Mão de Obra</h2>
        <p className="text-sm text-neutral-600">
          Crie uma OS-10 para solicitar a contratação de mão de obra necessária para a obra
        </p>
      </div>

      {/* Status */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.os10Criada ? '#10b981' : '#f59e0b' }}
          >
            {data.os10Criada ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Clock className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {data.os10Criada ? 'Requisição de mão de obra criada!' : 'Aguardando finalização'}
            </h3>
            {data.os10Criada ? (
              <p className="text-sm text-neutral-600">
                OS-10 criada: <strong>{data.os10Id}</strong>
              </p>
            ) : (
              <p className="text-sm text-neutral-600">
                Status: <strong className="text-orange-600">Aguardando finalização</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card de Ação */}
      {!data.os10Criada ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: '#DDC063' }}
              >
                <Plus className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-base mb-2">Criar Nova Requisição de Mão de Obra</h3>
                <p className="text-sm text-neutral-600">
                  Ao clicar no botão abaixo, uma nova OS-10 será criada para solicitar contratação de mão de obra
                </p>
              </div>

              <Button
                onClick={handleCriarOS10}
                className="bg-primary hover:bg-primary/90"
                style={{ backgroundColor: '#D3AF37' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar OS-10
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm mb-1">OS-10: Requisição de Mão de Obra</p>
                  <p className="text-xs text-neutral-600">{data.os10Id}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A requisição de mão de obra deve especificar as funções necessárias, quantidades, qualificações exigidas e período de contratação.
        </AlertDescription>
      </Alert>
    </div>
  );
}
