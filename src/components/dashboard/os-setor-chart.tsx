// Gráfico de OS por Setor - Sistema Minerva ERP
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OrdemServico } from '@/lib/types';

interface OSSetorChartProps {
  ordensServico: OrdemServico[];
  title?: string;
  height?: number;
}

export function OSSetorChart({
  ordensServico,
  title = 'Distribuição por Setor',
  height = 300
}: OSSetorChartProps) {
  // Agrupar OS por setor
  const setorData = React.useMemo(() => {
    const counts: Record<string, number> = {};

    ordensServico.forEach(os => {
      const setor = os.setor || 'SEM_SETOR';
      counts[setor] = (counts[setor] || 0) + 1;
    });

    const setorLabels: Record<string, string> = {
      COM: 'Comercial',
      ASS: 'Assessoria',
      OBR: 'Obras',
      SEM_SETOR: 'Sem Setor',
    };

    const setorColors: Record<string, string> = {
      COM: '#3b82f6', // blue-500
      ASS: '#8b5cf6', // violet-500
      OBR: 'var(--warning)', // amber-500
      SEM_SETOR: '#9ca3af', // neutral-400
    };

    return Object.entries(counts)
      .map(([setor, count]) => ({
        name: setorLabels[setor] || setor,
        value: count,
        color: setorColors[setor] || 'var(--primary)',
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
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} OS ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Não mostrar label se < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
          <PieChart>
            <Pie
              data={setorData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {setorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = setorData.find(d => d.name === value);
                return `${value} (${item?.value || 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
