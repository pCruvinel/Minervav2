import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Plus,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  useContratos,
  formatCurrency,
  formatDate,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_COLORS,
  CONTRATO_STATUS_COLORS,
  type ContratoStatus,
} from '@/lib/hooks/use-contratos'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/_auth/comercial/contratos')({
  component: ContratosPage,
})

function ContratosPage() {
  const navigate = useNavigate()
  const { contratos, summary, isLoading, error } = useContratos()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  // Filtrar contratos
  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch =
      contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CONTRATO_TIPO_LABELS[contrato.tipo]?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'todos' || contrato.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calcular totais filtrados
  const totalContratos = filteredContratos.length
  const valorTotal = filteredContratos.reduce((acc, c) => acc + (c.valor_total || 0), 0)
  const contratosAtivos = filteredContratos.filter(
    (c) => c.status === 'ativo'
  ).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Contratos</h1>
          <p className="text-neutral-600 mt-1">
            Gerencie todos os contratos da empresa
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/comercial/novo-contrato' })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar contratos. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de Contratos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{totalContratos}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Contratos Ativos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{contratosAtivos}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Valor Total</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-900 mt-1">
                    {formatCurrency(valorTotal)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Buscar por número, cliente ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lista de Contratos</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${filteredContratos.length} contrato(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-neutral-600">Carregando contratos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Término</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                      {contratos.length === 0
                        ? 'Nenhum contrato cadastrado ainda'
                        : 'Nenhum contrato encontrado com os filtros aplicados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContratos.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell className="font-medium">
                        {contrato.numero_contrato || '-'}
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/clientes/$clienteId"
                          params={{ clienteId: contrato.cliente_id }}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          {contrato.cliente_nome}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={CONTRATO_TIPO_COLORS[contrato.tipo]}
                        >
                          {CONTRATO_TIPO_LABELS[contrato.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contrato.valor_total)}
                      </TableCell>
                      <TableCell>{formatDate(contrato.data_inicio)}</TableCell>
                      <TableCell>{formatDate(contrato.data_fim)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={CONTRATO_STATUS_COLORS[contrato.status]}
                        >
                          {CONTRATO_STATUS_LABELS[contrato.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Ver OS de Origem */}
                          {contrato.os_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigate({ 
                                  to: '/os/$osId', 
                                  params: { osId: contrato.os_id! } 
                                })
                              }}
                              title={`Ver OS ${contrato.os_codigo || ''}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {/* Download do contrato */}
                          {contrato.arquivo_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                window.open(contrato.arquivo_url!, '_blank')
                              }}
                              title="Download do contrato"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
