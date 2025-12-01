import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 10 funções disponíveis
const FUNCOES_DISPONIVEIS = [
    { id: 'admin', nome: 'Administrador', acessoSistema: true },
    { id: 'diretoria', nome: 'Diretoria', acessoSistema: true },
    { id: 'gestor_administrativo', nome: 'Gestor Administrativo', acessoSistema: true },
    { id: 'gestor_obras', nome: 'Gestor de Obras', acessoSistema: true },
    { id: 'gestor_assessoria', nome: 'Gestor de Assessoria', acessoSistema: true },
    { id: 'coordenador_obras', nome: 'Coordenador de Obras', acessoSistema: true },
    { id: 'coordenador_assessoria', nome: 'Coordenador de Assessoria', acessoSistema: true },
    { id: 'colaborador', nome: 'Colaborador', acessoSistema: true },
    { id: 'colaborador_obra', nome: 'Colaborador de Obra', acessoSistema: false },
    { id: 'mao_de_obra', nome: 'Mão de Obra Terceirizada', acessoSistema: false },
];

const CARGOS = [
    'Pedreiro',
    'Ajudante de Pedreiro',
    'Mestre de Obras',
    'Pintor',
    'Eletricista',
    'Encanador',
    'Engenheiro Civil',
    'Técnico em Edificações',
    'Administrativo',
    'Supervisor',
];

interface ColaboradorAdicional {
    id: string;
    cargo: string;
    funcao: string;
    quantidade: number;
}

interface StepRequisicaoMultiplaProps {
    data: {
        colaboradoresAdicionais: ColaboradorAdicional[];
        totalVagas: number;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
    colaboradorBase?: {
        tipoColaborador: string;
        cargo: string;
        funcao: string;
    };
    centroCusto?: string;
}

export function StepRequisicaoMultipla({
    data,
    onDataChange,
    readOnly,
    colaboradorBase,
    centroCusto
}: StepRequisicaoMultiplaProps) {
    const [novoColaborador, setNovoColaborador] = useState<Partial<ColaboradorAdicional>>({
        cargo: '',
        funcao: '',
        quantidade: 1,
    });

    const handleAddColaborador = () => {
        if (readOnly || !novoColaborador.cargo || !novoColaborador.funcao) return;

        const newItem: ColaboradorAdicional = {
            id: `col-${Date.now()}`,
            cargo: novoColaborador.cargo || '',
            funcao: novoColaborador.funcao || '',
            quantidade: novoColaborador.quantidade || 1,
        };

        const updated = [...(data.colaboradoresAdicionais || []), newItem];
        const total = updated.reduce((sum, c) => sum + c.quantidade, 1); // +1 para o colaborador base

        onDataChange({
            ...data,
            colaboradoresAdicionais: updated,
            totalVagas: total,
        });

        setNovoColaborador({ cargo: '', funcao: '', quantidade: 1 });
    };

    const handleRemoveColaborador = (id: string) => {
        if (readOnly) return;

        const updated = (data.colaboradoresAdicionais || []).filter(c => c.id !== id);
        const total = updated.reduce((sum, c) => sum + c.quantidade, 1);

        onDataChange({
            ...data,
            colaboradoresAdicionais: updated,
            totalVagas: total,
        });
    };

    const handleDuplicarBase = () => {
        if (readOnly || !colaboradorBase?.cargo || !colaboradorBase?.funcao) return;

        const newItem: ColaboradorAdicional = {
            id: `col-${Date.now()}`,
            cargo: colaboradorBase.cargo,
            funcao: colaboradorBase.funcao,
            quantidade: 1,
        };

        const updated = [...(data.colaboradoresAdicionais || []), newItem];
        const total = updated.reduce((sum, c) => sum + c.quantidade, 1);

        onDataChange({
            ...data,
            colaboradoresAdicionais: updated,
            totalVagas: total,
        });
    };

    const getFuncaoNome = (funcaoId: string) => {
        return FUNCOES_DISPONIVEIS.find(f => f.id === funcaoId)?.nome || funcaoId;
    };

    const totalVagas = (data.colaboradoresAdicionais || []).reduce((sum, c) => sum + c.quantidade, 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Requisição Múltipla</h2>
                    <p className="text-sm text-muted-foreground">
                        Adicione mais colaboradores a esta mesma requisição (opcional)
                    </p>
                </div>
            </div>

            {/* Resumo do Colaborador Base */}
            {colaboradorBase && colaboradorBase.cargo && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success" />
                                Colaborador Principal (Etapa 3)
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDuplicarBase}
                                disabled={readOnly}
                                className="h-7 text-xs"
                            >
                                <Copy className="w-3 h-3 mr-1" />
                                Duplicar
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Cargo:</span>
                                <p className="font-medium">{colaboradorBase.cargo}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Função:</span>
                                <p className="font-medium">{getFuncaoNome(colaboradorBase.funcao)}</p>
                            </div>
                            {centroCusto && (
                                <div>
                                    <span className="text-muted-foreground">Centro de Custo:</span>
                                    <p className="font-medium">{centroCusto}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Adicionar Colaboradores */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Adicionar Mais Colaboradores
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="novoCargo">Cargo</Label>
                        <Select
                            value={novoColaborador.cargo}
                            onValueChange={(value) => setNovoColaborador({ ...novoColaborador, cargo: value })}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="novoCargo">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {CARGOS.map((cargo) => (
                                    <SelectItem key={cargo} value={cargo}>
                                        {cargo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="novaFuncao">Função</Label>
                        <Select
                            value={novoColaborador.funcao}
                            onValueChange={(value) => setNovoColaborador({ ...novoColaborador, funcao: value })}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="novaFuncao">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {FUNCOES_DISPONIVEIS.map((funcao) => (
                                    <SelectItem key={funcao.id} value={funcao.id}>
                                        {funcao.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantidade">Qtd</Label>
                        <Input
                            id="quantidade"
                            type="number"
                            min="1"
                            max="50"
                            value={novoColaborador.quantidade}
                            onChange={(e) => setNovoColaborador({ ...novoColaborador, quantidade: parseInt(e.target.value) || 1 })}
                            disabled={readOnly}
                        />
                    </div>

                    <Button
                        onClick={handleAddColaborador}
                        disabled={readOnly || !novoColaborador.cargo || !novoColaborador.funcao}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
            </div>

            {/* Lista de Colaboradores Adicionais */}
            {(data.colaboradoresAdicionais || []).length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                        Colaboradores na Requisição
                    </h3>

                    <div className="space-y-2">
                        {(data.colaboradoresAdicionais || []).map((col, index) => (
                            <Card key={col.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="font-mono">
                                            #{index + 2}
                                        </Badge>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Cargo:</span>
                                                <span className="ml-1 font-medium">{col.cargo}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Função:</span>
                                                <span className="ml-1 font-medium">{getFuncaoNome(col.funcao)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Quantidade:</span>
                                                <Badge className="ml-1 bg-primary">{col.quantidade}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveColaborador(col.id)}
                                        disabled={readOnly}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumo Total */}
            <Card className="bg-muted/50">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="font-medium">Total de Vagas nesta Requisição:</span>
                        </div>
                        <Badge className="bg-primary text-lg px-4 py-1">
                            {totalVagas} {totalVagas === 1 ? 'vaga' : 'vagas'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Uma única OS-10 pode solicitar múltiplos colaboradores com cargos e funções diferentes.
                    Todos serão alocados no mesmo centro de custo selecionado na Etapa 2.
                </AlertDescription>
            </Alert>
        </div>
    );
}