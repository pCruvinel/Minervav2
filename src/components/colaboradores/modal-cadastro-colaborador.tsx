import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Info, Calculator, Loader2, MapPin, ChevronsUpDown, Check, FileText, Building2 } from 'lucide-react';
import { Colaborador } from '@/types/colaborador';
import { FUNCOES, QUALIFICACOES_OBRA, TIPOS_CONTRATACAO, DIAS_SEMANA, DOCUMENTOS_OBRIGATORIOS, BANCOS } from '@/lib/constants/colaboradores';
import { useViaCEP } from '@/lib/hooks/use-viacep';
import { cn } from '@/lib/utils';

interface ModalCadastroColaboradorProps {
  open: boolean;
  onClose: () => void;
  colaborador: Colaborador | null;
  onSalvar: (dados: any) => void;
}

// Schema Zod para validação
const colaboradorSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  emailPessoal: z.string().email('Email inválido').optional().or(z.literal('')),
  emailProfissional: z.string().email('Email inválido').optional().or(z.literal('')),
});

// Helper para máscaras
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

export function ModalCadastroColaborador({
  open,
  onClose,
  colaborador,
  onSalvar,
}: ModalCadastroColaboradorProps) {
  const [tabAtual, setTabAtual] = useState('pessoais');
  const { fetchCEP, loading: cepLoading } = useViaCEP();

  // Dados Pessoais
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [emailPessoal, setEmailPessoal] = useState('');
  const [emailProfissional, setEmailProfissional] = useState('');
  const [telefonePessoal, setTelefonePessoal] = useState('');
  const [telefoneProfissional, setTelefoneProfissional] = useState('');
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('');
  const [disponibilidadeDias, setDisponibilidadeDias] = useState<string[]>([]);
  const [turno, setTurno] = useState<string[]>([]);

  // Endereço (campos separados para ViaCEP)
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  // Função e Hierarquia
  const [funcao, setFuncao] = useState('');
  const [qualificacao, setQualificacao] = useState('');
  const [documentosObrigatorios, setDocumentosObrigatorios] = useState<string[]>([]);
  const [documentosPopoverOpen, setDocumentosPopoverOpen] = useState(false);

  // Dados Financeiros
  const [tipoContratacao, setTipoContratacao] = useState('');
  const [salarioBruto, setSalarioBruto] = useState('');
  const [remuneracaoContratual, setRemuneracaoContratual] = useState('');

  // Dados Bancários
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [chavePix, setChavePix] = useState('');

  // Validação de erros
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher dados ao editar
  useEffect(() => {
    if (colaborador) {
      setNomeCompleto(colaborador.nome_completo || colaborador.nome || '');
      setCpf(colaborador.cpf || '');
      setDataNascimento(colaborador.data_nascimento ? new Date(colaborador.data_nascimento).toISOString().split('T')[0] : '');
      setEmailPessoal(colaborador.email_pessoal || '');
      setEmailProfissional(colaborador.email_profissional || colaborador.email || '');
      setTelefonePessoal(colaborador.telefone_pessoal || '');
      setTelefoneProfissional(colaborador.telefone_profissional || colaborador.telefone || '');
      setContatoEmergenciaNome(colaborador.contato_emergencia_nome || '');
      setContatoEmergenciaTelefone(colaborador.contato_emergencia_telefone || '');
      setDisponibilidadeDias(colaborador.disponibilidade_dias || []);
      setTurno(colaborador.turno || []);
      setFuncao(colaborador.funcao || '');
      setQualificacao(colaborador.qualificacao || '');
      setTipoContratacao(colaborador.tipo_contratacao || '');
      setSalarioBruto(colaborador.salario_base?.toString() || '');
      setRemuneracaoContratual(colaborador.remuneracao_contratual?.toString() || '');

      // Parse endereço se existir
      if (colaborador.endereco) {
        // Tenta extrair campos do endereço
        setLogradouro(colaborador.endereco);
      }
    } else {
      handleReset();
    }
  }, [colaborador, open]);

  // Buscar CEP automaticamente ao digitar 8 dígitos
  const handleCepChange = async (value: string) => {
    const maskedCep = maskCEP(value);
    setCep(maskedCep);

    const cleanCep = maskedCep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const endereco = await fetchCEP(cleanCep);
      if (endereco) {
        setLogradouro(endereco.logradouro || '');
        setBairro(endereco.bairro || '');
        setCidade(endereco.localidade || '');
        setUf(endereco.uf || '');
      }
    }
  };

  // Calcular dados derivados
  const funcaoData = FUNCOES.find(f => f.value === funcao);
  const isColaboradorObra = funcao === 'colaborador_obra';
  const isCLT = tipoContratacao === 'CLT';
  const isContrato = tipoContratacao === 'CONTRATO';

  // Cálculos financeiros
  const calcularCustoCLT = () => {
    const salario = parseFloat(salarioBruto) || 0;
    return salario * 1.46; // +46% de encargos
  };

  const calcularCustoMes = () => {
    if (isCLT) {
      return calcularCustoCLT();
    } else if (isContrato) {
      return parseFloat(remuneracaoContratual) || 0;
    }
    return 0;
  };

  const calcularCustoDia = () => {
    return calcularCustoMes() / 26;
  };

  const getRateioFixo = () => {
    if (!funcaoData) return '';

    if (funcaoData.setor === 'administrativo' || funcao.includes('diretor')) {
      return 'Escritório';
    } else if (funcaoData.setor === 'obras') {
      return 'Setor Obras';
    } else if (funcaoData.setor === 'assessoria') {
      return 'Setor Assessoria Técnica';
    }
    return funcaoData.setor;
  };

  const handleDiaToggle = (dia: string) => {
    setDisponibilidadeDias(prev =>
      prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const handleTurnoToggle = (t: string) => {
    setTurno(prev =>
      prev.includes(t)
        ? prev.filter(item => item !== t)
        : [...prev, t]
    );
  };

  const handleDocumentoToggle = (doc: string) => {
    setDocumentosObrigatorios(prev =>
      prev.includes(doc)
        ? prev.filter(d => d !== doc)
        : [...prev, doc]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nomeCompleto || nomeCompleto.length < 3) {
      newErrors.nomeCompleto = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!cpf || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (emailPessoal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPessoal)) {
      newErrors.emailPessoal = 'Email pessoal inválido';
    }

    if (emailProfissional && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailProfissional)) {
      newErrors.emailProfissional = 'Email profissional inválido';
    }

    if (!funcao) {
      newErrors.funcao = 'Selecione uma função';
    }

    if (!tipoContratacao) {
      newErrors.tipoContratacao = 'Selecione o tipo de contratação';
    }

    if (isCLT && !salarioBruto) {
      newErrors.salarioBruto = 'Salário bruto é obrigatório para CLT';
    }

    if (isContrato && !remuneracaoContratual) {
      newErrors.remuneracaoContratual = 'Remuneração contratual é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = () => {
    if (!validateForm()) {
      // Mostrar primeira aba com erro
      if (errors.nomeCompleto || errors.cpf || errors.emailPessoal || errors.emailProfissional) {
        setTabAtual('pessoais');
      } else if (errors.funcao) {
        setTabAtual('hierarquia');
      } else {
        setTabAtual('financeiro');
      }
      return;
    }

    // Montar endereço completo
    const enderecoCompleto = [
      logradouro,
      numero ? `nº ${numero}` : '',
      complemento,
      bairro,
      cidade,
      uf,
      cep ? `CEP: ${cep}` : ''
    ].filter(Boolean).join(', ');

    onSalvar({
      nome_completo: nomeCompleto,
      cpf,
      data_nascimento: dataNascimento || null,
      endereco: enderecoCompleto,
      cep: cep.replace(/\D/g, ''),
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      email_pessoal: emailPessoal,
      email_profissional: emailProfissional,
      telefone_pessoal: telefonePessoal,
      telefone_profissional: telefoneProfissional,
      contato_emergencia_nome: contatoEmergenciaNome,
      contato_emergencia_telefone: contatoEmergenciaTelefone,
      disponibilidade_dias: disponibilidadeDias,
      turno,
      funcao,
      qualificacao,
      documentos_obrigatorios: documentosObrigatorios,
      setor: funcaoData?.setor,
      gestor: funcaoData?.gestor,
      tipo_contratacao: tipoContratacao,
      salario_base: isCLT ? parseFloat(salarioBruto) : null,
      remuneracao_contratual: isContrato ? parseFloat(remuneracaoContratual) : null,
      custo_dia: calcularCustoDia(),
      rateio_fixo: getRateioFixo(),
      bloqueado_sistema: isColaboradorObra,
      // Dados bancários
      banco,
      agencia,
      conta,
      chave_pix: chavePix,
    });

    // Reset
    handleReset();
  };

  const handleReset = () => {
    setNomeCompleto('');
    setCpf('');
    setDataNascimento('');
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setUf('');
    setEmailPessoal('');
    setEmailProfissional('');
    setTelefonePessoal('');
    setTelefoneProfissional('');
    setContatoEmergenciaNome('');
    setContatoEmergenciaTelefone('');
    setDisponibilidadeDias([]);
    setTurno([]);
    setFuncao('');
    setQualificacao('');
    setDocumentosObrigatorios([]);
    setTipoContratacao('');
    setSalarioBruto('');
    setRemuneracaoContratual('');
    setBanco('');
    setAgencia('');
    setConta('');
    setChavePix('');
    setTabAtual('pessoais');
    setErrors({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            Cadastro completo de colaborador com dados pessoais, hierarquia e informações financeiras
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tabAtual} onValueChange={setTabAtual}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoais" className="relative">
              Dados Pessoais
              {(errors.nomeCompleto || errors.cpf || errors.emailPessoal || errors.emailProfissional) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="hierarquia" className="relative">
              Funções e Hierarquia
              {errors.funcao && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="relative">
              Dados Financeiros
              {(errors.tipoContratacao || errors.salarioBruto || errors.remuneracaoContratual) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: DADOS PESSOAIS */}
          <TabsContent value="pessoais" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Digite o nome completo..."
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={errors.nomeCompleto ? 'border-destructive' : ''}
                />
                {errors.nomeCompleto && (
                  <p className="text-xs text-destructive">{errors.nomeCompleto}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  maxLength={14}
                  className={errors.cpf ? 'border-destructive' : ''}
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive">{errors.cpf}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail Pessoal</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={emailPessoal}
                  onChange={(e) => setEmailPessoal(e.target.value)}
                  className={errors.emailPessoal ? 'border-destructive' : ''}
                />
                {errors.emailPessoal && (
                  <p className="text-xs text-destructive">{errors.emailPessoal}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>E-mail Profissional</Label>
                <Input
                  type="email"
                  placeholder="email@minerva.com"
                  value={emailProfissional}
                  onChange={(e) => setEmailProfissional(e.target.value)}
                  className={errors.emailProfissional ? 'border-destructive' : ''}
                />
                {errors.emailProfissional && (
                  <p className="text-xs text-destructive">{errors.emailProfissional}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Telefone Pessoal</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefonePessoal}
                  onChange={(e) => setTelefonePessoal(maskPhone(e.target.value))}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone Profissional</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefoneProfissional}
                  onChange={(e) => setTelefoneProfissional(maskPhone(e.target.value))}
                  maxLength={15}
                />
              </div>
            </div>

            {/* Endereço com ViaCEP */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Endereço</h4>
              </div>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>CEP</Label>
                  <div className="relative">
                    <Input
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
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
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="123"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Apto, Bloco..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>

                <div className="col-span-3 space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>

                <div className="col-span-4 space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>UF</Label>
                  <Input
                    placeholder="SP"
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Contato de Emergência</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Contato</Label>
                  <Input
                    placeholder="Nome completo"
                    value={contatoEmergenciaNome}
                    onChange={(e) => setContatoEmergenciaNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone do Contato</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={contatoEmergenciaTelefone}
                    onChange={(e) => setContatoEmergenciaTelefone(maskPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Disponibilidade */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Disponibilidade</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dias Disponíveis</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS_SEMANA.map(dia => (
                      <div key={dia} className="flex items-center">
                        <Checkbox
                          id={dia}
                          checked={disponibilidadeDias.includes(dia)}
                          onCheckedChange={() => handleDiaToggle(dia)}
                        />
                        <label htmlFor={dia} className="ml-2 text-sm cursor-pointer">
                          {dia}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Turno (Multi-seleção)</Label>
                  <div className="flex gap-4 flex-wrap">
                    {['MANHA', 'TARDE', 'NOITE', 'INTEGRAL'].map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <Checkbox
                          id={`turno-${t}`}
                          checked={turno.includes(t)}
                          onCheckedChange={() => handleTurnoToggle(t)}
                        />
                        <label
                          htmlFor={`turno-${t}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t.charAt(0) + t.slice(1).toLowerCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: FUNÇÃO E HIERARQUIA */}
          <TabsContent value="hierarquia" className="space-y-4">
            <div className="space-y-2">
              <Label>Função *</Label>
              <Select value={funcao} onValueChange={setFuncao}>
                <SelectTrigger className={errors.funcao ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a função..." />
                </SelectTrigger>
                <SelectContent>
                  {FUNCOES.map(func => (
                    <SelectItem key={func.value} value={func.value}>
                      {func.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funcao && (
                <p className="text-xs text-destructive">{errors.funcao}</p>
              )}
            </div>

            {/* Qualificação (somente para Colaborador Obra) */}
            {isColaboradorObra && (
              <div className="space-y-2">
                <Label>Qualificação *</Label>
                <Select value={qualificacao} onValueChange={setQualificacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a qualificação..." />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICACOES_OBRA.map(qual => (
                      <SelectItem key={qual.value} value={qual.value}>
                        {qual.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Multi-Select Documentos Obrigatórios */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos Obrigatórios
              </Label>
              <Popover open={documentosPopoverOpen} onOpenChange={setDocumentosPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={documentosPopoverOpen}
                    className="w-full justify-between"
                  >
                    {documentosObrigatorios.length > 0
                      ? `${documentosObrigatorios.length} documento(s) selecionado(s)`
                      : "Selecione os documentos..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar documento..." />
                    <CommandList>
                      <CommandEmpty>Nenhum documento encontrado.</CommandEmpty>
                      <CommandGroup>
                        {DOCUMENTOS_OBRIGATORIOS.map((doc) => (
                          <CommandItem
                            key={doc.value}
                            value={doc.value}
                            onSelect={() => handleDocumentoToggle(doc.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                documentosObrigatorios.includes(doc.value) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {doc.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {documentosObrigatorios.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {documentosObrigatorios.map(doc => {
                    const docInfo = DOCUMENTOS_OBRIGATORIOS.find(d => d.value === doc);
                    return (
                      <Badge key={doc} variant="secondary" className="text-xs">
                        {docInfo?.label || doc}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preenchimento Automático */}
            {funcaoData && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Preenchimento Automático</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Setor</p>
                    <Badge variant="secondary">{funcaoData.setor}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nível</p>
                    <Badge variant="secondary">{funcaoData.nivel}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rateio Fixo (não editável)</p>
                  <Badge>{getRateioFixo()}</Badge>
                </div>
              </div>
            )}

            {/* Alerta de Bloqueio de Acesso */}
            {isColaboradorObra && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Controle de Acesso:</strong> Colaboradores de Obra não terão acesso ao sistema.
                  Os demais colaboradores receberão convite por e-mail para definir senha.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* ABA 3: DADOS FINANCEIROS */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Contratação *</Label>
              <Select value={tipoContratacao} onValueChange={setTipoContratacao}>
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
              {errors.tipoContratacao && (
                <p className="text-xs text-destructive">{errors.tipoContratacao}</p>
              )}
            </div>

            {/* Lógica CLT */}
            {isCLT && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Salário Bruto (Folha) *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={salarioBruto}
                    onChange={(e) => setSalarioBruto(e.target.value)}
                    className={errors.salarioBruto ? 'border-destructive' : ''}
                  />
                  {errors.salarioBruto && (
                    <p className="text-xs text-destructive">{errors.salarioBruto}</p>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Cálculos Automáticos (CLT)</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Custo CLT (+46%)</p>
                      <p className="text-lg font-medium text-primary">
                        {formatCurrency(calcularCustoCLT())}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Custo Mês</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(calcularCustoMes())}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Custo Dia (÷26)</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(calcularCustoDia())}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    📌 Fórmula: Custo CLT = Salário Bruto × 1,46 | Custo-Dia = Custo Mês ÷ 26 dias úteis
                  </p>
                </div>
              </div>
            )}

            {/* Lógica Contrato */}
            {isContrato && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Remuneração Contratual *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={remuneracaoContratual}
                    onChange={(e) => setRemuneracaoContratual(e.target.value)}
                    className={errors.remuneracaoContratual ? 'border-destructive' : ''}
                  />
                  {errors.remuneracaoContratual && (
                    <p className="text-xs text-destructive">{errors.remuneracaoContratual}</p>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Cálculos Automáticos (Contrato)</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Custo Mês</p>
                      <p className="text-lg font-medium text-primary">
                        {formatCurrency(calcularCustoMes())}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Custo Dia (÷26)</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(calcularCustoDia())}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    📌 Fórmula: Custo-Dia = Remuneração Contratual ÷ 26 dias úteis
                  </p>
                </div>
              </div>
            )}

            {/* Dados Bancários */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Dados Bancários</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select value={banco} onValueChange={setBanco}>
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
                </div>

                <div className="space-y-2">
                  <Label>Agência</Label>
                  <Input
                    placeholder="0000"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conta</Label>
                  <Input
                    placeholder="00000-0"
                    value={conta}
                    onChange={(e) => setConta(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chave Pix (opcional)</Label>
                  <Input
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {tipoContratacao && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recorrência Automática:</strong> Será gerada uma Fatura Recorrente no módulo Financeiro
                  com o valor de {isCLT ? 'Custo CLT' : 'Remuneração Contratual'} para este colaborador.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Colaborador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
