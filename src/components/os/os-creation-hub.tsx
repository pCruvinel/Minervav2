import React from 'react';
import { HardHat, ClipboardCheck, DollarSign, Users } from 'lucide-react';
import { OSCreationCard } from './os-creation-card';

interface OSCreationHubProps {
  onNavigate: (route: string) => void;
}

export function OSCreationHub({ onNavigate }: OSCreationHubProps) {
  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <h1>Criar Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">
            Selecione o setor e o fluxo de trabalho que deseja iniciar.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Obras */}
          <OSCreationCard
            icon={HardHat}
            title="Obras"
            description="Iniciar um novo projeto de obra (fachada, perícia, estrutural) ou registrar um contrato de obra já assinado."
            iconColor="primary"
            options={[
              {
                label: 'Novo Lead (OS 01-04)',
                route: '/os/criar/obras-lead'
              },
              {
                label: 'Start de Contrato (OS 13)',
                route: '/os/criar/start-contrato-obra'
              }
            ]}
            onNavigate={onNavigate}
          />

          {/* Card 2: Assessoria */}
          <OSCreationCard
            icon={ClipboardCheck}
            title="Assessoria"
            description="Crie laudos, vistorias, termos de reforma ou contratos de assessoria."
            iconColor="primary"
            options={[
              {
                label: 'Novo Lead (OS 05, 06)',
                route: '/os/criar/assessoria-lead'
              },
              {
                label: 'Start Contrato (OS 11, 12)',
                route: '/os/criar/start-contrato-assessoria'
              },
              {
                label: 'Solicitação de Reforma (OS 07)',
                route: '/os/criar/solicitacao-reforma'
              },
              {
                label: 'Visita Técnica / Parecer Técnico (OS 08)',
                route: '/os/criar/vistoria'
              }
            ]}
            onNavigate={onNavigate}
          />

          {/* Card 3: Financeiro */}
          <OSCreationCard
            icon={DollarSign}
            title="Financeiro"
            description="Crie requisições de compra de materiais ou serviços para departamentos ou obras."
            iconColor="secondary"
            options={[
              {
                label: 'Requisição de Compras (OS 09)',
                route: '/os/criar/requisicao-compras'
              }
            ]}
            onNavigate={onNavigate}
          />

          {/* Card 4: RH (Recursos Humanos) */}
          <OSCreationCard
            icon={Users}
            title="RH"
            description="Solicite a contratação de nova mão de obra ou colaboradores."
            iconColor="secondary"
            options={[
              {
                label: 'Requisição de Mão de Obra (OS 10)',
                route: '/os/criar/requisicao-mao-obra'
              }
            ]}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}