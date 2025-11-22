import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, CheckCircle, XCircle, Eye, AlertCircle, Download } from 'lucide-react';
import { mockReformasPendentes, ReformaPendente } from '../../lib/mock-data-gestores';
import { toast } from 'sonner@2.0.3';

/**
 * GESTOR DE ASSESSORIA - ANÁLISE DE REFORMAS (OS 07)
 * Lista de solicitações de reforma com validação de documentação (ART/RRT)
 */

export function AnaliseReformas() {
  const [reformas, setReformas] = useState<ReformaPendente[]>(mockReformasPendentes);
  const [reformaSelecionada, setReformaSelecionada] = useState<ReformaPendente | null>(null);
  const [modalAnalisar, setModalAnalisar] = useState(false);
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const tipoReformaLabel: Record<string, string> = {
    ESTRUTURAL: 'Estrutural',
    NAO_ESTRUTURAL: 'Não Estrutural',
    INSTALACOES: 'Instalações',
    ACABAMENTO: 'Acabamento',
  };

  const statusDocLabel: Record<string, string> = {
    pendente_art: 'Pendente ART',
    art_enviada: 'ART Enviada',
    rrt_enviada: 'RRT Enviada',
    completo: 'Completo',
  };

  const statusAprovacaoLabel: Record<string, string> = {
    aguardando_analise: 'Aguardando Análise',
    em_analise: 'Em Análise',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    pendente_documentacao: 'Pendente Documentação',
  };

  const statusDocBadgeVariant = (status: string) => {
    switch (status) {
      case 'completo':
        return 'outline';
      case 'pendente_art':
      case 'art_enviada':
      case 'rrt_enviada':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const statusAprovacaoBadgeVariant = (status: string) => {
    switch (status) {
      case 'aguardando_analise':
        return 'default';
      case 'em_analise':
        return 'secondary';
      case 'aprovado':
        return 'outline';
      case 'reprovado':
        return 'destructive';
      case 'pendente_documentacao':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleAbrirAnalisar = (reforma: ReformaPendente) => {
    setReformaSelecionada(reforma);
    setNovoStatus(reforma.statusAprovacao);
    setObservacoes('');
    setModalAnalisar(true);
  };

  const handleSalvarAnalise = () => {
    if (!reformaSelecionada || !novoStatus) {
      toast.error('Selecione um status para continuar');
      return;
    }

    setReformas(prev =>
      prev.map(r =>
        r.id === reformaSelecionada.id
          ? { ...r, statusAprovacao: novoStatus as any, observacoes }
          : r
      )
    );

    const mensagem =
      novoStatus === 'aprovado'
        ? 'Reforma aprovada com sucesso!'
        : novoStatus === 'reprovado'
          ? 'Reforma reprovada'
          : 'Status da reforma atualizado';

    toast.success(mensagem, {
      description: `${reformaSelecionada.condominio} - ${reformaSelecionada.unidade}`,
    });

    setModalAnalisar(false);
    setReformaSelecionada(null);
    setNovoStatus('');
    setObservacoes('');
  };

  const reformasFiltradas = reformas.filter(r =>
    filtroStatus === 'todos' ? true : r.statusAprovacao.toLowerCase() === filtroStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Análise de Projetos - Reformas (OS 07)</h1>
        <p className="text-muted-foreground">
          Validação de documentação (ART/RRT) e aprovação de solicitações de reforma
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
              Todos ({reformas.length})
            </Button>
            <Button
              variant={filtroStatus === 'aguardando_analise' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('aguardando_analise')}
            >
              Aguardando Análise ({reformas.filter(r => r.statusAprovacao.toLowerCase() === 'aguardando_analise').length})
            </Button>
            <Button
              variant={filtroStatus === 'em_analise' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('em_analise')}
            >
              Em Análise ({reformas.filter(r => r.statusAprovacao.toLowerCase() === 'em_analise').length})
            </Button>
            <Button
              variant={filtroStatus === 'aprovado' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('aprovado')}
            >
              Aprovados ({reformas.filter(r => r.statusAprovacao.toLowerCase() === 'aprovado').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Reformas */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Reforma</CardTitle>
          <CardDescription>
            {reformasFiltradas.length} reforma(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código OS</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Tipo Reforma</TableHead>
                <TableHead>Status Documentação</TableHead>
                <TableHead>Status Aprovação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reformasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma reforma encontrada com os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                reformasFiltradas.map(reforma => (
                  <TableRow key={reforma.id}>
                    <TableCell className="font-mono">{reforma.codigo}</TableCell>
                    <TableCell>{reforma.condominio}</TableCell>
                    <TableCell>{reforma.unidade}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tipoReformaLabel[reforma.tipoReforma]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusDocBadgeVariant(reforma.statusDocumentacao.toLowerCase())}>
                        {statusDocLabel[reforma.statusDocumentacao.toLowerCase()] || reforma.statusDocumentacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusAprovacaoBadgeVariant(reforma.statusAprovacao.toLowerCase())}>
                        {statusAprovacaoLabel[reforma.statusAprovacao.toLowerCase()] || reforma.statusAprovacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAbrirAnalisar(reforma)}
                        className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Analisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Análise */}
      <Dialog open={modalAnalisar} onOpenChange={setModalAnalisar}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Analisar Solicitação de Reforma</DialogTitle>
            <DialogDescription>
              Validar documentação e aprovar/reprovar a solicitação
            </DialogDescription>
          </DialogHeader>

          {reformaSelecionada && (
            <div className="space-y-4">
              {/* Informações da Reforma */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Código OS</Label>
                  <p className="font-mono">{reformaSelecionada.codigo}</p>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <p>{reformaSelecionada.responsavel}</p>
                </div>
                <div>
                  <Label>Condomínio</Label>
                  <p>{reformaSelecionada.condominio}</p>
                </div>
                <div>
                  <Label>Unidade</Label>
                  <p>{reformaSelecionada.unidade}</p>
                </div>
                <div>
                  <Label>Tipo de Reforma</Label>
                  <Badge variant="outline">
                    {tipoReformaLabel[reformaSelecionada.tipoReforma]}
                  </Badge>
                </div>
                <div>
                  <Label>Data Solicitação</Label>
                  <p>{new Date(reformaSelecionada.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                </div>
                {reformaSelecionada.valorEstimado && (
                  <div>
                    <Label>Valor Estimado</Label>
                    <p className="font-mono">
                      R$ {reformaSelecionada.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                <div>
                  <Label>Status Documentação</Label>
                  <Badge variant={statusDocBadgeVariant(reformaSelecionada.statusDocumentacao)}>
                    {statusDocLabel[reformaSelecionada.statusDocumentacao]}
                  </Badge>
                </div>
              </div>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Anexados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reformaSelecionada.documentos?.art && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>ART: {reformaSelecionada.documentos.art}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {reformaSelecionada.documentos?.rrt && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>RRT: {reformaSelecionada.documentos.rrt}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {reformaSelecionada.documentos?.projeto && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>Projeto: {reformaSelecionada.documentos.projeto}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {reformaSelecionada.documentos?.memorial && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>Memorial: {reformaSelecionada.documentos.memorial}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {!reformaSelecionada.documentos?.art &&
                      !reformaSelecionada.documentos?.rrt &&
                      !reformaSelecionada.documentos?.projeto &&
                      !reformaSelecionada.documentos?.memorial && (
                        <div className="flex items-center gap-2 text-muted-foreground p-4 text-center">
                          <AlertCircle className="h-4 w-4" />
                          <span>Nenhum documento anexado</span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Decisão de Aprovação */}
              <div className="space-y-2">
                <Label htmlFor="status">Decisão de Aprovação *</Label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status da análise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="aprovado">Aprovar Reforma</SelectItem>
                    <SelectItem value="reprovado">Reprovar Reforma</SelectItem>
                    <SelectItem value="pendente_documentacao">Pendente Documentação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações / Feedback</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre a análise da reforma..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAnalisar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarAnalise}
              className="bg-[#D3AF37] hover:bg-[#D3AF37]/90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Salvar Análise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}