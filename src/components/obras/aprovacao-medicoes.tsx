import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { FileText, CheckCircle, XCircle, Eye, Download, TrendingUp } from 'lucide-react';
import { mockMedicoesPendentes, MedicaoPendente } from '../../lib/mock-data-gestores';
import { toast } from 'sonner@2.0.3';

/**
 * GESTOR DE OBRAS - APROVAÇÃO DE MEDIÇÕES
 * Lista de medições aguardando validação para faturamento
 */

export function AprovacaoMedicoes() {
  const [medicoes, setMedicoes] = useState<MedicaoPendente[]>(mockMedicoesPendentes);
  const [medicaoSelecionada, setMedicaoSelecionada] = useState<MedicaoPendente | null>(null);
  const [modalRevisar, setModalRevisar] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  const tipoMedicaoLabel: Record<string, string> = {
    FISICA: 'Física',
    FINANCEIRA: 'Financeira',
    AMBAS: 'Física + Financeira',
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_VALIDACAO':
        return 'default';
      case 'EM_ANALISE':
        return 'secondary';
      case 'APROVADO':
        return 'outline';
      case 'REJEITADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const statusLabel: Record<string, string> = {
    AGUARDANDO_VALIDACAO: 'Aguardando Validação',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
  };

  const handleAbrirRevisar = (medicao: MedicaoPendente) => {
    setMedicaoSelecionada(medicao);
    setObservacoes(medicao.observacoes || '');
    setModalRevisar(true);
  };

  const handleAprovar = () => {
    if (!medicaoSelecionada) return;

    setMedicoes(prev =>
      prev.map(m =>
        m.id === medicaoSelecionada.id
          ? { ...m, statusAprovacao: 'APROVADO', observacoes }
          : m
      )
    );

    toast.success('Medição aprovada com sucesso!', {
      description: `Medição ${medicaoSelecionada.numeroMedicao} liberada para faturamento.`,
    });

    setModalRevisar(false);
    setMedicaoSelecionada(null);
    setObservacoes('');
  };

  const handleRejeitar = () => {
    if (!medicaoSelecionada) return;

    setMedicoes(prev =>
      prev.map(m =>
        m.id === medicaoSelecionada.id
          ? { ...m, statusAprovacao: 'REJEITADO', observacoes }
          : m
      )
    );

    toast.error('Medição rejeitada', {
      description: `O responsável ${medicaoSelecionada.responsavel} será notificado para correções.`,
    });

    setModalRevisar(false);
    setMedicaoSelecionada(null);
    setObservacoes('');
  };

  const medicoesFiltradas = medicoes.filter(m =>
    filtroStatus === 'TODOS' ? true : m.statusAprovacao === filtroStatus
  );

  const totalValorPendente = medicoes
    .filter(m => m.statusAprovacao === 'AGUARDANDO_VALIDACAO' || m.statusAprovacao === 'EM_ANALISE')
    .reduce((acc, m) => acc + m.valorMedicao, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Aprovação de Medições</h1>
        <p className="text-muted-foreground">
          Validação de medições para liberação de faturamento
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total Pendente</p>
                <div className="font-mono" style={{ fontSize: '1.5rem' }}>
                  {medicoes.filter(m => m.statusAprovacao === 'AGUARDANDO_VALIDACAO').length}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-[#D3AF37]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Valor Pendente</p>
                <div className="font-mono" style={{ fontSize: '1.2rem' }}>
                  R$ {(totalValorPendente / 1000).toFixed(0)}K
                </div>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Aprovadas (Mês)</p>
                <div className="font-mono" style={{ fontSize: '1.5rem' }} className="text-green-600">
                  {medicoes.filter(m => m.statusAprovacao === 'APROVADO').length}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
              Todos ({medicoes.length})
            </Button>
            <Button
              variant={filtroStatus === 'AGUARDANDO_VALIDACAO' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('AGUARDANDO_VALIDACAO')}
            >
              Aguardando ({medicoes.filter(m => m.statusAprovacao === 'AGUARDANDO_VALIDACAO').length})
            </Button>
            <Button
              variant={filtroStatus === 'EM_ANALISE' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('EM_ANALISE')}
            >
              Em Análise ({medicoes.filter(m => m.statusAprovacao === 'EM_ANALISE').length})
            </Button>
            <Button
              variant={filtroStatus === 'APROVADO' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('APROVADO')}
            >
              Aprovados ({medicoes.filter(m => m.statusAprovacao === 'APROVADO').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Medições */}
      <Card>
        <CardHeader>
          <CardTitle>Medições de Obras</CardTitle>
          <CardDescription>
            {medicoesFiltradas.length} medição(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Obra / Cliente</TableHead>
                <TableHead>Nº Medição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>% Medido</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhuma medição encontrada com os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                medicoesFiltradas.map(medicao => (
                  <TableRow key={medicao.id}>
                    <TableCell className="font-mono">{medicao.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div>{medicao.obraCliente}</div>
                        <div className="text-muted-foreground">
                          Responsável: {medicao.responsavel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">#{medicao.numeroMedicao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tipoMedicaoLabel[medicao.tipoMedicao]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{medicao.percentualMedido}%</TableCell>
                    <TableCell className="font-mono">
                      R$ {medicao.valorMedicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(medicao.statusAprovacao)}>
                        {statusLabel[medicao.statusAprovacao]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {medicao.statusAprovacao === 'AGUARDANDO_VALIDACAO' ||
                          medicao.statusAprovacao === 'EM_ANALISE' ? (
                          <Button
                            size="sm"
                            onClick={() => handleAbrirRevisar(medicao)}
                            className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Validar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Validar Medição de Obra</DialogTitle>
            <DialogDescription>
              Revise os documentos e aprove para liberação de faturamento
            </DialogDescription>
          </DialogHeader>

          {medicaoSelecionada && (
            <div className="space-y-4">
              {/* Informações da Medição */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Código</Label>
                  <p className="font-mono">{medicaoSelecionada.codigo}</p>
                </div>
                <div>
                  <Label>Cliente / Obra</Label>
                  <p>{medicaoSelecionada.obraCliente}</p>
                </div>
                <div>
                  <Label>Número da Medição</Label>
                  <p className="font-mono">#{medicaoSelecionada.numeroMedicao}</p>
                </div>
                <div>
                  <Label>Tipo de Medição</Label>
                  <Badge variant="outline">
                    {tipoMedicaoLabel[medicaoSelecionada.tipoMedicao]}
                  </Badge>
                </div>
                <div>
                  <Label>Percentual Medido</Label>
                  <p className="font-mono">{medicaoSelecionada.percentualMedido}%</p>
                </div>
                <div>
                  <Label>Valor da Medição</Label>
                  <p className="font-mono">
                    R$ {medicaoSelecionada.valorMedicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <p>{medicaoSelecionada.responsavel}</p>
                </div>
                <div>
                  <Label>Data de Envio</Label>
                  <p>{new Date(medicaoSelecionada.dataEnvio).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Anexados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {medicaoSelecionada.documentos?.relatorioFotografico && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>Relatório Fotográfico: {medicaoSelecionada.documentos.relatorioFotografico}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {medicaoSelecionada.documentos?.planilhaMedicao && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>Planilha de Medição: {medicaoSelecionada.documentos.planilhaMedicao}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {medicaoSelecionada.documentos?.diarioObra && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span>Diário de Obra: {medicaoSelecionada.documentos.diarioObra}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações / Feedback</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre a validação da medição..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRevisar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejeitar}>
              <XCircle className="h-4 w-4 mr-1" />
              Rejeitar Medição
            </Button>
            <Button
              onClick={handleAprovar}
              className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprovar para Faturamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
