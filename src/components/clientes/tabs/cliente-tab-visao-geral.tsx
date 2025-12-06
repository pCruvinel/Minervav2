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
import {
  Building2,
  User,
  FileText,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { Cliente } from '@/lib/hooks/use-cliente-historico';

// Extended type to include observacoes which may come from the API
interface ClienteExtended extends Cliente {
  observacoes?: string;
}

interface ClienteTabVisaoGeralProps {
  cliente: ClienteExtended | undefined;
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
            <div>
              <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
              <p className="font-medium mt-1">{cliente.cpf_cnpj || '-'}</p>
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

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <p className="font-medium mt-1">{endereco.cep}</p>
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
