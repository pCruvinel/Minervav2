import { useState } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  FileText,
  Building,
  ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableRow,
  CompactTableCell
} from "@/components/shared/compact-table";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { useLucratividadeCC } from "@/lib/hooks/use-lucratividade-cc";
import { useCCDetalhes } from "@/lib/hooks/use-cc-detalhes";
import { formatCurrency as formatarMoeda } from "@/lib/utils";
import { useCentroCusto } from "@/lib/hooks/use-centro-custo";
import { useDistribuicaoCustos } from "@/lib/hooks/use-distribuicao-custos";

// Componentes internos (mantidos para estrutura)
import { KPIFinanceiroGrid, KPICardFinanceiro } from "@/components/financeiro/kpi-financeiro-grid";

export function CentroCustoDetalhesPage() {
  const { ccId } = useParams({ from: '/_auth/financeiro/centro-custo/$ccId' });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resumo");

  // Hooks de Dados Reais
  const { data: ccResumo, isLoading: resumoLoading } = useLucratividadeCC(ccId);
  const { 
    receitas, 
    despesas, 
    custosPorCategoria, 
    overhead, 
    isLoading: detalhesLoading 
  } = useCCDetalhes(ccId);

  // Hook para nome/detalhes básicos se lucratividade falhar ou demorar
  const { data: listaCCs } = useCentroCusto();
  const ccBasico = listaCCs?.find(c => c.id === ccId);

  const isLoading = resumoLoading || detalhesLoading;
  const nomeCC = ccResumo?.nome || ccBasico?.nome || "Centro de Custo";
  const statusCC = "Ativo"; // Pode vir do banco depois
  const isSistema = ccBasico?.is_sistema || false;
  const isCCFixo = ccBasico?.tipo === 'fixo' || isSistema;

  // Distribution data (only for departmental CCs)
  const { data: distribuicaoData, loading: distribuicaoLoading } = useDistribuicaoCustos();

  if (!ccId) return <div>ID não fornecido</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={() => router.history.back()}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold tracking-tight">{nomeCC}</h1>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span>Contrato Global: {formatarMoeda(Number(ccResumo?.contrato_global || 0))}</span>
                <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                  {statusCC}
                </Badge>
                {isSistema && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Sistema
                  </Badge>
                )}
             </div>
           </div>
        </div>
        <div className="flex gap-2">
          {/* Ações futuras: Exportar, Editar */}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        /* KPIs */
        <KPIFinanceiroGrid columns={4}>
          <KPICardFinanceiro
            title="Receita Realizada"
            value={ccResumo?.receita_realizada || 0}
            previsto={ccResumo?.receita_prevista}
            icon={DollarSign}
            trend={ccResumo?.receita_realizada && ccResumo.receita_prevista ? 
              (ccResumo.receita_realizada / ccResumo.receita_prevista - 1) * 100 : 0}
            trendLabel="do previsto"
            variant="success"
          />
          <KPICardFinanceiro
            title="Custo Total"
            value={ccResumo?.custo_total_realizado || 0}
            previsto={ccResumo?.custo_total_previsto}
            icon={TrendingDown}
            variant="danger"
            trendLabel="vs orçado"
          />
          <KPICardFinanceiro
            title="Lucro Realizado"
            value={ccResumo?.lucro_realizado || 0}
            icon={TrendingUp}
            variant={Number(ccResumo?.lucro_realizado) >= 0 ? "default" : "danger"}
          />
          <KPICardFinanceiro
            title="Margem de Lucro"
            value={`${ccResumo?.margem_realizada_pct || 0}%`}
            icon={PieChartIcon}
            variant="neutral"
            formatter={(v) => v.toString()}
          />
        </KPIFinanceiroGrid>
      )}

      {/* Tabs de Detalhe */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumo">Resumo Financeiro</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas Operacionais</TabsTrigger>
          <TabsTrigger value="overhead">Overhead & Indiretos</TabsTrigger>
          {isCCFixo && <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>}
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        {/* --- AB RESUMO --- */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Breakdown de Custos */}
              <div className="col-span-2">
        <CompactTableWrapper
          title="Composição de Custos"
          subtitle="Distribuição dos gastos por categoria"
          // Sem paginação neste widget pois deve mostrar tudo
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <CompactTableHead>Categoria</CompactTableHead>
                <CompactTableHead align="right">Previsto</CompactTableHead>
                <CompactTableHead align="right">Realizado</CompactTableHead>
                <CompactTableHead align="right">%</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {custosPorCategoria.data?.map((cat, idx) => (
                <CompactTableRow key={idx}>
                  <CompactTableCell className="font-medium">{cat.categoria_nome}</CompactTableCell>
                  <CompactTableCell className="text-right">{formatarMoeda(cat.valor_previsto)}</CompactTableCell>
                  <CompactTableCell className="text-right">{formatarMoeda(cat.valor_realizado)}</CompactTableCell>
                  <CompactTableCell className="text-right">{cat.percentual_total}%</CompactTableCell>
                </CompactTableRow>
              ))}
              {custosPorCategoria.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Nenhum custo registrado
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="bg-muted/50 font-bold border-t-2">
                  <CompactTableCell className="py-3">TOTAL</CompactTableCell>
                  <CompactTableCell className="text-right py-3">
                    {formatarMoeda(custosPorCategoria.data?.reduce((acc, curr) => acc + curr.valor_previsto, 0) || 0)}
                  </CompactTableCell>
                  <CompactTableCell className="text-right py-3">
                    {formatarMoeda(custosPorCategoria.data?.reduce((acc, curr) => acc + curr.valor_realizado, 0) || 0)}
                  </CompactTableCell>
                  <CompactTableCell className="text-right py-3">100%</CompactTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CompactTableWrapper>
      </div>

            {/* Card de Overhead Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Overhead & Indiretos</CardTitle>
                <CardDescription>Custo administrativo alocado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Alocado</span>
                  <span className="font-bold text-lg">{formatarMoeda(ccResumo?.custo_overhead_total || 0)}</span>
                </div>
                <div className="border-t pt-4">
                   <p className="text-xs text-muted-foreground mb-2">Última alocação:</p>
                   {overhead.data?.[0] ? (
                     <div className="text-sm">
                       <p>Ref: {new Date(overhead.data[0].mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                       <p className="font-medium">{formatarMoeda(overhead.data[0].valor_total_alocado)}</p>
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground">Nenhuma alocação recente</p>
                   )}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("overhead")}>
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- ABA RECEITAS --- */}
        <TabsContent value="receitas">

        <CompactTableWrapper
           title="Receitas"
           subtitle="Faturamento e entradas vinculadas"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <CompactTableHead>Vencimento</CompactTableHead>
                <CompactTableHead>Descrição</CompactTableHead>
                <CompactTableHead>Cliente</CompactTableHead>
                <CompactTableHead>Status</CompactTableHead>
                <CompactTableHead align="right">Valor</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receitas.data?.map((item) => (
                 <CompactTableRow key={item.id}>
                  <CompactTableCell>{new Date(item.data).toLocaleDateString()}</CompactTableCell>
                  <CompactTableCell>{item.descricao} {item.parcela_num ? `(${item.parcela_num}/${item.total_parcelas})` : ''}</CompactTableCell>
                  <CompactTableCell>{item.cliente_nome || '-'}</CompactTableCell>
                  <CompactTableCell>
                    <Badge 
                      variant="outline"
                      className={
                        item.status === 'recebido' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                      }
                    >
                      {item.status}
                    </Badge>
                  </CompactTableCell>
                  <CompactTableCell className="text-right">{formatarMoeda(item.valor)}</CompactTableCell>
                </CompactTableRow>
              ))}
              {receitas.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    Nenhuma receita registrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CompactTableWrapper>
      </TabsContent>

        {/* --- ABA DESPESAS --- */}
        <TabsContent value="despesas">
        <CompactTableWrapper
          title="Contas a Pagar"
          subtitle="Registro de despesas vinculadas"
          // Paginação seria implementada aqui se houvesse no hook
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <CompactTableHead>Data</CompactTableHead>
                <CompactTableHead>Descrição</CompactTableHead>
                <CompactTableHead>Categoria</CompactTableHead>
                <CompactTableHead>Status</CompactTableHead>
                <CompactTableHead align="right">Valor</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.data?.map((item) => (
                 <CompactTableRow key={item.id}>
                  <CompactTableCell>{new Date(item.data).toLocaleDateString()}</CompactTableCell>
                  <CompactTableCell>{item.descricao}</CompactTableCell>
                  <CompactTableCell>{item.categoria_nome || '-'}</CompactTableCell>
                  <CompactTableCell>
                     <Badge 
                      variant="outline" 
                      className={
                        item.status === 'pago' ? 'bg-success/10 text-success border-success/20' : 
                        item.status === 'atrasado' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                        'bg-warning/10 text-warning border-warning/20'
                      }
                    >
                      {item.status}
                    </Badge>
                  </CompactTableCell>
                  <CompactTableCell className="text-right">{formatarMoeda(item.valor)}</CompactTableCell>
                </CompactTableRow>
              ))}
              {despesas.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    Nenhuma despesa registrada
                  </TableCell>
                </TableRow>
              )}  
            </TableBody>
          </Table>
        </CompactTableWrapper>
      </TabsContent>

        {/* --- ABA OVERHEAD (NOVA) --- */}
        <TabsContent value="overhead">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Overhead</CardTitle>
              <CardDescription>Rateio de custos administrativos e do setor</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Mês de Referência</TableHead>
                     <TableHead className="text-right">Rateio Adm/Escritório</TableHead>
                     <TableHead className="text-right">Rateio Setor</TableHead>
                     <TableHead className="text-right font-bold">Total Alocado</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {overhead.data?.map((item) => (
                     <TableRow key={item.id}>
                       <TableCell>{new Date(item.mes_referencia).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</TableCell>
                       <TableCell className="text-right">{formatarMoeda(item.custo_escritorio_rateado)}</TableCell>
                       <TableCell className="text-right">{formatarMoeda(item.custo_setor_rateado)}</TableCell>
                       <TableCell className="text-right font-bold">{formatarMoeda(item.valor_total_alocado)}</TableCell>
                     </TableRow>
                   ))}
                   {overhead.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">Nenhum rateio de overhead encontrado</TableCell>
                      </TableRow>
                   )}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA DISTRIBUIÇÃO (CCs Departamentais) --- */}
        {isCCFixo && (
          <TabsContent value="distribuicao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Distribuição de Custos Departamentais
                </CardTitle>
                <CardDescription>
                  Rateio dos custos fixos entre clientes ativos por setor.
                  Fórmula: ((Custo Escritório ÷ 2) + Custo Setor) ÷ Qtd Clientes Ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distribuicaoLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : distribuicaoData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <CompactTableHead>Período</CompactTableHead>
                        <CompactTableHead>Setor</CompactTableHead>
                        <CompactTableHead align="right">Custo Escritório</CompactTableHead>
                        <CompactTableHead align="right">½ Escritório</CompactTableHead>
                        <CompactTableHead align="right">Custo Setor</CompactTableHead>
                        <CompactTableHead align="right">Clientes Ativos</CompactTableHead>
                        <CompactTableHead align="right" className="font-bold">Custo/Cliente</CompactTableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribuicaoData.map((item, idx) => (
                        <CompactTableRow key={idx}>
                          <CompactTableCell>
                            {new Date(item.periodo).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </CompactTableCell>
                          <CompactTableCell>
                            <Badge variant="outline">{item.setor_nome}</Badge>
                          </CompactTableCell>
                          <CompactTableCell className="text-right">{formatarMoeda(item.custo_escritorio)}</CompactTableCell>
                          <CompactTableCell className="text-right">{formatarMoeda(item.metade_escritorio)}</CompactTableCell>
                          <CompactTableCell className="text-right">{formatarMoeda(item.custo_setor)}</CompactTableCell>
                          <CompactTableCell className="text-right">{item.qtd_clientes_ativos}</CompactTableCell>
                          <CompactTableCell className="text-right font-bold text-primary">
                            {formatarMoeda(item.custo_distribuido_por_cliente)}
                          </CompactTableCell>
                        </CompactTableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Building className="h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum dado de distribuição disponível</p>
                    <p className="text-xs mt-1">Lance despesas nos CCs departamentais para ver o rateio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* --- ABA DOCUMENTOS --- */}
        <TabsContent value="documentos">
           <Card>
             <CardHeader>
               <CardTitle>Documentos do Projeto</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                 <FileText className="h-10 w-10 mb-2" />
                 <p>Nenhum documento anexado</p>
                 <Button variant="link">Upload de Arquivo</Button>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
