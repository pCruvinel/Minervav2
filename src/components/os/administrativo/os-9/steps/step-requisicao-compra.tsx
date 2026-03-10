import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Package, Loader2, Trash2 } from 'lucide-react';
import { FormMaskedInput } from '@/components/ui/form-masked-input';
import { RequisitionItemCard } from '../components';
import { CentroCustoSelector } from '@/components/shared/centro-custo-selector';
import { useRequisitionItems, useCreateRequisitionItem, useDeleteRequisitionItem } from '@/lib/hooks/use-requisition-items';
import { useViaCEP } from '@/lib/hooks/use-viacep';
import type { ItemRequisicao, DadosRequisicaoOS } from '@/lib/types';
import { PRAZOS_NECESSIDADE } from '@/lib/types';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

interface StepRequisicaoCompraProps {
  data: Record<string, any>;
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  etapaId?: string;
  osId?: string;
  /** Ref para expor função de salvar itens locais antes de avançar */
  saveItemsRef?: React.MutableRefObject<(() => Promise<void>) | undefined>;
  /** Função para criar OS (usada quando o usuário tenta salvar item antes da OS existir) */
  onCreateOS?: () => Promise<string | null>;
}

/**
 * StepRequisicaoCompra - Etapa 1 da OS-09 (Requisição de Compra)
 *
 * Permite gerenciar requisição de compra com dados em nível de OS
 * (endereço de entrega e prazo) e múltiplos itens.
 *
 * Features:
 * - Dados de OS: Endereço de Entrega (ViaCEP) + Prazo de Necessidade
 * - Array dinâmico de itens (Material, Ferramenta, Equipamento, Logística, Documentação)
 * - Integração com useRequisitionItems (CRUD no Supabase)
 * - Cálculo de valor total da requisição
 * - Empty state quando sem itens
 * - Modo readOnly para navegação histórica
 *
 * @example
 * ```tsx
 * <StepRequisicaoCompra
 *   data={etapa1Data}
 *   onDataChange={setEtapa1Data}
 *   etapaId={etapaId}
 *   readOnly={false}
 * />
 * ```
 */
export function StepRequisicaoCompra({
  data,
  onDataChange,
  readOnly,
  etapaId,
  osId,
  saveItemsRef,
  onCreateOS
}: StepRequisicaoCompraProps) {
  // Estado local para dados da OS (endereço + prazo)
  const [dadosOS, setDadosOS] = useState<Partial<DadosRequisicaoOS>>({
    centro_custo_id: data.centro_custo_id || undefined,
    prazo_necessidade: data.prazo_necessidade || undefined,
    local_entrega: data.local_entrega || undefined,
    cep: data.cep || '',
    logradouro: data.logradouro || '',
    numero: data.numero || '',
    complemento: data.complemento || '',
    bairro: data.bairro || '',
    cidade: data.cidade || '',
    uf: data.uf || ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Estado local para itens (enquanto edita, antes de salvar no banco)
  // Estado local para itens (enquanto edita, antes de salvar no banco)
  // Inicializa com itens preservados no pai (se houver) para resistir à remontagem
  const [localItems, setLocalItems] = useState<Partial<ItemRequisicao>[]>(() => data.itens || []);

  // Hooks de integração com Supabase e ViaCEP
  const { items: savedItems, loading, refetch } = useRequisitionItems(etapaId);
  const { mutate: createItem, loading: creating } = useCreateRequisitionItem();
  const { mutate: deleteItem, loading: deleting } = useDeleteRequisitionItem();
  const { fetchCEP, loading: cepLoading } = useViaCEP();

  // Combinar itens salvos + itens locais (novos)
  const allItems = [...savedItems, ...localItems];

  const handleAddItem = () => {
    if (readOnly) return;

    const newItem: Partial<ItemRequisicao> = {
      tipo: undefined,
      sub_tipo: undefined,
      descricao: '',
      quantidade: 0,
      unidade_medida: undefined,
      preco_unitario: 0,
      link_produto: '',
      observacao: ''
    };

    setLocalItems([...localItems, newItem]);
  };

  const handleUpdateLocalItem = (index: number, updates: Partial<ItemRequisicao>) => {
    if (readOnly) return;

    const adjustedIndex = index - savedItems.length;
    if (adjustedIndex < 0) return; // Item salvo, não local

    const updatedLocalItems = [...localItems];
    updatedLocalItems[adjustedIndex] = { ...updatedLocalItems[adjustedIndex], ...updates };
    setLocalItems(updatedLocalItems);
  };

  const handleRemoveLocalItem = async (index: number) => {
    if (readOnly) return;

    const adjustedIndex = index - savedItems.length;
    if (adjustedIndex < 0) {
      // Item salvo no banco - deletar via API
      const itemToDelete = savedItems[index];
      if (itemToDelete.id) {
        try {
          await deleteItem(itemToDelete.id);
          logger.log(`✅ Item ${itemToDelete.id} deletado com sucesso`);
          await refetch();
        } catch (error) {
          logger.error('Erro ao deletar item:', error);
        }
      }
    } else {
      // Item local - remover do array
      const updatedLocalItems = localItems.filter((_, i) => i !== adjustedIndex);
      setLocalItems(updatedLocalItems);
    }
  };

  const handleSaveLocalItems = async () => {
    if (readOnly) return;

    // Se não tiver etapaId (OS não criada) e tivermos a função de criar, usamos ela
    if (!etapaId && onCreateOS) {
      try {
        logger.log('Creating OS from Step 1...');
        // ✅ FIX: Limpar itens locais ANTES de criar a OS
        // Os itens foram copiados para o pai e serão salvos em createOSWithCC
        setLocalItems([]);

        const newOsId = await onCreateOS();
        if (!newOsId) {
          // Se falhou, restaurar os itens locais (foram limpos mas salvos no pai)
          setLocalItems(data.itens || []);
          return;
        }
        // O componente será remontado ou atualizado com o novo etapaId
        // Os itens já foram salvos no banco dentro de createOSWithCC
        return;
      } catch (error) {
        logger.error('Error auto-creating OS:', error);
        // Restaurar itens locais em caso de erro
        setLocalItems(data.itens || []);
        return;
      }
    }

    if (!etapaId) return;

    logger.log(`💾 Salvando ${localItems.length} itens locais...`);

    for (const item of localItems) {
      // Validar campos obrigatórios do item
      if (
        !item.tipo ||
        !item.descricao ||
        !item.quantidade ||
        !item.unidade_medida ||
        item.preco_unitario === undefined
      ) {
        logger.error('Item com campos obrigatórios faltando:', item);
        continue;
      }

      // Validar sub_tipo se necessário
      if ((item.tipo === 'Ferramenta' || item.tipo === 'Equipamento') && !item.sub_tipo) {
        logger.error('Sub-tipo obrigatório para Ferramenta/Equipamento:', item);
        continue;
      }

      try {
        await createItem({
          etapaId,
          osId,
          item: item as Omit<ItemRequisicao, 'id' | 'os_etapa_id' | 'os_id' | 'created_at' | 'updated_at'>
        });
        logger.log(`✅ Item salvo com sucesso`);
      } catch (error) {
        logger.error('Erro ao salvar item:', error);
      }
    }

    // Limpar itens locais e refetch do banco
    setLocalItems([]);
    await refetch();
  };

  // Registrar função de salvar itens no ref para o workflow chamar antes de avançar
  React.useEffect(() => {
    if (saveItemsRef) {
      saveItemsRef.current = handleSaveLocalItems;
    }
    return () => {
      if (saveItemsRef) {
        saveItemsRef.current = undefined;
      }
    };
  }, [saveItemsRef, localItems, etapaId, readOnly]);

  // Handlers para dados da OS
  const handleOSFieldChange = (field: keyof DadosRequisicaoOS, value: any) => {
    if (readOnly) return;
    setDadosOS({ ...dadosOS, [field]: value });
  };

  const handleLocalEntregaChange = async (value: 'escritorio' | 'cliente' | 'outro') => {
    if (readOnly) return;

    if (value === 'escritorio') {
      // Endereço fixo do escritório Minerva
      setDadosOS(prev => ({
        ...prev,
        local_entrega: value,
        cep: '04538-133',
        logradouro: 'Avenida Brigadeiro Faria Lima',
        numero: '3477',
        complemento: '14º Andar - Itaim Bibi',
        bairro: 'Itaim Bibi',
        cidade: 'São Paulo',
        uf: 'SP'
      }));
    } else if (value === 'cliente') {
      // Buscar endereço do cliente vinculado ao centro de custo
      if (dadosOS.centro_custo_id) {
        try {
          const { data: ccData } = await supabase
            .from('centros_custo')
            .select('cliente_id')
            .eq('id', dadosOS.centro_custo_id)
            .single();

          if (ccData?.cliente_id) {
            const { data: cliente } = await supabase
              .from('clientes')
              .select('endereco')
              .eq('id', ccData.cliente_id)
              .single();

            if (cliente && cliente.endereco) {
              const ende = cliente.endereco as any;
              setDadosOS(prev => ({
                ...prev,
                local_entrega: value,
                cep: ende.cep || '',
                logradouro: ende.rua || ende.logradouro || '',
                numero: ende.numero || '',
                complemento: ende.complemento || '',
                bairro: ende.bairro || '',
                cidade: ende.cidade || '',
                uf: ende.estado || ende.uf || ''
              }));
              return;
            }
          }
          toast.warning('Cliente do centro de custo não possui endereço cadastrado. Preencha manualmente.');
        } catch (error) {
          logger.error('Erro ao buscar endereço do cliente:', error);
        }
      } else {
        toast.warning('Selecione primeiro o Centro de Custo para buscar o endereço do cliente.');
      }
      
      // Se falhar ou não tiver CC, apenas muda o tipo, limpando os dados (ou mantém para usuário preencher)
      setDadosOS(prev => ({
        ...prev,
        local_entrega: value,
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
      }));
    } else {
      // Outro local
      setDadosOS(prev => ({
        ...prev,
        local_entrega: value,
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
      }));
    }
  };

  const handleCEPBlur = async () => {
    if (readOnly || !dadosOS.cep) return;

    setTouched({ ...touched, cep: true });

    const endereco = await fetchCEP(dadosOS.cep);
    if (endereco) {
      setDadosOS({
        ...dadosOS,
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        uf: endereco.uf,
        complemento: endereco.complemento || dadosOS.complemento
      });
    }
  };

  // Cálculo de resumo
  const totalItems = allItems.length;
  const valorTotalRequisicao = allItems.reduce(
    (sum, item) => sum + (item.quantidade || 0) * (item.preco_unitario || 0),
    0
  );

  // Validação dos dados da OS
  const dadosOSCompletos = !!(
    dadosOS.centro_custo_id &&
    dadosOS.prazo_necessidade &&
    dadosOS.local_entrega &&
    (dadosOS.local_entrega !== 'outro' || (
      dadosOS.cep &&
      dadosOS.logradouro &&
      dadosOS.numero &&
      dadosOS.bairro &&
      dadosOS.cidade &&
      dadosOS.uf
    ))
  );

  // Fluxo progressivo: CC + Prazo + Local devem ser preenchidos primeiro
  const camposPrincipaisPreenchidos = Boolean(
    dadosOS.centro_custo_id &&
    dadosOS.prazo_necessidade &&
    dadosOS.local_entrega
  );

  // Sincronizar com parent component para validação de completude
  React.useEffect(() => {
    onDataChange({
      totalItems,
      valorTotal: valorTotalRequisicao,
      hasItems: totalItems > 0,
      dadosOSCompletos,
      itens: localItems, // Persistir itens locais no pai
      ...dadosOS
    });
  }, [totalItems, valorTotalRequisicao, dadosOS, dadosOSCompletos, localItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl mb-1">Requisição de Compra</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados da requisição e adicione os itens necessários
        </p>
      </div>

      {/* Dados da Requisição (OS Level) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da Requisição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Centro de Custo */}
          <CentroCustoSelector
            value={dadosOS.centro_custo_id}
            onChange={(ccId, ccData) => {
              setDadosOS(prev => ({
                ...prev,
                centro_custo_id: ccId
              }));
              // Armazenar nome do CC no data pai para confirmação
              onDataChange({
                ...data,
                centro_custo_id: ccId,
                centro_custo_nome: ccData?.nome || ''
              });
            }}
            disabled={readOnly}
            required
            error={!dadosOS.centro_custo_id && touched.centro_custo_id ? 'Centro de custo é obrigatório' : undefined}
          />

          {/* Prazo de Necessidade e Local de Entrega dividem a tela em grid em desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prazo de Necessidade */}
            <div className="space-y-2">
              <Label htmlFor="prazo-necessidade">
                Prazo de Necessidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={dadosOS.prazo_necessidade}
                onValueChange={(value) => handleOSFieldChange('prazo_necessidade', value)}
                disabled={readOnly}
              >
                <SelectTrigger id="prazo-necessidade">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  {PRAZOS_NECESSIDADE.map((prazo) => (
                    <SelectItem key={prazo.value} value={prazo.value}>
                      {prazo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Local de Entrega */}
            <div className="space-y-2">
              <Label htmlFor="local-entrega">
                Local de Entrega <span className="text-destructive">*</span>
              </Label>
              <Select
                value={dadosOS.local_entrega}
                onValueChange={(value: any) => handleLocalEntregaChange(value)}
                disabled={readOnly}
              >
                <SelectTrigger id="local-entrega">
                  <SelectValue placeholder="Selecione o local de entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="escritorio">Entregar no Escritório (Sede)</SelectItem>
                  <SelectItem value="cliente">Entregar no Cliente</SelectItem>
                  <SelectItem value="outro">Outro Endereço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endereço de Entrega - Só aparece se Local for "Outro" */}
          {camposPrincipaisPreenchidos && dadosOS.local_entrega === 'outro' && (
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                Endereço de Entrega
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">
                    CEP <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <FormMaskedInput
                      id="cep"
                      maskType="cep"
                      value={dadosOS.cep || ''}
                      onChange={(e) => handleOSFieldChange('cep', e.target.value)}
                      onBlur={handleCEPBlur}
                      placeholder="00000-000"
                      disabled={readOnly}
                    />
                    {cepLoading && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">
                    Logradouro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="logradouro"
                    value={dadosOS.logradouro || ''}
                    onChange={(e) => handleOSFieldChange('logradouro', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">
                    Número <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="numero"
                    value={dadosOS.numero || ''}
                    onChange={(e) => handleOSFieldChange('numero', e.target.value)}
                    placeholder="123"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={dadosOS.complemento || ''}
                    onChange={(e) => handleOSFieldChange('complemento', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">
                    Bairro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bairro"
                    value={dadosOS.bairro || ''}
                    onChange={(e) => handleOSFieldChange('bairro', e.target.value)}
                    placeholder="Bairro"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">
                    Cidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cidade"
                    value={dadosOS.cidade || ''}
                    onChange={(e) => handleOSFieldChange('cidade', e.target.value)}
                    placeholder="Cidade"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uf">
                    UF <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="uf"
                    value={dadosOS.uf || ''}
                    onChange={(e) => handleOSFieldChange('uf', e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Itens - Só aparece após selecionar CC + Prazo */}
      {camposPrincipaisPreenchidos && (
        <>
          {/* Botão Adicionar */}
          {!readOnly && (
            <Button
              onClick={handleAddItem}
              disabled={loading || creating || deleting}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          )}

          {/* Tabela de Itens Salvos */}
          {savedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens da Requisição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qtd</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Un.</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Unit.</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                        {!readOnly && <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {savedItems.map((item, index) => {
                        const total = (item.quantidade || 0) * (item.preco_unitario || 0);
                        return (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{index + 1}</td>
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <div className="font-medium">{item.tipo}</div>
                                {item.sub_tipo && <div className="text-xs text-muted-foreground">{item.sub_tipo}</div>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm max-w-md">
                              <div className="truncate" title={item.descricao}>{item.descricao}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">{item.quantidade}</td>
                            <td className="py-3 px-4 text-sm">{item.unidade_medida}</td>
                            <td className="py-3 px-4 text-sm text-right">
                              R$ {(item.preco_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold">
                              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            {!readOnly && (
                              <td className="py-3 px-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveLocalItem(index)}
                                  disabled={deleting}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards de Itens em Edição (Locais) */}
          {localItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Itens em Edição</h3>
              {localItems.map((item, localIndex) => {
                const globalIndex = savedItems.length + localIndex;
                return (
                  <RequisitionItemCard
                    key={`local-${localIndex}`}
                    item={item}
                    index={globalIndex}
                    onChange={(updates) => handleUpdateLocalItem(globalIndex, updates)}
                    onRemove={() => handleRemoveLocalItem(globalIndex)}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {savedItems.length === 0 && localItems.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum item adicionado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique no botão "Adicionar Item" para começar
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botão Salvar Itens Locais */}
          {localItems.length > 0 && !readOnly && (
            <Button
              onClick={handleSaveLocalItems}
              disabled={creating || (!etapaId && !onCreateOS)}
              variant="default"
              className="w-full"
            >
              {creating ? 'Salvando...' : `Salvar ${localItems.length} ${localItems.length === 1 ? 'Item' : 'Itens'}`}
            </Button>
          )}

          {/* Resumo */}
          {totalItems > 0 && (
            <Card className="border-border">
              <CardContent className="pt-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total de Itens:</span>
                    <span className="text-base font-semibold">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Valor Total:</span>
                    <span className="text-xl font-bold">
                      R$ {valorTotalRequisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Mensagem quando CC + Prazo não preenchidos */}
      {!camposPrincipaisPreenchidos && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Campos Obrigatórios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione o Centro de Custo e o Prazo de Necessidade para prosseguir
            </p>
          </CardContent>
        </Card>
      )}

      {/* Aviso */}
      {camposPrincipaisPreenchidos && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {totalItems === 0
              ? 'Adicione pelo menos 1 item para continuar.'
              : `${totalItems} ${totalItems === 1 ? 'item adicionado' : 'itens adicionados'}. Revise os dados antes de avançar.`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
