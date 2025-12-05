# Correção da Política RLS da Tabela Notificações

## Problema Identificado

Ao concluir a OS-09 na etapa 2, ocorrem erros 403 ao tentar carregar notificações, com a seguinte mensagem de erro:

```
new row violates row-level security policy for table "notificacoes"
```

## Causa

A política RLS de INSERT na tabela `notificacoes` usa `auth.role() = 'authenticated'`, que pode não funcionar corretamente em todos os contextos de autenticação do Supabase.

## Solução

### 1. Criar Nova Migration SQL

Criar o arquivo `supabase/migrations/20251205_fix_notifications_rls.sql`:

```sql
-- Migration: Corrigir política RLS da tabela notificacoes
-- Data: 2025-12-05
-- Descrição: Ajustar política de INSERT para usar auth.uid() ao invés de auth.role()

BEGIN;

-- Remover política antiga
DROP POLICY IF EXISTS "Users can create notifications" ON public.notificacoes;

-- Criar nova política mais robusta
CREATE POLICY "Users can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;
```

### 2. Executar a Migration

✅ **CORREÇÃO APLICADA**

A migration foi aplicada diretamente no banco de dados via SQL:

```sql
DROP POLICY IF EXISTS "Users can create notifications" ON public.notificacoes;
CREATE POLICY "Users can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**Status:** Política RLS corrigida com sucesso.

## Verificação

### ✅ Verificação Realizada

**Política RLS Atual:**
```sql
CREATE POLICY "Users can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**Status:** ✅ Política corrigida e aplicada com sucesso.

### Testes a Realizar

1. **Tentar concluir uma OS-09 novamente**
   - Acessar OS-09 na etapa 2
   - Anexar 3 orçamentos
   - Clicar em "Concluir OS"
   - Verificar se não há mais erros 403/400

2. **Verificar se os erros 403 nas notificações foram resolvidos**
   - Verificar no console do navegador
   - Confirmar que não há mais mensagens de erro RLS

3. **Confirmar que notificações podem ser criadas normalmente**
   - Testar criação de notificações via delegação
   - Verificar se o NotificationBell funciona corretamente

## Contexto Adicional

- A etapa 2 da OS-09 requer exatamente 3 orçamentos anexados
- O erro ocorria durante a finalização do workflow
- Componentes como `NotificationBell` e `RecentNotificationsWidget` fazem requisições automáticas para notificações
- A política anterior funcionava em alguns contextos mas falhava em outros