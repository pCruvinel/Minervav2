import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { FileText, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { mockLaudosPendentes, LaudoPendente } from '../../lib/mock-data-gestores';
import { toast } from 'sonner@2.0.3';

/**
 * GESTOR DE ASSESSORIA - VALIDAÇÃO DE LAUDOS (OS 06/08)
 * Tabela de laudos gerados pelos colaboradores aguardando revisão e aprovação
 */

export function FilaAprovacaoLaudos() {
  const [laudos, setLaudos] = useState<LaudoPendente[]>(mockLaudosPendentes);
  const [laudoSelecionado, setLaudoSelecionado] = useState<LaudoPendente | null>(null);
  const [modalRevisar, setModalRevisar] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const tiposLaudoLabel: Record<string, string> = {
    VISTORIA_TECNICA: 'Vistoria Técnica',
    LAUDO_ESTRUTURAL: 'Laudo Estrutural',
    PERICIA_ENGENHARIA: 'Perícia de Engenharia',
    AVALIACAO_IMOVEL: 'Avaliação de Imóvel',
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pendente_revisao':
        return 'default';
      case 'em_revisao':
        return 'secondary';
      case 'aprovado':
        return 'outline';
      case 'rejeitado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const statusLabel: Record<string, string> = {
    pendente_revisao: 'Pendente Revisão',
    em_revisao: 'Em Revisão',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
  };

  const handleAbrirRevisar = (laudo: LaudoPendente) => {
    setLaudoSelecionado(laudo);
    setObservacoes(laudo.observacoes || '');
    setModalRevisar(true);
  };

  const handleAprovar = () => {
    if (!laudoSelecionado) return;

    setLaudos(prev =>
      prev.map(l =>
        l.id === laudoSelecionado.id
          ? { ...l, status: 'aprovado', observacoes }
          : l
      )
    );

    toast.success('Laudo aprovado com sucesso!', {
      description: `O PDF final será gerado automaticamente para ${laudoSelecionado.cliente}.`,
    });

    setModalRevisar(false);
    setLaudoSelecionado(null);
    setObservacoes('');
  };

  const handleRejeitar = () => {
    if (!laudoSelecionado) return;

    setLaudos(prev =>
      prev.map(l =>
        l.id === laudoSelecionado.id
          ? { ...l, status: 'rejeitado', observacoes }
          : l
      )
    );

    toast.error('Laudo rejeitado', {
      description: `O colaborador ${laudoSelecionado.autor} será notificado para correções.`,
    });

    setModalRevisar(false);
    setLaudoSelecionado(null);
    setObservacoes('');
  };

  const laudosFiltrados = laudos.filter(l =>
    filtroStatus === 'todos' ? true : l.status.toLowerCase() === filtroStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Fila de Aprovação de Laudos</h1>
        <p className="text-muted-foreground">
          Revisar e aprovar laudos gerados pelos colaboradores (OS 06/08)
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filtroStatus === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('todos')}
            >
              Todos ({laudos.length})
            </Button>
            <Button
              variant={filtroStatus === 'pendente_revisao' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('pendente_revisao')}
            >
              Pendente Revisão ({laudos.filter(l => l.status.toLowerCase() === 'pendente_revisao').length})
            </Button>
            <Button
              variant={filtroStatus === 'em_revisao' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('em_revisao')}
            >
              Em Revisão ({laudos.filter(l => l.status.toLowerCase() === 'em_revisao').length})
            </Button>
            <Button
              variant={filtroStatus === 'aprovado' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('aprovado')}
            >
              Aprovados ({laudos.filter(l => l.status.toLowerCase() === 'aprovado').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Laudos */}
      <Card>
        <CardHeader>
          <CardTitle>Laudos Técnicos</CardTitle>
          <CardDescription>
            {laudosFiltrados.length} laudo(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Laudo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Data Submissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laudosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum laudo encontrado com os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                laudosFiltrados.map(laudo => (
                  <TableRow key={laudo.id}>
                    <TableCell className="font-mono">{laudo.codigo}</TableCell>
                    <TableCell>{laudo.cliente}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {tiposLaudoLabel[laudo.tipoLaudo]}
                      </div>
                    </TableCell>
                    <TableCell>{laudo.autor}</TableCell>
                    <TableCell>
                      {new Date(laudo.dataSubmissao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(laudo.status.toLowerCase())}>
                        {statusLabel[laudo.status.toLowerCase()] || laudo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {laudo.status.toLowerCase() === 'pendente_revisao' || laudo.status.toLowerCase() === 'em_revisao' ? (
                          <Button
                            size="sm"
                            onClick={() => handleAbrirRevisar(laudo)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Revisar e Aprovar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Revisão */}
      <Dialog open={modalRevisar} onOpenChange={setModalRevisar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Laudo Técnico</DialogTitle>
            <DialogDescription>
              Revise o laudo e aprove para gerar o PDF final ou rejeite para solicitar correções
            </DialogDescription>
          </DialogHeader>

          {laudoSelecionado && (
            <div className="space-y-4">
              {/* Informações do Laudo */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Cliente</Label>
                  <p>{laudoSelecionado.cliente}</p>
                </div>
                <div>
                  <Label>Código OS</Label>
                  <p className="font-mono">{laudoSelecionado.codigo}</p>
                </div>
                <div>
                  <Label>Tipo de Laudo</Label>
                  <p>{tiposLaudoLabel[laudoSelecionado.tipoLaudo]}</p>
                </div>
                <div>
                  <Label>Autor</Label>
                  <p>{laudoSelecionado.autor}</p>
                </div>
                <div>
                  <Label>Data de Submissão</Label>
                  <p>{new Date(laudoSelecionado.dataSubmissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Arquivo</Label>
                  <p className="text-muted-foreground">{laudoSelecionado.arquivoRascunho}</p>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações / Feedback</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre a revisão do laudo..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Simulação de Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Laudo (Simulado)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Visualização do arquivo: {laudoSelecionado.arquivoRascunho}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar Rascunho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRevisar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejeitar}>
              <XCircle className="h-4 w-4 mr-1" />
              Rejeitar Laudo
            </Button>
            <Button
              onClick={handleAprovar}
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprovar e Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
