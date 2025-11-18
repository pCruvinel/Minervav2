import React, { useState } from 'react';
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
import { MoreHorizontal, Eye, Edit, XCircle, Loader2 } from 'lucide-react';

interface OrdemServicoData {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  cliente: { id: string; nome: string };
  tipoOS: { id: string; nome: string; setor: string };
  responsavel: { id: string; nome: string; avatar: string };
  etapaAtual: { numero: number; titulo: string; status: string } | null;
  dataInicio: string;
  dataPrazo: string;
  criadoEm: string;
}

interface OSTableProps {
  ordensServico: OrdemServicoData[];
  canViewSetorColumn: boolean;
  onNavigate: (route: string) => void;
  onCancelOS?: (osId: string) => Promise<void>;
  isCancelling?: boolean;
}

export function OSTable({ ordensServico, canViewSetorColumn, onNavigate, onCancelOS, isCancelling = false }: OSTableProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServicoData | null>(null);

  const handleCancelClick = (os: OrdemServicoData) => {
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
    const statusConfig: Record<string, { variant: any; label: string; className?: string }> = {
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

  // Função para verificar se a data está atrasada
  const isOverdue = (dataPrazo: string, status: string) => {
    if (status === 'concluida' || status === 'cancelada') return false;
    const today = new Date();
    const prazo = new Date(dataPrazo);
    return prazo < today;
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
              <TableHead>Código OS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Etapa Atual</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo de OS</TableHead>
              {canViewSetorColumn && <TableHead>Setor</TableHead>}
              <TableHead>Responsável</TableHead>
              <TableHead>Data Início</TableHead>
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
              ordensServico.map((os) => (
                <TableRow key={os.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => onNavigate('os-details-workflow')}
                      className="text-primary hover:underline"
                    >
                      {os.codigo}
                    </button>
                  </TableCell>
                  <TableCell>{getStatusBadge(os.status)}</TableCell>
                  <TableCell>
                    {os.etapaAtual ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          E{os.etapaAtual.numero}
                        </Badge>
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {os.etapaAtual.titulo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{os.cliente.nome}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {os.tipoOS.nome}
                  </TableCell>
                  {canViewSetorColumn && (
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {os.tipoOS.setor}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{os.responsavel.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{os.responsavel.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {os.dataInicio ? formatDate(os.dataInicio) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onNavigate('os-details-workflow')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar a ordem de serviço {selectedOS?.codigo}?
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