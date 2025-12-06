/**
 * RequisicaoCard - Card de requisição de mão de obra para o Kanban
 *
 * Exibe resumo de uma OS-10 com suas vagas agregadas.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Briefcase } from 'lucide-react';
import type { RequisicaoMaoDeObra, VagaRecrutamento } from '@/lib/types/recrutamento';

interface RequisicaoCardProps {
  requisicao: RequisicaoMaoDeObra;
  onClick: () => void;
}

/**
 * Resume as vagas para exibição no card
 * - 1 vaga: "2x Pedreiro"
 * - 2 vagas: "2x Pedreiro, 1x Servente"
 * - 3+ vagas: "2x Pedreiro + 2 outros..."
 */
function summarizeVagas(vagas: VagaRecrutamento[]): string {
  if (!vagas || vagas.length === 0) return 'Sem vagas';

  if (vagas.length === 1) {
    return `${vagas[0].quantidade}x ${vagas[0].cargo_funcao}`;
  }

  if (vagas.length === 2) {
    return vagas.map((v) => `${v.quantidade}x ${v.cargo_funcao}`).join(', ');
  }

  // Mais de 2 vagas: mostrar primeira + contagem
  const first = vagas[0];
  const othersCount = vagas.length - 1;
  return `${first.quantidade}x ${first.cargo_funcao} + ${othersCount} outros...`;
}

/**
 * Retorna configuração do badge de urgência
 */
function getUrgenciaBadge(urgencia: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    baixa: {
      label: 'Baixa',
      className: 'bg-success/10 text-success border-success/20',
    },
    normal: {
      label: 'Normal',
      className: 'bg-info/10 text-info border-info/20',
    },
    alta: {
      label: 'Alta',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    critica: {
      label: 'Crítica',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };
  return map[urgencia] || map.normal;
}

/**
 * Extrai iniciais do nome para avatar
 */
function getInitials(nome: string): string {
  if (!nome) return '??';
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formata data para exibição curta
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function RequisicaoCard({ requisicao, onClick }: RequisicaoCardProps) {
  const vagasSummary = summarizeVagas(requisicao.vagas);
  const urgencia = requisicao.metadata?.urgencia || 'normal';
  const urgenciaBadge = getUrgenciaBadge(urgencia);

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header: Código OS + Badge Urgência */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-semibold text-primary">
          {requisicao.codigo_os}
        </span>
        <Badge variant="outline" className={urgenciaBadge.className}>
          {urgenciaBadge.label}
        </Badge>
      </div>

      {/* Body: Resumo das Vagas */}
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <p className="text-sm font-medium line-clamp-1">{vagasSummary}</p>
      </div>

      {/* Centro de Custo */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Building2 className="w-3 h-3" />
        <span className="truncate">
          {requisicao.centro_custo?.nome || 'Centro de custo não informado'}
        </span>
      </div>

      {/* Data da Solicitação */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(requisicao.data_entrada)}</span>
      </div>

      {/* Footer: Avatar do Solicitante + Total Vagas */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {requisicao.solicitante?.avatar_url && (
              <AvatarImage src={requisicao.solicitante.avatar_url} />
            )}
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(requisicao.solicitante?.nome_completo || '')}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {requisicao.solicitante?.nome_completo || 'Solicitante'}
          </span>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {requisicao.total_vagas} {requisicao.total_vagas === 1 ? 'vaga' : 'vagas'}
        </Badge>
      </div>
    </div>
  );
}
