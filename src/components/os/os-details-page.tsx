import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Calendar,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';
import { OrdemServico, Comentario, Documento, HistoricoItem, Etapa } from '@/lib/types';
import { toast } from '../../lib/utils/safe-toast';

interface OSDetailsPageProps {
  ordemServico: OrdemServico;
  comentarios: Comentario[];
  documentos: Documento[];
  historico: HistoricoItem[];
  etapas: Etapa[];
  onBack?: () => void;
  onAddComentario: (texto: string) => void;
}

const getStatusBadge = (status: string) => {
  const badges = {
    'triagem': <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-medium">Triagem</Badge>,
    'em-andamento': <Badge className="bg-primary/20 text-primary font-medium">Em Andamento</Badge>,
    'em-validacao': <Badge className="bg-secondary/20 text-secondary font-medium">Em Validação</Badge>,
    'concluida': <Badge className="bg-green-100 text-green-700 font-medium">Concluída</Badge>,
    'rejeitada': <Badge className="bg-destructive/20 text-destructive font-medium">Rejeitada</Badge>,
  };
  return badges[status as keyof typeof badges];
};

const getHistoricoIcon = (tipo: string) => {
  switch (tipo) {
    case 'status': return '🔄';
    case 'comentario': return '💬';
    case 'documento': return '📎';
    case 'atribuicao': return '👤';
    default: return '•';
  }
};

export function OSDetailsPage({
  ordemServico,
  comentarios,
  documentos,
  historico,
  etapas,
  onAddComentario
}: OSDetailsPageProps) {
  const [novoComentario, setNovoComentario] = useState('');

  const handleAddComentario = () => {
    if (!novoComentario.trim()) {
      toast.error('Digite um comentário antes de adicionar');
      return;
    }

    onAddComentario(novoComentario);
    setNovoComentario('');
    toast.success('Comentário adicionado com sucesso!');
  };

  const handleUploadDocument = () => {
    toast.info('Funcionalidade de upload em desenvolvimento');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 rounded-md"
        >
          <Link to="/os">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{ordemServico.codigo_os}</h1>
          <p className="text-neutral-600 font-normal">{ordemServico.cliente_nome}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* OS Details Card */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Detalhes da OS</CardTitle>
                {getStatusBadge(ordemServico.status_geral)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <User className="w-4 h-4" />
                    <span>Cliente</span>
                  </div>
                  <p className="font-normal text-lg">{ordemServico.cliente_nome}</p>
                  {ordemServico.cliente && (
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {ordemServico.cliente.email && (
                        <p className="flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center text-xs opacity-70">@</span>
                          {ordemServico.cliente.email}
                        </p>
                      )}
                      {ordemServico.cliente.telefone && (
                        <p className="flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center text-xs opacity-70">📞</span>
                          {ordemServico.cliente.telefone}
                        </p>
                      )}
                      {ordemServico.cliente.endereco && (
                        <p className="flex items-start gap-2 mt-1">
                          <span className="w-4 h-4 flex items-center justify-center text-xs opacity-70 mt-0.5">📍</span>
                          <span className="flex-1">
                            {ordemServico.cliente.endereco.rua}, {ordemServico.cliente.endereco.numero}
                            {ordemServico.cliente.endereco.bairro && ` - ${ordemServico.cliente.endereco.bairro}`}
                            {ordemServico.cliente.endereco.cidade && ` - ${ordemServico.cliente.endereco.cidade}`}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <FileText className="w-4 h-4" />
                    <span>Tipo de Serviço</span>
                  </div>
                  <p className="font-normal">{ordemServico.tipo_os_nome}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>Data de Início</span>
                  </div>
                  <p className="font-normal">{ordemServico.data_entrada ? formatDate(ordemServico.data_entrada) : '-'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Prazo de Entrega</span>
                  </div>
                  <p className="font-normal">{ordemServico.data_prazo ? formatDate(ordemServico.data_prazo) : '-'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                  <User className="w-4 h-4" />
                  <span>Responsável</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-white font-medium">
                      {ordemServico.responsavel_nome?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ordemServico.responsavel_nome || 'Não atribuído'}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Descrição</span>
                </div>
                <p className="text-neutral-700 font-normal">{ordemServico.descricao}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Documentos Gerados</CardTitle>
                <Button
                  size="sm"
                  onClick={handleUploadDocument}
                  className="rounded-md font-semibold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Documentos do Workflow */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Documentos Oficiais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {etapas.filter(e =>
                  (e.nome_etapa.toLowerCase().includes('proposta') ||
                    e.nome_etapa.toLowerCase().includes('laudo') ||
                    e.nome_etapa.toLowerCase().includes('contrato'))
                  ).map(etapa => {
                    const isConcluida = etapa.status === 'concluida';
                    return (
                      <Button
                        key={etapa.id}
                        variant="outline"
                        className={`h-auto p-3 justify-start gap-3 ${!isConcluida ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}
                        asChild={isConcluida}
                        disabled={!isConcluida}
                      >
                        {isConcluida ? (
                          <Link
                            to={`/os/details-workflow/${ordemServico.id}`}
                            search={{ step: etapa.ordem }}
                            className="flex items-center gap-3 w-full"
                          >
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{etapa.nome_etapa}</div>
                              <div className="text-xs text-muted-foreground">
                                {isConcluida ? 'Disponível' : 'Pendente'}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 w-full">
                            <div className="bg-muted p-2 rounded-full text-muted-foreground">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{etapa.nome_etapa}</div>
                              <div className="text-xs text-muted-foreground">
                                Pendente
                              </div>
                            </div>
                          </div>
                        )}
                      </Button>
                    );
                  })}
                  {etapas.filter(e =>
                  (e.nome_etapa.toLowerCase().includes('proposta') ||
                    e.nome_etapa.toLowerCase().includes('laudo') ||
                    e.nome_etapa.toLowerCase().includes('contrato'))
                  ).length === 0 && (
                      <div className="col-span-full text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-md border border-dashed">
                        Nenhum documento oficial previsto para esta OS.
                      </div>
                    )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Anexos</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleUploadDocument}
                    className="h-8 text-xs"
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {documentos.length === 0 ? (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    <p>Nenhum anexo adicional</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documentos.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-colors border border-border"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{doc.nome}</p>
                            <p className="text-[10px] text-neutral-500">
                              {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Etapas do Workflow Card */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Etapas do Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[50px]">#</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Etapa</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Responsável</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etapas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma etapa encontrada
                        </td>
                      </tr>
                    ) : (
                      etapas.map((etapa) => (
                        <tr key={etapa.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{etapa.ordem}</td>
                          <td className="p-4">{etapa.nome_etapa}</td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={`
                                ${etapa.status === 'concluida' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                ${etapa.status === 'em_andamento' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                ${etapa.status === 'pendente' ? 'bg-gray-50 text-gray-600 border-gray-200' : ''}
                              `}
                            >
                              {etapa.status === 'concluida' ? 'Concluída' :
                                etapa.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {etapa.responsavel_id ? 'Definido' : '-'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(etapa.updated_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline (1/3) */}
        <div className="space-y-6">
          {/* Comments Section */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <MessageSquare className="w-5 h-5" />
                Comentários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comentarios.map(comentario => (
                  <div key={comentario.id} className="flex gap-2">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-white text-xs font-medium">
                        {comentario.userAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-neutral-50 rounded-md p-3 border border-neutral-200">
                        <p className="text-xs text-neutral-800 mb-1 font-medium">{comentario.userName}</p>
                        <p className="text-sm text-neutral-700 font-normal">{comentario.texto}</p>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-normal">
                        {formatDateTime(comentario.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <Textarea
                  placeholder="Adicionar um comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  rows={3}
                  className="border-neutral-300 rounded-md"
                />
                <Button
                  size="sm"
                  onClick={handleAddComentario}
                  className="w-full rounded-md font-semibold"
                >
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Timeline */}
          <Card className="border-neutral-200 rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Histórico e Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historico.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm">
                        {getHistoricoIcon(item.tipo)}
                      </div>
                      {index < historico.length - 1 && (
                        <div className="w-0.5 h-full bg-neutral-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-neutral-800 font-normal">{item.descricao}</p>
                      <p className="text-xs text-neutral-500 mt-1 font-normal">
                        {item.userName} • {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}