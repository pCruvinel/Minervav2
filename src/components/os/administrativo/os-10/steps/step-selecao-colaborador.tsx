import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserCog, ShieldAlert, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCargos, FUNCOES_COLABORADOR, TIPOS_CONTRATACAO } from '@/lib/hooks/use-os-workflows';

interface StepSelecaoColaboradorData {
    tipoColaborador: string;
    cargo: string;
    funcao: string;
    acessoSistema: boolean;
}

interface StepSelecaoColaboradorProps {
    data: StepSelecaoColaboradorData;
    onDataChange: (updatedData: StepSelecaoColaboradorData) => void;
    readOnly?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _Props { updatedData: StepSelecaoColaboradorData }

export function StepSelecaoColaborador({ data, onDataChange, readOnly }: StepSelecaoColaboradorProps) {
    // Buscar cargos reais do Supabase
    const { cargos, loading: loadingCargos } = useCargos();

    const handleInputChange = (field: string, value: string | boolean) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleFuncaoChange = (funcaoSlug: string) => {
        if (readOnly) return;
        const funcao = FUNCOES_COLABORADOR.find(f => f.slug === funcaoSlug);
        onDataChange({
            ...data,
            funcao: funcaoSlug,
            acessoSistema: funcao?.acesso_sistema ?? true,
        });
    };

    const selectedFuncao = FUNCOES_COLABORADOR.find(f => f.slug === data.funcao);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCog className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Seleção do Tipo de Colaborador</h2>
                    <p className="text-sm text-muted-foreground">
                        Defina o tipo de contratação, cargo e função do colaborador
                    </p>
                </div>
            </div>

            {/* Tipo de Contratação */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2 text-primary">
                    Tipo de Contratação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipoColaborador">
                            Tipo de Vínculo <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.tipoColaborador}
                            onValueChange={(value: string) => handleInputChange('tipoColaborador', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="tipoColaborador">
                                <SelectValue placeholder="Selecione o tipo de vínculo" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_CONTRATACAO.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cargo">
                            Cargo <span className="text-destructive">*</span>
                        </Label>
                        {loadingCargos ? (
                            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Carregando cargos...</span>
                            </div>
                        ) : (
                            <Select
                                value={data.cargo}
                                onValueChange={(value: string) => handleInputChange('cargo', value)}
                                disabled={readOnly}
                            >
                                <SelectTrigger id="cargo">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cargos.length > 0 ? (
                                        cargos.map((cargo) => (
                                            <SelectItem key={cargo.id} value={cargo.slug}>
                                                {cargo.nome}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Nenhum cargo cadastrado
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* Função no Sistema */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2 text-primary">
                    Função no Sistema
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="funcao">
                        Função/Perfil <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.funcao}
                        onValueChange={handleFuncaoChange}
                        disabled={readOnly}
                    >
                        <SelectTrigger id="funcao">
                            <SelectValue placeholder="Selecione a função no sistema" />
                        </SelectTrigger>
                        <SelectContent>
                            {FUNCOES_COLABORADOR.map((funcao) => (
                                <SelectItem key={funcao.slug} value={funcao.slug}>
                                    <div className="flex items-center gap-2">
                                        <span>{funcao.nome}</span>
                                        {!funcao.acesso_sistema && (
                                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning">
                                                Sem Acesso
                                            </Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        A função determina o nível de acesso e permissões do colaborador no sistema
                    </p>
                </div>
            </div>

            {/* Info da Função Selecionada */}
            {selectedFuncao && (
                <Card className={`border-2 ${selectedFuncao.acesso_sistema ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            {selectedFuncao.acesso_sistema ? (
                                <UserCog className="w-4 h-4 text-success" />
                            ) : (
                                <ShieldAlert className="w-4 h-4 text-warning" />
                            )}
                            Função Selecionada: {selectedFuncao.nome}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                Nível de acesso: {selectedFuncao.nivel}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Acesso ao Sistema:</span>
                                {selectedFuncao.acesso_sistema ? (
                                    <Badge className="bg-success text-success-foreground">Sim</Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                                        Não
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alerta para colaborador sem acesso */}
            {selectedFuncao && !selectedFuncao.acesso_sistema && (
                <Alert className="border-warning bg-warning/5">
                    <ShieldAlert className="h-4 w-4 text-warning" />
                    <AlertDescription className="text-warning">
                        <strong>Atenção:</strong> Colaboradores com a função &ldquo;{selectedFuncao.nome}&rdquo;
                        <strong> NÃO terão acesso ao sistema</strong>. Eles serão cadastrados apenas
                        para fins de gestão de RH, controle de presença e rateio de custos.
                    </AlertDescription>
                </Alert>
            )}

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    O sistema possui <strong>10 funções disponíveis</strong>. Apenas &ldquo;Colaborador de Obra&rdquo;
                    e &ldquo;Mão de Obra&rdquo; não possuem acesso ao sistema.
                </AlertDescription>
            </Alert>
        </div>
    );
}