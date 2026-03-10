import { useFormContext } from 'react-hook-form';
import { nanoid } from 'nanoid';
import type { SPDADynamicFormData, CustomItemData } from '../schemas/spda-dynamic-schema';
import type { SPCIDynamicFormData } from '../schemas/spci-dynamic-schema';

export type ReplicationScope =
  | { type: 'bloco'; blocoIdx: number; formType: 'spda' | 'spci' }
  | { type: 'pavimento'; blocoIdx: number; pavIdx: number; formType: 'spci' };

export function useDynamicLineReplication() {
  const { getValues, setValue } = useFormContext();

  const addCustomItem = (scope: ReplicationScope, sectionId: string, label: string) => {
    const customItem: CustomItemData = {
      id: '', // será substituído por nanoid() para cada clone
      label,
      origin: 'user',
      createdAt: new Date().toISOString(),
      status: '',
      observacao: '',
    };

    if (scope.formType === 'spci' && scope.type === 'pavimento') {
      // Replicar em todos os pavimentos do Bloco A
      const data = getValues() as SPCIDynamicFormData;
      const pavimentos = data.blocos[scope.blocoIdx].pavimentos;

      pavimentos.forEach((pav, pavIndex) => {
        const currentItems = (pav.sections as any)[sectionId]?._customItems || [];
        const clonedItem = { ...customItem, id: nanoid() };
        setValue(
          `blocos.${scope.blocoIdx}.pavimentos.${pavIndex}.sections.${sectionId}._customItems`,
          [...currentItems, clonedItem],
          { shouldDirty: true, shouldTouch: true }
        );
      });
    } else if (scope.formType === 'spci' && scope.type === 'bloco') {
      // Replicar em todos os blocos do Empreendimento
      const data = getValues() as SPCIDynamicFormData;
      const blocos = data.blocos;

      blocos.forEach((bloco, blocoIndex) => {
        const currentItems = (bloco.sections as any)[sectionId]?._customItems || [];
        const clonedItem = { ...customItem, id: nanoid() };
        setValue(
          `blocos.${blocoIndex}.sections.${sectionId}._customItems`,
          [...currentItems, clonedItem],
          { shouldDirty: true, shouldTouch: true }
        );
      });
    } else if (scope.formType === 'spda' && scope.type === 'bloco') {
      // Replicar em todos os blocos do Empreendimento
      const data = getValues() as SPDADynamicFormData;
      const blocos = data.blocos;

      blocos.forEach((bloco, blocoIndex) => {
        const currentItems = (bloco.sections as any)[sectionId]?._customItems || [];
        const clonedItem = { ...customItem, id: nanoid() };
        setValue(
          `blocos.${blocoIndex}.sections.${sectionId}._customItems`,
          [...currentItems, clonedItem],
          { shouldDirty: true, shouldTouch: true }
        );
      });
    }
  };

  /**
   * Remoção ocorre apenas no array específico (não em cascata para os irmãos).
   * @param fieldPath - EX: 'blocos.0.pavimentos.1.sections.extintores._customItems'
   * @param indexToRemove - Indice local no field array
   */
  const removeCustomItem = (fieldPath: string, indexToRemove: number) => {
    const currentItems = getValues(fieldPath) as CustomItemData[];
    if (!currentItems || !currentItems.length) return;

    const newItems = [...currentItems];
    newItems.splice(indexToRemove, 1);

    setValue(fieldPath, newItems, { shouldDirty: true, shouldTouch: true });
  };

  return {
    addCustomItem,
    removeCustomItem,
  };
}
