import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Alert, AlertDescription } from '../../../ui/alert';
import { CheckCircle2, MapPin, AlertCircle, Flag } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepRealizarVisitaFinalProps {
  data: { visitaFinalRealizada: boolean };
  onDataChange: (data: any) => void;
}

export function StepRealizarVisitaFinal({ data, onDataChange }: StepRealizarVisitaFinalProps) {
  const handleRealizarVisita = () => {
    onDataChange({ visitaFinalRealizada: true });
    toast.success('Visita final registrada como realizada!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Realizar Visita Final</h2>
        <p className="text-sm text-neutral-600">
          Confirme a realização da visita técnica final para validação dos serviços executados
        </p>
      </div>

      {/* Status da Visita */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.visitaFinalRealizada ? '#10b981' : '#DDC063' }}
          >
            {data.visitaFinalRealizada ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Flag className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {data.visitaFinalRealizada ? 'Visita final realizada com sucesso!' : 'Aguardando realização da visita final'}
            </h3>
            <p className="text-sm text-neutral-600">
              {data.visitaFinalRealizada 
                ? 'A visita técnica final foi registrada. Todas as etapas da OS-13 foram concluídas!'
                : 'Clique no card abaixo para registrar a realização da visita final.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Card Clicável */}
      {!data.visitaFinalRealizada && (
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={handleRealizarVisita}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#D3AF37' }}
              >
                <Flag className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-2">Concluir Visita Final</h3>
                <p className="text-sm text-neutral-600">
                  Clique aqui para registrar que a visita final foi realizada e validar os serviços
                </p>
              </div>

              <div className="text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusão da OS */}
      {data.visitaFinalRealizada && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-green-600"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg mb-2 text-green-900">🎉 Parabéns! OS-13 Concluída</h3>
                <p className="text-sm text-green-800 mb-3">
                  Todas as 17 etapas da OS-13 (Start de Contrato de Obra) foram concluídas com sucesso!
                </p>
                <ul className="space-y-1 text-sm text-green-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dados do cliente e edificação registrados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Documentação técnica completa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Requisições de compras e mão de obra criadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mobilização e segurança validadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Visitas técnicas realizadas</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!data.visitaFinalRealizada && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Durante a visita final, verifique a qualidade dos serviços executados, conformidade com o projeto, segurança e organização do canteiro de obras.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
