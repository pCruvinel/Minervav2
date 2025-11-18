# 🚀 COMANDOS PRONTOS - Execute Agora

**Copie e cole estes comandos diretamente no Supabase Dashboard**

---

## 📍 ACESSE O SQL EDITOR

**URL:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/sql/new

---

## ✅ COMANDO 1: Criar Sistema de Delegações

**Copie este caminho do arquivo:**
```
supabase/migrations/create_delegacoes_table.sql
```

**Abra o arquivo no VS Code e copie TODO o conteúdo**

**Depois execute no SQL Editor**

**Verificação (copie e cole):**
```sql
SELECT COUNT(*) as colunas FROM information_schema.columns WHERE table_name = 'delegacoes';
```
✅ Esperado: 13

---

## ✅ COMANDO 2: Preparar Colaboradores

**Copie este caminho do arquivo:**
```
supabase/migrations/seed_auth_users_CORRIGIDO.sql
```

**Abra o arquivo no VS Code e copie TODO o conteúdo**

**Depois execute no SQL Editor**

**Verificação (copie e cole):**
```sql
SELECT id, email, nome_completo FROM colaboradores WHERE email LIKE '%@minervaestrutura.com.br' ORDER BY role_nivel DESC;
```
✅ Esperado: 6 linhas

---

## ✅ COMANDO 3: Criar Usuários Auth [VIA DASHBOARD]

**ATENÇÃO: Não é SQL! Fazer via interface gráfica**

**Acesse:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

**Clique em "Add user" 6 vezes, um para cada:**

### Copie e cole estes dados:

**Usuário 1:**
```
Email: carlos.diretor@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-dir-001
☑️ Auto Confirm User
```

**Usuário 2:**
```
Email: pedro.gestorcomercial@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-gcom-001
☑️ Auto Confirm User
```

**Usuário 3:**
```
Email: maria.gestorassessoria@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-gass-001
☑️ Auto Confirm User
```

**Usuário 4:**
```
Email: joao.gestorobras@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-gobr-001
☑️ Auto Confirm User
```

**Usuário 5:**
```
Email: ana.colabc@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-ccom-001
☑️ Auto Confirm User
```

**Usuário 6:**
```
Email: bruno.colaba@minervaestrutura.com.br
Password: minerva123
User UID (em Advanced): user-cass-001
☑️ Auto Confirm User
```

**Verificação (volte ao SQL Editor):**
```sql
SELECT COUNT(*) as total FROM auth.users WHERE email LIKE '%@minervaestrutura.com.br';
```
✅ Esperado: 6

---

## ✅ COMANDO 4: Criar Sistema de Calendário

**Copie este caminho do arquivo:**
```
supabase/migrations/create_calendario_tables.sql
```

**Abra o arquivo no VS Code e copie TODO o conteúdo**

**Depois execute no SQL Editor**

**Verificação (copie e cole):**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name IN ('turnos', 'agendamentos');
```
✅ Esperado: 2 linhas

---

## ✅ COMANDO 5: Popular Dados Exemplo [OPCIONAL]

**Copie este caminho do arquivo:**
```
supabase/migrations/seed_calendario_data.sql
```

**Abra o arquivo no VS Code e copie TODO o conteúdo**

**Depois execute no SQL Editor**

**Verificação (copie e cole):**
```sql
SELECT (SELECT COUNT(*) FROM turnos WHERE ativo = true) as turnos, (SELECT COUNT(*) FROM agendamentos WHERE status = 'confirmado') as agendamentos;
```
✅ Esperado: turnos: 5, agendamentos: 6

---

## ✅ VERIFICAÇÃO FINAL

**Copie e cole este SQL:**

```sql
SELECT
  'Tabelas Criadas' as item,
  COUNT(*)::text as valor
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('delegacoes', 'turnos', 'agendamentos')

UNION ALL

SELECT 'Usuários Auth', COUNT(*)::text
FROM auth.users
WHERE email LIKE '%@minervaestrutura.com.br'

UNION ALL

SELECT 'Turnos Ativos', COUNT(*)::text
FROM turnos WHERE ativo = true

UNION ALL

SELECT 'Agendamentos', COUNT(*)::text
FROM agendamentos

UNION ALL

SELECT 'Políticas RLS', COUNT(*)::text
FROM pg_policies
WHERE tablename IN ('delegacoes', 'turnos', 'agendamentos');
```

**✅ Resultado esperado:**
```
Tabelas Criadas: 3
Usuários Auth: 6
Turnos Ativos: 5
Agendamentos: 6
Políticas RLS: 13
```

---

## 🎉 PRONTO!

**Teste de Login:**
- URL: http://localhost:3000 (ou onde seu app roda)
- Email: `carlos.diretor@minervaestrutura.com.br`
- Senha: `minerva123`

---

## 📞 Se der erro, rode este debug:

```sql
-- Ver quais tabelas existem
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Ver quantos usuários auth existem
SELECT id, email FROM auth.users;

-- Ver quantos colaboradores existem
SELECT id, email, nome_completo FROM colaboradores;
```

---

**Tempo total:** 15-20 minutos
**Dificuldade:** Fácil
**Método:** Copiar/Colar
