// Modal de Delegação de OS - Sistema Hierárquico Minerva ERP
'use client';

import React, { useState, useMemo } from 'react';
import { X, UserPlus, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { toast } from '../../lib/utils/safe-toast';
import { useAuth } from '../../lib/contexts/auth-context';
import { User, OrdemServico, Delegacao, podeDelegar, isGestor, isAdminOuDiretoria, ROLE_LABELS } from '../../lib/types';
import { mockUsers } from '../../lib/mock-data';
import { ordensServicoAPI } from '../../lib/api-client';

interface ModalDelegarOSProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico;
  onDelegarSuccess?: (delegacao: Delegacao) => void;
}

export function ModalDelegarOS({ 
  isOpen, 
  onClose, 
  os,
  onDelegarSuccess 
}: ModalDelegarOSProps) {
  const { currentUser } = useAuth();
  const [selectedColaborador, setSelectedColaborador] = useState<User | null>(null);
  const [descricaoTarefa, setDescricaoTarefa] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [dataPrazo, setDataPrazo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar colaboradores disponíveis para delegação
  const colaboradoresDisponiveis = useMemo(() => {
    if (!currentUser) return [];

    // Verificar se usuário atual pode delegar
    if (!podeDelegar(currentUser)) return [];

    return mockUsers.filter(user => {
      // Não delegar para si mesmo
      if (user.id === currentUser.id) return false;

      // Não delegar para mao_de_obra (sem acesso ao sistema)
      if (user.cargo_slug === 'mao_de_obra') return false;

      // Admin e Diretoria podem delegar para qualquer um
      if (isAdminOuDiretoria(currentUser)) return true;

      // Gestor Administrativo pode delegar para qualquer setor
      if (currentUser.cargo_slug === 'gestor_administrativo') return true;

      // Gestor de setor pode delegar apenas para seu setor
      if (isGestor(currentUser)) {
        return user.setor_slug === currentUser.setor_slug;
      }

      return false;
    });
  }, [currentUser]);

  // Resetar form ao abrir
  React.useEffect(() => {
    if (isOpen) {
      setSelectedColaborador(null);
      setDescricaoTarefa('');
      setObservacoes('');
      setDataPrazo('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !selectedColaborador) return;

    // Validações
    if (!descricaoTarefa.trim()) {
      toast.error('Descreva a tarefa a ser delegada');
      return;
    }

    if (descricaoTarefa.trim().length < 10) {
      toast.error('A descrição da tarefa deve ter no mínimo 10 caracteres');
      return;
    }

    if (!dataPrazo) {
      toast.error('Defina um prazo para a tarefa');
      return;
    }

    // Verificar se data é futura
    const prazo = new Date(dataPrazo);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (prazo < hoje) {
      toast.error('O prazo deve ser uma data futura');
      return;
    }

    setIsSubmitting(true);

    try {
      // Chamar API para criar delegação no Supabase
      console.log('📋 Criando delegação via API...');

      const resultado = await ordensServicoAPI.createDelegacao({
        os_id: os.id,
        delegante_id: currentUser.id,
        delegado_id: selectedColaborador.id,
        descricao_tarefa: descricaoTarefa.trim(),
        observacoes: observacoes.trim() || undefined,
        data_prazo: dataPrazo,
        status_delegacao: 'pendente',
      });

      console.log('✅ Delegação criada com sucesso:', resultado);

      // Converter resultado da API para o tipo local Delegacao
      const novaDelegacao: Delegacao = {
        id: resultado.id,
        os_id: resultado.os_id,
        delegante_id: resultado.delegante_id,
        delegante_nome: resultado.delegante_nome,
        delegado_id: resultado.delegado_id,
        delegado_nome: resultado.delegado_nome,
        data_delegacao: resultado.created_at,
        data_prazo: resultado.data_prazo,
        status_delegacao: resultado.status_delegacao,
        descricao_tarefa: resultado.descricao_tarefa,
        observacoes: resultado.observacoes,
        created_at: resultado.created_at,
        updated_at: resultado.updated_at,
        data_criacao: resultado.created_at,
        data_atualizacao: resultado.updated_at,
      };

      // Callback de sucesso
      if (onDelegarSuccess) {
        onDelegarSuccess(novaDelegacao);
      }

      toast.success(
        `Tarefa delegada com sucesso para ${selectedColaborador.nome_completo}!`
      );

      onClose();
    } catch (error: any) {
      console.error('Erro ao delegar tarefa:', error);

      // Mensagem de erro específica baseada no erro retornado
      const errorMessage = error?.message || 'Erro ao delegar tarefa. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'diretoria') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role.startsWith('gestor_')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  };

  const getRoleLabel = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Delegar Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da OS */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium mb-3">Ordem de Serviço</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Código:</span>
                <span className="text-sm font-medium">{os.codigo_os}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-neutral-600">Descrição:</span>
                <span className="text-sm font-medium text-right">{os.descricao}</span>
              </div>
              {os.cliente_nome && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Cliente:</span>
                  <span className="text-sm font-medium">{os.cliente_nome}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seleção de Colaborador */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Delegar para <span className="text-red-500">*</span>
            </Label>

            {colaboradoresDisponiveis.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Nenhum colaborador disponível
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Você não tem permissão para delegar tarefas ou não há colaboradores ativos no sistema.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-2">
                {colaboradoresDisponiveis.map((colaborador) => (
                  <button
                    key={colaborador.id}
                    type="button"
                    onClick={() => setSelectedColaborador(colaborador)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${
                        selectedColaborador?.id === colaborador.id
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-primary/50 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={colaborador.avatar_url} alt={colaborador.nome_completo} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(colaborador.nome_completo)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {colaborador.nome_completo}
                          </p>
                          {selectedColaborador?.id === colaborador.id && (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRoleBadgeColor(colaborador.cargo_slug || '')}`}
                          >
                            {getRoleLabel(colaborador.cargo_slug || '')}
                          </Badge>
                          <span className="text-xs text-neutral-500 capitalize">
                            {colaborador.setor_slug || colaborador.setor || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Descrição da Tarefa */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição da Tarefa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente a tarefa que está sendo delegada..."
              value={descricaoTarefa}
              onChange={(e) => setDescricaoTarefa(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-500">
              Mínimo de 10 caracteres • {descricaoTarefa.length} caracteres
            </p>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <Label htmlFor="prazo" className="text-sm font-medium">
              Prazo para Conclusão <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <Input
                id="prazo"
                type="date"
                value={dataPrazo}
                onChange={(e) => setDataPrazo(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Observações (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">
              Observações <span className="text-xs text-neutral-500">(Opcional)</span>
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione informações adicionais, requisitos especiais, etc..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <PrimaryButton
              type="submit"
              disabled={!selectedColaborador || !descricaoTarefa || !dataPrazo || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Delegando..."
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Delegar Tarefa
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
