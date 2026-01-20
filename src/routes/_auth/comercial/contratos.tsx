import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
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
} from '@/lib/hooks/use-contratos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/shared/page-header'
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableCell,
  CompactTableRow,
} from '@/components/shared/compact-table'
import { FilterBar, SearchInput, FilterSelect, DateRangePicker, type DateRange } from '@/components/shared/filters'

export const Route = createFileRoute('/_auth/comercial/contratos')({
  component: ContratosPage,
})

function ContratosPage() {
  const navigate = useNavigate()
  const { contratos, isLoading, error } = useContratos()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  // Pagination and sorting state
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<'numero_contrato' | 'cliente_nome' | 'valor_total' | 'data_inicio' | 'status' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filtrar contratos
  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch =
      contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CONTRATO_TIPO_LABELS[contrato.tipo]?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'todos' || contrato.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Handle Sort
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setPage(1)
  }

  // Sorted contracts
  const sortedContratos = useMemo(() => {
    if (!sortField) return filteredContratos
    return [...filteredContratos].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [filteredContratos, sortField, sortDirection])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedContratos.length / itemsPerPage))
  const paginatedContratos = sortedContratos.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  // Calcular totais filtrados
  const totalContratos = filteredContratos.length
  const valorTotal = filteredContratos.reduce((acc, c) => acc + (c.valor_total || 0), 0)
  const contratosAtivos = filteredContratos.filter(
    (c) => c.status === 'ativo'
  ).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      {/* Header */}
      <PageHeader
        title="Contratos"
        subtitle="Gerencie todos os contratos da empresa"
        showBackButton
      >
        <Button onClick={() => navigate({ to: '/comercial/novo-contrato' })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </PageHeader>

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
      <FilterBar>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por número, cliente ou tipo..."
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'rascunho', label: 'Rascunho' },
            { value: 'ativo', label: 'Ativo' },
            { value: 'suspenso', label: 'Suspenso' },
            { value: 'encerrado', label: 'Encerrado' },
            { value: 'cancelado', label: 'Cancelado' },
          ]}
          placeholder="Status"
        />
        <DateRangePicker
          startDate={dateRange?.start}
          endDate={dateRange?.end}
          onChange={setDateRange}
          placeholder="Período"
        />
      </FilterBar>

      {/* Tabela de Contratos */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-neutral-600">Carregando contratos...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CompactTableWrapper
          title="Lista de Contratos"
          totalItems={sortedContratos.length}
          currentCount={paginatedContratos.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(perPage) => {
            setItemsPerPage(perPage)
            setPage(1)
          }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <CompactTableHead
                  onSort={() => handleSort('numero_contrato')}
                  sortDirection={sortField === 'numero_contrato' ? sortDirection : undefined}
                >
                  Número
                </CompactTableHead>
                <CompactTableHead
                  onSort={() => handleSort('cliente_nome')}
                  sortDirection={sortField === 'cliente_nome' ? sortDirection : undefined}
                >
                  Cliente
                </CompactTableHead>
                <CompactTableHead>Tipo</CompactTableHead>
                <CompactTableHead
                  onSort={() => handleSort('valor_total')}
                  sortDirection={sortField === 'valor_total' ? sortDirection : undefined}
                >
                  Valor
                </CompactTableHead>
                <CompactTableHead
                  onSort={() => handleSort('data_inicio')}
                  sortDirection={sortField === 'data_inicio' ? sortDirection : undefined}
                >
                  Início
                </CompactTableHead>
                <CompactTableHead>Término</CompactTableHead>
                <CompactTableHead
                  onSort={() => handleSort('status')}
                  sortDirection={sortField === 'status' ? sortDirection : undefined}
                >
                  Status
                </CompactTableHead>
                <CompactTableHead className="text-right">Ações</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContratos.length === 0 ? (
                <CompactTableRow>
                  <CompactTableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {contratos.length === 0
                      ? 'Nenhum contrato cadastrado ainda'
                      : 'Nenhum contrato encontrado com os filtros aplicados'}
                  </CompactTableCell>
                </CompactTableRow>
              ) : (
                paginatedContratos.map((contrato) => (
                  <CompactTableRow key={contrato.id}>
                    <CompactTableCell className="font-medium">
                      {contrato.numero_contrato || '-'}
                    </CompactTableCell>
                    <CompactTableCell>
                      <Link
                        to="/contatos/$clienteId"
                        params={{ clienteId: contrato.cliente_id }}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {contrato.cliente_nome}
                      </Link>
                    </CompactTableCell>
                    <CompactTableCell>
                      <Badge
                        variant="outline"
                        className={CONTRATO_TIPO_COLORS[contrato.tipo]}
                      >
                        {CONTRATO_TIPO_LABELS[contrato.tipo]}
                      </Badge>
                    </CompactTableCell>
                    <CompactTableCell className="font-medium">
                      {formatCurrency(contrato.valor_total)}
                    </CompactTableCell>
                    <CompactTableCell>{formatDate(contrato.data_inicio)}</CompactTableCell>
                    <CompactTableCell>{formatDate(contrato.data_fim)}</CompactTableCell>
                    <CompactTableCell>
                      <Badge
                        variant="outline"
                        className={CONTRATO_STATUS_COLORS[contrato.status]}
                      >
                        {CONTRATO_STATUS_LABELS[contrato.status]}
                      </Badge>
                    </CompactTableCell>
                    <CompactTableCell className="text-right">
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
                    </CompactTableCell>
                  </CompactTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CompactTableWrapper>
      )}
    </div>
  )
}
