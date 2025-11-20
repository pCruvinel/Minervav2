## ⚡ INÍCIO RÁPIDO

### ✅ Sistema Já Está Funcionando!

O sistema está 100% operacional em **modo frontend-only** com dados mock. Você pode:

- ✅ Navegar por todos os módulos
- ✅ Testar todos os fluxos de OS
- ✅ Ver dashboards completos
- ✅ Gerenciar leads, clientes e propostas
- ✅ Usar calendário e agendamentos

### 🎯 Próximo Passo (Opcional)

**Para habilitar backend com Supabase:**

→ Leia **[docs/GUIA_RAPIDO_SUPABASE.md](./docs/GUIA_RAPIDO_SUPABASE.md)** (5 minutos)

**Ou continue testando em modo mock** - funciona perfeitamente!

---

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 + React
- **UI:** shadcn/ui + Tailwind CSS v4
- **Backend:** Supabase (Edge Functions + PostgreSQL)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage
- **Ícones:** Lucide React

---

## 🎨 Design System

**Paleta de Cores:**
- Primary: `#D3AF37` (Dourado)
- Secondary: `#DDC063` (Dourado Claro)
- Texto: Preto em todas as situações

**Documentação completa:** [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)

---

## 👥 Usuários de Teste

Após configurar o backend ou em modo mock:

| Email | Senha | Perfil |
|-------|-------|--------|
| diretoria@minerva.com | diretoria123 | Diretoria |
| gestor.adm@minerva.com | gestor123 | Gestor ADM |
| gestor.obras@minerva.com | gestor123 | Gestor Obras |
| gestor.assessoria@minerva.com | gestor123 | Gestor Assessoria |
| colaborador@minerva.com | colaborador123 | Colaborador |

**Mais detalhes:** [docs/USUARIOS_TESTE.md](./docs/USUARIOS_TESTE.md)

---

## 📊 Módulos Implementados

### ✅ Completos e Funcionais

1. **Dashboard Executivo** (Diretoria)
   - Visão geral de KPIs
   - Gráficos de OS por setor e status
   - Métricas financeiras

2. **Dashboard Gestores** (Obras e Assessoria)
   - Métricas específicas por setor
   - Aprovações pendentes
   - Gestão de equipes

3. **Dashboard Colaborador**
   - Minhas OS em andamento
   - Agenda de compromissos
   - Leads atribuídos
   - Clientes

4. **Gestão de Ordens de Serviço**
   - OS 01-04: Fluxo especial com 15 etapas
   - OS 05-13: Fluxo normal
   - Workflow visual completo
   - Sistema de aprovações hierárquicas

5. **CRM Comercial**
   - Dashboard comercial
   - Gestão de leads
   - Propostas (OS 01-04)
   - Conversão de leads

6. **Gest��o de Clientes**
   - CRUD completo
   - Histórico de OS
   - Documentos
   - Portal do cliente

7. **Financeiro**
   - Contas a pagar/receber
   - Conciliação bancária
   - Prestação de contas
   - Custos flutuantes

8. **Recursos Humanos**
   - Gestão de colaboradores
   - Controle de presença
   - Gestão de permissões

9. **Calendário & Agendamentos**
   - Visão dia/semana/mês
   - Agendamentos por turno
   - Bloqueio de turnos

10. **Portal do Cliente**
    - Acompanhamento de obras
    - Documentos de assessoria
    - Timeline de eventos

---

## 📁 Estrutura do Projeto

```
/
├── app/                          # Rotas Next.js
│   ├── colaborador/              # Módulo colaborador
│   ├── gestor-obras/             # Módulo gestor obras
│   └── gestor-assessoria/        # Módulo gestor assessoria
│
├── components/                   # Componentes React
│   ├── auth/                     # Autenticação
│   ├── dashboard/                # Dashboards
│   ├── os/                       # Ordens de Serviço
│   ├── clientes/                 # Gestão de clientes
│   ├── comercial/                # CRM
│   ├── financeiro/               # Financeiro
│   ├── colaboradores/            # RH
│   ├── calendario/               # Agendamentos
│   └── ui/                       # shadcn/ui
│
├── lib/                          # Utilitários
│   ├── mock-data*.ts             # Dados mockados
│   ├── api-client.ts             # Cliente API
│   └── hooks/                    # React Hooks
│
├── supabase/functions/server/    # Edge Functions
│   └── index.tsx                 # API Backend
│
├── styles/                       # Estilos
│   ├── globals.css               # Estilos globais
│   └── variables.css             # Variáveis CSS
│
└── docs/                         # 📚 DOCUMENTAÇÃO (NOVO!)
    ├── 00-INDEX.md               # Índice completo
    ├── START_HERE.md             # Comece aqui
    ├── GUIA_RAPIDO_SUPABASE.md   # Setup backend
    └── ...                       # 40+ documentos
```

---

## 🔌 Backend e Deploy

### Status Atual
- ✅ **Código pronto** - Edge Functions implementadas
- ✅ **Credenciais configuradas** - Supabase conectado
- ⚠️ **Deploy pendente** - Erro 403 (resolvível)

### Resolver Deploy
1. Leia [docs/GUIA_RAPIDO_SUPABASE.md](./docs/GUIA_RAPIDO_SUPABASE.md) (5 minutos)
2. Execute comandos do deploy via CLI
3. Ou continue em modo frontend-only

### Alternativa: Modo Frontend Only
O sistema funciona perfeitamente sem backend:
- Dados mock abundantes e realistas
- Todos os fluxos operacionais
- Ideal para demonstrações

Para ativar: [docs/MODO_FRONTEND_ONLY.md](./docs/MODO_FRONTEND_ONLY.md)

---

## 🗄️ Banco de Dados

### Schema Completo
Veja [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) para:
- Estrutura de tabelas
- Relacionamentos
- ENUMs normalizados
- Políticas RLS

### Setup Rápido
```sql
-- Execute no SQL Editor do Supabase
-- (Veja docs/COMANDOS_SUPABASE.md para SQL completo)
```

---

## 📚 Documentação

### 🎯 Começar Aqui
1. **[docs/START_HERE.md](./docs/START_HERE.md)** ⭐ - Início absoluto
2. **[docs/GUIA_RAPIDO_SUPABASE.md](./docs/GUIA_RAPIDO_SUPABASE.md)** - Setup backend (5 min)
3. **[docs/USUARIOS_TESTE.md](./docs/USUARIOS_TESTE.md)** - Fazer login

### 📖 Documentação Completa
- **[docs/00-INDEX.md](./docs/00-INDEX.md)** - Índice de toda documentação (40+ docs)
- **[docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)** - Sistema de design
- **[docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)** - Schema do banco
- **[docs/COMANDOS_SUPABASE.md](./docs/COMANDOS_SUPABASE.md)** - Comandos práticos

### 🔧 Troubleshooting
- **[docs/SOLUCAO_ERRO_403.md](./docs/SOLUCAO_ERRO_403.md)** - Resolver erro de deploy
- **[docs/TEST_API_CONNECTION.md](./docs/TEST_API_CONNECTION.md)** - Testar conexão
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Problemas gerais

---

## 🎯 Fluxos de Ordens de Serviço

### OS 01-04 (Fluxo Especial - 15 Etapas)
1. Identificação do Lead
2. Follow-up 1, 2, 3
3. Geração de Proposta
4. Agendamento de Apresentação
5. Realização de Apresentação
6. Memorial e Escopo
7. Precificação
8. Geração de Contrato
9. Contrato Assinado
10. **Conversão automática para OS-13 (Obra)**

### OS 05-13 (Fluxo Normal)
- Campo Cliente obrigatório
- Etapas específicas por tipo de OS
- Sistema de aprovações
- Workflow visual

**Detalhes:** `/components/os/`

---

## 🏆 Recursos Destacados

### ✨ Gestão à Vista
- Dashboards em tempo real
- Métricas visuais
- Status coloridos por tipo de OS

### 🔄 Fluxo de Aprovação Hierárquico
- Colaborador → Gestor → Diretoria
- Notificações de pendências
- Badge de aprovações

### 📱 Design Responsivo
- Desktop e mobile
- Sidebar adaptativa
- Componentes otimizados

### 🎨 Design System Consistente
- Paleta dourada (#D3AF37)
- Componentes shadcn/ui
- Tailwind CSS v4

### 📊 Dados Mock Abundantes
- 18 Ordens de Serviço
- 30 Clientes
- 20 Leads comerciais
- 18 Eventos de agenda
- Múltiplos usuários de teste

---

## 🔐 Segurança e Permissões

### Sistema de Roles
- **DIRETORIA** - Acesso total
- **GESTOR_ADM** - Gestão administrativa
- **GESTOR_SETOR** - Gestão por setor
- **COLABORADOR** - Operacional

### Visibilidade de Menu
Sistema dinâmico baseado no perfil de acesso.

**Documentação:** [docs/MENU_VISIBILIDADE_README.md](./docs/MENU_VISIBILIDADE_README.md)

---

## 🧪 Testar o Sistema

### 1. Acessar o Sistema
O sistema já está rodando! Faça login com qualquer usuário de teste.

### 2. Explorar Módulos
Navegue pelos dashboards, OS, clientes e comercial.

### 3. Testar Workflows
Crie uma OS e navegue pelas etapas.

### 4. Verificar Dados Mock
Veja `/lib/mock-data-*.ts` para dados disponíveis.

---

## 🚧 Roadmap

### ✅ Fase 1-4: Fundação (Completo)
- Sistema de autenticação
- Layout e navegação
- Design system
- Estrutura de dados

### ✅ Fluxos 5-17: Módulos (Completo)
- Todos os dashboards
- Gestão de OS completa
- CRM comercial
- Financeiro
- RH
- Portal do cliente

### ⚠️ Deploy Backend (Pendente)
- Resolver erro 403
- Configurar banco
- Popular dados iniciais

### 🔜 Próximos Passos
- Notificações em tempo real
- Relatórios PDF
- Integrações externas
- App mobile

---

## 🤝 Contribuindo

Este é um projeto privado da Minerva Engenharia.

### Desenvolvimento
1. Clone o repositório
2. Leia [docs/GUIA_RAPIDO_SUPABASE.md](./docs/GUIA_RAPIDO_SUPABASE.md)
3. Configure backend ou use modo mock
4. Desenvolva seguindo [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)

---

## 📝 Licença

© 2025 Minerva Engenharia - Todos os direitos reservados

---

## 📞 Suporte

- **Documentação:** [docs/00-INDEX.md](./docs/00-INDEX.md)
- **Troubleshooting:** [docs/SOLUCAO_ERRO_403.md](./docs/SOLUCAO_ERRO_403.md)
- **Deploy:** [docs/COMANDOS_SUPABASE.md](./docs/COMANDOS_SUPABASE.md)

---

**Versão:** 1.0.0  
**Última Atualização:** 18/11/2025  
**Status:** ✅ Sistema completo e funcionando  
**Backend:** ⚠️ Deploy pendente (opcional - sistema funciona em modo mock)

---

## 🎉 Quick Start Absoluto

```bash
# 1. Sistema já está funcionando!
# 2. Faça login com: colaborador@minerva.com / colaborador123
# 3. Explore os módulos!

# Opcional - Habilitar backend:
npm install -g supabase
supabase login
supabase link --project-ref zxfevlkssljndqqhxkjb
cd supabase/functions && supabase functions deploy server
```

**Leia:** [docs/GUIA_RAPIDO_SUPABASE.md](./docs/GUIA_RAPIDO_SUPABASE.md) para mais detalhes.

---

**Desenvolvido com ❤️ para Minerva Engenharia**