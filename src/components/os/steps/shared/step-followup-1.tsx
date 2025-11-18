import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Separator } from '../../../ui/separator';
import { AlertCircle, Upload } from 'lucide-react';

interface StepFollowup1Props {
  data: {
    idadeEdificacao: string;
    motivoProcura: string;
    quandoAconteceu: string;
    oqueFeitoARespeito: string;
    existeEscopo: string;
    previsaoOrcamentaria: string;
    grauUrgencia: string;
    apresentacaoProposta: string;
    nomeContatoLocal: string;
    telefoneContatoLocal: string;
    cargoContatoLocal: string;
  };
  onDataChange: (data: any) => void;
}

export function StepFollowup1({ data, onDataChange }: StepFollowup1Props) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Realize a entrevista inicial com o lead/cliente para levantar informações sobre o projeto.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idadeEdificacao">
            1. Qual a idade da edificação? <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.idadeEdificacao} 
            onValueChange={(value) => onDataChange({ ...data, idadeEdificacao: value })}
          >
            <SelectTrigger id="idadeEdificacao">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ainda não foi entregue">Ainda não foi entregue</SelectItem>
              <SelectItem value="0 a 3 anos">0 a 3 anos</SelectItem>
              <SelectItem value="3 a 5 anos">3 a 5 anos</SelectItem>
              <SelectItem value="5 a 10 anos">5 a 10 anos</SelectItem>
              <SelectItem value="10 a 20 anos">10 a 20 anos</SelectItem>
              <SelectItem value="Acima de 20 anos">Acima de 20 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivoProcura">
            2. Qual o motivo fez você nos procurar? Quais problemas existentes? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="motivoProcura"
            rows={4}
            value={data.motivoProcura}
            onChange={(e) => onDataChange({ ...data, motivoProcura: e.target.value })}
            placeholder="Descreva os problemas e motivações..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quandoAconteceu">
            3. Quando aconteceu? Há quanto tempo vem acontecendo? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="quandoAconteceu"
            rows={3}
            value={data.quandoAconteceu}
            onChange={(e) => onDataChange({ ...data, quandoAconteceu: e.target.value })}
            placeholder="Descreva o histórico do problema..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="oqueFeitoARespeito">
            4. O que já foi feito a respeito disso?
          </Label>
          <Textarea
            id="oqueFeitoARespeito"
            rows={3}
            value={data.oqueFeitoARespeito}
            onChange={(e) => onDataChange({ ...data, oqueFeitoARespeito: e.target.value })}
            placeholder="Descreva as ações já realizadas..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="existeEscopo">
            5. Existe um escopo de serviços ou laudo com diagnóstico do problema?
          </Label>
          <Textarea
            id="existeEscopo"
            rows={2}
            value={data.existeEscopo}
            onChange={(e) => onDataChange({ ...data, existeEscopo: e.target.value })}
            placeholder="Sim/Não e detalhes..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previsaoOrcamentaria">
            6. Existe previsão orçamentária para este serviço? Ou você precisa de parâmetro para taxa extra?
          </Label>
          <Textarea
            id="previsaoOrcamentaria"
            rows={2}
            value={data.previsaoOrcamentaria}
            onChange={(e) => onDataChange({ ...data, previsaoOrcamentaria: e.target.value })}
            placeholder="Informe o orçamento disponível..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grauUrgencia">
            7. Qual o grau de urgência para executar esse serviço? <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.grauUrgencia} 
            onValueChange={(value) => onDataChange({ ...data, grauUrgencia: value })}
          >
            <SelectTrigger id="grauUrgencia">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 dias">30 dias</SelectItem>
              <SelectItem value="3 meses">3 meses</SelectItem>
              <SelectItem value="6 meses ou mais">6 meses ou mais</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apresentacaoProposta">
            8. Nossas propostas são apresentadas, nós não enviamos orçamento. Você concorda? Deseja que faça o orçamento? Se sim, qual dia e horário sugeridos para apresentação da proposta comercial dessa visita técnica? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="apresentacaoProposta"
            rows={3}
            value={data.apresentacaoProposta}
            onChange={(e) => onDataChange({ ...data, apresentacaoProposta: e.target.value })}
            placeholder="Resposta do cliente..."
          />
        </div>

        <Separator />

        <h3 className="text-sm font-medium">Dados do Contato no Local</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nomeContatoLocal">
              9. Nome (Contato no Local) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomeContatoLocal"
              value={data.nomeContatoLocal}
              onChange={(e) => onDataChange({ ...data, nomeContatoLocal: e.target.value })}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefoneContatoLocal">
              10. Contato (Telefone) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefoneContatoLocal"
              value={data.telefoneContatoLocal}
              onChange={(e) => onDataChange({ ...data, telefoneContatoLocal: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="cargoContatoLocal">
              11. Cargo (Contato no Local)
            </Label>
            <Input
              id="cargoContatoLocal"
              value={data.cargoContatoLocal}
              onChange={(e) => onDataChange({ ...data, cargoContatoLocal: e.target.value })}
              placeholder="Ex: Síndico, Zelador, Gerente..."
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Anexar Arquivos (escopo, laudo, fotos)</Label>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, JPG, PNG - Máx. 10MB por arquivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
