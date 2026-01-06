/**
 * StepRealizarApresentacao - Wrapper para StepRealizarVisita (tipo apresentacao)
 * 
 * Usado em:
 * - OS 1-4 (Obras): Etapa 11 - Realizar Visita (Apresentação)
 * 
 * Este componente é um wrapper que reutiliza StepRealizarVisita com tipo="apresentacao"
 */

import { StepRealizarVisita, StepRealizarVisitaData } from './step-realizar-visita';

interface StepRealizarApresentacaoProps {
  data: {
    apresentacaoRealizada?: boolean;
    dataApresentacao?: string;
    observacoes?: string;
  };
  onDataChange: (data: StepRealizarApresentacaoProps['data']) => void;
  readOnly?: boolean;
}

export function StepRealizarApresentacao({
  data,
  onDataChange,
  readOnly = false
}: StepRealizarApresentacaoProps) {
  // Mapear dados para o formato do StepRealizarVisita
  const mappedData: StepRealizarVisitaData = {
    visitaRealizada: data.apresentacaoRealizada,
    dataVisita: data.dataApresentacao,
    observacoes: data.observacoes,
  };

  // Mapear callback para formato original
  const handleDataChange = (newData: StepRealizarVisitaData) => {
    onDataChange({
      apresentacaoRealizada: newData.visitaRealizada,
      dataApresentacao: newData.dataVisita,
      observacoes: newData.observacoes,
    });
  };

  return (
    <StepRealizarVisita
      data={mappedData}
      onDataChange={handleDataChange}
      readOnly={readOnly}
      tipoVisita="apresentacao"
    />
  );
}

