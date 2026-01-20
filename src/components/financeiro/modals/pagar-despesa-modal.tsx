import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useMarcarPago } from '@/lib/hooks/use-faturas-recorrentes';
import { supabase } from '@/lib/supabase-client';

const pagarDespesaSchema = z.object({
    valorPago: z.union([z.string(), z.number()]).transform((val) => Number(String(val).replace(/[^0-9,.-]+/g, "").replace(",", "."))),
    dataPagamento: z.date({
        required_error: "A data de pagamento é obrigatória.",
    }),
    observacoes: z.string().optional(),
});

type PagarDespesaFormValues = z.infer<typeof pagarDespesaSchema>;

interface PagarDespesaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fatura: {
        id: string;
        descricao: string;
        fornecedor: string;
        valor: number;
    } | null;
    onSuccess?: () => void;
}

export function PagarDespesaModal({ open, onOpenChange, fatura, onSuccess }: PagarDespesaModalProps) {
    const pagarDespesa = useMarcarPago();
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const form = useForm<PagarDespesaFormValues>({
        resolver: zodResolver(pagarDespesaSchema),
        defaultValues: {
            valorPago: fatura?.valor || 0,
            dataPagamento: new Date(),
            observacoes: '',
        },
        values: {
            valorPago: fatura?.valor || 0,
            dataPagamento: new Date(),
            observacoes: '',
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("O arquivo deve ter no máximo 5MB.");
                return;
            }
            // Replace existing files to enforce single file upload
            setArquivos([file]);
        }
    };

    const removeFile = () => {
        setArquivos([]);
    };

    const uploadComprovante = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `comprovantes/${fileName}`;

        const { error } = await supabase.storage
            .from('financeiro') // Ensure this bucket exists or use general bucket
            .upload(filePath, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from('financeiro')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    async function onSubmit(data: PagarDespesaFormValues) {
        if (!fatura) return;

        try {
            setUploading(true);
            let comprovanteUrl: string | undefined;

            if (arquivos.length > 0) {
                // Upload only the first file for now as schema supports single URL
                // Or user specifically selects "Comprovante"
                try {
                    comprovanteUrl = await uploadComprovante(arquivos[0]);
                } catch (uploadError) {
                    console.error(uploadError);
                    toast.error("Erro ao fazer upload do comprovante.");
                    setUploading(false);
                    return;
                }
            }

            await pagarDespesa.mutateAsync({
                faturaId: fatura.id,
                valorPago: data.valorPago,
                dataPagamento: data.dataPagamento,
                comprovanteUrl,
                observacoes: data.observacoes,
            });

            form.reset();
            setArquivos([]);
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            // Error handling handled by mutation or generic
        } finally {
            setUploading(false);
        }
    }

    const formatCurrencyInput = (value: number | string) => {
        const number = Number(String(value).replace(/\D/g, '')) / 100;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(number);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Pagamento</DialogTitle>
                    <DialogDescription>
                        Registre o pagamento para {fatura?.fornecedor} - {fatura?.descricao}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="valorPago"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Valor Pago</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSignIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    className="pl-9"
                                                    value={formatCurrencyInput(value)}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/\D/g, '');
                                                        onChange(parseFloat(rawValue) / 100);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dataPagamento"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col mt-2">
                                        <FormLabel>Data do Pagamento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                                        ) : (
                                                            <span>Selecione a data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="observacoes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhes sobre o pagamento..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Comprovante (Anexo)</FormLabel>
                            <div className="flex flex-col gap-2">
                                <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Clique para enviar comprovante
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, PNG ou JPG (Max 5MB)
                                    </p>
                                </div>
                                {arquivos.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {arquivos.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded border">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                                                    <span className="text-sm truncate">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({(file.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => removeFile()}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading || pagarDespesa.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={uploading || pagarDespesa.isPending}>
                                {(uploading || pagarDespesa.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Pagamento
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
