# Guia: Aplicar Migrations do Sistema de Calendário

## 📋 Migrations Criadas

1. **create_calendario_tables.sql** - Schema completo (tabelas, índices, RLS, funções)
2. **seed_calendario_data.sql** - Dados iniciais de exemplo

## 🚀 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/create_calendario_tables.sql`
5. Cole no editor e clique em **RUN**
6. Aguarde a confirmação de sucesso
7. Repita os passos 4-6 para `seed_calendario_data.sql`

### Opção 2: Via Supabase CLI

```bash
# 1. Aplicar a migration principal
supabase db execute --file supabase/migrations/create_calendario_tables.sql

# 2. Aplicar o seed de dados
supabase db execute --file supabase/migrations/seed_calendario_data.sql
```

### Opção 3: Via MCP Tool (se disponível)

```typescript
// Usar o mcp__supabase__apply_migration
mcp__supabase__apply_migration({
  project_id: "zlvhahmwmlclhlwlchoc",
  name: "create_calendario_tables",
  query: "<conteúdo do arquivo SQL>"
});
```

## ✅ Verificação Pós-Migration

Execute as seguintes queries para verificar se tudo foi criado corretamente:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('turnos', 'agendamentos');

-- 2. Contar turnos criados
SELECT COUNT(*) as total_turnos FROM turnos WHERE ativo = true;

-- 3. Contar agendamentos criados
SELECT COUNT(*) as total_agendamentos FROM agendamentos WHERE status = 'confirmado';

-- 4. Testar função de disponibilidade
SELECT * FROM obter_turnos_disponiveis(CURRENT_DATE);

-- 5. Verificar RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('turnos', 'agendamentos');
```

## 📊 Resultados Esperados

Após aplicar as migrations com sucesso, você deve ter:

- ✅ 2 tabelas criadas: `turnos` e `agendamentos`
- ✅ 7 índices para otimização
- ✅ 2 triggers para timestamps automáticos
- ✅ 6 RLS policies para segurança
- ✅ 2 funções auxiliares SQL
- ✅ 5 turnos de exemplo (após seed)
- ✅ 6 agendamentos de exemplo (após seed)

## 🔧 Troubleshooting

### Erro: "table colaboradores does not exist"
```sql
-- Verificar se a tabela colaboradores existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'colaboradores'
);
```

### Erro: "table ordens_servico does not exist"
A migration está preparada para isso. A FK `os_id` é opcional e pode ser NULL.

### Erro: "permission denied"
Certifique-se de estar logado como admin ou com as permissões adequadas no Supabase.

## 🎯 Próximos Passos

Após aplicar as migrations:

1. ✅ Testar criação de turnos via interface
2. ✅ Testar criação de agendamentos via interface
3. ✅ Validar regras de negócio (vagas, conflitos)
4. ✅ Verificar feedback visual (loading states)
