import React, { useState } from 'react';
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
import { OrdemServico, Comentario, Documento, HistoricoItem } from '@/lib/types';
import { toast } from '../../lib/utils/safe-toast';

interface OSDetailsPageProps {
  ordemServico: OrdemServico;
  comentarios: Comentario[];
  documentos: Documento[];
  historico: HistoricoItem[];
  onBack: () => void;
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
  onBack,
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
          onClick={onBack}
          className="gap-2 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{ordemServico.codigo}</h1>
          <p className="text-neutral-600 font-normal">{ordemServico.cliente}</p>
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
                {getStatusBadge(ordemServico.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <User className="w-4 h-4" />
                    <span>Cliente</span>
                  </div>
                  <p className="font-normal">{ordemServico.cliente}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <FileText className="w-4 h-4" />
                    <span>Tipo de Serviço</span>
                  </div>
                  <p className="font-normal">{ordemServico.tipo}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>Data de Início</span>
                  </div>
                  <p className="font-normal">{formatDate(ordemServico.prazoInicio)}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Prazo de Entrega</span>
                  </div>
                  <p className="font-normal">{formatDate(ordemServico.prazoFim)}</p>
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
                      {ordemServico.responsavel.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ordemServico.responsavel.name}</p>
                    <p className="text-xs text-neutral-500 font-normal">{ordemServico.responsavel.email}</p>
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
            <CardContent>
              {documentos.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-normal">Nenhum documento anexado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentos.map(doc => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-colors border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="text-sm font-medium">{doc.nome}</p>
                          <p className="text-xs text-neutral-500 font-normal">
                            Enviado por {doc.uploadedBy} em {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-md">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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