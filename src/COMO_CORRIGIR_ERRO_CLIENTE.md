# 🚨 ERRO: "invalid input value for enum cliente_status"

## ⚡ SOLUÇÃO RÁPIDA (2 minutos)

### **Passo 1: Acesse o Supabase**
```
🌐 https://supabase.com/dashboard
→ Selecione seu projeto
→ Clique em "SQL Editor"
→ Clique em "New query"
```

### **Passo 2: Copie e Execute o Script**
```sql
-- Criar ENUM se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cliente_status') THEN
    CREATE TYPE cliente_status AS ENUM (
      'LEAD',
      'CLIENTE_ATIVO',
      'CLIENTE_INATIVO'
    );
  END IF;
END $$;

-- Verificar se criou corretamente
SELECT enumlabel as valor
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;
```

### **Passo 3: Recarregue o App**
```
F5 ou Ctrl+R
```

---

## ✅ Resultado Esperado

Você deve ver no resultado da query:
```
LEAD
CLIENTE_ATIVO
CLIENTE_INATIVO
```

---

## 🔧 Se Ainda Não Funcionar

### **Cenário: ENUM existe mas está errado**

Execute este script:

```sql
-- 1. Converter coluna para TEXT temporariamente
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT;

-- 2. Dropar ENUM antigo
DROP TYPE IF EXISTS cliente_status CASCADE;

-- 3. Criar ENUM correto
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- 4. Restaurar tipo da coluna
ALTER TABLE clientes 
ALTER COLUMN status 
TYPE cliente_status 
USING status::cliente_status;

-- 5. Definir valor padrão
ALTER TABLE clientes 
ALTER COLUMN status 
SET DEFAULT 'LEAD'::cliente_status;

-- 6. Verificar
SELECT DISTINCT status FROM clientes;
```

---

## 📊 Verificação Final

Execute para conferir tudo:

```sql
-- Ver valores do ENUM
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status';

-- Ver clientes no banco
SELECT nome_razao_social, status, tipo_cliente
FROM clientes
LIMIT 5;
```

---

## 🎯 O Que Foi Corrigido

**Antes (Errado):**
```sql
❌ "Cliente Ativo"  (com espaços e minúsculas)
❌ "Lead"           (minúscula)
```

**Depois (Correto):**
```sql
✅ LEAD
✅ CLIENTE_ATIVO
✅ CLIENTE_INATIVO
```

---

## 📚 Mais Detalhes

- **Script completo:** `/FIX_CLIENTE_STATUS_ENUM.sql`
- **Documentação:** `/FIX_CLIENTE_STATUS_README.md`
- **Todos os ENUMs:** `/ENUM_DEFINICOES_SISTEMA.md`

---

**Tempo estimado:** 2-3 minutos  
**Dificuldade:** Baixa  
**Risco:** Nenhum (script idempotente)
