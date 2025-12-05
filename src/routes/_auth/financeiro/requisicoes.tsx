import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Rota legada - redireciona para /financeiro/compras
 * Mantida para compatibilidade com links antigos
 */
export const Route = createFileRoute('/_auth/financeiro/requisicoes')({
  beforeLoad: () => {
    // Redirecionar para a nova rota de Gestão de Compras
    throw redirect({
      to: '/financeiro/compras',
    });
  },
});
