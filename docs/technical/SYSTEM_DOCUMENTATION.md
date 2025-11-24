# Documentação do Sistema Minerva ERP v2.0

## 1. Visão Geral
O Minerva ERP é um sistema de gestão empresarial focado em empresas de engenharia e manutenção predial. A versão 2.0 foi reconstruída utilizando tecnologias modernas para garantir performance, escalabilidade e uma melhor experiência de usuário.

### Tech Stack
- **Frontend**: React 18.3+, TypeScript, Vite
- **Estilização**: Tailwind CSS, Shadcn/UI
- **Roteamento**: TanStack Router (File-based routing)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: React Context + Custom Hooks
- **Data Fetching**: Custom Hooks com `api-client.ts`

## 2. Arquitetura do Sistema

### Frontend
A aplicação segue uma arquitetura baseada em componentes e hooks.
- **`src/routes`**: Define a estrutura de navegação e as páginas principais.
- **`src/components`**: Componentes reutilizáveis (UI) e componentes de negócio específicos.
- **`src/lib`**: Lógica de negócios, hooks, utilitários e definições de tipos.

### Backend (Supabase)
O backend é totalmente serverless, utilizando o Supabase.
- **Database**: PostgreSQL com Row Level Security (RLS) para controle de acesso.
- **Auth**: Gerenciamento de usuários e sessões.
- **Edge Functions**: Lógica de backend complexa (ex: `server` function para API centralizada).

## 3. Mapa de Telas (Rotas)

A navegação é gerenciada pelo TanStack Router, com a estrutura de arquivos em `src/routes`.

### Autenticação
- `/login`: Tela de login do sistema.

### Área Logada (`_auth`)
Todas as rotas abaixo exigem autenticação.

#### Dashboard
- `/dashboard`: Visão geral do sistema, métricas e atalhos. Adapta-se ao perfil do usuário (Diretoria, Gestor, Colaborador).

#### Ordens de Serviço (OS)
- `/os`: Listagem de todas as Ordens de Serviço.
- `/os/criar`: Wizard para criação de nova OS (Workflow de 15 etapas).
- `/os/$osId`: Detalhes de uma OS específica e acompanhamento do workflow.

#### Clientes (CRM)
- `/clientes`: Listagem e gerenciamento de clientes e leads.
- `/clientes/$clienteId`: Detalhes do cliente.

#### Colaboradores
- `/colaboradores`: Gestão de equipe e permissões.

#### Financeiro
- `/financeiro`: Módulo financeiro (Contas a Pagar/Receber).
- `/financeiro/fluxo-caixa`: Visualização de fluxo de caixa.

#### Calendário
- `/calendario`: Agenda de visitas e compromissos.

#### Configurações
- `/configuracoes`: Configurações do sistema.

## 4. Fluxo de Dados

### Camada de API (`src/lib/api-client.ts`)
Toda a comunicação com o Supabase é centralizada no `api-client.ts`. Este módulo fornece métodos tipados para interagir com as tabelas (ex: `clientesAPI`, `ordensServicoAPI`).
- **Tratamento de Erros**: Captura erros de API e padroniza respostas.
- **Autenticação**: Injeta automaticamente o token de sessão.

### Custom Hooks (`src/lib/hooks`)
A lógica de busca e manipulação de dados é encapsulada em hooks.
- **`useAuth`**: Gerencia o estado do usuário logado e permissões.
- **`useOrdensServico`**: CRUD de OSs.
- **`useClientes`**: CRUD de Clientes.
- **`useEtapas`**: Gerencia as etapas do workflow de OS.
- **`useWorkflowState`**: Gerencia o estado complexo do wizard de criação de OS.
- **`useAutoSave`**: Implementa salvamento automático em formulários longos.

### Estado Global
- **`AuthContext`**: Mantém o usuário atual e suas permissões acessíveis em toda a aplicação.
- **`ThemeContext`**: Gerencia o tema (claro/escuro).

## 5. Componentes Chave

### `OSDetailsWorkflowPage` (`src/components/os/os-details-workflow-page.tsx`)
O componente mais complexo do sistema. Gerencia o ciclo de vida de uma OS, desde a criação até a conclusão.
- **Workflow**: Controla a navegação entre as 15 etapas.
- **Validação**: Utiliza Zod para validar dados de cada etapa.
- **Persistência**: Salva o progresso automaticamente no banco.

### `Sidebar` (`src/components/layout/sidebar.tsx`)
Navegação principal do sistema.
- **Responsividade**: Adapta-se a mobile e desktop.
- **Permissões**: Exibe apenas os menus permitidos para o cargo do usuário.

## 6. Modelo de Dados (Resumo)

### Tabelas Principais
- **`ordens_servico`**: Tabela central. Relaciona-se com clientes, tipos de OS e colaboradores.
- **`os_etapas`**: Armazena o estado de cada etapa de uma OS.
- **`clientes`**: Cadastro de clientes e leads.
- **`colaboradores`**: Perfis de usuários e dados de RH.
- **`delegacoes`**: Tarefas delegadas entre usuários.

### Enums Importantes
- **`os_status_geral`**: `em_triagem`, `em_andamento`, `concluida`, `cancelada`.
- **`os_etapa_status`**: `pendente`, `em_andamento`, `concluida`, `bloqueada`.
- **`role_level`**: `admin`, `diretoria`, `gestor_*`, `colaborador`.

---
*Documentação gerada automaticamente em 23/11/2025.*
