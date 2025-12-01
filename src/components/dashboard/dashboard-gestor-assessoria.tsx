import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, FileText, ClipboardCheck, AlertCircle } from 'lucide-react';
import { mockKPIsAssessoria } from '../../lib/mock-data-gestores';

/**
 * DASHBOARD GESTOR DE ASSESSORIA (Nível 3)
 * Exibe KPIs específicos para gestão técnica de assessoria
 */

export function DashboardGestorAssessoria() {
  const kpis = mockKPIsAssessoria;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard Gestor de Assessoria</h1>
        <p className="text-muted-foreground">
          Visão geral da gestão técnica de assessoria
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Vistorias Agendadas (Semana) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Vistorias Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.vistoriasAgendadasSemana}</div>
              <Badge variant="outline">Esta semana</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Vistorias programadas para os próximos 7 dias
            </p>
          </CardContent>
        </Card>

        {/* Laudos em Redação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Laudos em Redação</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.laudosEmRedacao}</div>
              <Badge variant="secondary">Em andamento</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Laudos sendo elaborados pelos colaboradores
            </p>
          </CardContent>
        </Card>

        {/* OS 07 (Reformas) Pendentes de Análise */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reformas (OS 07)</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.os07PendentesAnalise}</div>
              <Badge variant="default" className="bg-primary hover:bg-primary/90">
                Pendente
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Solicitações de reforma aguardando análise técnica
            </p>
          </CardContent>
        </Card>

        {/* Laudos Pendentes de Revisão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Laudos p/ Revisão</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.totalLaudosRevisao}</div>
              <Badge variant="destructive">Ação requerida</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Laudos aguardando aprovação para emissão do PDF final
            </p>
          </CardContent>
        </Card>

        {/* Reformas Aprovadas (Histórico) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reformas Aprovadas</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.totalReformasAprovadas}</div>
              <Badge variant="outline" className="border-success text-success">
                Total
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Total de reformas aprovadas no período
            </p>
          </CardContent>
        </Card>

        {/* Reformas Rejeitadas (Histórico) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Reformas Rejeitadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.totalReformasRejeitadas}</div>
              <Badge variant="outline" className="border-destructive text-destructive">
                Total
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Total de reformas rejeitadas no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão à Vista - Assessoria Técnica</CardTitle>
          <CardDescription>
            Indicadores de desempenho e fluxo de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Aprovação (Laudos)</span>
                <span className="font-mono">
                  {kpis.totalLaudosRevisao > 0
                    ? ((kpis.totalLaudosRevisao / (kpis.totalLaudosRevisao + kpis.laudosEmRedacao)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Aprovação (Reformas)</span>
                <span className="font-mono">
                  {((kpis.totalReformasAprovadas / (kpis.totalReformasAprovadas + kpis.totalReformasRejeitadas)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Média de Vistorias/Semana</span>
                <span className="font-mono">{kpis.vistoriasAgendadasSemana}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Laudos em Fila (Ação Requerida)</span>
                <span className="font-mono">{kpis.totalLaudosRevisao}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
