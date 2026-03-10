import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MoreHorizontal, FileText, Check, X } from 'lucide-react';
import type { CandidatoVaga } from '@/lib/types/recrutamento';
import { useUpdateCandidaturaStatus } from '@/lib/hooks/use-recrutamento';

interface CandidatoCardProps {
  vinculo: CandidatoVaga;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  inscrito: { label: 'Inscrito', variant: 'secondary' },
  em_analise: { label: 'Em Análise', variant: 'default' },
  entrevista: { label: 'Em Entrevista', variant: 'default' },
  aprovado: { label: 'Aprovado', variant: 'default' }, // idealmente um "success" variant, mas default serve
  reprovado: { label: 'Reprovado', variant: 'destructive' },
  desistiu: { label: 'Desistiu', variant: 'outline' },
};

export function CandidatoCard({ vinculo }: CandidatoCardProps) {
  const candidato = vinculo.candidato;
  const { mutate: updateStatus, loading } = useUpdateCandidaturaStatus();

  if (!candidato) return null;

  const handleStatusChange = (newStatus: CandidatoVaga['status_candidatura']) => {
    if (newStatus === vinculo.status_candidatura) return;
    updateStatus({ id: vinculo.id, status: newStatus });
  };

  const statusConfig = STATUS_CONFIG[vinculo.status_candidatura] || STATUS_CONFIG.inscrito;

  return (
    <div className="flex items-start justify-between p-3 bg-card border rounded-lg shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{candidato.nome_completo}</span>
          <Badge variant={statusConfig.variant} className="text-[10px] uppercase h-5 leading-none">
            {vinculo.status_candidatura === 'aprovado' && <Check className="w-3 h-3 mr-1" />}
            {vinculo.status_candidatura === 'reprovado' && <X className="w-3 h-3 mr-1" />}
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {candidato.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{candidato.email}</span>
            </div>
          )}
          {candidato.telefone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{candidato.telefone}</span>
            </div>
          )}
          {candidato.fonte && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="capitalize">{candidato.fonte}</span>
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusChange('inscrito')}>Mover para Inscrito</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('em_analise')}>Mover para Análise</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('entrevista')}>Mover para Entrevista</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('aprovado')} className="text-success">Aprovar Candidato</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('reprovado')} className="text-destructive">Reprovar Candidato</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('desistiu')}>Marcar como Desistência</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
