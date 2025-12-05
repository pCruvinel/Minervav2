import { createFileRoute, redirect } from '@tanstack/react-router';
import { GestaoComprasPage } from '@/components/financeiro/gestao-compras-page';

export const Route = createFileRoute('/_auth/financeiro/compras')({
  component: ComprasRoute,
  beforeLoad: ({ context }) => {
    const { currentUser } = context.auth;
    const cargoSlug = currentUser?.cargo_slug || currentUser?.role_nivel;

    // RBAC: Apenas admin, diretor, coord_administrativo
    const CARGOS_PERMITIDOS = ['admin', 'diretor', 'coord_administrativo'];

    if (!cargoSlug || !CARGOS_PERMITIDOS.includes(cargoSlug)) {
      throw redirect({
        to: '/',
        search: { error: 'sem-permissao-financeiro' },
      });
    }
  },
});

function ComprasRoute() {
  return (
    <div className="container mx-auto py-8">
      <GestaoComprasPage />
    </div>
  );
}
