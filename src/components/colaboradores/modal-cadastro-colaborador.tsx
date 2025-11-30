import React, { useState, useEffect } from 'react';
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
import { Info, Upload, Calculator } from 'lucide-react';

interface ModalCadastroColaboradorProps {
  open: boolean;
  onClose: () => void;
  colaborador: any | null;
  onSalvar: (dados: any) => void;
}

import { FUNCOES, QUALIFICACOES_OBRA, TIPOS_CONTRATACAO, DIAS_SEMANA } from '@/lib/constants/colaboradores';

export function ModalCadastroColaborador({
  open,
  onClose,
  colaborador,
  onSalvar,
}: ModalCadastroColaboradorProps) {
  const [tabAtual, setTabAtual] = useState('pessoais');

  // Dados Pessoais
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [emailPessoal, setEmailPessoal] = useState('');
  const [emailProfissional, setEmailProfissional] = useState('');
  const [telefonePessoal, setTelefonePessoal] = useState('');
  const [telefoneProfissional, setTelefoneProfissional] = useState('');
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('');
  const [disponibilidadeDias, setDisponibilidadeDias] = useState<string[]>([]);
  const [turno, setTurno] = useState('');

  // Função e Hierarquia
  const [funcao, setFuncao] = useState('');
  const [qualificacao, setQualificacao] = useState('');

  // Dados Financeiros
  const [tipoContratacao, setTipoContratacao] = useState('');
  const [salarioBruto, setSalarioBruto] = useState('');
  const [remuneracaoContratual, setRemuneracaoContratual] = useState('');

  // Calcular dados derivados
  const funcaoData = FUNCOES.find(f => f.value === funcao);
  const isColaboradorObra = funcao === 'COLABORADOR_OBRA';
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

    if (funcaoData.setor === 'administrativo' || funcao.includes('DIRETOR')) {
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

  const handleSalvar = () => {
    if (!nomeCompleto || !cpf || !funcao || !tipoContratacao) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (isCLT && !salarioBruto) {
      alert('Para CLT, o Salário Bruto é obrigatório');
      return;
    }

    if (isContrato && !remuneracaoContratual) {
      alert('Para Contrato, a Remuneração Contratual é obrigatória');
      return;
    }

    onSalvar({
      nomeCompleto,
      cpf,
      dataNascimento,
      enderecoCompleto,
      emailPessoal,
      emailProfissional,
      telefonePessoal,
      telefoneProfissional,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      disponibilidadeDias,
      turno,
      funcao,
      qualificacao,
      setor: funcaoData?.setor,
      gestor: funcaoData?.gestor,
      tipoContratacao,
      salarioBruto: isCLT ? parseFloat(salarioBruto) : null,
      remuneracaoContratual: isContrato ? parseFloat(remuneracaoContratual) : null,
      custoCLT: isCLT ? calcularCustoCLT() : null,
      custoMes: calcularCustoMes(),
      custoDia: calcularCustoDia(),
      rateioFixo: getRateioFixo(),
      bloqueadoSistema: isColaboradorObra,
    });

    // Reset
    handleReset();
  };

  const handleReset = () => {
    setNomeCompleto('');
    setCpf('');
    setDataNascimento('');
    setEnderecoCompleto('');
    setEmailPessoal('');
    setEmailProfissional('');
    setTelefonePessoal('');
    setTelefoneProfissional('');
    setContatoEmergenciaNome('');
    setContatoEmergenciaTelefone('');
    setDisponibilidadeDias([]);
    setTurno('');
    setFuncao('');
    setQualificacao('');
    setTipoContratacao('');
    setSalarioBruto('');
    setRemuneracaoContratual('');
    setTabAtual('pessoais');
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
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador - OS Tipo 10'}
          </DialogTitle>
          <DialogDescription>
            Cadastro completo de colaborador com dados pessoais, hierarquia e informações financeiras
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tabAtual} onValueChange={setTabAtual}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="hierarquia">Função e Hierarquia</TabsTrigger>
            <TabsTrigger value="financeiro">Dados Financeiros</TabsTrigger>
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
                />
              </div>

              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Endereço Completo</Label>
                <Textarea
                  placeholder="Rua, número, complemento, bairro, cidade, UF, CEP"
                  value={enderecoCompleto}
                  onChange={(e) => setEnderecoCompleto(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail Pessoal</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={emailPessoal}
                  onChange={(e) => setEmailPessoal(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail Profissional</Label>
                <Input
                  type="email"
                  placeholder="email@minerva.com"
                  value={emailProfissional}
                  onChange={(e) => setEmailProfissional(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone Pessoal</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefonePessoal}
                  onChange={(e) => setTelefonePessoal(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone Profissional</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefoneProfissional}
                  onChange={(e) => setTelefoneProfissional(e.target.value)}
                />
              </div>
            </div>

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
                    onChange={(e) => setContatoEmergenciaTelefone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Disponibilidade</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dias Disponíveis</Label>
                  <div className="flex gap-2">
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
                  <Label>Turno</Label>
                  <Select value={turno} onValueChange={setTurno}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANHA">Manhã</SelectItem>
                      <SelectItem value="TARDE">Tarde</SelectItem>
                      <SelectItem value="NOITE">Noite</SelectItem>
                      <SelectItem value="INTEGRAL">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: FUNÇÃO E HIERARQUIA */}
          <TabsContent value="hierarquia" className="space-y-4">
            <div className="space-y-2">
              <Label>Função (Lista Fixa) *</Label>
              <Select value={funcao} onValueChange={setFuncao}>
                <SelectTrigger>
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

            {/* Preenchimento Automático */}
            {funcaoData && (
              <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Preenchimento Automático</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Setor</p>
                    <Badge variant="secondary">{funcaoData.setor}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Gestor</p>
                    <Badge variant="secondary">
                      {funcaoData.gestor ? FUNCOES.find(f => f.value === funcaoData.gestor)?.label.split(' - ')[1] : 'Nenhum'}
                    </Badge>
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
                  Os demais colaboradores receberão senha automática por e-mail.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* ABA 3: DADOS FINANCEIROS */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Contratação *</Label>
              <Select value={tipoContratacao} onValueChange={setTipoContratacao}>
                <SelectTrigger>
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
                  />
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
                  />
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
