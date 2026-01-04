import { WorkflowStep } from '@/components/os/shared/components/workflow-stepper';

export const steps: WorkflowStep[] = [
    { id: 1, title: 'Dados do Cliente', short: 'Cliente', responsible: 'Comercial', status: 'active' },
    { id: 2, title: 'Anexar ART', short: 'ART', responsible: 'Engenharia', status: 'pending' },
    { id: 3, title: 'Relatório Fotográfico', short: 'Fotos', responsible: 'Engenharia', status: 'pending' },
    { id: 4, title: 'Imagem de Áreas', short: 'Áreas', responsible: 'Engenharia', status: 'pending' },
    { id: 5, title: 'Cronograma', short: 'Cronograma', responsible: 'Engenharia', status: 'pending' },
    { id: 6, title: 'Agendar Visita Inicial', short: 'Ag. Visita', responsible: 'Engenharia', status: 'pending' },
    { id: 7, title: 'Realizar Visita Inicial', short: 'Visita', responsible: 'Engenharia', status: 'pending' },
    { id: 8, title: 'Histograma', short: 'Histograma', responsible: 'Engenharia', status: 'pending' },
    { id: 9, title: 'Placa de Obra', short: 'Placa', responsible: 'Engenharia', status: 'pending' },
    { id: 10, title: 'Requisição de Compras', short: 'Compras', responsible: 'Compras', status: 'pending' },
    { id: 11, title: 'Requisição de Mão de Obra', short: 'RH', responsible: 'RH', status: 'pending' },
    { id: 12, title: 'Evidência Mobilização', short: 'Mobilização', responsible: 'Engenharia', status: 'pending' },
    { id: 13, title: 'Diário de Obra', short: 'Diário', responsible: 'Engenharia', status: 'pending' },
    { id: 14, title: 'Seguro de Obras', short: 'Seguro', responsible: 'Financeiro', status: 'pending' },
    { id: 15, title: 'Documentos SST', short: 'SST', responsible: 'Segurança', status: 'pending' },
    { id: 16, title: 'Agendar Visita Final', short: 'Ag. Final', responsible: 'Engenharia', status: 'pending' },
    { id: 17, title: 'Realizar Visita Final', short: 'Visita Final', responsible: 'Engenharia', status: 'pending' },
];
