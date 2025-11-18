import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Alert, AlertDescription } from '../../../ui/alert';
import { CheckCircle2, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepRealizarVisitaInicialProps {
  data: { visitaRealizada: boolean };
  onDataChange: (data: any) => void;
}

export function StepRealizarVisitaInicial({ data, onDataChange }: StepRealizarVisitaInicialProps) {
  const handleIniciarVisita = () => {
    onDataChange({ visitaRealizada: true });
    toast.success('Visita inicial registrada como realizada!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Realizar Visita Inicial</h2>
        <p className="text-sm text-neutral-600">
          Confirme a realização da visita técnica inicial ao local da obra
        </p>
      </div>

      {/* Status da Visita */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.visitaRealizada ? '#10b981' : '#DDC063' }}
          >
            {data.visitaRealizada ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <MapPin className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {data.visitaRealizada ? 'Visita realizada com sucesso!' : 'Aguardando realização da visita'}
            </h3>
            <p className="text-sm text-neutral-600">
              {data.visitaRealizada 
                ? 'A visita técnica inicial foi registrada no sistema.'
                : 'Clique no card abaixo para registrar a realização da visita.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Card Clicável */}
      {!data.visitaRealizada && (
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={handleIniciarVisita}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#D3AF37' }}
              >
                <MapPin className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-2">Iniciar Visita Técnica</h3>
                <p className="text-sm text-neutral-600">
                  Clique aqui para registrar que a visita ao local da obra foi realizada
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

      {/* Informações da Visita Realizada */}
      {data.visitaRealizada && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            A visita técnica inicial foi concluída. Os dados coletados durante a visita devem ser documentados nas próximas etapas.
          </AlertDescription>
        </Alert>
      )}

      {!data.visitaRealizada && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Durante a visita, verifique as condições do local, possíveis interferências, acessos e todas as informações necessárias para o planejamento da obra.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
