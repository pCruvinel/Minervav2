import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle,
  TrendingDown,
  Clock
} from 'lucide-react';
import {
  mockMetricasComerciais,
  mockFunilVendas,
  mockLeads,
  mockPropostasComerciais,
  getLeadsByStatus
} from '../../lib/mock-data-comercial';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

export function DashboardComercial() {
  const metricas = mockMetricasComerciais;

  // Estatísticas de Leads por Status
  const leadsNovos = getLeadsByStatus('NOVO').length;
  const leadsEmContato = getLeadsByStatus('EM_CONTATO').length;
  const leadsVistoriaAgendada = getLeadsByStatus('VISTORIA_AGENDADA').length;
  const leadsPropostaEnviada = getLeadsByStatus('PROPOSTA_ENVIADA').length;
  const leadsNegociacao = getLeadsByStatus('NEGOCIACAO').length;

  // Cores do Funil (degradê de amarelo para dourado)
  const coresFunil = ['#F3E9B5', '#E6D78E', 'var(--primary)', 'var(--primary)', '#C49F2F', '#B08F27', 'var(--primary)'];

  // Dados para gráfico de funil
  const dadosFunil = mockFunilVendas.filter(etapa => 
    !['Perdido', 'Cancelado'].includes(etapa.etapa)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-black">Dashboard Comercial</h1>
        <p className="text-black/60">Acompanhamento do Funil de Vendas e Performance Comercial</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Leads (Mês) */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-black/70">Leads no Mês</CardTitle>
            <Users className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-black">{metricas.leadsMes}</span>
                <span className="text-black/50">/ {metricas.totalLeads} total</span>
              </div>
              <p className="text-sm text-black/60">Novembro 2025</p>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-black/70">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-black">{metricas.taxaConversao}%</span>
              </div>
              <p className="text-sm text-success">
                ↑ 2.3% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Propostas em Aberto */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-black/70">Propostas em Aberto</CardTitle>
            <FileText className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-black">
                  R$ {(metricas.valorPropostasAbertas / 1000).toFixed(0)}k
                </span>
              </div>
              <p className="text-sm text-black/60">
                {metricas.propostasAbertas} propostas ativas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contratos Fechados (Mês) */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-black/70">Contratos Fechados</CardTitle>
            <CheckCircle className="h-5 w-5 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-black">{metricas.contratosMes}</span>
                <span className="text-black/50">contratos</span>
              </div>
              <p className="text-sm text-black/60">
                R$ {(metricas.valorContratosMes / 1000).toFixed(0)}k no mês
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Funil de Vendas */}
      <Card className="border-[var(--primary)]/20">
        <CardHeader>
          <CardTitle className="text-black">Funil de Vendas</CardTitle>
          <p className="text-sm text-black/60">
            Distribuição de leads por etapa do processo comercial
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={dadosFunil}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="etapa" type="category" />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'quantidade') return [value, 'Leads'];
                  if (name === 'valor') return [`R$ ${(value / 1000).toFixed(0)}k`, 'Valor Total'];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--primary)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="quantidade" name="Quantidade de Leads" radius={[0, 8, 8, 0]}>
                {dadosFunil.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coresFunil[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cards de Resumo por Etapa */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Novos */}
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-black/70">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-black">{leadsNovos}</div>
            <p className="text-sm text-black/60 mt-1">Leads recentes</p>
          </CardContent>
        </Card>

        {/* Em Contato */}
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-black/70">Em Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-black">{leadsEmContato}</div>
            <p className="text-sm text-black/60 mt-1">Qualificando</p>
          </CardContent>
        </Card>

        {/* Vistoria Agendada */}
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-black/70">Vistoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-black">{leadsVistoriaAgendada}</div>
            <p className="text-sm text-black/60 mt-1">Agendadas</p>
          </CardContent>
        </Card>

        {/* Proposta Enviada */}
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-black/70">Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-black">{leadsPropostaEnviada}</div>
            <p className="text-sm text-black/60 mt-1">Aguardando</p>
          </CardContent>
        </Card>

        {/* Negociação */}
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-black/70">Negociação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-black">{leadsNegociacao}</div>
            <p className="text-sm text-black/60 mt-1">Em andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Propostas que Expiram em Breve */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle className="text-black">Atenção: Propostas Próximas ao Vencimento</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPropostasComerciais
                .filter(p => p.status === 'AGUARDANDO_APROVACAO_CLIENTE' || p.status === 'NEGOCIACAO')
                .sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime())
                .slice(0, 4)
                .map(proposta => {
                  const diasRestantes = Math.ceil(
                    (new Date(proposta.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={proposta.id} className="flex items-start justify-between p-3 bg-[var(--primary)]/5 rounded-lg">
                      <div className="flex-1">
                        <p className="text-black">{proposta.leadNome}</p>
                        <p className="text-sm text-black/60">{proposta.tipoServico}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${diasRestantes <= 3 ? 'text-destructive' : 'text-[var(--primary)]'}`}>
                          {diasRestantes > 0 ? `${diasRestantes} dias` : 'Expirada'}
                        </p>
                        <p className="text-xs text-black/60">
                          R$ {(proposta.valorProposta / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Top Oportunidades */}
        <Card className="border-[var(--primary)]/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle className="text-black">Top Oportunidades</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeads
                .filter(l => l.valorEstimado && l.valorEstimado > 0)
                .sort((a, b) => (b.valorEstimado || 0) - (a.valorEstimado || 0))
                .slice(0, 4)
                .map(lead => (
                  <div key={lead.id} className="flex items-start justify-between p-3 bg-[var(--primary)]/10 rounded-lg">
                    <div className="flex-1">
                      <p className="text-black">{lead.nome}</p>
                      <p className="text-sm text-black/60">{lead.interesse}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--primary)]">
                        R$ {((lead.valorEstimado || 0) / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs text-black/60 capitalize">
                        {lead.status.toLowerCase().replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}