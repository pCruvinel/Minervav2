# 🔐 Sistema de Visibilidade de Menu - Guia Rápido

## 📌 Resumo

Sistema que controla quais itens do menu lateral aparecem para cada perfil de usuário no Minerva ERP.

---

## 🎯 Como Funciona

A **Sidebar** usa o contexto de autenticação (`useAuth()`) para obter o perfil do usuário logado e filtra automaticamente os itens do menu baseado em permissões predefinidas.

---

## 👥 Visibilidade por Perfil

| Perfil | Dashboard | OS | Financeiro | Colaboradores | Clientes | Calendário | Configurações |
|--------|-----------|-----|------------|---------------|----------|------------|---------------|
| **Diretoria** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestores** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Colaboradores** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **MOBRA** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🧪 Como Testar

### Opção 1: Login Real
```bash
1. Fazer login com diferentes usuários (veja mock-data.ts)
2. Verificar menu lateral automaticamente filtrado
```

### Opção 2: Preview Visual
```bash
1. Login com qualquer usuário
2. Menu Debug → "Preview de Menu"
3. Selecionar perfis e ver itens visíveis/ocultos
```

---

## 📂 Arquivos Principais

- **`/components/layout/sidebar.tsx`** - Lógica de filtro
- **`/components/admin/menu-preview-page.tsx`** - Ferramenta de preview
- **`/lib/contexts/auth-context.tsx`** - Contexto de autenticação
- **`/FLUXO_16_MENU_PERFIL_COLABORADOR.md`** - Documentação completa

---

## 🔧 Como Modificar

### Adicionar/Remover itens para um perfil:

```typescript
// Em /components/layout/sidebar.tsx

const visibilityByRole: Record<RoleLevel, string[]> = {
  'COLABORADOR_ADMINISTRATIVO': [
    'dashboard', 
    'projetos', 
    'clientes', 
    'calendario',
    'novo-item' // ← Adicione aqui
  ],
  // ...
};
```

### Adicionar novo item ao menu:

```typescript
// 1. Adicionar ao array menuItems
const menuItems = [
  // ... itens existentes
  { id: 'novo-modulo', label: 'Novo Módulo', icon: IconComponent },
];

// 2. Adicionar aos perfis permitidos em visibilityByRole
const visibilityByRole = {
  'DIRETORIA': [..., 'novo-modulo'],
  // ...
};
```

---

## ⚠️ Importante

- **Debug Menu** sempre visível (para desenvolvimento)
- **Fallback**: Menu completo se não houver usuário logado
- **Submenus**: Não são filtrados individualmente (todos aparecem se o pai for visível)
- **Design**: Zero alterações visuais - apenas controle de visibilidade

---

## 🎯 Status

✅ **Implementado e Funcional**  
📅 **Data:** 17 de novembro de 2025  
🔄 **Versão:** 1.0  

---

Para documentação completa, consulte: `/FLUXO_16_MENU_PERFIL_COLABORADOR.md`
