import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepRequisicaoComprasProps {
  data: { os09Criada: boolean; os09Id: string };
  onDataChange: (data: any) => void;
}

export function StepRequisicaoCompras({ data, onDataChange }: StepRequisicaoComprasProps) {
  const handleCriarOS09 = () => {
    // Simular criação de OS-09
    const novoId = `OS-${Math.floor(Math.random() * 10000)}`;
    onDataChange({ os09Criada: true, os09Id: novoId });
    toast.success(`OS-09 criada com sucesso! (${novoId})`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Requisição Inicial de Compras</h2>
        <p className="text-sm text-neutral-600">
          Crie uma OS-09 para requisitar os materiais e equipamentos necessários para o início da obra
        </p>
      </div>

      {/* Status */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.os09Criada ? '#10b981' : '#DDC063' }}
          >
            {data.os09Criada ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <ShoppingCart className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {data.os09Criada ? 'Requisição de compras criada!' : 'Aguardando requisição de compras'}
            </h3>
            {data.os09Criada ? (
              <p className="text-sm text-neutral-600">
                OS-09 criada: <strong>{data.os09Id}</strong>
              </p>
            ) : (
              <p className="text-sm text-neutral-600">
                Crie uma nova OS-09 para solicitar materiais e equipamentos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card de Ação */}
      {!data.os09Criada ? (
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
                <h3 className="text-base mb-2">Criar Nova Requisição de Compras</h3>
                <p className="text-sm text-neutral-600">
                  Ao clicar no botão abaixo, uma nova OS-09 será criada para esta obra
                </p>
              </div>

              <Button
                onClick={handleCriarOS09}
                className="bg-primary hover:bg-primary/90"
                style={{ backgroundColor: '#D3AF37' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar OS-09
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
                  <p className="text-sm mb-1">OS-09: Requisição de Compras</p>
                  <p className="text-xs text-neutral-600">{data.os09Id}</p>
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
          A requisição de compras deve incluir todos os materiais, ferramentas e equipamentos necessários para o início das atividades da obra.
        </AlertDescription>
      </Alert>
    </div>
  );
}
