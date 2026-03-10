import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Info, Calculator, Loader2, MapPin, Building2, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { Colaborador } from '@/types/colaborador';
import { FUNCOES, QUALIFICACOES_OBRA, TIPOS_CONTRATACAO, BANCOS, DOCUMENTOS_OBRIGATORIOS, getCargoIdByFuncao, getSetorIdBySlug, getCentroCustoFixo } from '@/lib/constants/colaboradores';
import { useViaCEP } from '@/lib/hooks/use-viacep';
import { cn } from '@/lib/utils';

// ============================================================
// CONSTANTES
// ============================================================

const DIAS_SEMANA_CONFIG = [
  { value: 'SEG', inicial: 'S', nome: 'Segunda' },
  { value: 'TER', inicial: 'T', nome: 'Terca' },
  { value: 'QUA', inicial: 'Q', nome: 'Quarta' },
  { value: 'QUI', inicial: 'Q', nome: 'Quinta' },
  { value: 'SEX', inicial: 'S', nome: 'Sexta' },
  { value: 'SAB', inicial: 'S', nome: 'Sabado' },
  { value: 'DOM', inicial: 'D', nome: 'Domingo' },
];

const TURNOS_CONFIG = [
  { value: 'MANHA', label: 'Manha' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
  { value: 'INTEGRAL', label: 'Integral' },
];

// ============================================================
// SCHEMA ZOD
// ============================================================

const colaboradorFormSchema = z.object({
  // Identificacao
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF invalido'),
  dataNascimento: z.string().optional(),
  emailPessoal: z.string().email('Email invalido').optional().or(z.literal('')),
  emailProfissional: z.string().email('Email invalido').optional().or(z.literal('')),
  telefonePessoal: z.string().optional(),
  telefoneProfissional: z.string().optional(),
  contatoEmergenciaNome: z.string().optional(),
  contatoEmergenciaTelefone: z.string().optional(),
  // Endereco
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  // Disponibilidade
  disponibilidadeDias: z.array(z.string()).optional(),
  turno: z.array(z.string()).optional(),
  // Funcao e Hierarquia
  funcao: z.string().min(1, 'Selecione uma funcao'),
  qualificacao: z.string().optional(),
  // Financeiro
  tipoContratacao: z.string().min(1, 'Selecione o tipo de contratacao'),
  salarioBruto: z.string().optional(),
  remuneracaoContratual: z.string().optional(),
  diaVencimento: z.string().optional(),
  // Bancario
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  chavePix: z.string().optional(),
  // Acesso (apenas create)
  emailAcesso: z.string().optional(),
}).refine((data) => {
  if (data.tipoContratacao === 'CLT' && (!data.salarioBruto || data.salarioBruto === '')) {
    return false;
  }
  return true;
}, {
  message: 'Salario bruto e obrigatorio para CLT',
  path: ['salarioBruto'],
}).refine((data) => {
  if (data.tipoContratacao === 'CONTRATO' && (!data.remuneracaoContratual || data.remuneracaoContratual === '')) {
    return false;
  }
  return true;
}, {
  message: 'Remuneracao contratual e obrigatoria',
  path: ['remuneracaoContratual'],
});

type ColaboradorFormData = z.infer<typeof colaboradorFormSchema>;

// ============================================================
// PAYLOAD TIPADO (exportado para uso externo)
// ============================================================

export interface ColaboradorFormPayload {
  // Acesso
  email_acesso: string | null;
  enviar_convite: boolean;
  // Campos existentes na tabela colaboradores
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  endereco: string;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  email_pessoal: string | null;
  email_profissional: string | null;
  telefone_pessoal: string | null;
  telefone_profissional: string | null;
  contato_emergencia_nome: string | null;
  contato_emergencia_telefone: string | null;
  disponibilidade_dias: string[];
  turno: string[];
  funcao: string | null;
  qualificacao: string | null;
  setor: string | null;
  gestor: string | null;
  cargo_id: string | null;
  setor_id: string | null;
  tipo_contratacao: string | null;
  salario_base: number | null;
  remuneracao_contratual: number | null;
  custo_dia: number | null;
  dia_vencimento: number;
  rateio_fixo: string | null;
  bloqueado_sistema: boolean;
  documentos_obrigatorios: string[] | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  chave_pix: string | null;
}

// ============================================================
// HELPERS DE MASCARA
// ============================================================

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const maskDate = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\/\d{4})\d+?$/, '$1');
};

const dateToISO = (dateBR: string): string => {
  if (!dateBR || dateBR.length !== 10) return '';
  const [dia, mes, ano] = dateBR.split('/');
  if (!dia || !mes || !ano) return '';
  return `${ano}-${mes}-${dia}`;
};

const dateFromISO = (dateISO: string): string => {
  if (!dateISO) return '';
  if (dateISO.includes('/')) return dateISO;
  const datePart = dateISO.split('T')[0];
  const [ano, mes, dia] = datePart.split('-');
  if (!dia || !mes || !ano) return '';
  return `${dia}/${mes}/${ano}`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// ============================================================
// TIPOS E PROPS
// ============================================================

interface ModalCadastroColaboradorProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  colaborador?: Colaborador | null;
  // eslint-disable-next-line no-unused-vars
  onSalvar: (data: ColaboradorFormPayload, files?: Record<string, File>) => Promise<void> | void;
  loading?: boolean;
}

// ============================================================
// COMPONENTE
// ============================================================

export function ModalCadastroColaborador({
  open,
  onClose,
  mode,
  colaborador = null,
  onSalvar,
  loading: externalLoading = false,
}: ModalCadastroColaboradorProps) {
  const [tabAtual, setTabAtual] = useState('identificacao');
  const [internalLoading, setInternalLoading] = useState(false);
  const { fetchCEP, loading: cepLoading } = useViaCEP();
  const [documentosFiles, setDocumentosFiles] = useState<Record<string, File>>({});
  const [docErrors, setDocErrors] = useState<string[]>([]);

  const isLoading = externalLoading || internalLoading;
  const isCreate = mode === 'create';

  // React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      emailPessoal: '',
      emailProfissional: '',
      telefonePessoal: '',
      telefoneProfissional: '',
      contatoEmergenciaNome: '',
      contatoEmergenciaTelefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      disponibilidadeDias: [],
      turno: [],
      funcao: '',
      qualificacao: '',
      tipoContratacao: '',
      salarioBruto: '',
      remuneracaoContratual: '',
      diaVencimento: '5',
      banco: '',
      agencia: '',
      conta: '',
      chavePix: '',
      emailAcesso: '',
    },
  });

  // Watched values
  const funcao = watch('funcao');
  const tipoContratacao = watch('tipoContratacao');
  const salarioBruto = watch('salarioBruto');
  const remuneracaoContratual = watch('remuneracaoContratual');
  const emailProfissional = watch('emailProfissional');

  // Derived values
  const funcaoData = FUNCOES.find(f => f.value === funcao);
  const isColaboradorObra = funcao === 'colaborador_obra';
  const isCLT = tipoContratacao === 'CLT';
  const isContrato = tipoContratacao === 'CONTRATO';

  // Auto-sync emailAcesso with emailProfissional (non-obra)
  useEffect(() => {
    if (isColaboradorObra) {
      setValue('emailAcesso', '');
    } else if (isCreate && emailProfissional) {
      setValue('emailAcesso', emailProfissional);
    }
  }, [isColaboradorObra, isCreate, emailProfissional, setValue]);

  // Preencher dados ao editar
  useEffect(() => {
    if (mode === 'edit' && colaborador) {
      reset({
        nomeCompleto: colaborador.nome_completo || colaborador.nome || '',
        cpf: colaborador.cpf || '',
        dataNascimento: colaborador.data_nascimento ? dateFromISO(colaborador.data_nascimento) : '',
        emailPessoal: colaborador.email_pessoal || '',
        emailProfissional: colaborador.email_profissional || colaborador.email || '',
        telefonePessoal: colaborador.telefone_pessoal || '',
        telefoneProfissional: colaborador.telefone_profissional || colaborador.telefone || '',
        contatoEmergenciaNome: colaborador.contato_emergencia_nome || '',
        contatoEmergenciaTelefone: colaborador.contato_emergencia_telefone || '',
        cep: colaborador.cep || '',
        logradouro: colaborador.logradouro || colaborador.endereco || '',
        numero: colaborador.numero || '',
        complemento: colaborador.complemento || '',
        bairro: colaborador.bairro || '',
        cidade: colaborador.cidade || '',
        uf: colaborador.uf || '',
        disponibilidadeDias: colaborador.disponibilidade_dias || [],
        turno: colaborador.turno || [],
        funcao: colaborador.funcao || '',
        qualificacao: colaborador.qualificacao || '',
        tipoContratacao: colaborador.tipo_contratacao || '',
        salarioBruto: colaborador.salario_base?.toString() || '',
        remuneracaoContratual: colaborador.remuneracao_contratual?.toString() || '',
        diaVencimento: colaborador.dia_vencimento?.toString() || '5',
        banco: colaborador.banco || '',
        agencia: colaborador.agencia || '',
        conta: colaborador.conta || '',
        chavePix: colaborador.chave_pix || '',
        emailAcesso: colaborador.email || '',

      });
    } else if (mode === 'create') {
      reset();
      setTabAtual('identificacao');
      setDocumentosFiles({});
      setDocErrors([]);
    }
  }, [colaborador, mode, open, reset]);

  // ViaCEP
  const handleCepChange = async (value: string) => {
    const maskedCep = maskCEP(value);
    setValue('cep', maskedCep);

    const cleanCep = maskedCep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const endereco = await fetchCEP(cleanCep);
      if (endereco) {
        setValue('logradouro', endereco.logradouro || '');
        setValue('bairro', endereco.bairro || '');
        setValue('cidade', endereco.localidade || '');
        setValue('uf', endereco.uf || '');
      }
    }
  };

  // Calculos financeiros
  const calcularCustoCLT = () => {
    const salario = parseFloat(salarioBruto || '') || 0;
    return salario * 1.46;
  };

  const calcularCustoMes = () => {
    if (isCLT) return calcularCustoCLT();
    if (isContrato) return parseFloat(remuneracaoContratual || '') || 0;
    return 0;
  };

  const calcularCustoDia = () => calcularCustoMes() / 26;

  const getRateioFixo = (): string | null => {
    if (!funcaoData) return null;
    const funcaoSlug = watch('funcao');
    return getCentroCustoFixo(funcaoSlug);
  };


  const handleFileChange = (docValue: string, file: File | null) => {
    if (file) {
      setDocumentosFiles(prev => ({ ...prev, [docValue]: file }));
      setDocErrors(prev => prev.filter(e => e !== docValue));
    } else {
      setDocumentosFiles(prev => {
        const next = { ...prev };
        delete next[docValue];
        return next;
      });
    }
  };

  // Submit handler
  const onSubmitForm = async (data: ColaboradorFormData) => {
    // Validacao extra: email profissional obrigatorio para acesso (non-obra)
    if (isCreate && !isColaboradorObra && (!data.emailProfissional || !data.emailProfissional.includes('@'))) {
      setTabAtual('acesso');
      return;
    }

    // Validar Documentos Obrigatorios (apenas no create por enquanto)
    if (isCreate) {
      const missingDocs = DOCUMENTOS_OBRIGATORIOS.filter(doc => !documentosFiles[doc.value]).map(doc => doc.value);
      if (missingDocs.length > 0) {
        setDocErrors(missingDocs);
        setTabAtual('documentos');
        return;
      }
    }

    setInternalLoading(true);
    try {
      const enderecoCompleto = [
        data.logradouro,
        data.numero ? `n${data.numero}` : '',
        data.complemento,
        data.bairro,
        data.cidade,
        data.uf,
        data.cep ? `CEP: ${data.cep}` : ''
      ].filter(Boolean).join(', ');

      const payload: ColaboradorFormPayload = {
        email_acesso: isCreate && !isColaboradorObra ? (data.emailProfissional || null) : null,
        enviar_convite: isCreate && !isColaboradorObra && !!data.emailProfissional,
        nome_completo: data.nomeCompleto,
        cpf: data.cpf,
        data_nascimento: data.dataNascimento ? dateToISO(data.dataNascimento) : null,
        endereco: enderecoCompleto,
        cep: data.cep || null,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        uf: data.uf || null,
        email_pessoal: data.emailPessoal || null,
        email_profissional: data.emailProfissional || null,
        telefone_pessoal: data.telefonePessoal || null,
        telefone_profissional: data.telefoneProfissional || null,
        contato_emergencia_nome: data.contatoEmergenciaNome || null,
        contato_emergencia_telefone: data.contatoEmergenciaTelefone || null,
        disponibilidade_dias: data.disponibilidadeDias || [],
        turno: data.turno || [],
        funcao: data.funcao || null,
        qualificacao: data.qualificacao || null,
        setor: funcaoData?.setor || null,
        gestor: (funcaoData as Record<string, unknown>)?.gestor as string || null,
        cargo_id: getCargoIdByFuncao(data.funcao),
        setor_id: getSetorIdBySlug(funcaoData?.setor),
        tipo_contratacao: data.tipoContratacao || null,
        salario_base: isCLT ? (parseFloat(data.salarioBruto || '') || null) : null,
        remuneracao_contratual: isContrato ? (parseFloat(data.remuneracaoContratual || '') || null) : null,
        custo_dia: calcularCustoDia() || null,
        dia_vencimento: parseInt(data.diaVencimento || '5') || 5,
        rateio_fixo: getRateioFixo() || null,
        bloqueado_sistema: isColaboradorObra,
        documentos_obrigatorios: null,
        banco: data.banco || null,
        agencia: data.agencia || null,
        conta: data.conta || null,
        chave_pix: data.chavePix || null,
      };

      await onSalvar(payload, isCreate ? documentosFiles : undefined);
    } finally {
      setInternalLoading(false);
    }
  };

  // Determinar abas com erros
  const hasIdentificacaoErrors = !!(errors.nomeCompleto || errors.cpf || errors.emailPessoal || errors.emailProfissional);
  const hasFuncaoErrors = !!(errors.funcao);
  const hasFinanceiroErrors = !!(errors.tipoContratacao || errors.salarioBruto || errors.remuneracaoContratual);
  const hasDocumentosErrors = docErrors.length > 0;


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Cadastrar Colaborador' : 'Editar Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? 'Preencha os dados do colaborador. Campos marcados com * sao obrigatorios.'
              : 'Atualize os dados do colaborador conforme necessario.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Tabs value={tabAtual} onValueChange={setTabAtual}>
            <TabsList className={cn("grid w-full", isCreate ? "grid-cols-5" : "grid-cols-4")}>
              <TabsTrigger value="identificacao" className="relative">
                Identificacao
                {hasIdentificacaoErrors && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="hierarquia" className="relative">
                Funcao e Hierarquia
                {hasFuncaoErrors && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="relative">
                Contrato
                {hasFinanceiroErrors && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="documentos" className="relative">
                Documentos
                {hasDocumentosErrors && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </TabsTrigger>
              {isCreate && (
                <TabsTrigger value="acesso" className="relative">
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  Acesso
                </TabsTrigger>
              )}
            </TabsList>

            {/* ========== ABA 1: IDENTIFICACAO ========== */}
            <TabsContent value="identificacao" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Digite o nome completo"
                    {...register('nomeCompleto')}
                    className={errors.nomeCompleto ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.nomeCompleto && (
                    <p className="text-xs text-destructive">{errors.nomeCompleto.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="000.000.000-00"
                        value={field.value}
                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                        maxLength={14}
                        className={errors.cpf ? 'border-destructive' : ''}
                        disabled={isLoading}
                      />
                    )}
                  />
                  {errors.cpf && (
                    <p className="text-xs text-destructive">{errors.cpf.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Controller
                    name="dataNascimento"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        placeholder="dd/mm/aaaa"
                        value={field.value}
                        onChange={(e) => field.onChange(maskDate(e.target.value))}
                        maxLength={10}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Pessoal</Label>
                  <Input
                    type="email"
                    placeholder="email@pessoal.com"
                    {...register('emailPessoal')}
                    className={errors.emailPessoal ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.emailPessoal && (
                    <p className="text-xs text-destructive">{errors.emailPessoal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email Profissional</Label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com"
                    {...register('emailProfissional')}
                    className={errors.emailProfissional ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.emailProfissional && (
                    <p className="text-xs text-destructive">{errors.emailProfissional.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Telefone Pessoal</Label>
                  <Controller
                    name="telefonePessoal"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        maxLength={15}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone Profissional</Label>
                  <Controller
                    name="telefoneProfissional"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        maxLength={15}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Endereco com ViaCEP */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Endereco</h4>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>CEP</Label>
                    <div className="relative">
                      <Controller
                        name="cep"
                        control={control}
                        render={({ field }) => (
                          <Input
                            placeholder="00000-000"
                            value={field.value}
                            onChange={(e) => handleCepChange(e.target.value)}
                            maxLength={9}
                            disabled={isLoading}
                          />
                        )}
                      />
                      {cepLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="col-span-4 space-y-2">
                    <Label>Logradouro</Label>
                    <Input
                      placeholder="Rua, Avenida..."
                      {...register('logradouro')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <Label>Numero</Label>
                    <Input
                      placeholder="123"
                      {...register('numero')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      placeholder="Apto, Bloco..."
                      {...register('complemento')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-3 space-y-2">
                    <Label>Bairro</Label>
                    <Input
                      placeholder="Bairro"
                      {...register('bairro')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-4 space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      placeholder="Cidade"
                      {...register('cidade')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>UF</Label>
                    <Controller
                      name="uf"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="SP"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={2}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Contato de Emergencia */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Contato de Emergencia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Contato</Label>
                    <Input
                      placeholder="Nome completo"
                      {...register('contatoEmergenciaNome')}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone do Contato</Label>
                    <Controller
                      name="contatoEmergenciaTelefone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="(00) 00000-0000"
                          value={field.value}
                          onChange={(e) => field.onChange(maskPhone(e.target.value))}
                          maxLength={15}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Disponibilidade */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Disponibilidade</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Dias Disponiveis</Label>
                    <Controller
                      name="disponibilidadeDias"
                      control={control}
                      render={({ field }) => (
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex gap-2 justify-start"
                        >
                          {DIAS_SEMANA_CONFIG.map((dia) => (
                            <ToggleGroupItem
                              key={dia.value}
                              value={dia.value}
                              aria-label={dia.nome}
                              title={dia.nome}
                              disabled={isLoading}
                              className={cn(
                                "h-10 w-10 rounded-full p-0 font-semibold text-sm transition-all",
                                "border-2 border-muted-foreground/20",
                                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary",
                                "hover:bg-muted hover:border-muted-foreground/40"
                              )}
                            >
                              {dia.inicial}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Turno</Label>
                    <Controller
                      name="turno"
                      control={control}
                      render={({ field }) => (
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex gap-2 flex-wrap justify-start"
                        >
                          {TURNOS_CONFIG.map((t) => (
                            <ToggleGroupItem
                              key={t.value}
                              value={t.value}
                              aria-label={t.label}
                              disabled={isLoading}
                              className={cn(
                                "h-9 px-4 rounded-full font-medium text-sm transition-all",
                                "border border-muted-foreground/20",
                                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary",
                                "hover:bg-muted hover:border-muted-foreground/40"
                              )}
                            >
                              {t.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ========== ABA 2: FUNCAO E HIERARQUIA ========== */}
            <TabsContent value="hierarquia" className="space-y-4">
              <div className="space-y-2">
                <Label>Funcao *</Label>
                <Controller
                  name="funcao"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger className={errors.funcao ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione a funcao..." />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNCOES.map(func => (
                          <SelectItem key={func.value} value={func.value}>
                            {func.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.funcao && (
                  <p className="text-xs text-destructive">{errors.funcao.message}</p>
                )}
              </div>

              {/* Qualificacao (somente para Colaborador Obra) */}
              {isColaboradorObra && (
                <div className="space-y-2">
                  <Label>Qualificacao *</Label>
                  <Controller
                    name="qualificacao"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a qualificacao..." />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALIFICACOES_OBRA.map(qual => (
                            <SelectItem key={qual.value} value={qual.value}>
                              {qual.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}


              {/* Preenchimento Automatico */}
              {funcaoData && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Preenchimento Automatico</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Setor</p>
                      <Badge variant="secondary">{funcaoData.setor}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nivel</p>
                      <Badge variant="secondary">{funcaoData.nivel}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rateio Fixo (nao editavel)</p>
                    <Badge>{getRateioFixo()}</Badge>
                  </div>
                </div>
              )}

              {/* Alerta de Bloqueio de Acesso */}
              {isColaboradorObra && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Controle de Acesso:</strong> Colaboradores de Obra nao terao acesso ao sistema.
                    {isCreate
                      ? ' Nenhum convite de acesso sera enviado.'
                      : ' Os demais colaboradores podem ter convite reenviado na pagina de detalhes.'}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* ========== ABA 3: CONTRATO E FINANCEIRO ========== */}
            <TabsContent value="financeiro" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Contratacao *</Label>
                  <Controller
                    name="tipoContratacao"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger className={errors.tipoContratacao ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_CONTRATACAO.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipoContratacao && (
                    <p className="text-xs text-destructive">{errors.tipoContratacao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Dia de Vencimento (Folha)</Label>
                  <Controller
                    name="diaVencimento"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Dia 05 (Padrao)</SelectItem>
                          <SelectItem value="10">Dia 10</SelectItem>
                          <SelectItem value="15">Dia 15</SelectItem>
                          <SelectItem value="20">Dia 20</SelectItem>
                          <SelectItem value="25">Dia 25</SelectItem>
                          <SelectItem value="30">Dia 30</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-[0.65rem] text-muted-foreground">
                    Dia referencia para o painel de pagamentos
                  </p>
                </div>
              </div>

              {/* Logica CLT */}
              {isCLT && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Salario Bruto (Folha) *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register('salarioBruto')}
                      className={errors.salarioBruto ? 'border-destructive' : ''}
                      disabled={isLoading}
                    />
                    {errors.salarioBruto && (
                      <p className="text-xs text-destructive">{errors.salarioBruto.message}</p>
                    )}
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Calculos Automaticos (CLT)</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo CLT (+46%)</p>
                        <p className="text-lg font-medium text-primary">
                          {formatCurrency(calcularCustoCLT())}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo Mes</p>
                        <p className="text-lg font-medium">
                          {formatCurrency(calcularCustoMes())}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo Dia (/26)</p>
                        <p className="text-lg font-medium">
                          {formatCurrency(calcularCustoDia())}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Formula: Custo CLT = Salario Bruto x 1,46 | Custo-Dia = Custo Mes / 26 dias uteis
                    </p>
                  </div>
                </div>
              )}

              {/* Logica Contrato */}
              {isContrato && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remuneracao Contratual *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register('remuneracaoContratual')}
                      className={errors.remuneracaoContratual ? 'border-destructive' : ''}
                      disabled={isLoading}
                    />
                    {errors.remuneracaoContratual && (
                      <p className="text-xs text-destructive">{errors.remuneracaoContratual.message}</p>
                    )}
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Calculos Automaticos (Contrato)</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo Mes</p>
                        <p className="text-lg font-medium text-primary">
                          {formatCurrency(calcularCustoMes())}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo Dia (/26)</p>
                        <p className="text-lg font-medium">
                          {formatCurrency(calcularCustoDia())}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Formula: Custo-Dia = Remuneracao Contratual / 26 dias uteis
                    </p>
                  </div>
                </div>
              )}

              {/* Dados Bancarios */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Dados Bancarios</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Controller
                      name="banco"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o banco..." />
                          </SelectTrigger>
                          <SelectContent>
                            {BANCOS.map(b => (
                              <SelectItem key={b.value} value={b.value}>
                                {b.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Agencia</Label>
                    <Input
                      placeholder="0000"
                      {...register('agencia')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      placeholder="00000-0"
                      {...register('conta')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Chave Pix (opcional)</Label>
                    <Input
                      placeholder="CPF, email, telefone ou chave aleatoria"
                      {...register('chavePix')}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {tipoContratacao && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recorrencia Automatica:</strong> Sera gerada uma Fatura Recorrente no modulo Financeiro
                    com o valor de {isCLT ? 'Custo CLT' : 'Remuneracao Contratual'} para este colaborador.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* ========== ABA: DOCUMENTOS ========== */}
            <TabsContent value="documentos" className="space-y-4">
              <div className="bg-muted/50 border rounded-lg p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-base mb-1">Documentos do Colaborador</h4>
                  <p className="text-sm text-muted-foreground">
                    {isCreate ? 'No cadastro, todos os 7 documentos sao obrigatorios.' : 'Atualize os documentos se necessario.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCUMENTOS_OBRIGATORIOS.map((doc) => {
                    const isError = docErrors.includes(doc.value);
                    const hasFile = !!documentosFiles[doc.value];
                    return (
                      <div key={doc.value} className={cn("p-3 border rounded-lg", isError ? "border-destructive bg-destructive/5" : "bg-background")}>
                        <Label className={cn("block mb-2 text-sm font-medium", isError && "text-destructive")}>
                          {doc.label} {isCreate && '*'}
                        </Label>
                        <Input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(doc.value, e.target.files?.[0] || null)}
                          disabled={isLoading}
                        />
                        {hasFile && (
                          <p className="text-xs text-success flex items-center gap-1 mt-2">
                            <CheckCircle2 className="w-3 h-3" /> Arquivo selecionado
                          </p>
                        )}
                        {isError && (
                          <p className="text-xs text-destructive mt-2">Este documento e obrigatorio no cadastro.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ========== ABA 4: ACESSO AO SISTEMA (apenas create, non-obra) ========== */}
            {isCreate && (
              <TabsContent value="acesso" className="space-y-6">
                <div className="bg-muted/50 border rounded-lg p-6 space-y-6">
                  <div>
                    <h4 className="font-medium text-base mb-1">Acesso ao Sistema</h4>
                    <p className="text-sm text-muted-foreground">
                      O colaborador recebera um convite por email para definir sua senha e acessar o sistema.
                    </p>
                  </div>

                  {isColaboradorObra ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Colaboradores de Obra nao possuem acesso ao sistema. Nenhum convite sera enviado.
                      </AlertDescription>
                    </Alert>
                  ) : emailProfissional && emailProfissional.includes('@') ? (
                    <>
                      {/* Preview do email de acesso */}
                      <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-sm font-medium">Email de acesso</Label>
                          <p className="text-sm text-foreground font-mono">{emailProfissional}</p>
                        </div>
                        <Badge className="bg-success/10 text-success border-success/30">Pronto</Badge>
                      </div>

                      <Alert>
                        <ShieldCheck className="h-4 w-4" />
                        <AlertDescription>
                          Ao salvar, um email de convite sera enviado automaticamente para <strong>{emailProfissional}</strong>.
                          O colaborador podera definir sua senha e acessar o sistema.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Email profissional nao preenchido.</strong> Volte para a aba de Identificacao e preencha o campo
                        &quot;Email Profissional&quot; para que o convite de acesso possa ser enviado.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isCreate ? 'Cadastrando...' : 'Salvando...'}
                </>
              ) : (
                isCreate ? 'Cadastrar Colaborador' : 'Salvar Alteracoes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
