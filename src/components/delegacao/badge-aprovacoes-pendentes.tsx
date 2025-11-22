// Badge de Aprovações Pendentes - Sistema Hierárquico Minerva ERP
'use client';

import { useMemo } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../lib/contexts/auth-context';
import { Delegacao, podeAprovar } from '../../lib/types';
import { formatarDataRelativa } from '../../lib/utils/date-utils';

interface BadgeAprovacoesPendentesProps {
  delegacoes: Delegacao[];
  onAprovar?: (delegacaoId: string) => void;
  onReprovar?: (delegacaoId: string) => void;
  onVerTodas?: () => void;
}

export function BadgeAprovacoesPendentes({
  delegacoes,
  onAprovar,
  onReprovar,
  onVerTodas,
}: BadgeAprovacoesPendentesProps) {
  const { currentUser } = useAuth();

  // Filtrar aprovações pendentes para o usuário atual
  const aprovacoesPendentes = useMemo(() => {
    if (!currentUser) return [];

    // Apenas gestores e diretoria podem aprovar
    if (!podeAprovar(currentUser)) return [];

    // Filtrar delegações concluídas que aguardam aprovação
    return delegacoes.filter(d => {
      // Deve estar concluída
      if (d.status_delegacao !== 'concluida') return false;

      // Deve ter sido delegada pelo usuário atual (gestor aprova o que ele delegou)
      if (d.delegante_id !== currentUser.id) return false;

      return true;
    });
  }, [delegacoes, currentUser]);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!currentUser || aprovacoesPendentes.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2"
        >
          <Bell className="w-5 h-5" />
          {aprovacoesPendentes.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {aprovacoesPendentes.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Aprovações Pendentes</h3>
            </div>
            <Badge variant="secondary">
              {aprovacoesPendentes.length}
            </Badge>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Tarefas concluídas aguardando sua aprovação
          </p>
        </div>

        {/* Lista de Aprovações */}
        <div className="max-h-96 overflow-y-auto">
          {aprovacoesPendentes.map((delegacao) => (
            <div
              key={delegacao.id}
              className="p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(delegacao.delegado_nome || 'Desconhecido')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {delegacao.delegado_nome || 'Desconhecido'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatarDataRelativa(delegacao.updated_at)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0"
                    >
                      Concluída
                    </Badge>
                  </div>

                  <p className="text-sm text-neutral-700 line-clamp-2 mb-3">
                    {delegacao.descricao_tarefa}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        if (onReprovar) {
                          onReprovar(delegacao.id);
                        }
                      }}
                    >
                      Reprovar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (onAprovar) {
                          onAprovar(delegacao.id);
                        }
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {onVerTodas && (
          <div className="p-3 border-t border-neutral-200">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={onVerTodas}
            >
              Ver todas as delegações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
