/**
 * ClienteTabVisaoGeral - Aba de Visão Geral do Cliente
 *
 * Exibe dados cadastrais, informações da empresa, responsável legal e contato.
 *
 * @example
 * ```tsx
 * <ClienteTabVisaoGeral cliente={cliente} onDownloadContrato={handleDownload} />
 * ```
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  User,
  FileText,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Home,
  Waves,
  ArrowUp,
} from 'lucide-react';
import { Cliente } from '@/lib/hooks/use-cliente-historico';

// Labels para tipos
const TIPO_CLIENTE_LABELS: Record<string, string> = {
  PESSOA_FISICA: 'Pessoa Física',
  PESSOA_JURIDICA: 'Pessoa Jurídica',
};

const TIPO_EMPRESA_LABELS: Record<string, string> = {
  ADMINISTRADORA: 'Administradora',
  CONDOMINIO: 'Condomínio',
  CONSTRUTORA: 'Construtora',
  INCORPORADORA: 'Incorporadora',
  INDUSTRIA: 'Indústria',
  COMERCIO: 'Comércio',
  OUTROS: 'Outros',
};

interface ClienteTabVisaoGeralProps {
  cliente: Cliente | undefined;
  isLoading?: boolean;
}

export function ClienteTabVisaoGeral({ cliente, isLoading }: ClienteTabVisaoGeralProps) {
  if (isLoading || !cliente) {
    return <VisaoGeralLoading />;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Parse endereco JSONB
  const endereco = cliente.endereco || {};
  const enderecoFormatado = endereco.logradouro
    ? `${endereco.logradouro}, ${endereco.numero || 's/n'}${endereco.complemento ? ` - ${endereco.complemento}` : ''}, ${endereco.bairro || ''} - ${endereco.cidade || ''}/${endereco.estado || ''}`
    : '-';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Razão Social</Label>
              <p className="font-medium mt-1">{cliente.nome_razao_social}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <p className="font-medium mt-1">
                  {cliente.tipo_cliente ? TIPO_CLIENTE_LABELS[cliente.tipo_cliente] : '-'}
                </p>
              </div>
              {cliente.tipo_empresa && (
                <div>
                  <Label className="text-xs text-muted-foreground">Segmento</Label>
                  <Badge variant="outline" className="mt-1">
                    {TIPO_EMPRESA_LABELS[cliente.tipo_empresa] || cliente.tipo_empresa}
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
              <p className="font-medium mt-1 font-mono">{cliente.cpf_cnpj || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="font-medium mt-1 capitalize">{cliente.status}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cadastrado em</Label>
              <p className="font-medium mt-1">{formatDate(cliente.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Responsável e Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Responsável e Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cliente.nome_responsavel && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Responsável</Label>
                  <p className="font-medium mt-1">{cliente.nome_responsavel}</p>
                  {endereco.cargo_responsavel && (
                    <p className="text-xs text-muted-foreground">{endereco.cargo_responsavel}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <p className="font-medium mt-1">{cliente.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <p className="font-medium mt-1">{cliente.telefone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Endereço Completo</Label>
              <p className="font-medium mt-1">{enderecoFormatado}</p>
            </div>
            {endereco.cep && (
              <div>
                <Label className="text-xs text-muted-foreground">CEP</Label>
                <p className="font-medium mt-1 font-mono">{endereco.cep}</p>
              </div>
            )}
          </div>

          {/* Características do Imóvel (se existirem) */}
          {(endereco.tipo_edificacao || endereco.qtd_unidades) && (
            <div className="mt-6 pt-4 border-t">
              <Label className="text-xs text-muted-foreground mb-3 block">
                Características do Imóvel
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {endereco.tipo_edificacao && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium">{endereco.tipo_edificacao}</p>
                  </div>
                )}
                {endereco.qtd_unidades && (
                  <div>
                    <p className="text-xs text-muted-foreground">Unidades</p>
                    <p className="font-medium">{endereco.qtd_unidades}</p>
                  </div>
                )}
                {endereco.qtd_blocos && (
                  <div>
                    <p className="text-xs text-muted-foreground">Blocos</p>
                    <p className="font-medium">{endereco.qtd_blocos}</p>
                  </div>
                )}
                {endereco.qtd_pavimentos && (
                  <div>
                    <p className="text-xs text-muted-foreground">Pavimentos</p>
                    <p className="font-medium">{endereco.qtd_pavimentos}</p>
                  </div>
                )}
              </div>

              {/* Características adicionais */}
              {(endereco.tipo_telhado || endereco.possui_elevador || endereco.possui_piscina) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {endereco.tipo_telhado && (
                    <Badge variant="outline" className="gap-1">
                      <Home className="h-3 w-3" />
                      {endereco.tipo_telhado}
                    </Badge>
                  )}
                  {endereco.possui_elevador && (
                    <Badge variant="outline" className="gap-1">
                      <ArrowUp className="h-3 w-3" />
                      Com Elevador
                    </Badge>
                  )}
                  {endereco.possui_piscina && (
                    <Badge variant="outline" className="gap-1">
                      <Waves className="h-3 w-3" />
                      Com Piscina
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      {cliente.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {cliente.observacoes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VisaoGeralLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
