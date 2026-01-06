import { FileText } from 'lucide-react';
import { EtapaCheck } from '@/components/os/shared/components/etapa-check';
import { useAuth } from '@/lib/contexts/auth-context';

interface StepContratoAssinadoProps {
  data: {
    contratoAssinado: boolean;
    dataAssinatura?: string;
    usuarioConfirmacao?: string;
  };
  onDataChange: (data: { contratoAssinado: boolean; dataAssinatura?: string; usuarioConfirmacao?: string }) => void;
  readOnly?: boolean;
}

export function StepContratoAssinado({ data, onDataChange, readOnly = false }: StepContratoAssinadoProps) {
  const { currentUser } = useAuth();

  const handleConfirm = () => {
    onDataChange({
      ...data,
      contratoAssinado: true,
      dataAssinatura: new Date().toISOString(),
      usuarioConfirmacao: currentUser?.nome_completo || 'Usuário'
    });
  };

  const handleUndo = () => {
    onDataChange({
      ...data,
      contratoAssinado: false,
      dataAssinatura: undefined,
      usuarioConfirmacao: undefined
    });
  };

  return (
    <EtapaCheck
      title="Contrato Assinado"
      description="Confirme que o contrato foi devidamente assinado por todas as partes envolvidas."
      checked={!!data.contratoAssinado}
      date={data.dataAssinatura}
      confirmedBy={data.usuarioConfirmacao}
      onConfirm={handleConfirm}
      onUndo={handleUndo}
      readOnly={readOnly}
      actionLabel="Confirmar Assinatura"
      icon={FileText}
    />
  );
}
