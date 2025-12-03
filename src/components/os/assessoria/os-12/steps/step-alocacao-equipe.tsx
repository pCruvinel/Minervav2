import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, UserCheck, X, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { useColaboradores, useSetores } from '@/lib/hooks/use-os-workflows';

interface StepAlocacaoEquipeData {
  tecnicoResponsavel: string;
  equipeSuporteIds: string[];
  coordenadorId: string;
}

interface StepAlocacaoEquipeProps {
  data: StepAlocacaoEquipeData;
  onDataChange: (newData: StepAlocacaoEquipeData) => void;
  readOnly?: boolean;
}

export function StepAlocacaoEquipe({ data, onDataChange, readOnly }: StepAlocacaoEquipeProps) {
  // Buscar setores para encontrar ID do setor assessoria
  const { setores } = useSetores();
  const setorAssessoria = setores.find(s => s.slug === 'assessoria');

  // Buscar técnicos do setor assessoria
  const { colaboradores: tecnicos, loading: loadingTecnicos } = useColaboradores({
    setor_id: setorAssessoria?.id,
    ativo: true,
  });

  // Buscar coordenadores (funcao = coordenador_assessoria)
  const { colaboradores: coordenadores, loading: loadingCoords } = useColaboradores({
    funcao: 'coordenador_assessoria',
    ativo: true,
  });

  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  const toggleEquipeSuporte = (tecnicoId: string) => {
    if (readOnly) return;
    const current = data.equipeSuporteIds || [];
    if (current.includes(tecnicoId)) {
      handleInputChange('equipeSuporteIds', current.filter(id => id !== tecnicoId));
    } else {
      handleInputChange('equipeSuporteIds', [...current, tecnicoId]);
    }
  };

  const getTecnicoById = (id: string) => tecnicos.find(t => t.id === id);
  const getCoordById = (id: string) => coordenadores.find(c => c.id === id);

  const tecnicoResponsavel = getTecnicoById(data.tecnicoResponsavel);
  const coordenador = getCoordById(data.coordenadorId);

  const isLoading = loadingTecnicos || loadingCoords;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl mb-1">Alocação de Equipe</h2>
          <p className="text-sm text-muted-foreground">
            Defina os profissionais responsáveis pelo atendimento deste contrato
          </p>
        </div>
      </div>

      {/* Técnico Responsável */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
          Técnico Responsável Principal
        </h3>

        <div className="space-y-2">
          <Label htmlFor="tecnicoResponsavel">Selecione o Técnico <span className="text-destructive">*</span></Label>
          <Select
            value={data.tecnicoResponsavel}
            onValueChange={(value) => handleInputChange('tecnicoResponsavel', value)}
            disabled={readOnly || loadingTecnicos}
          >
            <SelectTrigger id="tecnicoResponsavel">
              {loadingTecnicos ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </span>
              ) : (
                <SelectValue placeholder="Selecione o técnico responsável" />
              )}
            </SelectTrigger>
            <SelectContent>
              {tecnicos.map((tec) => (
                <SelectItem key={tec.id} value={tec.id}>
                  <div className="flex items-center gap-2">
                    <span>{tec.nome_completo}</span>
                    {tec.cargo?.nome && (
                      <Badge variant="outline" className="text-xs">{tec.cargo.nome}</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {tecnicoResponsavel && (
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-full">
                    <UserCheck className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{tecnicoResponsavel.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{tecnicoResponsavel.cargo?.nome || tecnicoResponsavel.email}</p>
                  </div>
                </div>
                <Badge className="bg-success">Principal</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Equipe de Suporte */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
          Equipe de Suporte (Opcional)
        </h3>

        <p className="text-sm text-muted-foreground">
          Selecione técnicos adicionais que podem atender quando o responsável principal estiver indisponível
        </p>

        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando técnicos...</span>
            </div>
          ) : (
            tecnicos.filter(t => t.id !== data.tecnicoResponsavel).map((tec) => {
              const isSelected = (data.equipeSuporteIds || []).includes(tec.id);
              return (
                <Badge
                  key={tec.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all py-2 px-3',
                    isSelected ? 'bg-primary' : 'hover:bg-muted',
                    readOnly && 'cursor-not-allowed opacity-70'
                  )}
                  onClick={() => toggleEquipeSuporte(tec.id)}
                >
                  {isSelected ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                  {tec.nome_completo}
                </Badge>
              );
            })
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {(data.equipeSuporteIds || []).length} técnico(s) de suporte selecionado(s)
        </p>
      </div>

      {/* Coordenador */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
          Coordenador Responsável
        </h3>

        <div className="space-y-2">
          <Label htmlFor="coordenadorId">Coordenador</Label>
          <Select
            value={data.coordenadorId}
            onValueChange={(value) => handleInputChange('coordenadorId', value)}
            disabled={readOnly || loadingCoords}
          >
            <SelectTrigger id="coordenadorId">
              {loadingCoords ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </span>
              ) : (
                <SelectValue placeholder="Selecione o coordenador" />
              )}
            </SelectTrigger>
            <SelectContent>
              {coordenadores.map((coord) => (
                <SelectItem key={coord.id} value={coord.id}>{coord.nome_completo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {coordenador && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Coordenador Definido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{coordenador.nome_completo}</p>
              <p className="text-sm text-muted-foreground">Setor: {coordenador.setor?.nome || 'Assessoria'}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O técnico responsável será notificado sobre as visitas agendadas e receberá
          alertas caso alguma visita não seja realizada conforme o SLA definido.
        </AlertDescription>
      </Alert>
    </div>
  );
}