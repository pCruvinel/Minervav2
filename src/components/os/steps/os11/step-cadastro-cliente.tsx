import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User, Search, UserPlus, Loader2 } from 'lucide-react';
import { useClientes } from '@/lib/hooks/use-clientes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TIPOS_IMOVEL = [
    'Apartamento',
    'Casa',
    'Sobrado',
    'Condomínio',
    'Comercial',
    'Industrial',
    'Galpão',
    'Terreno',
    'Outro',
];

const ESTADOS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
];

interface StepCadastroClienteData {
    clienteId: string;
    nomeCliente: string;
    cpfCnpj: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    tipoImovel: string;
    observacoes: string;
    modoCliente: 'existente' | 'novo';
}

interface StepCadastroClienteProps {
    data: StepCadastroClienteData;
    // eslint-disable-next-line
    onDataChange: (_data: StepCadastroClienteData) => void;
    readOnly?: boolean;
}

export function StepCadastroCliente({ data, onDataChange, readOnly }: StepCadastroClienteProps) {
    const [busca, setBusca] = useState('');

    // Buscar clientes existentes do Supabase
    const { clientes, loading, error } = useClientes();

    const handleInputChange = (field: string, value: string) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleModoChange = (modo: string) => {
        if (readOnly) return;
        onDataChange({
            ...data,
            modoCliente: modo as 'existente' | 'novo',
            // Limpar dados ao trocar modo
            ...(modo === 'novo' ? { clienteId: '' } : {
                nomeCliente: '',
                cpfCnpj: '',
                email: '',
                telefone: '',
            })
        });
    };

    const handleSelecionarCliente = (clienteId: string) => {
        if (readOnly) return;
        const cliente = clientes.find(c => c.id === clienteId);
        if (cliente) {
            const endereco = cliente.endereco || {};
            onDataChange({
                ...data,
                clienteId,
                nomeCliente: cliente.nome_razao_social || '',
                cpfCnpj: cliente.cpf_cnpj || '',
                email: cliente.email || '',
                telefone: cliente.telefone || '',
                endereco: endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero || ''}` : '',
                cidade: endereco.cidade || '',
                estado: endereco.estado || '',
                cep: endereco.cep || '',
            });
        }
    };

    const formatCpfCnpj = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2');
        }
        return numbers
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const formatTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const formatCep = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nome_razao_social?.toLowerCase().includes(busca.toLowerCase()) ||
        c.cpf_cnpj?.includes(busca.replace(/\D/g, '')) ||
        c.email?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Cadastro do Cliente</h2>
                    <p className="text-sm text-muted-foreground">
                        Selecione um cliente existente ou cadastre um novo
                    </p>
                </div>
            </div>

            {/* Tabs para escolher modo */}
            <Tabs value={data.modoCliente || 'existente'} onValueChange={handleModoChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existente" disabled={readOnly}>
                        <Search className="w-4 h-4 mr-2" />
                        Cliente Existente
                    </TabsTrigger>
                    <TabsTrigger value="novo" disabled={readOnly}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Cliente
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Cliente Existente */}
                <TabsContent value="existente" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="busca">Buscar Cliente</Label>
                        <Input
                            id="busca"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Digite nome, CPF/CNPJ ou email..."
                            disabled={readOnly}
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-2 p-4 border rounded-md bg-muted/50">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erro ao carregar clientes. Por favor, tente novamente.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="border rounded-md max-h-64 overflow-y-auto">
                            {clientesFiltrados.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    {busca ? 'Nenhum cliente encontrado' : 'Digite para buscar clientes'}
                                </div>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <div
                                        key={cliente.id}
                                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${data.clienteId === cliente.id ? 'bg-primary/10' : ''
                                            }`}
                                        onClick={() => handleSelecionarCliente(cliente.id)}
                                    >
                                        <div className="font-medium">{cliente.nome_razao_social}</div>
                                        <div className="text-sm text-muted-foreground flex gap-4">
                                            {cliente.cpf_cnpj && <span>{cliente.cpf_cnpj}</span>}
                                            {cliente.email && <span>{cliente.email}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {data.clienteId && (
                        <Alert className="bg-success/10 border-success">
                            <User className="h-4 w-4 text-success" />
                            <AlertDescription className="text-success">
                                Cliente selecionado: <strong>{data.nomeCliente}</strong>
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                {/* Tab: Novo Cliente */}
                <TabsContent value="novo" className="space-y-4">
                    <div className="space-y-4">
                        <h3 className="text-base border-b border-border pb-2 text-primary">
                            Dados Pessoais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeCliente">Nome Completo <span className="text-destructive">*</span></Label>
                                <Input
                                    id="nomeCliente"
                                    value={data.nomeCliente}
                                    onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                                    placeholder="Nome do cliente"
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpfCnpj">CPF/CNPJ <span className="text-destructive">*</span></Label>
                                <Input
                                    id="cpfCnpj"
                                    value={data.cpfCnpj}
                                    onChange={(e) => handleInputChange('cpfCnpj', formatCpfCnpj(e.target.value))}
                                    placeholder="000.000.000-00"
                                    maxLength={18}
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="email@exemplo.com"
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone <span className="text-destructive">*</span></Label>
                                <Input
                                    id="telefone"
                                    value={data.telefone}
                                    onChange={(e) => handleInputChange('telefone', formatTelefone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Endereço do Imóvel - comum para ambos os modos */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2 text-primary">
                    Endereço do Imóvel (Local da Vistoria)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="endereco">Endereço Completo <span className="text-destructive">*</span></Label>
                        <Input
                            id="endereco"
                            value={data.endereco}
                            onChange={(e) => handleInputChange('endereco', e.target.value)}
                            placeholder="Rua, número, complemento"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade <span className="text-destructive">*</span></Label>
                        <Input
                            id="cidade"
                            value={data.cidade}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            placeholder="Cidade"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.estado}
                            onValueChange={(value) => handleInputChange('estado', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="estado">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {ESTADOS.map((uf) => (
                                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                            id="cep"
                            value={data.cep}
                            onChange={(e) => handleInputChange('cep', formatCep(e.target.value))}
                            placeholder="00000-000"
                            maxLength={9}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tipoImovel">Tipo de Imóvel <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.tipoImovel}
                            onValueChange={(value) => handleInputChange('tipoImovel', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="tipoImovel">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_IMOVEL.map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                        id="observacoes"
                        value={data.observacoes}
                        onChange={(e) => handleInputChange('observacoes', e.target.value)}
                        placeholder="Informações adicionais sobre o cliente ou imóvel"
                        rows={3}
                        disabled={readOnly}
                    />
                </div>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    O e-mail cadastrado será utilizado para envio do laudo técnico ao final do processo.
                </AlertDescription>
            </Alert>
        </div>
    );
}