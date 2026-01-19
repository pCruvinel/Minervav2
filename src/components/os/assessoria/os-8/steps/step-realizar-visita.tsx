import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/lib/utils/safe-toast';

interface StepRealizarVisitaProps {
  data: {
    visitaRealizada: boolean;
    dataRealizacao: string;
  };
  onDataChange: (data: { visitaRealizada: boolean; dataRealizacao: string }) => void;
  readOnly?: boolean;
  /** Dados do agendamento da Etapa 3 */
  agendamentoData?: {
    dataAgendamento?: string;
    horarioInicio?: string;
    horarioFim?: string;
  };
  /** Informações do cliente da Etapa 1 */
  clienteInfo?: {
    nome?: string;
    edificacao?: string;
  };
}

export function StepRealizarVisita({ data, onDataChange, readOnly, agendamentoData, clienteInfo }: StepRealizarVisitaProps) {
  const handleIniciarVisita = () => {
    if (readOnly) return;
    const now = new Date().toISOString();
    onDataChange({
      ...data,
      visitaRealizada: true,
      dataRealizacao: now,
    });
    toast.success('Visita iniciada! Preencha o formulário pós-visita na próxima etapa.');
  };

  const handleCancelar = () => {
    if (readOnly) return;
    onDataChange({
      ...data,
      visitaRealizada: false,
      dataRealizacao: '',
    });
    toast.info('Visita cancelada');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Realizar Visita Técnica</h2>
        <p className="text-sm text-muted-foreground">
          Confirme a realização da visita técnica
        </p>
      </div>

      {!data.visitaRealizada ? (
        <div className="space-y-4">
          {/* Card de Informações */}
          <div className="border border-border rounded-lg p-6 bg-background">
            <h3 className="text-base mb-4" style={{ color: 'var(--primary)' }}>
              Informações da Visita
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Agendada</p>
                  <p className="font-medium">
                    {agendamentoData?.dataAgendamento
                      ? format(new Date(agendamentoData.dataAgendamento), "dd/MM/yyyy (EEEE)", { locale: ptBR })
                      : 'Não agendada'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {agendamentoData?.horarioInicio && agendamentoData?.horarioFim
                      ? `${agendamentoData.horarioInicio} - ${agendamentoData.horarioFim}`
                      : 'Horário não definido'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">
                    {clienteInfo?.edificacao || clienteInfo?.nome || 'Ver informações do cliente'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <MapPin className="w-10 h-10 text-white" />
            </div>

            <div className="text-center">
              <h3 className="text-lg mb-2">Pronto para iniciar a visita?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ao clicar no botão abaixo, você confirmará o início da visita técnica
              </p>

              <PrimaryButton
                onClick={handleIniciarVisita}
                className="px-8 py-3"
                disabled={readOnly}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Iniciar Visita
              </PrimaryButton>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de estar no local antes de iniciar a visita.
              Após confirmar, você será direcionado para preencher o formulário pós-visita.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Confirmação de Visita Realizada */}
          <div className="border border-success/20 rounded-lg p-6 bg-success/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg mb-1 text-success">Visita Realizada</h3>
                <p className="text-sm text-success mb-4">
                  A visita foi confirmada em{' '}
                  {data.dataRealizacao &&
                    format(new Date(data.dataRealizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>

                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  className="border-green-600 text-success hover:bg-success/10"
                  disabled={readOnly}
                >
                  Cancelar Confirmação
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Avance para a próxima etapa para preencher o formulário pós-visita com as informações coletadas.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
