import { renderHook, act } from '@testing-library/react';
import { useDynamicLineReplication } from '../use-dynamic-line-replication';
import { useFormContext } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

describe('useDynamicLineReplication', () => {
  let mockGetValues: any;
  let mockSetValue: any;

  beforeEach(() => {
    mockGetValues = vi.fn();
    mockSetValue = vi.fn();
    (useFormContext as any).mockReturnValue({
      getValues: mockGetValues,
      setValue: mockSetValue,
    });
  });

  it('should replicate custom item to all pavimentos within a bloco', () => {
    mockGetValues.mockReturnValue({
      blocos: [
        {
          pavimentos: [
            { sections: { saidas: { _customItems: [] } } },
            { sections: { saidas: { _customItems: [{ id: '1', label: 'Existing' }] } } },
          ],
        },
      ],
    });

    const { result } = renderHook(() => useDynamicLineReplication());

    act(() => {
      result.current.addCustomItem(
        { type: 'pavimento', blocoIdx: 0, pavIdx: 0, formType: 'spci' },
        'saidas',
        'Teste Fumaça'
      );
    });

    expect(mockSetValue).toHaveBeenCalledTimes(2);
    expect(mockSetValue).toHaveBeenNthCalledWith(
      1,
      'blocos.0.pavimentos.0.sections.saidas._customItems',
      expect.arrayContaining([
        expect.objectContaining({ label: 'Teste Fumaça', status: '', observacao: '' })
      ]),
      { shouldDirty: true, shouldTouch: true }
    );
    expect(mockSetValue).toHaveBeenNthCalledWith(
      2,
      'blocos.0.pavimentos.1.sections.saidas._customItems',
      expect.arrayContaining([
        expect.objectContaining({ label: 'Existing' }),
        expect.objectContaining({ label: 'Teste Fumaça', status: '', observacao: '' })
      ]),
      { shouldDirty: true, shouldTouch: true }
    );
  });

  it('should replicate custom item to all blocos for SPCIBlocoForm', () => {
    mockGetValues.mockReturnValue({
      blocos: [
        { sections: { hidrantes: { _customItems: [] } } },
        { sections: { hidrantes: { _customItems: [] } } },
      ],
    });

    const { result } = renderHook(() => useDynamicLineReplication());

    act(() => {
      result.current.addCustomItem(
        { type: 'bloco', blocoIdx: 0, formType: 'spci' },
        'hidrantes',
        'Verificar Mangueira'
      );
    });

    expect(mockSetValue).toHaveBeenCalledTimes(2);
    expect(mockSetValue).toHaveBeenNthCalledWith(
      1,
      'blocos.0.sections.hidrantes._customItems',
      expect.arrayContaining([expect.objectContaining({ label: 'Verificar Mangueira' })]),
      { shouldDirty: true, shouldTouch: true }
    );
    expect(mockSetValue).toHaveBeenNthCalledWith(
      2,
      'blocos.1.sections.hidrantes._customItems',
      expect.arrayContaining([expect.objectContaining({ label: 'Verificar Mangueira' })]),
      { shouldDirty: true, shouldTouch: true }
    );
  });

  it('should remove custom item for a specific isolated fieldPath', () => {
    mockGetValues.mockReturnValue([
      { id: 'item1', label: 'Item 1' },
      { id: 'item2', label: 'Item 2' }
    ]);

    const { result } = renderHook(() => useDynamicLineReplication());

    act(() => {
      result.current.removeCustomItem('blocos.0.sections.saidas._customItems', 0);
    });

    expect(mockSetValue).toHaveBeenCalledTimes(1);
    expect(mockSetValue).toHaveBeenCalledWith(
      'blocos.0.sections.saidas._customItems',
      [{ id: 'item2', label: 'Item 2' }],
      { shouldDirty: true, shouldTouch: true }
    );
  });
});
