import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { PieChart, User, AlertTriangle, CheckCircle } from 'lucide-react';

export interface RateioCC {
  ccId: string;
  ccNome: string;
  percentual: number;
}

export interface ColaboradorRateio {
  colaboradorId: string;
  colaboradorNome: string;
  centrosCusto: RateioCC[];
}

export interface ModalRateioCCProps {
  open: boolean;
  onClose: () => void;
  colaboradores: ColaboradorRateio[];
  onConfirmar: (rateios: ColaboradorRateio[]) => void;
}

export function ModalRateioCC({ open, onClose, colaboradores, onConfirmar }: ModalRateioCCProps) {
  const [rateiosLocal, setRateiosLocal] = useState<ColaboradorRateio[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  // Sincronizar estado local quando modal abre
  React.useEffect(() => {
    if (open && colaboradores.length > 0) {
      setRateiosLocal([...colaboradores]);
      setErros({});
    }
  }, [open, colaboradores]);

  const handlePercentualChange = (colaboradorId: string, ccId: string, novoValor: string) => {
    const valor = parseInt(novoValor) || 0;

    setRateiosLocal(prev => prev.map(colab => {
      if (colab.colaboradorId !== colaboradorId) return colab;

      return {
        ...colab,
        centrosCusto: colab.centrosCusto.map(cc =>
          cc.ccId === ccId ? { ...cc, percentual: valor } : cc
        )
      };
    }));

    // Limpar erro desse colaborador
    setErros(prev => {
      const novos = { ...prev };
      delete novos[colaboradorId];
      return novos;
    });
  };

  const validarRateios = (): boolean => {
    const novosErros: Record<string, string> = {};

    rateiosLocal.forEach(colab => {
      const soma = colab.centrosCusto.reduce((acc, cc) => acc + cc.percentual, 0);

      if (soma !== 100) {
        novosErros[colab.colaboradorId] = `Soma deve ser 100% (atual: ${soma}%)`;
      }

      // Verificar se algum CC tem 0%
      const temZero = colab.centrosCusto.some(cc => cc.percentual <= 0);
      if (temZero) {
        novosErros[colab.colaboradorId] = 'Todos os CCs devem ter percentual maior que 0';
      }
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleConfirmar = () => {
    if (validarRateios()) {
      onConfirmar(rateiosLocal);
    }
  };

  const getSomaPercentual = (colaboradorId: string): number => {
    const colab = rateiosLocal.find(c => c.colaboradorId === colaboradorId);
    if (!colab) return 0;
    return colab.centrosCusto.reduce((acc, cc) => acc + cc.percentual, 0);
  };

  const distribuirIgualmente = (colaboradorId: string) => {
    setRateiosLocal(prev => prev.map(colab => {
      if (colab.colaboradorId !== colaboradorId) return colab;

      const qtdCCs = colab.centrosCusto.length;
      const percentualBase = Math.floor(100 / qtdCCs);
      const resto = 100 - (percentualBase * qtdCCs);

      return {
        ...colab,
        centrosCusto: colab.centrosCusto.map((cc, idx) => ({
          ...cc,
          percentual: idx === 0 ? percentualBase + resto : percentualBase
        }))
      };
    }));

    // Limpar erro
    setErros(prev => {
      const novos = { ...prev };
      delete novos[colaboradorId];
      return novos;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Definir Rateio de Centros de Custo
          </DialogTitle>
          <DialogDescription>
            Os colaboradores abaixo estão alocados em mais de um Centro de Custo.
            Defina o percentual de cada CC (a soma deve ser 100%).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {rateiosLocal.map((colab) => {
            const soma = getSomaPercentual(colab.colaboradorId);
            const temErro = !!erros[colab.colaboradorId];
            const somaCorreta = soma === 100;

            return (
              <div
                key={colab.colaboradorId}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  temErro ? "border-destructive bg-destructive/5" :
                    somaCorreta ? "border-success/50 bg-success/5" : "border-border"
                )}
              >
                {/* Header do Colaborador */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{colab.colaboradorNome}</span>
                    <Badge variant="secondary" className="text-xs">
                      {colab.centrosCusto.length} CCs
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => distribuirIgualmente(colab.colaboradorId)}
                      className="text-xs"
                    >
                      Distribuir igual
                    </Button>
                    <Badge
                      variant={somaCorreta ? "default" : "destructive"}
                      className={cn(
                        "text-xs font-mono",
                        somaCorreta && "bg-success hover:bg-success"
                      )}
                    >
                      {soma}%
                    </Badge>
                  </div>
                </div>

                {/* Inputs de Percentual */}
                <div className="grid gap-2">
                  {colab.centrosCusto.map((cc) => (
                    <div
                      key={cc.ccId}
                      className="flex items-center gap-3 p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {cc.ccNome}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={cc.percentual}
                          onChange={(e) => handlePercentualChange(
                            colab.colaboradorId,
                            cc.ccId,
                            e.target.value
                          )}
                          className="w-20 text-center font-mono"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Erro */}
                {temErro && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {erros[colab.colaboradorId]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmar Rateio e Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
