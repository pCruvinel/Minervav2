# Padrões de Query Supabase - Minerva v2

Este documento define os padrões recomendados para queries no Supabase, garantindo performance e evitando problemas de N+1.

## 📚 Índice

1. [Princípios Gerais](#princípios-gerais)
2. [Padrão: Buscar Ordens de Serviço](#padrão-buscar-ordens-de-serviço)
3. [Padrão: Buscar Colaboradores](#padrão-buscar-colaboradores)
4. [Padrão: Buscar Delegações](#padrão-buscar-delegações)
5. [Evitar N+1 Queries](#evitar-n1-queries)

---

## Princípios Gerais

### ✅ FAZER:
- Sempre usar `.select()` com relacionamentos via `tabela_relacionada(*)`
- Filtrar no banco com `.eq()`, `.in()`, etc., não no JavaScript
- Usar `.single()` quando esperar um único resultado
- Nomear aliases com `campo:tabela_relacionada(*)`

### ❌ NÃO FAZER:
- Múltiplas queries sequenciais quando JOIN resolve
- Filtrar arrays no JavaScript quando o banco pode filtrar
- Buscar dados relacionados em loops

---

## Padrão: Buscar Ordens de Serviço

### ✅ Query Recomendada (COM JOINs)

```typescript
const { data: ordensServico, error } = await supabase
  .from('ordens_servico')
  .select(`
    *,
    cliente:clientes(id, nome_razao_social),
    tipo_os:tipos_os(id, codigo, nome, setor_padrao),
    responsavel:colaboradores!ordens_servico_responsavel_id_fkey(
      id,
      nome_completo,
      cargo:cargos(slug, nome),
      setor:setores(slug, nome)
    ),
    criado_por:colaboradores!ordens_servico_criado_por_id_fkey(
      id,
      nome_completo
    )
  `)
  .eq('status_geral', 'em_andamento')
  .order('created_at', { ascending: false });
```

**Resultado**: 1 query que retorna tudo, incluindo dados relacionados.

---

### ❌ Query Incorreta (Sem JOINs - Problema N+1)

```typescript
// ❌ NÃO FAZER ISSO
const { data: ordensServico } = await supabase
  .from('ordens_servico')
  .select('*')
  .eq('status_geral', 'em_andamento');

// Para cada OS, buscar cliente separadamente (N+1 problem!)
for (const os of ordensServico) {
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', os.cliente_id)
    .single();

  os.cliente = cliente; // ❌ Péssima performance!
}
```

**Problema**: Se houver 100 OSs, serão feitas 101 queries (1 + 100).

---

## Padrão: Buscar Colaboradores

### ✅ Query com Cargo e Setor

```typescript
const { data: colaboradores, error } = await supabase
  .from('colaboradores')
  .select(`
    *,
    cargo:cargos(id, slug, nome, nivel_acesso),
    setor:setores(id, slug, nome)
  `)
  .eq('ativo', true)
  .order('nome_completo');
```

**Uso no código:**

```typescript
colaboradores.forEach(user => {
  console.log(user.nome_completo);
  console.log(user.cargo.slug); // 'gestor_obras'
  console.log(user.setor.nome); // 'Obras'
});
```

---

## Padrão: Buscar Delegações

### ✅ Query Completa com Relacionamentos

```typescript
const { data: delegacoes, error } = await supabase
  .from('delegacoes')
  .select(`
    *,
    os:ordens_servico(
      id,
      codigo_os,
      descricao,
      status_geral,
      tipo_os:tipos_os(nome)
    ),
    delegante:colaboradores!delegacoes_delegante_id_fkey(
      id,
      nome_completo
    ),
    delegado:colaboradores!delegacoes_delegado_id_fkey(
      id,
      nome_completo,
      cargo:cargos(slug)
    )
  `)
  .eq('status_delegacao', 'pendente')
  .order('created_at', { ascending: false });
```

---

## Evitar N+1 Queries

### Exemplo Real: Dashboard com Métricas

#### ❌ Forma Errada (N+1)

```typescript
// Buscar todas as OSs
const { data: osLista } = await supabase
  .from('ordens_servico')
  .select('*');

// Para cada OS, buscar tipo (N queries!)
const osComTipo = await Promise.all(
  osLista.map(async (os) => {
    const { data: tipo } = await supabase
      .from('tipos_os')
      .select('nome')
      .eq('id', os.tipo_os_id)
      .single();
    return { ...os, tipo_nome: tipo.nome };
  })
);
```

**Problema**: 1 + N queries (muito lento).

---

#### ✅ Forma Correta (1 Query)

```typescript
const { data: osLista } = await supabase
  .from('ordens_servico')
  .select(`
    *,
    tipo_os:tipos_os(nome, setor_padrao)
  `);

// Acessar diretamente
osLista.forEach(os => {
  console.log(os.tipo_os.nome); // Já disponível!
});
```

**Resultado**: 1 query apenas.

---

## Nomenclatura de Foreign Keys

Quando há múltiplas FKs para a mesma tabela, use `!nome_da_constraint`:

```typescript
responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*)
criado_por:colaboradores!ordens_servico_criado_por_id_fkey(*)
```

---

## Filtros Compostos

### ✅ Filtrar no Banco

```typescript
const { data } = await supabase
  .from('ordens_servico')
  .select('*, cliente:clientes(nome_razao_social)')
  .eq('status_geral', 'em_andamento')
  .in('tipo_os_id', ['uuid1', 'uuid2'])
  .gte('data_entrada', '2024-01-01')
  .order('data_prazo');
```

### ❌ Filtrar no JavaScript

```typescript
// ❌ NÃO FAZER
const { data: todas } = await supabase
  .from('ordens_servico')
  .select('*');

const filtradas = todas.filter(os =>
  os.status_geral === 'em_andamento' &&
  ['uuid1', 'uuid2'].includes(os.tipo_os_id)
);
```

**Problema**: Transfere dados desnecessários da rede.

---

## Referências

- [Supabase Joins Documentation](https://supabase.com/docs/guides/api/joins-and-nested-tables)
- `docs/guides/DATABASE_SCHEMA` - Schema do banco Minerva
