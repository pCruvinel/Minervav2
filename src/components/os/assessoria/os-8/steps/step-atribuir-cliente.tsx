import { useRef, useImperativeHandle, forwardRef } from 'react';
import { LeadCadastro, type LeadCadastroHandle } from '@/components/os/shared/lead-cadastro';
import { type LeadCompleto } from '@/components/os/shared/lead-cadastro/types';

interface StepAtribuirClienteProps {
  data: {
    clienteId: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export interface StepAtribuirClienteHandle {
  save: () => Promise<string | null>;
}

export const StepAtribuirCliente = forwardRef<StepAtribuirClienteHandle, StepAtribuirClienteProps>(
  function StepAtribuirCliente({ data, onDataChange, readOnly }, ref) {
    const leadRef = useRef<LeadCadastroHandle>(null);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!leadRef.current) return null;
        return await leadRef.current.save();
      }
    }));

    const handleLeadChange = (id: string, _leadData: LeadCompleto | null) => {
      onDataChange({
        ...data,
        clienteId: id,
        // Se precisar de mais dados no pai, adicionar aqui
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-1">Atribuir Cliente</h2>
          <p className="text-sm text-muted-foreground">
            Selecione o cliente responsável por esta ordem de serviço
          </p>
        </div>

        <LeadCadastro
          ref={leadRef}
          selectedLeadId={data.clienteId}
          onLeadChange={handleLeadChange}
          readOnly={readOnly}
          showEdificacao={true}
          showEndereco={true}
          statusFilter={['lead', 'ativo']} // Permitir seleção de clientes
        />
      </div>
    );
  }
);
