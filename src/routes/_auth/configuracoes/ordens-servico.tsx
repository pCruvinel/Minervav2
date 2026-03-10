import { createFileRoute } from '@tanstack/react-router';
import { OrdensServicoSettingsPage } from '@/components/configuracoes/ordens-servico/ordens-servico-settings-page';

export const Route = createFileRoute('/_auth/configuracoes/ordens-servico')({
    component: OrdensServicoPageRoute,
});

function OrdensServicoPageRoute() {
    return <OrdensServicoSettingsPage />;
}
