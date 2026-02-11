import { WorkflowStep } from '@/components/os/shared/components/workflow-stepper';

export const steps: WorkflowStep[] = [
    { id: 1, title: 'Dados do Cliente', short: 'Cliente', setor: 'administrativo' as const, setorNome: 'Administrativo' },
    { id: 2, title: 'Anexar ART', short: 'ART', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 3, title: 'Relatório Fotográfico', short: 'Fotos', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 4, title: 'Imagem de Áreas', short: 'Áreas', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 5, title: 'Cronograma', short: 'Cronograma', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 6, title: 'Agendar Visita Inicial', short: 'Ag. Visita', setor: 'administrativo' as const, setorNome: 'Administrativo' },
    { id: 7, title: 'Realizar Visita Inicial', short: 'Visita', setor: 'administrativo' as const, setorNome: 'Administrativo' },
    { id: 8, title: 'Histograma', short: 'Histograma', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 9, title: 'Placa de Obra', short: 'Placa', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 10, title: 'Requisição de Compras', short: 'Compras', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 11, title: 'Requisição de Mão de Obra', short: 'RH', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 12, title: 'Evidência Mobilização', short: 'Mobilização', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 13, title: 'Diário de Obra', short: 'Diário', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 14, title: 'Seguro de Obras', short: 'Seguro', setor: 'administrativo' as const, setorNome: 'Administrativo' },
    { id: 15, title: 'Documentos SST', short: 'SST', setor: 'obras' as const, setorNome: 'Obras' },
    { id: 16, title: 'Agendar Visita Final', short: 'Ag. Final', setor: 'administrativo' as const, setorNome: 'Administrativo' },
    { id: 17, title: 'Realizar Visita Final', short: 'Visita Final', setor: 'obras' as const, setorNome: 'Obras' },
];
