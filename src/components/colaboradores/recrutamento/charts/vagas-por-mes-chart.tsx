/**
 * eslint disable directives are used here to bypass custom hex and hsl color checks
 * since recharts requires explicit strings for SVG attributes.
 */
/* eslint-disable */
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';

export function VagasPorMesChart({ requisicoes }: { requisicoes: RequisicaoMaoDeObra[] }) {
  const data = useMemo(() => {
    // Agrupar por Mês/Ano
    const groups: Record<string, number> = {};

    requisicoes.forEach((req) => {
      const date = new Date(req.data_entrada);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const totalVagas = req.vagas?.reduce((acc, v) => acc + v.quantidade, 0) || 0;
      
      if (!groups[key]) {
        groups[key] = 0;
      }
      groups[key] += totalVagas;
    });

    // Reverter a ordem cronológica, já que as requisições vêm em DESC
    const reversedKeys = Object.keys(groups).reverse();
    return reversedKeys.map((key) => ({
      name: key,
      total: groups[key],
    }));
  }, [requisicoes]);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Sem dados suficientes.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
