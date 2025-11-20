# ⚡ Início Rápido - Migrations em 5 Passos

**Tempo:** 15 minutos | **Dificuldade:** Fácil

---

## 🎯 O Que Você Vai Fazer

1. Copiar/colar 4 SQLs no Supabase
2. Criar 6 usuários manualmente
3. Testar login

---

## 📍 Links Importantes

**SQL Editor:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/sql/new

**Authentication:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

---

## ✅ Passo 1: Delegações (30s)

1. Abra: `supabase/migrations/create_delegacoes_table.sql`
2. Ctrl+A, Ctrl+C
3. Cole no SQL Editor
4. Run

**Verificar:**
```sql
SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'delegacoes';
```
Esperado: 13

---

## ✅ Passo 2: IDs dos Colaboradores (15s)

1. Abra: `supabase/migrations/seed_auth_users_CORRIGIDO.sql`
2. Ctrl+A, Ctrl+C
3. Cole no SQL Editor (delete SQL anterior)
4. Run

**Verificar:**
```sql
SELECT COUNT(*) FROM colaboradores WHERE email LIKE '%@minervaestrutura.com.br';
```
Esperado: 6

---

## ✅ Passo 3: Criar Usuários (10min)

**Acesse:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

Para cada usuário abaixo:
1. "Add user" → "Create new user"
2. Cole email e password
3. ☑️ Marque "Auto Confirm User"
4. Expanda "Advanced"
5. Cole User UID
6. Create

### Usuários:

```
1. carlos.diretor@minervaestrutura.com.br / minerva123 / user-dir-001
2. pedro.gestorcomercial@minervaestrutura.com.br / minerva123 / user-gcom-001
3. maria.gestorassessoria@minervaestrutura.com.br / minerva123 / user-gass-001
4. joao.gestorobras@minervaestrutura.com.br / minerva123 / user-gobr-001
5. ana.colabc@minervaestrutura.com.br / minerva123 / user-ccom-001
6. bruno.colaba@minervaestrutura.com.br / minerva123 / user-cass-001
```

**Verificar:**
```sql
SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@minervaestrutura.com.br';
```
Esperado: 6

---

## ✅ Passo 4: Calendário (45s)

1. Abra: `supabase/migrations/create_calendario_tables.sql`
2. Ctrl+A, Ctrl+C
3. Cole no SQL Editor
4. Run

**Verificar:**
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('turnos', 'agendamentos');
```
Esperado: 2

---

## ✅ Passo 5: Dados Exemplo [OPCIONAL] (15s)

1. Abra: `supabase/migrations/seed_calendario_data.sql`
2. Ctrl+A, Ctrl+C
3. Cole no SQL Editor
4. Run

**Verificar:**
```sql
SELECT COUNT(*) FROM turnos WHERE ativo = true;
```
Esperado: 5

---

## 🎉 Pronto!

**Testar login:**
- Email: `carlos.diretor@minervaestrutura.com.br`
- Senha: `minerva123`

---

## 📚 Documentação Completa

Se algo der errado, consulte:
- `EXECUTAR_AGORA.md` - Guia detalhado
- `CHECKLIST_MIGRATIONS.md` - Checklist imprimível
- `CRIAR_USUARIOS_AUTH.md` - Guia de usuários

---

**Versão:** 1.0 | **Projeto:** Minerva v2
