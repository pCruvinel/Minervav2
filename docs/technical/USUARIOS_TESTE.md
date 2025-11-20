# 👥 Usuários de Teste - Sistema de Visibilidade de Menu

## 🎯 Como Usar

Use estes usuários para testar o sistema de visibilidade de menu. Cada perfil mostrará diferentes itens no menu lateral.

---

## 🔐 Credenciais de Login

> **Senha:** Qualquer senha é aceita em modo desenvolvimento (frontend-only)

### 🟣 Diretoria (Acesso Total - 7/7 itens)

```
Email: carlos.silva@minervaengenharia.com.br
Nome: Carlos Eduardo Silva
Perfil: DIRETORIA
Itens Visíveis: Dashboard, Projetos/OS, Financeiro, Colaboradores, Clientes, Calendário, Configurações
```

---

### 🔵 Gestores (Acesso Completo - 7/7 itens)

#### Gestor Administrativo
```
Email: maria.silva@minervaengenharia.com.br
Nome: Maria Silva Gestora Comercial
Perfil: GESTOR_ADMINISTRATIVO
Setor: Administrativo (COM)
Itens Visíveis: Dashboard, Projetos/OS, Financeiro, Colaboradores, Clientes, Calendário, Configurações
```

#### Gestor Assessoria
```
Email: joao.pedro@minervaengenharia.com.br
Nome: João Pedro Gestor Assessoria
Perfil: GESTOR_ASSESSORIA
Setor: Assessoria Técnica (ASS)
Itens Visíveis: Dashboard, Projetos/OS, Financeiro, Colaboradores, Clientes, Calendário, Configurações
```

#### Gestor Obras
```
Email: roberto.carlos@minervaengenharia.com.br
Nome: Roberto Carlos Gestor Obras
Perfil: GESTOR_OBRAS
Setor: Obras (OBR)
Itens Visíveis: Dashboard, Projetos/OS, Financeiro, Colaboradores, Clientes, Calendário, Configurações
```

---

### 🟡 Colaboradores (Acesso Limitado - 4/7 itens)

#### Colaborador Administrativo
```
Email: vendedor.1@minerva.com
Nome: Ana Claudia Vendedora
Perfil: COLABORADOR_ADMINISTRATIVO
Setor: Administrativo (COM)
Itens Visíveis: Dashboard, Projetos/OS, Clientes, Calendário
Itens Ocultos: ❌ Financeiro, ❌ Colaboradores, ❌ Configurações
```

```
Email: vendedor.2@minerva.com
Nome: Fernando Luis Vendedor
Perfil: COLABORADOR_ADMINISTRATIVO
Setor: Administrativo (COM)
```

#### Colaborador Assessoria
```
Email: tecnico.ass.1@minerva.com
Nome: Bruno Martins Técnico
Perfil: COLABORADOR_ASSESSORIA
Setor: Assessoria Técnica (ASS)
Itens Visíveis: Dashboard, Projetos/OS, Clientes, Calendário
Itens Ocultos: ❌ Financeiro, ❌ Colaboradores, ❌ Configurações
```

```
Email: tecnico.ass.2@minerva.com
Nome: Fabiana Souza Técnica
Perfil: COLABORADOR_ASSESSORIA
Setor: Assessoria Técnica (ASS)
```

#### Colaborador Obras
```
Email: encarregado.1@minerva.com
Nome: Marcelo Costa Encarregado
Perfil: COLABORADOR_OBRAS
Setor: Obras (OBR)
Itens Visíveis: Dashboard, Projetos/OS, Clientes, Calendário
Itens Ocultos: ❌ Financeiro, ❌ Colaboradores, ❌ Configurações
```

```
Email: encarregado.2@minerva.com
Nome: Juliana Lima Encarregada
Perfil: COLABORADOR_OBRAS
Setor: Obras (OBR)
```

---

### 🔴 Mão de Obra (Acesso Mínimo - 1/7 itens)

```
Email: mobra.1@minerva.com
Nome: José Santos Pedreiro
Perfil: MOBRA
Setor: Obras (OBR)
Itens Visíveis: Dashboard
Itens Ocultos: ❌ Todos os outros (Projetos/OS, Financeiro, Colaboradores, Clientes, Calendário, Configurações)
```

```
Email: mobra.2@minerva.com
Nome: Antonio Silva Eletricista
Perfil: MOBRA
Setor: Obras (OBR)
```

---

## 🧪 Roteiro de Teste Sugerido

### Teste 1: Colaborador vs Gestor
```
1. Login como: vendedor.1@minerva.com (COLABORADOR_ADMINISTRATIVO)
2. Observar: Menu mostra apenas 4 itens
3. Logout
4. Login como: maria.silva@minervaengenharia.com.br (GESTOR_ADMINISTRATIVO)
5. Observar: Menu mostra todos os 7 itens
6. Comparar: Diferença de 3 itens (Financeiro, Colaboradores, Configurações)
```

### Teste 2: Diferentes Setores de Colaboradores
```
1. Login como: vendedor.1@minerva.com (COM)
2. Login como: tecnico.ass.1@minerva.com (ASS)
3. Login como: encarregado.1@minerva.com (OBR)
4. Observar: Todos mostram os mesmos 4 itens de menu
5. Verificar: Em futuras versões, poderá haver filtro adicional por setor
```

### Teste 3: Hierarquia Completa
```
1. Login como: mobra.1@minerva.com (Nível 1 - MOBRA)
   → Ver: Apenas Dashboard
2. Login como: encarregado.1@minerva.com (Nível 2 - COLABORADOR)
   → Ver: 4 itens
3. Login como: roberto.carlos@minervaengenharia.com.br (Nível 3 - GESTOR)
   → Ver: 7 itens (completo)
4. Login como: carlos.silva@minervaengenharia.com.br (Nível 4 - DIRETORIA)
   → Ver: 7 itens (completo)
```

### Teste 4: Preview de Menu
```
1. Login com qualquer usuário
2. Navegar: Menu Debug → "Preview de Menu"
3. Selecionar: Cada perfil nos botões
4. Observar: 
   - Lista verde (itens visíveis)
   - Lista vermelha (itens ocultos)
   - Estatísticas (total, visíveis, ocultos)
5. Verificar: Documentação de regras na parte inferior
```

---

## 📊 Matriz de Visibilidade Resumida

| Item Menu | DIR | GST | COL | MOB |
|-----------|-----|-----|-----|-----|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Projetos/OS | ✅ | ✅ | ✅ | ❌ |
| Financeiro | ✅ | ✅ | ❌ | ❌ |
| Colaboradores | ✅ | ✅ | ❌ | ❌ |
| Clientes | ✅ | ✅ | ✅ | ❌ |
| Calendário | ✅ | ✅ | ✅ | ❌ |
| Configurações | ✅ | ✅ | ❌ | ❌ |

**Legenda:**
- DIR = Diretoria
- GST = Gestores (todos)
- COL = Colaboradores (todos)
- MOB = Mão de Obra

---

## 💡 Dicas para Testes

1. **Limpar Cache:** Se o menu não atualizar, limpe o localStorage
2. **Modo Debug:** Itens de Debug sempre visíveis para todos
3. **Logout/Login:** Use o botão de logout no header para trocar de usuário
4. **Navegação:** Tente acessar páginas ocultas via URL (deve redirecionar)
5. **Submenus:** Se item pai é visível, todos os filhos aparecem (sem filtro individual)

---

## 🔍 Observações Importantes

- ✅ **Senha:** Qualquer valor é aceito em modo desenvolvimento
- ✅ **Persistência:** Usuário persiste após reload (salvo no localStorage)
- ✅ **Segurança:** Em produção, integrar com Supabase Auth para validação real
- ✅ **Fallback:** Se logout, menu mostra todos os itens (modo desenvolvimento)

---

**Arquivo de Referência:** `/lib/mock-data.ts` (linha ~280)  
**Documentação Completa:** `/FLUXO_16_MENU_PERFIL_COLABORADOR.md`
