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
    // Para recorrência única: data completa
    vencimentoData: z.date().optional(),
    // Para recorrência periódica: dia do mês (1-31)
    diaVencimento: z.number().min(1).max(31).optional(),
    categoria: z.string().min(1, 'Selecione uma categoria'),
    centroCustoId: z.string().optional(), // Opcional
    // Parcelamento (apenas para UNICA)
    parcelar: z.boolean().default(false),
    numeroParcelas: z.number().min(2).max(48).optional(),
}).refine((data) => {
    if (data.recorrencia === 'UNICA') {
        return !!data.vencimentoData;
    }
    return !!data.diaVencimento;
}, {
    message: 'Informe a data ou dia de vencimento',
    path: ['vencimentoData'],
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
}

export function NovaDespesaModal({ open, onOpenChange, onSuccess }: NovaDespesaModalProps) {
    const [arquivos, setArquivos] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const createDespesa = useCreateDespesa();

    const form = useForm<z.input<typeof novaDespesaSchema>>({
        resolver: zodResolver(novaDespesaSchema),
        defaultValues: {
            descricao: '',
            fornecedor: '',
            valor: '',
            categoria: '',
            centroCustoId: '',
            recorrencia: 'MENSAL',
            diaVencimento: 5,
            parcelar: false,
            numeroParcelas: 2,
        },
    });

    // Watch recorrência e parcelar para renderização condicional
    const recorrencia = useWatch({
        control: form.control,
        name: 'recorrencia',
    });

    const parcelar = useWatch({
        control: form.control,
        name: 'parcelar',
    });

    const isRecorrenciaUnica = recorrencia === 'UNICA';

    async function onSubmit(data: NovaDespesaFormValues) {
        try {
            await createDespesa.mutateAsync({
                descricao: data.descricao,
                fornecedor: data.fornecedor,
                valor: data.valor,
                categoria: data.categoria,
                recorrencia: data.recorrencia,
                vencimentoData: data.vencimentoData,
                diaVencimento: data.diaVencimento,
                centroCustoId: data.centroCustoId,
                parcelar: data.parcelar,
                numeroParcelas: data.numeroParcelas
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

    // Gerar dias do mês (1-31)
    const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);

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
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        Nova Despesa
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para cadastrar uma nova previsão de despesa.
                    </DialogDescription>
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
                                            <Input placeholder="Ex: Aluguel Escritório" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fornecedor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fornecedor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Imobiliária X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a categoria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                                                <SelectItem value="ENERGIA">Energia</SelectItem>
                                                <SelectItem value="AGUA">Água</SelectItem>
                                                <SelectItem value="INTERNET">Internet</SelectItem>
                                                <SelectItem value="SALARIO">Salário</SelectItem>
                                                <SelectItem value="ENCARGO">Encargos</SelectItem>
                                                <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                                                <SelectItem value="MATERIAL">Material</SelectItem>
                                                <SelectItem value="OUTROS">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Linha 3: Recorrência e Vencimento (condicional) */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="recorrencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recorrência</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                            {isRecorrenciaUnica ? (
                                // Recorrência Única: Datepicker completo
                                <FormField
                                    control={form.control}
                                    name="vencimentoData"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Data de Vencimento</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: ptBR })
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                // Recorrência Periódica: Seletor de dia do mês
                                <FormField
                                    control={form.control}
                                    name="diaVencimento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dia do Vencimento</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Dia do mês" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-60">
                                                    {diasDoMes.map((dia) => (
                                                        <SelectItem key={dia} value={dia.toString()}>
                                                            Dia {dia}
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
