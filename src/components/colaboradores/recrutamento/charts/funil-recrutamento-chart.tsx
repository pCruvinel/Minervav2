/* eslint-disable */
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { RequisicaoMaoDeObra } from '@/lib/types/recrutamento';
import { supabase } from '@/lib/supabase-client';

const ETAPAS = [
  { key: 'inscrito', name: 'Inscritos', color: 'hsl(var(--muted-foreground))' },
  { key: 'em_analise', name: 'Avaliação', color: 'hsl(var(--info))' },
  { key: 'entrevista', name: 'Entrevista', color: 'hsl(var(--primary))' },
  { key: 'aprovado', name: 'Aprovados', color: 'hsl(var(--success))' },
];

export function FunilRecrutamentoChart({ requisicoes }: { requisicoes: RequisicaoMaoDeObra[] }) {
  const [data, setData] = useState<{ name: string; total: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Idealmente ista a query via hook / rpc custom, mas podemos iterar as OS abertas
  // e buscar candidatos para um funil simplificado por conta da componentização ágil.
  useEffect(() => {
    async function loadFunnel() {
      // Como fetching é genérico aqui, contamos tudo que não for null
      const { data: candidaturas, error } = await supabase
        .from('candidato_vaga')
        .select('id, status_candidatura');

      if (error) {
        setLoading(false);
        return;
      }

      const contagem: Record<string, number> = {
        inscrito: 0,
        em_analise: 0,
        entrevista: 0,
        aprovado: 0,
      };

      candidaturas?.forEach((c) => {
        if (typeof contagem[c.status_candidatura] !== 'undefined') {
          contagem[c.status_candidatura]++;
        }
      });

      const formatted = ETAPAS.map((etapa) => ({
        name: etapa.name,
        total: contagem[etapa.key],
        color: etapa.color,
      }));

      setData(formatted);
      setLoading(false);
    }

    loadFunnel();
  }, [requisicoes]);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground animate-pulse">
        Carregando funil...
      </div>
    );
  }

  if (data.every((d) => d.total === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Nenhum candidato no funil.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          width={80}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'right', fill: 'hsl(var(--foreground))' }}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
