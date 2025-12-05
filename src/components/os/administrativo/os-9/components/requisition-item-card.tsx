import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { ItemRequisicao, ItemTipo, ItemSubTipo } from '@/lib/types';
import { TIPOS_ITEM, SUB_TIPOS_ITEM, UNIDADES_MEDIDA } from '@/lib/types';

interface RequisitionItemCardProps {
  item: Partial<ItemRequisicao>;
  index: number;
  onChange: (updates: Partial<ItemRequisicao>) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

/**
 * RequisitionItemCard - Card para um item de requisição de compra
 *
 * Componente que renderiza um card com campos necessários para
 * cadastrar um item de requisição (Material, Ferramenta, Equipamento, etc.)
 *
 * Features:
 * - Sub-tipo condicional (apenas para Ferramenta/Equipamento)
 * - Formatação monetária automática
 * - Cálculo de valor total
 * - Validações inline
 * - Campo de observações por item
 *
 * @example
 * ```tsx
 * <RequisitionItemCard
 *   item={item}
 *   index={0}
 *   onChange={(updates) => updateItem(0, updates)}
 *   onRemove={() => removeItem(0)}
 *   readOnly={false}
 * />
 * ```
 */
export function RequisitionItemCard({
  item,
  index,
  onChange,
  onRemove,
  readOnly = false
}: RequisitionItemCardProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Formatar moeda (BRL)
  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Parse moeda para número
  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseFloat(numbers) / 100;
  };

  const handleInputChange = (field: keyof ItemRequisicao, value: any) => {
    if (readOnly) return;
    onChange({ [field]: value });
  };

  const handleCurrencyChange = (field: keyof ItemRequisicao, value: string) => {
    if (readOnly) return;
    const formatted = formatCurrency(value);
    onChange({ [field]: parseCurrency(value) });
  };

  const handleTipoChange = (tipo: ItemTipo) => {
    if (readOnly) return;

    // Se mudar para tipo que não é Ferramenta/Equipamento, limpar sub_tipo
    if (tipo !== 'Ferramenta' && tipo !== 'Equipamento') {
      onChange({ tipo, sub_tipo: undefined });
    } else {
      onChange({ tipo });
    }
  };

  // Verificar se deve mostrar sub-tipo
  const showSubTipo = item.tipo === 'Ferramenta' || item.tipo === 'Equipamento';

  // Calcular valor total
  const valorTotal = (item.quantidade || 0) * (item.preco_unitario || 0);

  // Validações
  const errors: Record<string, string> = {};
  if (touched.tipo && !item.tipo) errors.tipo = 'Campo obrigatório';
  if (touched.sub_tipo && showSubTipo && !item.sub_tipo) errors.sub_tipo = 'Campo obrigatório';
  if (touched.descricao && !item.descricao) errors.descricao = 'Campo obrigatório';
  if (touched.quantidade && (!item.quantidade || item.quantidade <= 0)) errors.quantidade = 'Quantidade inválida';
  if (touched.unidade_medida && !item.unidade_medida) errors.unidade_medida = 'Campo obrigatório';
  if (touched.preco_unitario && (!item.preco_unitario || item.preco_unitario < 0)) errors.preco_unitario = 'Preço inválido';

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-sm">
              Item #{index + 1}
            </Badge>
            <CardTitle className="text-base">
              {item.tipo ? `${item.tipo}${item.sub_tipo ? ` - ${item.sub_tipo}` : ''}` : 'Novo Item'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {valorTotal > 0 && (
              <Badge className="bg-primary">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={readOnly}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo e Sub-tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`tipo-${index}`}>
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={item.tipo}
              onValueChange={(value) => handleTipoChange(value as ItemTipo)}
              disabled={readOnly}
            >
              <SelectTrigger id={`tipo-${index}`} className={errors.tipo ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_ITEM.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-destructive">{errors.tipo}</p>}
          </div>

          {showSubTipo && (
            <div className="space-y-2">
              <Label htmlFor={`subTipo-${index}`}>
                Sub-tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={item.sub_tipo}
                onValueChange={(value) => handleInputChange('sub_tipo', value as ItemSubTipo)}
                disabled={readOnly}
              >
                <SelectTrigger id={`subTipo-${index}`} className={errors.sub_tipo ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SUB_TIPOS_ITEM.map((subTipo) => (
                    <SelectItem key={subTipo.value} value={subTipo.value}>
                      {subTipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sub_tipo && <p className="text-xs text-destructive">{errors.sub_tipo}</p>}
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor={`descricao-${index}`}>
            Descrição <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`descricao-${index}`}
            value={item.descricao || ''}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            onBlur={() => setTouched({ ...touched, descricao: true })}
            placeholder="Descreva detalhadamente o item"
            rows={2}
            disabled={readOnly}
            className={errors.descricao ? 'border-destructive' : ''}
          />
          {errors.descricao && <p className="text-xs text-destructive">{errors.descricao}</p>}
        </div>

        {/* Quantidade, Unidade e Preço */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`quantidade-${index}`}>
              Quantidade <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`quantidade-${index}`}
              type="number"
              min="0"
              step="0.01"
              value={item.quantidade || ''}
              onChange={(e) => handleInputChange('quantidade', parseFloat(e.target.value) || 0)}
              onBlur={() => setTouched({ ...touched, quantidade: true })}
              placeholder="0"
              disabled={readOnly}
              className={errors.quantidade ? 'border-destructive' : ''}
            />
            {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`unidade-${index}`}>
              Unidade <span className="text-destructive">*</span>
            </Label>
            <Select
              value={item.unidade_medida}
              onValueChange={(value) => handleInputChange('unidade_medida', value)}
              disabled={readOnly}
            >
              <SelectTrigger id={`unidade-${index}`} className={errors.unidade_medida ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES_MEDIDA.map((unidade) => (
                  <SelectItem key={unidade.value} value={unidade.value}>
                    {unidade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unidade_medida && <p className="text-xs text-destructive">{errors.unidade_medida}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`preco-${index}`}>
              Preço Unitário <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id={`preco-${index}`}
                type="text"
                value={item.preco_unitario ? formatCurrency(String(item.preco_unitario * 100)) : ''}
                onChange={(e) => handleCurrencyChange('preco_unitario', e.target.value)}
                onBlur={() => setTouched({ ...touched, preco_unitario: true })}
                placeholder="0,00"
                disabled={readOnly}
                className={`pl-9 ${errors.preco_unitario ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.preco_unitario && <p className="text-xs text-destructive">{errors.preco_unitario}</p>}
          </div>
        </div>

        {/* Link do Produto */}
        <div className="space-y-2">
          <Label htmlFor={`link-${index}`}>Link do Produto (opcional)</Label>
          <Input
            id={`link-${index}`}
            type="url"
            value={item.link_produto || ''}
            onChange={(e) => handleInputChange('link_produto', e.target.value)}
            placeholder="https://exemplo.com/produto"
            disabled={readOnly}
          />
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor={`observacao-${index}`}>Observações</Label>
          <Textarea
            id={`observacao-${index}`}
            value={item.observacao || ''}
            onChange={(e) => handleInputChange('observacao', e.target.value)}
            placeholder="Informações adicionais sobre este item"
            rows={3}
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
