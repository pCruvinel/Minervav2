import { createFileRoute, redirect } from '@tanstack/react-router';
import { PurchaseApprovalBoard } from '@/components/financeiro/purchase-approval-board';

export const Route = createFileRoute('/_auth/financeiro/requisicoes')({
  component: RequisicoesRoute,
  beforeLoad: ({ context }) => {
    const { currentUser } = context.auth;
    const cargoSlug = currentUser?.cargo_slug || currentUser?.role_nivel;

    // RBAC: Apenas admin, diretor, coord_administrativo (novos slugs)
    const CARGOS_PERMITIDOS = ['admin', 'diretor', 'coord_administrativo'];

    if (!cargoSlug || !CARGOS_PERMITIDOS.includes(cargoSlug)) {
      throw redirect({
        to: '/',
        search: { error: 'sem-permissao-financeiro' }
      });
    }
  }
});

function RequisicoesRoute() {
  return (
    <div className="container mx-auto py-8">
      <PurchaseApprovalBoard />
    </div>
  );
}
