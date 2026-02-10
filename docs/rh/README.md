# 📋 Módulo de Recursos Humanos (RH)

> **Última Atualização:** 28/01/2026  
> **Versão:** 1.0  
> **Status:** ✅ Documentação Completa

---

## 🎯 Visão Geral

O módulo de RH do MinervaV2 gerencia o ciclo de vida completo de colaboradores, incluindo:

- **Cadastro e Convite** de colaboradores
- **Controle de Presença** com alocação de custos
- **Recrutamento** via OS-10 (Requisição de Mão de Obra)
- **Gestão de Turnos** e agendamentos
- **Documentos** pessoais e contratuais

---

## 📚 Documentação

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura técnica e fluxos de dados | ✅ |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Schema completo das 8 tabelas de RH | ✅ |
| [PERMISSIONS.md](./PERMISSIONS.md) | **🆕 Sistema de Permissionamento RBAC** | ✅ |
| [HOOKS_API.md](./HOOKS_API.md) | Referência de 15+ hooks com exemplos | ✅ |
| [PAGES_ROUTES.md](./PAGES_ROUTES.md) | Rotas, páginas e navegação | ✅ |
| [OS10_REQUISICAO_MAO_OBRA.md](./OS10_REQUISICAO_MAO_OBRA.md) | Workflow completo da OS-10 | ✅ |
| [CONTROLE_PRESENCA.md](./CONTROLE_PRESENCA.md) | Sistema de controle de presença | ✅ |

---

## 🗺️ Mapa do Módulo

```
/colaboradores/                        # Área principal de RH
├── Lista de Colaboradores            # CRUD completo
├── Detalhes do Colaborador           # Perfil, docs, financeiro
├── Controle de Presença              # Tabela diária
│   ├── Detalhes do Dia               # KPIs, custos, auditoria
│   └── Histórico                     # Relatórios e exportação
└── Recrutamento                      # Kanban de vagas (OS-10)

/os/criar/requisicao-mao-de-obra      # Workflow OS-10
└── 4 Steps: CC → Solicitação → Vagas → Revisão
```

---

## 📊 Status das Funcionalidades

### Core Features

| Feature | Status | Descrição |
|---------|--------|-----------|
| Cadastro de Colaboradores | ✅ 100% | CRUD completo com validações |
| Gestão de Documentos | ✅ 100% | Upload, download, categorização |
| Controle de Presença | ✅ 100% | Tabela, bulk actions, anexos |
| Página de Detalhes do Dia | ✅ 100% | 3 tabs: registros, custos, auditoria |
| Histórico de Presenças | ✅ 100% | Filtros, KPIs, exportação |
| OS-10 - Requisição MO | ✅ 95% | Workflow completo, 4 steps |
| Recrutamento Kanban | ✅ 95% | 4 colunas, drag & drop |
| Gestão de Turnos | ✅ 90% | CRUD, recorrência, setores |
| Custo de Mão de Obra | ✅ 90% | Por CC, por colaborador |
| **Automação de Salários** | ✅ 100% | Geração automática de despesas (Edge Function) |

### Integrações

| Integração | Status | Descrição |
|------------|--------|-----------|
| Supabase Auth | ✅ | Login, convites, RLS |
| Supabase Storage | ✅ | Documentos, avatars, comprovantes |
| ViaCEP | ✅ | Autocomplete de endereço |
| Calendário | ✅ | Turnos e agendamentos |
| Ordens de Serviço | ✅ | Alocação de custos por CC |

---

## 🔐 Controle de Acesso

> 🆕 **Sistema RBAC Granular:** Consulte [PERMISSIONS.md](./PERMISSIONS.md) para a nova arquitetura de permissões.

| Perfil | Nível | Acesso |
|--------|-------|--------|
| Admin | 10 | Acesso total |
| Diretor | 9 | Acesso total |
| Coord. Administrativo | 6 | Gestão de colaboradores |
| Coord. Assessoria/Obras | 5 | Visualização + presença |
| Operacional | 2-3 | Próprio setor |
| Colaborador Obra | 0 | **Sem acesso ao sistema** |

---

## 📁 Estrutura de Arquivos

```
src/
├── routes/_auth/colaboradores/         # 7 rotas
├── routes/_auth/os/criar/              # OS-10 route
├── components/colaboradores/           # 10 componentes
│   └── recrutamento/                   # Kanban components
├── components/os/administrativo/os-10/ # Workflow OS-10
├── lib/hooks/                          # 15+ hooks
├── lib/types/recrutamento.ts          # Types de recrutamento
├── types/colaborador.ts               # Types de colaborador
└── lib/constants/colaboradores.ts     # Constantes (funções, bancos, docs)
```

---

## 📚 Referências Complementares

| Documento | Localização |
|-----------|-------------|
| COLABORADORES_MODULE.md | `docs/technical/` |
| PRESENCE_CONTROL_SYSTEM.md | `docs/technical/` |
| PRESENCE_DETAILS_PAGE_IMPLEMENTATION.md | `docs/technical/` |
| USER_STRUCTURE_AND_INVITES.md | `docs/technical/` |

---

*Documentação gerada em 28/01/2026 por análise do código e banco de dados.*
