/**
 * ContratoDetalhePage – Página de Detalhes do Contrato
 *
 * Exibe informações completas do contrato com abas:
 * - Resumo: Dados do contrato + resumo financeiro
 * - Faturas: Lista de faturas vinculadas + geração
 *
 * Segue o padrão visual de ClienteDetalhesPage (header bar + tabs pill).
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { ModalHeaderPadrao } from '@/components/ui/modal-header-padrao'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableCell,
  CompactTableRow,
} from '@/components/shared/compact-table'
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  ClipboardList,
  Download,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  TrendingUp,
  HardHat,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import {
  useContratoDetalhe,
  FATURA_STATUS_LABELS,
  FATURA_STATUS_COLORS,
  type FaturaItem,
} from '@/lib/hooks/use-contrato-detalhe'
import { TimelineObra } from './timeline-obra'
import {
  formatCurrency,
  formatDate,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_COLORS,
  CONTRATO_STATUS_COLORS,
} from '@/lib/hooks/use-contratos'

// ===========================================
// COMPONENT
// ===========================================

interface ContratoDetalhePageProps {
  contratoId: string
  onBack: () => void
}

export function ContratoDetalhePage({ contratoId, onBack }: ContratoDetalhePageProps) {
  const {
    contrato,
    faturas,
    resumo,
    isLoading,
    error,
    gerarFatura,
    isGerandoFatura,
  } = useContratoDetalhe(contratoId)

  const [modalGerarFaturaOpen, setModalGerarFaturaOpen] = useState(false)
  const [novaFaturaForm, setNovaFaturaForm] = useState({
    valor: '',
    vencimento: '',
    descricao: '',
  })

  // Loading
  if (isLoading) {
    return (
      <div className="bg-muted pb-6">
        <div className="bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // Error
  if (error || !contrato) {
    return (
      <div className="p-6">
        <Button variant="outline" size="icon" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do contrato. {error?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Handler: gerar fatura
  const handleGerarFatura = async () => {
    if (!novaFaturaForm.valor || !novaFaturaForm.vencimento) {
      toast.error('Preencha valor e vencimento')
      return
    }

    try {
      const proximaParcela = faturas.length > 0
        ? Math.max(...faturas.map(f => f.parcela_num)) + 1
        : 1

      await gerarFatura({
        contratoId: contrato.id,
        clienteId: contrato.cliente_id,
        parcelaNum: proximaParcela,
        valorOriginal: parseFloat(novaFaturaForm.valor),
        vencimento: novaFaturaForm.vencimento,
        descricao: novaFaturaForm.descricao || undefined,
      })

      toast.success('Fatura gerada com sucesso!')
      setModalGerarFaturaOpen(false)
      setNovaFaturaForm({ valor: '', vencimento: '', descricao: '' })
    } catch {
      toast.error('Erro ao gerar fatura')
    }
  }

  return (
    <div className="bg-muted pb-6">
      {/* ====== Header Bar ====== */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back */}
            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            {/* Center: Contract info */}
            <div className="text-center flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {contrato.numero_contrato}
              </h1>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Link
                  to="/contatos/$clienteId"
                  params={{ clienteId: contrato.cliente_id }}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {contrato.cliente_nome}
                </Link>
                <span>•</span>
                <span>{formatDate(contrato.data_inicio)}</span>
              </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={CONTRATO_TIPO_COLORS[contrato.tipo]}>
                {CONTRATO_TIPO_LABELS[contrato.tipo]}
              </Badge>
              <Badge variant="outline" className={CONTRATO_STATUS_COLORS[contrato.status]}>
                {CONTRATO_STATUS_LABELS[contrato.status]}
              </Badge>
              {contrato.arquivo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(contrato.arquivo_url!, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Contrato
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== Content ====== */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="resumo" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="w-full h-auto p-1 bg-muted rounded-xl">
            <TabsTrigger
              value="resumo"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Resumo</span>
            </TabsTrigger>
            <TabsTrigger
              value="faturas"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0"
            >
              <Receipt className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Faturas ({resumo.qtdFaturas})</span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0"
            >
              <HardHat className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Timeline</span>
            </TabsTrigger>
          </TabsList>

          {/* ====== Tab: Resumo ====== */}
          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Detalhes do Contrato */}
              <Card className="border-border rounded-lg shadow-sm lg:col-span-2">
                <CardContent className="pt-6 space-y-6">
                  {/* Dados do contrato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoBlock icon={FileText} label="Número" value={contrato.numero_contrato} />
                    <InfoBlock icon={Building2} label="Cliente" value={contrato.cliente_nome} />
                    <InfoBlock icon={DollarSign} label="Valor Total" value={formatCurrency(contrato.valor_total)} />
                    {contrato.valor_mensal && (
                      <InfoBlock icon={TrendingUp} label="Valor Mensal" value={formatCurrency(contrato.valor_mensal)} />
                    )}
                    <InfoBlock icon={Calendar} label="Início" value={formatDate(contrato.data_inicio)} />
                    <InfoBlock icon={Calendar} label="Término" value={formatDate(contrato.data_fim)} />
                    <InfoBlock icon={ClipboardList} label="Parcelas" value={`${contrato.parcelas_total}x`} />
                    <InfoBlock icon={Calendar} label="Dia Vencimento" value={`Dia ${contrato.dia_vencimento}`} />
                    {contrato.valor_entrada > 0 && (
                      <InfoBlock icon={DollarSign} label="Entrada" value={formatCurrency(contrato.valor_entrada)} />
                    )}
                    {contrato.os_codigo && (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">OS Vinculada</span>
                        </div>
                        <Link
                          to="/os/$osId"
                          params={{ osId: contrato.os_id! }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {contrato.os_codigo}
                        </Link>
                      </div>
                    )}
                    {contrato.cc_nome && (
                      <InfoBlock icon={ClipboardList} label="Centro de Custo" value={contrato.cc_nome} />
                    )}
                  </div>

                  {/* Observações */}
                  {contrato.observacoes && (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Observações</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{contrato.observacoes}</p>
                    </div>
                  )}

                  {/* Assinatura */}
                  {contrato.signed_at && (
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center gap-2 text-success text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Assinado em {formatDate(contrato.signed_at)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Resumo Financeiro */}
              <div className="space-y-4 lg:col-span-1">
                <Card className="border-border rounded-lg shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    {/* Progresso */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Progresso de Pagamento</span>
                        <span className="font-bold text-foreground">{resumo.percentualPago}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${resumo.percentualPago}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <MiniCard
                        label="Faturado"
                        value={formatCurrency(resumo.totalFaturado)}
                        color="text-foreground"
                      />
                      <MiniCard
                        label="Recebido"
                        value={formatCurrency(resumo.totalPago)}
                        color="text-success"
                      />
                    </div>

                    {resumo.totalPendente > 0 && (
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Pendente</span>
                        </div>
                        <p className="text-lg font-bold text-yellow-800 mt-1">
                          {formatCurrency(resumo.totalPendente)}
                        </p>
                      </div>
                    )}

                    {resumo.totalVencido > 0 && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Vencido</span>
                        </div>
                        <p className="text-lg font-bold text-red-800 mt-1">
                          {formatCurrency(resumo.totalVencido)}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Qtd. Faturas
                      </p>
                      <p className="text-2xl font-bold text-primary">{resumo.qtdFaturas}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ====== Tab: Faturas ====== */}
          <TabsContent value="faturas" className="space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Faturas do Contrato
              </h3>
              {contrato.status === 'ativo' && (
                <Button onClick={() => setModalGerarFaturaOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Fatura
                </Button>
              )}
            </div>

            {/* Faturas Table */}
            {faturas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhuma fatura gerada para este contrato</p>
                  {contrato.status === 'ativo' && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setModalGerarFaturaOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Gerar Primeira Fatura
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <CompactTableWrapper
                title="Faturas"
                totalItems={faturas.length}
                currentCount={faturas.length}
                page={1}
                totalPages={1}
                onPageChange={() => {}}
                itemsPerPage={faturas.length}
                onItemsPerPageChange={() => {}}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <CompactTableHead>Nº Fatura</CompactTableHead>
                      <CompactTableHead>Parcela</CompactTableHead>
                      <CompactTableHead>Valor</CompactTableHead>
                      <CompactTableHead>Vencimento</CompactTableHead>
                      <CompactTableHead>Pagamento</CompactTableHead>
                      <CompactTableHead>Status</CompactTableHead>
                      <CompactTableHead className="text-right">Ações</CompactTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faturas.map((fatura: FaturaItem) => (
                      <CompactTableRow key={fatura.id}>
                        <CompactTableCell className="font-medium font-mono text-xs">
                          {fatura.numero_fatura}
                        </CompactTableCell>
                        <CompactTableCell>
                          {fatura.parcela_num}/{contrato.parcelas_total}
                        </CompactTableCell>
                        <CompactTableCell className="font-medium">
                          {formatCurrency(fatura.valor_final ?? fatura.valor_original)}
                        </CompactTableCell>
                        <CompactTableCell>{formatDate(fatura.vencimento)}</CompactTableCell>
                        <CompactTableCell>
                          {fatura.data_pagamento ? formatDate(fatura.data_pagamento) : '-'}
                        </CompactTableCell>
                        <CompactTableCell>
                          <Badge
                            variant="outline"
                            className={FATURA_STATUS_COLORS[fatura.status]}
                          >
                            {FATURA_STATUS_LABELS[fatura.status]}
                          </Badge>
                        </CompactTableCell>
                        <CompactTableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {fatura.url_boleto && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(fatura.url_boleto!, '_blank')}
                                title="Ver boleto"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CompactTableCell>
                      </CompactTableRow>
                    ))}
                  </TableBody>
                </Table>
              </CompactTableWrapper>
            )}
          </TabsContent>

          {/* ====== Tab: Timeline da Obra ====== */}
          <TabsContent value="timeline">
            <TimelineObra contratoId={contratoId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ====== Modal: Gerar Fatura ====== */}
      <Dialog open={modalGerarFaturaOpen} onOpenChange={setModalGerarFaturaOpen}>
        <DialogContent className="max-w-md p-0">
          <ModalHeaderPadrao
            title="Gerar Nova Fatura"
            description={`Gerar fatura para o contrato ${contrato.numero_contrato}`}
            icon={Receipt}
            theme="info"
          />

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fatura-valor">Valor (R$)</Label>
              <Input
                id="fatura-valor"
                type="number"
                step="0.01"
                placeholder={String(contrato.valor_mensal || contrato.valor_total / contrato.parcelas_total)}
                value={novaFaturaForm.valor}
                onChange={(e) => setNovaFaturaForm(prev => ({ ...prev, valor: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatura-vencimento">Vencimento</Label>
              <Input
                id="fatura-vencimento"
                type="date"
                value={novaFaturaForm.vencimento}
                onChange={(e) => setNovaFaturaForm(prev => ({ ...prev, vencimento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatura-descricao">Descrição (opcional)</Label>
              <Input
                id="fatura-descricao"
                placeholder="Ex: Parcela referente a março/2026"
                value={novaFaturaForm.descricao}
                onChange={(e) => setNovaFaturaForm(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setModalGerarFaturaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGerarFatura} disabled={isGerandoFatura}>
              {isGerandoFatura ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Fatura
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===========================================
// MINI-COMPONENTS
// ===========================================

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Icon className="w-4 h-4" />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function MiniCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
      <p className={`text-lg font-bold ${color} mb-0.5`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </p>
    </div>
  )
}
