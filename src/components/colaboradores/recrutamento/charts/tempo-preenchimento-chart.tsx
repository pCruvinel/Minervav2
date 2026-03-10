/* eslint-disable */
import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';

export function TempoPreenchimentoChart({ requisicoes }: { requisicoes: RequisicaoMaoDeObra[] }) {
  const data = useMemo(() => {
    const groups: Record<string, { totalDays: number; count: number }> = {};

    requisicoes.forEach((req) => {
      const date = new Date(req.data_entrada);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      req.vagas?.forEach((vaga) => {
        if (vaga.status === 'preenchida' && vaga.updated_at) {
          const inicio = date.getTime();
          const fim = new Date(vaga.updated_at).getTime();
          const dias = Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));

          if (!groups[key]) {
            groups[key] = { totalDays: 0, count: 0 };
          }
          groups[key].totalDays += dias;
          groups[key].count += 1;
        }
      });
    });

    const reversedKeys = Object.keys(groups).reverse();
    return reversedKeys.map((key) => ({
      name: key,
      media: Math.round(groups[key].totalDays / groups[key].count),
    }));
  }, [requisicoes]);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Dados insuficientes de vagas fechadas para o cálculo de tempo médio.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
          tickFormatter={(val) => `${val}d`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          formatter={(value) => [`${value} dias`, 'Tempo Médio']}
        />
        <Line
          type="monotone"
          dataKey="media"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          className="stroke-primary"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
