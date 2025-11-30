import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { MoreHorizontal, Eye, Edit, XCircle, Loader2, AlertTriangle } from 'lucide-react';

import { OrdemServico, User } from '../../lib/types';

interface OSTableProps {
  ordensServico: OrdemServico[];
  currentUser: User;
  canViewSetorColumn: boolean;
  onCancelOS?: (osId: string) => Promise<void>;
  isCancelling?: boolean;
}

export function OSTable({ ordensServico, currentUser, canViewSetorColumn, onCancelOS, isCancelling = false }: OSTableProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);

  const handleCancelClick = (os: OrdemServico) => {
    setSelectedOS(os);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedOS && onCancelOS) {
      await onCancelOS(selectedOS.id);
      setCancelDialogOpen(false);
      setSelectedOS(null);
    }
  };

  // Função para retornar o Badge de status com as cores corretas
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      em_andamento: {
        variant: 'secondary',
        label: 'Em Andamento',
        className: 'bg-[rgb(221,192,99)] text-black hover:bg-[rgb(221,192,99)]'
      },
      aguardando_aprovacao: {
        variant: 'default',
        label: 'Aguardando Aprovação',
        className: 'bg-[rgb(245,158,11)] text-white hover:bg-[rgb(245,158,11)]'
      },
      atrasada: {
        variant: 'destructive',
        label: 'Atrasada',
        className: 'bg-[rgb(239,68,68)] text-white hover:bg-[rgb(239,68,68)]'
      },
      concluida: {
        variant: 'default',
        label: 'Concluída',
        className: 'bg-[rgb(34,197,94)] text-white hover:bg-[rgb(34,197,94)]'
      },
      em_triagem: {
        variant: 'outline',
        label: 'Em Triagem'
      },
      cancelada: {
        variant: 'outline',
        label: 'Cancelada'
      }
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };


  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              {canViewSetorColumn && <TableHead>Setor</TableHead>}
              <TableHead>Responsável</TableHead>
              <TableHead>Início</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordensServico.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canViewSetorColumn ? 9 : 8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            ) : (
              ordensServico.map((os) => {
                const isActionNeeded = os.responsavel_id === currentUser.id &&
                  (os.status_geral === 'aguardando_aprovacao' || os.status_geral === 'atrasada');

                return (
                  <TableRow key={os.id} className={isActionNeeded ? "bg-amber-50/50 hover:bg-amber-50" : ""}>
                    <TableCell className="font-medium">
                      <Link
                        to="/os/$osId"
                        params={{ osId: os.id }}
                        className="text-primary hover:underline"
                      >
                        {os.codigo_os}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(os.status_geral)}</TableCell>
                    <TableCell>
                      {os.etapaAtual ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {os.etapaAtual.numero}. {os.etapaAtual.titulo}
                            </span>
                            {os.responsavel_id === currentUser.id &&
                              (os.status_geral === 'aguardando_aprovacao' || os.status_geral === 'atrasada') && (
                                <div title="Ação Necessária" className="text-amber-600">
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                              )}
                          </div>
                          <Badge variant="outline" className="w-fit text-[10px] h-5 px-1">
                            {os.etapaAtual.status === 'em_andamento' ? 'Em Andamento' :
                              os.etapaAtual.status === 'concluida' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{os.cliente_nome}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {os.tipo_os_nome}
                    </TableCell>
                    {canViewSetorColumn && (
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {os.setor_nome || '-'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{os.responsavel_nome?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{os.responsavel_nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {os.data_entrada ? formatDate(os.data_entrada) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/os/$osId" params={{ osId: os.id }} className="cursor-pointer w-full flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Rápido
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleCancelClick(os)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar a ordem de serviço {selectedOS?.codigo_os}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}