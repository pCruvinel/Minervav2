# 👥 Como Criar Usuários no Supabase Auth - Guia Passo a Passo

**Tempo estimado:** 10 minutos
**Método:** Via Supabase Dashboard (Interface Visual)

---

## ⚠️ Por Que Via Dashboard?

O Supabase **NÃO permite** criar usuários em `auth.users` via SQL público por segurança. Existem 3 formas de criar:

1. ✅ **Dashboard** (Recomendado) - Interface visual, fácil
2. ⚙️ **Management API** - Requer API Key de serviço
3. 📱 **Signup público** - Via formulário de cadastro do app

Vamos usar o **Dashboard** por ser mais rápido e seguro.

---

## 📋 Pré-requisitos

1. Execute primeiro: `supabase/migrations/seed_auth_users_CORRIGIDO.sql`
   - Isso atualiza os IDs dos colaboradores
   - Garante sincronização futura

---

## 🚀 Passo a Passo

### Passo 1: Acessar Authentication

1. Abra: **https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb**
2. No menu lateral, clique em **Authentication**
3. Clique na aba **Users**
4. Você verá a lista de usuários (provavelmente vazia)

---

### Passo 2: Criar Usuário 1 - Diretoria

1. Clique no botão **"Add user"** (canto superior direito)
2. Selecione **"Create new user"**
3. Preencha o formulário:

```
Email: carlos.diretor@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User (marcar esta opção!)
```

4. **IMPORTANTE:** Antes de clicar em Create, expanda **"Advanced"**
5. No campo **User UID**, cole: `user-dir-001`
6. Clique em **"Create user"**
7. ✅ Usuário criado!

---

### Passo 3: Criar Usuário 2 - Gestor Comercial

Repita o processo:

```
Email: pedro.gestorcomercial@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID (Advanced): user-gcom-001
```

---

### Passo 4: Criar Usuário 3 - Gestor Assessoria

```
Email: maria.gestorassessoria@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID (Advanced): user-gass-001
```

---

### Passo 5: Criar Usuário 4 - Gestor Obras

```
Email: joao.gestorobras@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID (Advanced): user-gobr-001
```

---

### Passo 6: Criar Usuário 5 - Colaborador Comercial

```
Email: ana.colabc@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID (Advanced): user-ccom-001
```

---

### Passo 7: Criar Usuário 6 - Colaborador Assessoria

```
Email: bruno.colaba@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID (Advanced): user-cass-001
```

---

## ✅ Verificação

### Verificar na Interface

Você deve ver **6 usuários** na lista:
- ✉️ 6 emails com domínio `@minervaestrutura.com.br`
- ✅ Todos com status "Confirmed"
- 🆔 Cada um com User ID específico

### Verificar via SQL

No **SQL Editor**, execute:

```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  c.nome_completo,
  c.role_nivel,
  c.setor
FROM auth.users u
INNER JOIN public.colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'
ORDER BY c.role_nivel DESC;
```

**Resultado esperado:** 6 linhas mostrando:
- ID do usuário
- Email
- Data de confirmação
- Nome completo (do colaborador)
- Role (DIRETORIA, GESTOR_*, COLABORADOR_*)
- Setor (ASS, COM, OBR)

Se retornou 6 linhas: **✅ SUCESSO!**

---

## 📊 Resumo dos Usuários Criados

| Email | Senha | User ID | Role | Setor |
|-------|-------|---------|------|-------|
| carlos.diretor@minervaestrutura.com.br | minerva123 | user-dir-001 | DIRETORIA | ASS |
| pedro.gestorcomercial@minervaestrutura.com.br | minerva123 | user-gcom-001 | GESTOR_COMERCIAL | COM |
| maria.gestorassessoria@minervaestrutura.com.br | minerva123 | user-gass-001 | GESTOR_ASSESSORIA | ASS |
| joao.gestorobras@minervaestrutura.com.br | minerva123 | user-gobr-001 | GESTOR_OBRAS | OBR |
| ana.colabc@minervaestrutura.com.br | minerva123 | user-ccom-001 | COLABORADOR_COMERCIAL | COM |
| bruno.colaba@minervaestrutura.com.br | minerva123 | user-cass-001 | COLABORADOR_ASSESSORIA | ASS |

---

## 🧪 Testar Login

Após criar os usuários:

1. Abra o sistema Minerva v2
2. Vá para a página de login
3. Teste com qualquer usuário acima
4. Exemplo:
   - Email: `carlos.diretor@minervaestrutura.com.br`
   - Senha: `minerva123`
5. ✅ Deve fazer login com sucesso!

---

## 🐛 Troubleshooting

### Erro: "Email já está em uso"
**Causa:** Usuário já foi criado antes
**Solução:** Pule para o próximo ou delete o existente

### Erro: "User UID já existe"
**Causa:** ID já está sendo usado
**Solução:** Verifique se o colaborador tem o ID correto no banco

### Erro: "Colaborador não encontrado" ao fazer login
**Causa:** IDs não correspondem entre `auth.users` e `colaboradores`
**Solução:** Execute o SQL corrigido novamente para atualizar IDs

### SQL de verificação retorna 0 linhas
**Causa:** IDs não batem ou colaboradores não existem
**Solução:**
1. Verifique se colaboradores existem: `SELECT * FROM colaboradores WHERE email LIKE '%@minerva%'`
2. Execute `seed_auth_users_CORRIGIDO.sql` novamente
3. Recrie os usuários com os IDs corretos

---

## 🎯 Próximos Passos

Após criar todos os usuários:

1. ✅ Testar login no sistema
2. ✅ Implementar métodos auth no `auth-context.tsx`
3. ✅ Configurar RLS policies
4. ✅ Testar delegação de tarefas

---

## 📝 Alternativa: Script Automático (Avançado)

Se você tem a **Service Role Key** do Supabase, pode usar um script:

```javascript
// Requer: SUPABASE_SERVICE_ROLE_KEY
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zxfevlkssljndqqhxkjb.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // ⚠️ Nunca commitar esta key!
);

async function createUser(email, password, uid) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { uid }
  });

  if (error) console.error(error);
  else console.log(`✅ ${email} criado`);
}

// Criar todos os usuários
await createUser('carlos.diretor@minervaestrutura.com.br', 'minerva123', 'user-dir-001');
// ... etc
```

**Nota:** Este método requer a **Service Role Key** que é confidencial.

---

**Boa sorte na criação dos usuários! 🚀**
