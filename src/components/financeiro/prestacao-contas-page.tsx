import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { FinanceiroCategoria } from '../../lib/types';

interface ProjetoFinanceiro {
  id: string;
  nome: string;
  cliente: string;
  tipo: 'OBRAS' | 'LAUDO_PONTUAL' | 'ASSESSORIA_ANUAL';
  status: 'EM_ANDAMENTO' | 'ENCERRADO';
  dataInicio: string;
  dataEncerramento?: string;
  receitas: {
    previsto: number;
    realizado: number;
  };
  custos: {
    previsto: number;
    realizado: number;
  };
  detalhamentoCustos?: {
    tipo: FinanceiroCategoria;
    previsto: number;
    realizado: number;
  }[];
}

// Mock data - Projetos com dados financeiros
const mockProjetos: ProjetoFinanceiro[] = [
  {
    id: 'proj-1',
    nome: 'Obra Residencial - Condomínio Jardim das Flores',
    cliente: 'Construtora Silva Ltda',
    tipo: 'OBRAS',
    status: 'ENCERRADO',
    dataInicio: '2024-06-01',
    dataEncerramento: '2024-11-30',
    receitas: {
      previsto: 125000,
      realizado: 128000,
    },
    custos: {
      previsto: 85000,
      realizado: 82500,
    },
    detalhamentoCustos: [
      { tipo: 'MAO_DE_OBRA', previsto: 45000, realizado: 43000 },
      { tipo: 'MATERIAL', previsto: 28000, realizado: 27500 },
      { tipo: 'EQUIPAMENTO', previsto: 12000, realizado: 12000 },
    ],
  },
  {
    id: 'proj-2',
    nome: 'Assessoria Técnica Anual - Empreendimento ABC',
    cliente: 'Empreendimentos ABC S.A.',
    tipo: 'ASSESSORIA_ANUAL',
    status: 'EM_ANDAMENTO',
    dataInicio: '2024-01-01',
    receitas: {
      previsto: 50400, // 4.200/mês x 12
      realizado: 46200, // 11 meses realizados
    },
    custos: {
      previsto: 24000,
      realizado: 22000,
    },
    detalhamentoCustos: [
      { tipo: 'MAO_DE_OBRA', previsto: 18000, realizado: 16500 },
      { tipo: 'ESCRITORIO', previsto: 6000, realizado: 5500 },
    ],
  },
  {
    id: 'proj-3',
    nome: 'Laudo Estrutural - Edifício Central',
    cliente: 'Administradora Central',
    tipo: 'LAUDO_PONTUAL',
    status: 'EM_ANDAMENTO',
    dataInicio: '2024-11-15',
    receitas: {
      previsto: 15000,
      realizado: 7500, // Parcial recebido
    },
    custos: {
      previsto: 8000,
      realizado: 6200,
    },
    detalhamentoCustos: [
      { tipo: 'MAO_DE_OBRA', previsto: 5500, realizado: 4500 },
      { tipo: 'EQUIPAMENTO', previsto: 2500, realizado: 1700 },
    ],
  },
  {
    id: 'proj-4',
    nome: 'Reforma Comercial - Shopping Norte',
    cliente: 'Shopping Norte Ltda',
    tipo: 'OBRAS',
    status: 'EM_ANDAMENTO',
    dataInicio: '2024-10-01',
    receitas: {
      previsto: 95000,
      realizado: 55000,
    },
    custos: {
      previsto: 68000,
      realizado: 42000,
    },
    detalhamentoCustos: [
      { tipo: 'MAO_DE_OBRA', previsto: 38000, realizado: 24000 },
      { tipo: 'MATERIAL', previsto: 22000, realizado: 13000 },
      { tipo: 'EQUIPAMENTO', previsto: 8000, realizado: 5000 },
    ],
  },
];

export function PrestacaoContasPage() {
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [projetoExpandido, setProjetoExpandido] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTipo = (tipo: string) => {
    const map: Record<string, string> = {
      OBRAS: 'Obras',
      LAUDO_PONTUAL: 'Laudo Pontual',
      ASSESSORIA_ANUAL: 'Assessoria Anual',
    };
    return map[tipo] || tipo;
  };

  const calcularLucro = (projeto: ProjetoFinanceiro) => {
    // Regra de negócio: Obras e Laudo Pontual só exibem lucro se ENCERRADO
    if (
      (projeto.tipo === 'OBRAS' || projeto.tipo === 'LAUDO_PONTUAL') &&
      projeto.status === 'EM_ANDAMENTO'
    ) {
      return null; // Não exibir lucro
    }

    // Assessoria Anual pode exibir lucro mensal mesmo em andamento
    return projeto.receitas.realizado - projeto.custos.realizado;
  };

  const calcularMargemLucro = (projeto: ProjetoFinanceiro) => {
    const lucro = calcularLucro(projeto);
    if (lucro === null || projeto.receitas.realizado === 0) return null;
    return (lucro / projeto.receitas.realizado) * 100;
  };

  // Aplicar filtros
  const projetosFiltrados = mockProjetos.filter((proj) => {
    if (filtroTipo && proj.tipo !== filtroTipo) return false;
    if (filtroStatus && proj.status !== filtroStatus) return false;
    return true;
  });

  // Calcular totais
  const totais = projetosFiltrados.reduce(
    (acc, proj) => {
      const lucro = calcularLucro(proj);
      return {
        receitas: acc.receitas + proj.receitas.realizado,
        custos: acc.custos + proj.custos.realizado,
        lucros: acc.lucros + (lucro || 0),
        projetosComLucro: acc.projetosComLucro + (lucro !== null ? 1 : 0),
      };
    },
    { receitas: 0, custos: 0, lucros: 0, projetosComLucro: 0 }
  );

  const handleExportar = () => {
    alert('Funcionalidade de exportação será implementada');
  };

  const toggleExpandir = (projetoId: string) => {
    setProjetoExpandido(projetoExpandido === projetoId ? null : projetoId);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Prestação de Contas por Projeto</h1>
          <p className="text-muted-foreground">
            Relatório analítico de lucratividade por Centro de Custo/Projeto
          </p>
        </div>
        <Button variant="outline" onClick={handleExportar}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Alerta de Regras de Negócio */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Regras de Cálculo de Lucro:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
            <li>
              <strong>Obras e Laudo Pontual:</strong> O lucro só é calculado e exibido{' '}
              <strong>APÓS O ENCERRAMENTO</strong> do contrato.
            </li>
            <li>
              <strong>Assessoria Anual:</strong> O lucro é calculado{' '}
              <strong>MENSALMENTE</strong>, mesmo em contratos em andamento.
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Projeto</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBRAS">Obras</SelectItem>
                  <SelectItem value="LAUDO_PONTUAL">Laudo Pontual</SelectItem>
                  <SelectItem value="ASSESSORIA_ANUAL">Assessoria Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="ENCERRADO">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Consolidados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Receitas Totais</p>
            <h3 className="text-2xl text-success">{formatCurrency(totais.receitas)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Custos Totais</p>
            <h3 className="text-2xl text-destructive">{formatCurrency(totais.custos)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
            <h3 className="text-2xl text-primary">{formatCurrency(totais.lucros)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              ({totais.projetosComLucro} projeto(s) com lucro calculado)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Margem Média</p>
            <h3 className="text-2xl">
              {totais.receitas > 0
                ? ((totais.lucros / totais.receitas) * 100).toFixed(1)
                : '0.0'}
              %
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Projetos ({projetosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projetosFiltrados.map((projeto) => {
              const lucro = calcularLucro(projeto);
              const margem = calcularMargemLucro(projeto);
              const isExpandido = projetoExpandido === projeto.id;
              const podeExibirLucro = lucro !== null;

              return (
                <Card key={projeto.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header do Projeto */}
                    <div
                      className="p-4 cursor-pointer hover:bg-background transition-colors"
                      onClick={() => toggleExpandir(projeto.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isExpandido ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <h4 className="font-medium">{projeto.nome}</h4>
                            <Badge variant={projeto.status === 'ENCERRADO' ? 'default' : 'outline'}>
                              {projeto.status === 'ENCERRADO' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {projeto.status === 'ENCERRADO' ? 'Encerrado' : 'Em Andamento'}
                            </Badge>
                            <Badge variant="secondary">{formatTipo(projeto.tipo)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{projeto.cliente}</p>
                        </div>

                        <div className="text-right">
                          {podeExibirLucro ? (
                            <>
                              <p className="text-sm text-muted-foreground mb-1">Lucro Realizado</p>
                              <p
                                className={`text-xl font-medium ${lucro >= 0 ? 'text-success' : 'text-destructive'
                                  }`}
                              >
                                {formatCurrency(lucro)}
                              </p>
                              {margem !== null && (
                                <p className="text-xs text-muted-foreground">
                                  Margem: {margem.toFixed(1)}%
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-warning">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm">
                                Lucro exibido após<br />encerramento
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalhamento (expandido) */}
                    {isExpandido && (
                      <div className="border-t bg-background p-4 space-y-4">
                        {/* Resumo Financeiro */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Receita Prevista</p>
                            <p className="font-medium">{formatCurrency(projeto.receitas.previsto)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Receita Realizada</p>
                            <p className="font-medium text-success">
                              {formatCurrency(projeto.receitas.realizado)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Custo Previsto</p>
                            <p className="font-medium">{formatCurrency(projeto.custos.previsto)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Custo Realizado</p>
                            <p className="font-medium text-destructive">
                              {formatCurrency(projeto.custos.realizado)}
                            </p>
                          </div>
                        </div>

                        {/* Detalhamento de Custos */}
                        {projeto.detalhamentoCustos && (
                          <div>
                            <h5 className="text-sm font-medium mb-3">Detalhamento de Custos</h5>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tipo de Custo</TableHead>
                                  <TableHead className="text-right">Previsto</TableHead>
                                  <TableHead className="text-right">Realizado</TableHead>
                                  <TableHead className="text-right">Variação</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {projeto.detalhamentoCustos.map((custo, index) => {
                                  const variacao = custo.realizado - custo.previsto;
                                  const variacaoPerc =
                                    custo.previsto > 0
                                      ? ((variacao / custo.previsto) * 100).toFixed(1)
                                      : '0.0';

                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {custo.tipo.replace(/_/g, ' ').toLowerCase()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(custo.previsto)}
                                      </TableCell>
                                      <TableCell className="text-right text-destructive">
                                        {formatCurrency(custo.realizado)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span
                                          className={
                                            variacao <= 0 ? 'text-success' : 'text-destructive'
                                          }
                                        >
                                          {variacao > 0 ? '+' : ''}
                                          {formatCurrency(variacao)} ({variacaoPerc}%)
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {projetosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum projeto encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
