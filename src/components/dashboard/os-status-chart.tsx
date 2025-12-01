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
      const status = os.status_geral || 'Em Triagem';
      counts[status] = (counts[status] || 0) + 1;
    });

    // Mapear para formato do gráfico
    const statusLabels: Record<string, string> = {
      em_triagem: 'Em Triagem',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };

    const statusColors: Record<string, string> = {
      em_triagem: '#60a5fa', // blue
      em_andamento: '#3b82f6', // blue-600
      concluido: '#22c55e', // green-500
      cancelado: 'var(--destructive)', // red
    };

    return Object.entries(counts)
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || 'var(--primary)',
      }))
      .sort((a, b) => b.value - a.value);
  }, [ordensServico]);

  const totalOS = ordensServico.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalOS) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-medium mb-1">{data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
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
          <div className="flex items-center justify-center h-64 text-muted-foreground">
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
        <p className="text-sm text-muted-foreground">
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
