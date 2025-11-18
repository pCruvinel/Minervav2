# 🚀 COMECE AQUI - ERP Minerva Engenharia

**Bem-vindo ao sistema de gestão integrada da Minerva Engenharia!**

---

## ⚡ STATUS INSTANTÂNEO

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ✅  SISTEMA FUNCIONANDO                               │
│   ✅  Frontend Completo (12 módulos)                    │
│   ✅  Dados Mock Abundantes                             │
│   ✅  Backend Configurado                               │
│   ⚠️   Deploy Pendente (opcional)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 VOCÊ QUER...

### 1. 🎮 TESTAR O SISTEMA AGORA (0 minutos)
```
┌─────────────────────────────────────────┐
│  Sistema JÁ FUNCIONA!                   │
│                                         │
│  1. Acesse o sistema                    │
│  2. Login: colaborador@minerva.com      │
│  3. Senha: colaborador123               │
│  4. Explore todos os módulos!           │
│                                         │
│  ✅ Sem configuração necessária         │
└─────────────────────────────────────────┘
```
**Documentação:** [USUARIOS_TESTE.md](./USUARIOS_TESTE.md)

---

### 2. 🔌 CONECTAR AO BACKEND (5-10 minutos)
```
┌─────────────────────────────────────────┐
│  Habilitar persistência de dados        │
│                                         │
│  1. Leia GUIA_RAPIDO_SUPABASE.md        │
│  2. Escolha uma das 3 opções            │
│  3. Execute os comandos                 │
│  4. Configure o banco                   │
│                                         │
│  ⚙️  Checklist: CHECKLIST_DEPLOY.md   │
└─────────────────────────────────────────┘
```
**Documentação:** [GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)

---

### 3. 📚 ENTENDER O SISTEMA (10 minutos)
```
┌─────────────────────────────────────────┐
│  Visão geral da arquitetura             │
│                                         │
│  1. Leia ../README.md                   │
│  2. Veja RESUMO_SUPABASE.md             │
│  3. Explore DESIGN_SYSTEM.md            │
│  4. Navegue pelos módulos               │
│                                         │
│  📖 Índice: 00-INDEX.md                 │
└─────────────────────────────────────────┘
```
**Documentação:** [00-INDEX.md](./00-INDEX.md)

---

### 4. 🛠️ RESOLVER ERRO 403 (5 minutos)
```
┌─────────────────────────────────────────┐
│  Solução para erro de deploy            │
│                                         │
│  1. Leia SOLUCAO_ERRO_403.md            │
│  2. Escolha uma das 4 soluções          │
│  3. Execute os comandos                 │
│  4. Teste a conexão                     │
│                                         │
│  🔧 Comandos: COMANDOS_SUPABASE.md     │
└─────────────────────────────────────────┘
```
**Documentação:** [SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)

---

## 📊 VISÃO GERAL DO SISTEMA

### ✅ O Que Está Pronto

```
Frontend (100%)
├── 👤 Autenticação ✅
├── 📊 Dashboards ✅
│   ├── Diretoria
│   ├── Gestor ADM
│   ├── Gestor Obras
│   ├── Gestor Assessoria
│   └── Colaborador
├── 📋 Ordens de Serviço ✅
│   ├── OS 01-04 (15 etapas)
│   ├── OS 05-13 (fluxo normal)
│   └── Workflow visual
├── 💼 CRM Comercial ✅
│   ├── Dashboard
│   ├── Leads
│   └── Propostas
├── 👥 Clientes ✅
│   ├── Lista e detalhes
│   ├── Portal Obras
│   └── Portal Assessoria
├── 💰 Financeiro ✅
│   ├── Contas a pagar/receber
│   ├── Conciliação
│   └── Prestação de contas
├── 👷 Colaboradores ✅
│   ├── Gestão
│   └── Presença
├── 📅 Calendário ✅
│   ├── Dia/Semana/Mês
│   └── Agendamentos
└── ⚙️ Configurações ✅
    ├── Usuários
    └── Permissões

Backend (Código Pronto)
├── 🔌 Edge Functions ✅
│   ├── Clientes (CRUD)
│   ├── OS (CRUD)
│   └── Etapas (CRUD)
├── 🗄️ Schema SQL ✅
│   ├── 5 tabelas principais
│   ├── ENUMs normalizados
│   └── Relacionamentos FK
└── ⚠️ Deploy Pendente
    └── Erro 403 (resolvível)
```

---

## 📝 DADOS MOCKADOS DISPONÍVEIS

```
✅ 18 Ordens de Serviço
✅ 30 Clientes
✅ 20 Leads Comerciais
✅ 18 Eventos de Agenda
✅ 5 Usuários de Teste
✅ 13 Tipos de OS
```

Todos os dados estão em `/lib/mock-data-*.ts`

---

## 🎨 DESIGN SYSTEM

```
Paleta de Cores:
├── Primary:   #D3AF37 (Dourado)
├── Secondary: #DDC063 (Dourado Claro)
└── Texto:     Preto (todas as situações)

Cores por Tipo de OS:
├── OS 01-04:  Verde (#10B981)
├── OS 05-06:  Roxo (#8B5CF6)
├── OS 07-08:  Azul (#3B82F6)
├── OS 09-10:  Laranja (#F59E0B)
└── OS 11-13:  Rosa (#EC4899)
```

**Documentação:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 🎯 PRÓXIMAS AÇÕES RECOMENDADAS

### 🟢 AGORA (0 min)
```bash
# Teste o sistema - já funciona!
Login: colaborador@minerva.com
Senha: colaborador123
```

### 🟡 DEPOIS (5-10 min)
```bash
# Habilitar backend
npm install -g supabase
supabase login
supabase link --project-ref zxfevlkssljndqqhxkjb
cd supabase/functions && supabase functions deploy server
```

### 🔵 QUANDO QUISER (20-30 min)
```sql
-- Configurar banco completo
-- SQL em: COMANDOS_SUPABASE.md
```

---

## 📚 DOCUMENTAÇÃO ESSENCIAL

### Para Começar
1. **[../README.md](../README.md)** - Visão geral do projeto
2. **[GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)** - Deploy em 5 minutos
3. **[USUARIOS_TESTE.md](./USUARIOS_TESTE.md)** - Fazer login

### Para Deploy
4. **[SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)** - Resolver erro 403
5. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Passo a passo visual
6. **[COMANDOS_SUPABASE.md](./COMANDOS_SUPABASE.md)** - Comandos práticos

### Para Referência
7. **[00-INDEX.md](./00-INDEX.md)** - Índice completo
8. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Sistema de design
9. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema do banco

### Para Troubleshooting
10. **[STATUS_ATUAL.md](./STATUS_ATUAL.md)** - Status do sistema
11. **[TEST_API_CONNECTION.md](./TEST_API_CONNECTION.md)** - Testar conexão
12. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problemas gerais

---

## ⚡ COMANDOS RÁPIDOS

### Testar Sistema (Modo Mock)
```
Já funciona! Apenas faça login.
```

### Deploy Backend
```bash
npm install -g supabase && supabase login
supabase link --project-ref zxfevlkssljndqqhxkjb
cd supabase/functions && supabase functions deploy server
```

### Testar API
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/health \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## 🎓 CURVA DE APRENDIZADO

```
┌────────────────────────────────────────────┐
│  Tempo    │  O Que Você Pode Fazer         │
├───────────┼────────────────────────────────┤
│  0 min    │  ✅ Testar todo o sistema      │
│  5 min    │  ✅ Entender a arquitetura     │
│  10 min   │  ✅ Deploy do backend          │
│  20 min   │  ✅ Banco configurado          │
│  30 min   │  ✅ Sistema em produção        │
│  1 hora   │  ✅ Customizações              │
└────────────────────────────────────────────┘
```

---

## 🏆 CONQUISTAS DESBLOQUEÁVEIS

- [ ] 🎮 Testou o sistema
- [ ] 📖 Leu a documentação
- [ ] 🔌 Conectou o backend
- [ ] 🗄️ Configurou o banco
- [ ] 👥 Criou usuários
- [ ] ✅ Todos os testes passaram
- [ ] 🎉 Sistema em produção

---

## 💡 DICAS

### 💎 Dica de Ouro
> O sistema **JÁ FUNCIONA** em modo mock.  
> Backend é **OPCIONAL** para testes e demonstrações.

### 🎯 Foco Inicial
> Comece testando o sistema.  
> Só configure backend quando precisar de persistência.

### 📚 Documentação
> Tudo está documentado.  
> Use [00-INDEX.md](./00-INDEX.md) como guia.

### 🔧 Problemas
> 99% das dúvidas estão em [SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)

---

## 🎉 BEM-VINDO!

```
╔══════════════════════════════════════════╗
║                                          ║
║   🏗️  ERP MINERVA ENGENHARIA            ║
║                                          ║
║   Sistema completo e funcionando        ║
║   12 módulos • 80+ componentes          ║
║   Frontend-only ou com backend          ║
║                                          ║
║   Desenvolvido com ❤️                    ║
║                                          ║
╚══════════════════════════════════════════╝
```

**Versão:** 1.0.0  
**Data:** 18/11/2025  
**Status:** ✅ Pronto para uso  

---

## 🚀 COMEÇAR AGORA

### Escolha UMA opção:

**[ A ] Quero testar agora →** Faça login no sistema  
**[ B ] Quero habilitar backend →** [GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)  
**[ C ] Quero entender tudo →** [../README.md](../README.md) + [00-INDEX.md](./00-INDEX.md)  

---

**Próximo arquivo recomendado:** [../README.md](../README.md) ou [GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)
