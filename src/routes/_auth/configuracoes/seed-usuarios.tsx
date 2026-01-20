import { createFileRoute } from '@tanstack/react-router';
import { SeedUsuariosPage } from '@/components/admin/seed-usuarios-page';

export const Route = createFileRoute('/_auth/configuracoes/seed-usuarios')({
  component: SeedUsuariosPageRoute,
});

function SeedUsuariosPageRoute() {
  return <SeedUsuariosPage />;
}
