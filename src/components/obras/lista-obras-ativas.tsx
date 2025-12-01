import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Building2, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { mockObrasAtivas, ObraAtiva } from '../../lib/mock-data-gestores';
import { ModalAtualizarCronograma } from './modal-atualizar-cronograma';

/**
 * GESTOR DE OBRAS - GESTÃO DE CRONOGRAMAS (OS 01-04, 13)
 * Lista de obras ativas com percentual de conclusão e status de cronograma
 */

export function ListaObrasAtivas() {
  const [obras, setObras] = useState<ObraAtiva[]>(mockObrasAtivas);
  const [obraSelecionada, setObraSelecionada] = useState<ObraAtiva | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  const tipoOSLabel: Record<string, string> = {
    OS_01: 'OS 01 - Obras Públicas',
    OS_02: 'OS 02 - Obras Privadas',
    OS_03: 'OS 03 - Reformas',
    OS_04: 'OS 04 - Ampliações',
    OS_13: 'OS 13 - Execução de Obra',
  };

  const statusCronogramaIcon = (status: string) => {
    switch (status) {
      case 'NO_PRAZO':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'ATENCAO':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'ATRASADO':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const statusCronogramaBadge = (status: string) => {
    switch (status) {
      case 'NO_PRAZO':
        return (
          <Badge variant="outline" className="border-success text-success">
            No Prazo
          </Badge>
        );
      case 'ATENCAO':
        return (
          <Badge variant="outline" className="border-warning text-warning">
            Atenção
          </Badge>
        );
      case 'ATRASADO':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return null;
    }
  };

  const handleAbrirModal = (obra: ObraAtiva) => {
    setObraSelecionada(obra);
    setModalAberto(true);
  };

  const handleAtualizarObra = (obraAtualizada: ObraAtiva) => {
    setObras(prev =>
      prev.map(o => (o.id === obraAtualizada.id ? obraAtualizada : o))
    );
    setModalAberto(false);
    setObraSelecionada(null);
  };

  const obrasFiltradas = obras.filter(o =>
    filtroStatus === 'TODOS' ? true : o.statusCronograma === filtroStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Gestão de Cronogramas - Obras Ativas</h1>
        <p className="text-muted-foreground">
          Acompanhamento de obras em andamento (OS 01-04, 13)
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total de Obras</p>
                <div className="font-mono" style={{ fontSize: '1.5rem' }}>{obras.length}</div>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">No Prazo</p>
                <div className="font-mono text-success" style={{ fontSize: '1.5rem' }}>
                  {obras.filter(o => o.statusCronograma === 'NO_PRAZO').length}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Atrasadas</p>
                <div className="font-mono text-destructive" style={{ fontSize: '1.5rem' }}>
                  {obras.filter(o => o.statusCronograma === 'ATRASADO').length}
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filtroStatus === 'TODOS' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('TODOS')}
            >
              Todos ({obras.length})
            </Button>
            <Button
              variant={filtroStatus === 'NO_PRAZO' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('NO_PRAZO')}
            >
              No Prazo ({obras.filter(o => o.statusCronograma === 'NO_PRAZO').length})
            </Button>
            <Button
              variant={filtroStatus === 'ATENCAO' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('ATENCAO')}
            >
              Atenção ({obras.filter(o => o.statusCronograma === 'ATENCAO').length})
            </Button>
            <Button
              variant={filtroStatus === 'ATRASADO' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('ATRASADO')}
            >
              Atrasado ({obras.filter(o => o.statusCronograma === 'ATRASADO').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Obras */}
      <Card>
        <CardHeader>
          <CardTitle>Obras em Execução</CardTitle>
          <CardDescription>
            {obrasFiltradas.length} obra(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente / Obra</TableHead>
                <TableHead>Tipo OS</TableHead>
                <TableHead>% Concluído</TableHead>
                <TableHead>Status Cronograma</TableHead>
                <TableHead>Último Diário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obrasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma obra encontrada com os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                obrasFiltradas.map(obra => (
                  <TableRow key={obra.id}>
                    <TableCell className="font-mono">{obra.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div>{obra.cliente}</div>
                        <div className="text-muted-foreground">{obra.tituloObra}</div>
                        <div className="text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {obra.localidade}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tipoOSLabel[obra.tipoOS]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{obra.percentualConcluido}%</span>
                        </div>
                        <Progress value={obra.percentualConcluido} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusCronogramaIcon(obra.statusCronograma)}
                        {statusCronogramaBadge(obra.statusCronograma)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {obra.ultimoDiarioObra ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(obra.ultimoDiarioObra).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAbrirModal(obra)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Atualizar Cronograma
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Atualização */}
      {obraSelecionada && (
        <ModalAtualizarCronograma
          obra={obraSelecionada}
          aberto={modalAberto}
          onFechar={() => {
            setModalAberto(false);
            setObraSelecionada(null);
          }}
          onAtualizar={handleAtualizarObra}
        />
      )}
    </div>
  );
}
