import { createFileRoute } from '@tanstack/react-router';
import { PropostaComercialPrintPage } from '@/components/os/shared/pages/proposta-comercial-print-page';

export const Route = createFileRoute('/_auth/os/proposta/$codigo')({
    component: PropostaComercialPrintPage,
});