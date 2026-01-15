/**
 * WorkloadTabContent - Container com Toggle Kanban/Tabela
 * 
 * Permite alternar entre duas visualizações de carga de trabalho:
 * - Kanban (por Coordenador)
 * - Tabela (por Setor → Colaborador → OS)
 */
'use client';

import { useState } from 'react';
import { WorkloadKanban } from './workload-kanban';
import { SetorWorkloadTable } from './setor-workload-table';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'table';

export function WorkloadTabContent() {
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    return (
        <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-end gap-1 bg-muted/50 rounded-lg p-1 w-fit ml-auto">
                <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={cn(
                        'gap-2',
                        viewMode === 'table' && 'shadow-sm'
                    )}
                >
                    <Table2 className="h-4 w-4" />
                    Por Setor
                </Button>
                <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={cn(
                        'gap-2',
                        viewMode === 'kanban' && 'shadow-sm'
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Por Coordenador
                </Button>
            </div>

            {/* Content */}
            {viewMode === 'kanban' ? (
                <WorkloadKanban />
            ) : (
                <SetorWorkloadTable />
            )}
        </div>
    );
}
