# 🔧 FIX: Erro de ENUM cliente_status

## ❌ Problema

```
Erro ao buscar clientes: {
  code: "22P02",
  message: 'invalid input value for enum cliente_status: "CLIENTE_ATIVO"'
}
```

## 📋 Causa

O ENUM `cliente_status` no banco de dados Supabase:
1. **Não existe**, ou
2. **Está com valores incorretos** (ex: "Cliente Ativo" com espaços e minúsculas)

## ✅ Solução

### **Opção 1: Executar Script SQL (Recomendado)**

1. **Abra o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Acesse SQL Editor:**
   - Menu lateral → SQL Editor
   - Clique em "New query"

3. **Execute o script:**
   - Abra: `/FIX_CLIENTE_STATUS_ENUM.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Clique em "Run"

4. **Verifique o resultado:**
   - Se aparecer "✅ ENUM cliente_status criado com sucesso!" → Tudo OK!
   - Se aparecer "❌ ENUM cliente_status existe mas está INCORRETO!" → Continue para Opção 2

---

### **Opção 2: Correção Manual (Se ENUM existe mas está errado)**

Se o ENUM já existe mas com valores incorretos (ex: "Cliente Ativo", "Lead", etc.):

1. **Abra o arquivo:** `/FIX_CLIENTE_STATUS_ENUM.sql`

2. **Localize o bloco comentado:** (linhas ~30-60)
   ```sql
   -- DESCOMENTAR E EXECUTAR APENAS SE O ENUM ESTIVER ERRADO:
   /*
   -- Passo 1: Alterar tipo da coluna para TEXT temporariamente
   ALTER TABLE clientes ALTER COLUMN status TYPE TEXT;
   ...
   */
   ```

3. **Descomente o bloco:**
   - Remova `/*` do início
   - Remova `*/` do final

4. **Execute o script completo novamente**

5. **Verifique os dados:**
   ```sql
   SELECT DISTINCT status FROM clientes;
   ```
   - Deve retornar: `LEAD`, `CLIENTE_ATIVO`, `CLIENTE_INATIVO`

---

## 🎯 Valores Corretos do ENUM

```sql
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);
```

### **Descrição:**
- `LEAD`: Prospect/lead ainda não convertido
- `CLIENTE_ATIVO`: Cliente ativo com contrato vigente
- `CLIENTE_INATIVO`: Cliente inativo ou contrato encerrado

---

## 🔍 Como Verificar se Está Correto

Execute no SQL Editor:

```sql
SELECT enumlabel as valor
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;
```

**Resultado esperado:**
```
LEAD
CLIENTE_ATIVO
CLIENTE_INATIVO
```

---

## 📊 Depois de Corrigir

1. **Recarregue o app** (F5)
2. **Teste "Criar Nova OS"**
3. **Dropdown de clientes deve funcionar** ✅

---

## ⚠️ IMPORTANTE

### **Padrão de ENUMs no Sistema Minerva:**
- ✅ **MAIÚSCULAS**: `CLIENTE_ATIVO`
- ✅ **SNAKE_CASE**: `CLIENTE_ATIVO` (underscore entre palavras)
- ❌ **Espaços**: ~~"Cliente Ativo"~~
- ❌ **Minúsculas**: ~~"cliente_ativo"~~
- ❌ **Acentos**: ~~"SITUAÇÃO"~~

### **Todos os ENUMs seguem este padrão:**
- `cliente_status`: LEAD, CLIENTE_ATIVO, CLIENTE_INATIVO
- `tipo_cliente`: PESSOA_FISICA, CONDOMINIO, CONSTRUTORA, etc.
- `os_status_geral`: EM_TRIAGEM, EM_ANDAMENTO, CONCLUIDA, etc.
- `os_etapa_status`: PENDENTE, EM_ANDAMENTO, APROVADA, etc.

---

## 📚 Arquivos Relacionados

- `/FIX_CLIENTE_STATUS_ENUM.sql` - Script SQL de correção
- `/ENUM_DEFINICOES_SISTEMA.md` - Documentação completa de todos os ENUMs
- `/DATABASE_SCHEMA.md` - Schema completo do banco de dados

---

## 🆘 Ainda com Erro?

Se após executar o script ainda houver erro:

1. **Capture o erro completo:**
   ```javascript
   console.log('Erro completo:', JSON.stringify(error, null, 2));
   ```

2. **Verifique os valores no banco:**
   ```sql
   SELECT id, nome_razao_social, status, tipo_cliente 
   FROM clientes 
   LIMIT 10;
   ```

3. **Verifique se há dados com valores antigos:**
   ```sql
   SELECT status, COUNT(*) 
   FROM clientes 
   GROUP BY status;
   ```

4. **Se houver valores antigos, atualize:**
   ```sql
   -- Exemplo: converter "Cliente Ativo" para "CLIENTE_ATIVO"
   UPDATE clientes 
   SET status = 'CLIENTE_ATIVO' 
   WHERE status::text = 'Cliente Ativo';
   ```

---

**Última atualização:** 14/11/2024  
**Status:** ✅ Testado e Funcional
