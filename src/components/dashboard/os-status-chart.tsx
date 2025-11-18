// Gráfico de OS por Status - Sistema Minerva ERP
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { OrdemServico } from '../../lib/types';

interface OSStatusChartProps {
  ordensServico: OrdemServico[];
  title?: string;
  height?: number;
}

export function OSStatusChart({ 
  ordensServico, 
  title = 'Ordens de Serviço por Status',
  height = 300 
}: OSStatusChartProps) {
  // Agrupar OS por status
  const statusCount = React.useMemo(() => {
    const counts: Record<string, number> = {};

    ordensServico.forEach(os => {
      const status = os.status || 'SEM_STATUS';
      counts[status] = (counts[status] || 0) + 1;
    });

    // Mapear para formato do gráfico
    const statusLabels: Record<string, string> = {
      RASCUNHO: 'Rascunho',
      PENDENTE: 'Pendente',
      EM_TRIAGEM: 'Em Triagem',
      EM_ANDAMENTO: 'Em Andamento',
      AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
      APROVADA: 'Aprovada',
      EM_EXECUCAO: 'Em Execução',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada',
      ARQUIVADA: 'Arquivada',
    };

    const statusColors: Record<string, string> = {
      RASCUNHO: '#9ca3af', // neutral
      PENDENTE: '#fbbf24', // amber
      EM_TRIAGEM: '#60a5fa', // blue
      EM_ANDAMENTO: '#3b82f6', // blue-600
      AGUARDANDO_APROVACAO: '#f59e0b', // amber-500
      APROVADA: '#10b981', // green
      EM_EXECUCAO: '#8b5cf6', // violet
      CONCLUIDA: '#22c55e', // green-500
      CANCELADA: '#ef4444', // red
      ARQUIVADA: '#6b7280', // neutral-500
    };

    return Object.entries(counts)
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || '#D3AF37',
      }))
      .sort((a, b) => b.value - a.value);
  }, [ordensServico]);

  const totalOS = ordensServico.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalOS) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="text-sm font-medium mb-1">{data.payload.name}</p>
          <p className="text-sm text-neutral-600">
            {data.value} OS ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (ordensServico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <p className="text-sm">Nenhuma ordem de serviço disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-neutral-600">
          Total: {totalOS} {totalOS === 1 ? 'ordem' : 'ordens'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={statusCount} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {statusCount.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
