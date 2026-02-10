import React, { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CentroCustoSelector } from '@/components/shared/centro-custo-selector';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Calendar as CalendarIcon, DollarSign, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateDespesa } from '@/lib/hooks/use-faturas-recorrentes';
import { useCategoriasFinanceiras } from '@/lib/hooks/use-categorias-financeiras';
import { useColaboradoresSelect } from '@/lib/hooks/use-colaboradores';

// Schema com lógica condicional para vencimento e parcelamento
const novaDespesaSchema = z.object({
    descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    fornecedor: z.string().min(3, 'Fornecedor deve ter no mínimo 3 caracteres'),
    valor: z.union([z.string(), z.number()]).transform((val) => {
        if (typeof val === 'number') return val;
        const numero = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'));
        return isNaN(numero) ? 0 : numero;
    }).refine((val) => val > 0, 'Valor deve ser maior que zero'),
    recorrencia: z.enum(['MENSAL', 'SEMANAL', 'ANUAL', 'UNICA'], {
        required_error: 'Selecione a recorrência',
    }),
    // Data completa obrigatória para todos
    vencimentoData: z.date({
        required_error: 'Selecione a data de vencimento',
    }),
    categoria: z.string().min(1, 'Selecione uma categoria'),
    centroCustoId: z.string().optional(), // Opcional
    
    // Novos campos para lógica híbrida
    favorecidoColaboradorId: z.string().optional(),
    
    // Parcelamento (apenas para UNICA)
    parcelar: z.boolean().default(false),
    numeroParcelas: z.number().min(2).max(48).optional(),
}).refine((data) => {
    if (data.parcelar && !data.numeroParcelas) {
        return false;
    }
    return true;
}, {
    message: 'Informe o número de parcelas',
    path: ['numeroParcelas'],
});

type NovaDespesaFormValues = z.output<typeof novaDespesaSchema>;

interface NovaDespesaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** Dados iniciais para preenchimento (ex: vindo de OS de Compra) */
    initialData?: Partial<z.input<typeof novaDespesaSchema>>;
    /** Campos que não podem ser editados (ex: valor definido na OS) */
    lockedFields?: Array<keyof z.input<typeof novaDespesaSchema>>;
}

export function NovaDespesaModal({ 
    open, 
    onOpenChange, 
    onSuccess,
    initialData,
    lockedFields = []
}: NovaDespesaModalProps) {
    const [arquivos, setArquivos] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const createDespesa = useCreateDespesa();
    
    // Buscar categorias de despesa do Supabase
    const { data: categorias = [], isLoading: isLoadingCategorias } = useCategoriasFinanceiras('pagar');
    
    // Buscar colaboradores
    const { data: colaboradores = [], isLoading: isLoadingColaboradores } = useColaboradoresSelect();

    const form = useForm<z.input<typeof novaDespesaSchema>, any, z.output<typeof novaDespesaSchema>>({
        resolver: zodResolver(novaDespesaSchema),
        defaultValues: {
            descricao: initialData?.descricao || '',
            fornecedor: initialData?.fornecedor || '',
            valor: initialData?.valor || '',
            categoria: initialData?.categoria || '',
            centroCustoId: initialData?.centroCustoId || '',
            recorrencia: (initialData?.recorrencia as any) || 'MENSAL',
            vencimentoData: initialData?.vencimentoData || new Date(),
            parcelar: initialData?.parcelar || false,
            numeroParcelas: initialData?.numeroParcelas || 2,
            favorecidoColaboradorId: initialData?.favorecidoColaboradorId || '',
        },
    });

    // Reset form when initialData changes or modal opens
    React.useEffect(() => {
        if (open && initialData) {
            form.reset({
                descricao: initialData.descricao || '',
                fornecedor: initialData.fornecedor || '',
                valor: initialData.valor || '',
                categoria: initialData.categoria || '',
                centroCustoId: initialData.centroCustoId || '',
                recorrencia: (initialData.recorrencia as any) || 'MENSAL',
                vencimentoData: initialData.vencimentoData || new Date(),
                parcelar: initialData.parcelar || false,
                numeroParcelas: initialData.numeroParcelas || 2,
                favorecidoColaboradorId: initialData.favorecidoColaboradorId || '',
            });
        }
    }, [open, initialData, form]);

    // Helper para verificar se campo está travado
    const isLocked = (field: keyof z.input<typeof novaDespesaSchema>) => lockedFields.includes(field);

    // Watch recorrência, parcelar e categoria para lógica condicional
    const recorrencia = useWatch({
        control: form.control,
        name: 'recorrencia',
    });

    const parcelar = useWatch({
        control: form.control,
        name: 'parcelar',
    });
    
    const categoriaId = useWatch({
        control: form.control,
        name: 'categoria',
    });

    const isRecorrenciaUnica = recorrencia === 'UNICA';
    
    // Verificar se categoria é Salários (ID fixo ou busca por nome)
    // ID Salário: 843f5fef-fb6a-49bd-bec3-b0917c2d4204
    const isSalario = categoriaId === '843f5fef-fb6a-49bd-bec3-b0917c2d4204';
    
    // Auto-fill ao selecionar colaborador
    const handleColaboradorSelect = (colabId: string) => {
        form.setValue('favorecidoColaboradorId', colabId);
        
        const selected = colaboradores.find(c => c.id === colabId);
        if (selected) {
            form.setValue('fornecedor', selected.nome_completo); // Compatibilidade
            form.setValue('descricao', `Salário - ${selected.nome_completo}`); // Sugestão
            
            // Auto-select Cost Center
            if (selected.rateio_fixo_id) {
                 form.setValue('centroCustoId', selected.rateio_fixo_id);
            }
        }
    };

    async function onSubmit(data: NovaDespesaFormValues) {
        try {
            await createDespesa.mutateAsync({
                descricao: data.descricao,
                fornecedor: data.fornecedor,
                valor: data.valor,
                categoria: data.categoria,
                recorrencia: data.recorrencia,
                vencimentoData: data.vencimentoData,
                centroCustoId: data.centroCustoId,
                parcelar: data.parcelar,
                numeroParcelas: data.numeroParcelas,
                favorecidoColaboradorId: data.favorecidoColaboradorId // Passar ID se existir
            });

            toast.success('Despesa criada com sucesso!');
            form.reset();
            setArquivos([]);
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            // Error handling is done in useMutation hook
            logger.error('Erro ao criar despesa:', error);
        }
    }

    // Formatação de Moeda no Input
    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
        let value = e.target.value.replace(/\D/g, '');
        value = (Number(value) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        onChange(value);
    };

    // Gerar opções de parcelas (2-48)
    const opcoesParcelas = Array.from({ length: 47 }, (_, i) => i + 2);

    // Handle file upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setArquivos(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setArquivos(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Nova Despesa</DialogTitle>
                            <DialogDescription className="text-xs">
                                Cadastre uma nova previsão de despesa fixa ou variável
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Linha 1: Descrição e Fornecedor */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="descricao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Ex: Aquisição de Equipamentos" 
                                                {...field} 
                                                disabled={isLocked('descricao')}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {isSalario ? (
                                <FormField
                                    control={form.control}
                                    name="favorecidoColaboradorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Colaborador</FormLabel>
                                            <Select onValueChange={handleColaboradorSelect} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o colaborador" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {colaboradores.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.nome_completo}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="fornecedor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fornecedor</FormLabel>
                                                <FormControl>
                                                     <Input 
                                                         placeholder="Nome do Fornecedor/Prestador" 
                                                         {...field}
                                                         disabled={isLocked('fornecedor')} 
                                                     />
                                                </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>


                        {/* Linha 2: Valor e Categoria */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="valor"
                                render={({ field: { onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Valor {parcelar ? 'Total' : 'Previsto'}</FormLabel>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    className="pl-9"
                                                    placeholder="R$ 0,00"
                                                    onChange={(e) => handleValorChange(e, onChange)}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                            disabled={isLocked('recorrencia')}
                                        >
                                            <FormControl>
                                                <SelectTrigger disabled={isLoadingCategorias}>
                                                    <SelectValue placeholder={isLoadingCategorias ? "Carregando..." : "Selecione a categoria"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[280px]">
                                                {categorias.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-muted-foreground text-xs">{cat.codigo}</span>
                                                            <span>{cat.nome}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Linha 3: Recorrência e Vencimento */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="recorrencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recorrência</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                            disabled={isLocked('recorrencia')}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a frequência" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MENSAL">Mensal</SelectItem>
                                                <SelectItem value="SEMANAL">Semanal</SelectItem>
                                                <SelectItem value="ANUAL">Anual</SelectItem>
                                                <SelectItem value="UNICA">Única</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vencimentoData"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{recorrencia === 'UNICA' ? 'Data de Vencimento' : 'Primeiro Vencimento'}</FormLabel>
                                        <Popover>
                                            <FormControl>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isLocked('vencimentoData')}
                                                    >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                                </PopoverTrigger>
                                            </FormControl>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    disabled={isLocked('vencimentoData')}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {recorrencia !== 'UNICA' && (
                                            <p className="text-[0.7rem] text-muted-foreground">
                                                A partir desta data, serão geradas as próximas automaticamente.
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Parcelamento (apenas para UNICA) */}
                        {isRecorrenciaUnica && (
                            <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                                <FormField
                                    control={form.control}
                                    name="parcelar"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="cursor-pointer">
                                                    Parcelar esta despesa
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground">
                                                    Divide o valor total em parcelas mensais iguais
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {parcelar && (
                                    <FormField
                                        control={form.control}
                                        name="numeroParcelas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número de Parcelas</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    defaultValue={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Parcelas" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-60">
                                                        {opcoesParcelas.map((num) => (
                                                            <SelectItem key={num} value={num.toString()}>
                                                                {num}x
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Centro de Custo (opcional) - SEM FormControl para evitar ref warning */}
                        <FormField
                            control={form.control}
                            name="centroCustoId"
                            render={({ field }) => (
                                <FormItem>
                                    <CentroCustoSelector
                                        value={field.value || ''}
                                        onChange={(ccId) => field.onChange(ccId)}
                                        label="Centro de Custo (Opcional)"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Upload de Comprovante */}
                        <div className="space-y-2">
                            <FormLabel>Comprovante / Boleto (Opcional)</FormLabel>
                            <div
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Clique para anexar arquivos (PDF, JPG, PNG)
                                </p>
                            </div>

                            {/* Lista de arquivos */}
                            {arquivos.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {arquivos.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded border bg-muted/30"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createDespesa.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createDespesa.isPending}>
                                {createDespesa.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Despesa
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
