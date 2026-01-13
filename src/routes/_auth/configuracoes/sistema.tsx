import { createFileRoute } from '@tanstack/react-router';
import { SistemaPage } from '@/components/configuracoes/sistema-page';

export const Route = createFileRoute('/_auth/configuracoes/sistema')({
    component: SistemaPageRoute,
});

function SistemaPageRoute() {
    return <SistemaPage />;
}
