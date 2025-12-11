# Contexto do Projeto Minerva v2.7

## Visão Geral
O **Minerva v2.7** é uma aplicação web focada na gestão de Ordens de Serviço (OS), Financeiro e Dashboard, construída com tecnologias modernas para garantir performance e escalabilidade. O sistema implementa **13 tipos de OS** com workflows polimórficos e **transferência automática de setor** entre etapas.

## Stack Tecnológico
- **Frontend:** React, Vite, TypeScript
- **Estilização:** Tailwind CSS, Shadcn UI (Radix UI)
- **Backend/Banco de Dados:** Supabase (PostgreSQL)
- **Gerenciamento de Estado:** TanStack Query, Context API
- **Deploy:** Vercel
- **Edge Functions:** Hono (server), React-PDF (generate-pdf)

## Estrutura de Documentação
A documentação do projeto foi centralizada na pasta `docs/` para facilitar o acesso e a manutenção.

- **[Planejamento](../planning/):** Documentos de arquitetura, planos de implementação, checklists e relatórios de status.
- **[Guias](../guides/):** Manuais de uso, guias de início rápido (Quick Start) e instruções para colaboradores.
- **[Técnico](../technical/):** Documentação de API, esquemas de banco de dados, guias de integração e solução de problemas.
- **[Sistema](../sistema/):** Documentação principal do sistema (PRD, especificações, schemas).

## Módulos Principais
- **OS (Ordens de Serviço):** Gestão completa do ciclo de vida das 13 OS, com workflows personalizados.
- **Financeiro:** Controle de contas a pagar/receber, centros de custo e relatórios financeiros.
- **Dashboard:** Visão geral dos indicadores de desempenho com KPIs personalizados.
- **Calendário:** Sistema de turnos e agendamentos integrado com validação de vagas.
- **Autenticação:** Sistema de login e controle de acesso via Supabase Auth com 7 níveis de hierarquia.

## Funcionalidades v2.7
- **Transferência Automática de Setor:** Sistema que detecta mudança de responsabilidade entre etapas e executa handoff automaticamente.
- **Notificação de Coordenadores:** Alerta automático quando OS é transferida para o setor.
- **Modal de Feedback:** Informação visual ao usuário após transferência bem-sucedida.
- **Tabela `os_transferencias`:** Histórico completo de todas as transferências de setor.

## Status Atual
O projeto está na versão **v2.7** com foco no sistema de transferência automática de setor. Consulte [TODAS_OS_E_ETAPAS.md](./TODAS_OS_E_ETAPAS.md) para detalhes sobre o status de cada OS.

**Última Atualização:** 11/12/2025
