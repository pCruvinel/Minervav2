# 📋 Atualização do Módulo Comercial - Navegação e Triagem

**Data:** 6 de Dezembro de 2025  
**Status:** ✅ Concluído

---

## 🎯 Objetivo

Criar uma "casa própria" para o módulo Comercial no menu lateral e simplificar o fluxo de entrada de novos leads, evitando que o vendedor precise "caçar" qual OS abrir em um menu gigante de operações.

---

## ✅ Implementações Realizadas

### 1. **Atualização da Sidebar** (`src/components/layout/sidebar.tsx`)

#### Novo Grupo "Comercial" no Menu
- **Ícone:** `Briefcase` (maleta executiva)
- **Posicionamento:** Logo após Dashboard, antes de Ordem de Serviço

#### Itens do Menu Comercial:
1. **Novo Lead** 🆕
   - Rota: `/comercial/novo-lead`
   - Ícone: `UserPlus`
   - Descrição: Triagem inicial de oportunidades comerciais

2. **Clientes**
   - Rota: `/clientes`
   - Ícone: `Users`
   - Descrição: Acesso direto à lista de clientes

3. **Contratos**
   - Rota: `/comercial/contratos`
   - Ícone: `FileText`
   - Descrição: Visualização e gestão de contratos

#### Permissões de Acesso:
- ✅ Admin
- ✅ Diretor
- ✅ Coordenador Administrativo
- ✅ Operacional Comercial
- ❌ Demais perfis (não têm acesso ao módulo comercial)

---

### 2. **Página de Triagem de Leads** (`src/routes/_auth/comercial/novo-lead.tsx`)

#### Design e UX:
- Layout centralizado e focado na decisão
- Gradiente suave de fundo (`bg-gradient-to-br from-neutral-50 to-neutral-100`)
- Grid responsivo de 2 colunas (1 coluna em mobile)

#### Cards de Seleção:

**Card 1: Lead de Obras** 🏗️
- Ícone: `HardHat`
- Descrição: "Fachadas, Reformas Estruturais, Impermeabilização"
- Badge: "OS 01-04"
- Ação: Redireciona para `/os/criar/obras-lead`
- Efeitos: Hover com escala, sombra e borda primary

**Card 2: Lead de Assessoria** 📋
- Ícone: `ClipboardCheck`
- Descrição: "Assessoria Mensal, Laudos Técnicos, Vistorias"
- Badge: "OS 05-06"
- Ação: Redireciona para `/os/criar/assessoria-lead`
- Efeitos: Hover com escala, sombra e borda primary

#### Características:
- Clique em toda a área do card (não apenas em botão)
- Feedback visual forte ao hover
- Transições suaves de 300ms
- Texto de ajuda no rodapé
- Responsivo e acessível

---

### 3. **Página de Contratos** (`src/routes/_auth/comercial/contratos.tsx`)

#### Funcionalidades:

**Dashboard de Resumo:**
- Total de Contratos
- Contratos Ativos (em execução + ativos)
- Valor Total dos Contratos

**Sistema de Filtros:**
- Busca textual (número, cliente, tipo)
- Filtro por status:
  - Todos
  - Ativo
  - Em Execução
  - Concluído
  - Pausado
  - Cancelado

**Tabela de Contratos:**
- Número do Contrato
- Cliente
- Tipo de Serviço
- Valor (formatado em BRL)
- Data de Início
- Data de Término
- Status (com badge colorido)
- Ações: Visualizar e Download

**Status com Cores:**
- 🟢 Ativo: Verde
- 🔵 Em Execução: Azul
- ⚪ Concluído: Cinza
- 🔴 Cancelado: Vermelho
- 🟡 Pausado: Amarelo

#### Botão CTA:
- "Novo Contrato" no header
- Redireciona para `/comercial/novo-lead`

**Observação:** Atualmente usa dados mock. Para integrar com o Supabase:
1. Criar hook `use-contratos.ts` similar ao `use-cliente-contratos.ts`
2. Substituir `mockContratos` pela consulta real
3. Adicionar paginação se necessário

---

## 📁 Arquivos Criados/Modificados

### Criados:
- ✅ `src/routes/_auth/comercial/novo-lead.tsx`
- ✅ `src/routes/_auth/comercial/contratos.tsx`

### Modificados:
- ✅ `src/components/layout/sidebar.tsx`
  - Adicionados ícones `UserPlus` e `Briefcase`
  - Criado grupo "Comercial" no menu
  - Ajustadas permissões por role

---

## 🧪 Testes Realizados

- ✅ Build sem erros
- ✅ Linter sem erros
- ✅ Rotas registradas automaticamente pelo TanStack Router
- ✅ Servidor de desenvolvimento rodando sem problemas

---

## 🚀 Como Usar

### Para o Vendedor:

1. Acesse o sistema e faça login
2. No menu lateral, clique em **"Comercial"**
3. Clique em **"Novo Lead"**
4. Escolha o tipo de oportunidade:
   - **Lead de Obras** → Para fachadas, reformas, impermeabilização
   - **Lead de Assessoria** → Para assessoria mensal, laudos, vistorias
5. Preencha o workflow específico da OS escolhida

### Para Consultar Contratos:

1. No menu lateral, clique em **"Comercial"**
2. Clique em **"Contratos"**
3. Use os filtros para encontrar contratos específicos
4. Visualize ou faça download dos documentos

---

## 🔄 Próximos Passos (Opcional)

1. **Integração com Supabase:**
   - Criar hook `use-contratos.ts`
   - Implementar queries reais para listagem de contratos
   - Adicionar paginação

2. **Melhorias de UX:**
   - Adicionar skeleton loading nos cards
   - Implementar toast notifications
   - Adicionar modal de detalhes do contrato

3. **Analytics:**
   - Rastrear quantos leads entram por cada tipo
   - Medir tempo médio de conversão
   - Dashboard de performance comercial

---

## 📊 Impacto Esperado

- ✅ Redução de tempo para criar novo lead (de ~5 cliques para 2)
- ✅ Menor taxa de erro ao escolher tipo de OS
- ✅ Melhor organização do módulo comercial
- ✅ Acesso rápido aos contratos ativos
- ✅ Experiência mais profissional para vendedores

---

## 🎨 Design System

**Cores Utilizadas:**
- Primary: `hsl(var(--primary))`
- Neutral: Escala de 50 a 900
- Status: Verde, Azul, Cinza, Vermelho, Amarelo

**Componentes Shadcn:**
- Card
- Button
- Badge
- Input
- Select
- Table

**Ícones Lucide:**
- `Briefcase`, `UserPlus`, `HardHat`, `ClipboardCheck`, `FileText`, `Users`

---

**Desenvolvido por:** Claude Sonnet 4.5  
**Projeto:** Minerva v2 - Sistema de Gestão Empresarial

