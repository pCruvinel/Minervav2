import { createFileRoute } from '@tanstack/react-router';
import { DashboardAnaliticoPage } from '@/components/financeiro/dashboard-analitico-page';

export const Route = createFileRoute('/_auth/financeiro/dashboard-analitico')({
  component: DashboardAnaliticoPage,
});
