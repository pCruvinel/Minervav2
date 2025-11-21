# Guia de Correção de Tipos - Backend & Integridade TypeScript

Este guia fornece instruções passo a passo para corrigir as inconsistências entre os ENUMs do banco de dados Supabase e os tipos TypeScript.

## Arquivos Criados

### 1. Migração SQL Consolidada
- **Arquivo**: `supabase/migrations/20251121000014_consolidate_all_enums.sql`
- **Função**: Consolida TODOS os arquivos FIX_*.sql em uma única migração
- **ENUMs corrigidos**:
  - `cliente_status`
  - `tipo_cliente`
  - `os_status_geral`
  - `os_etapa_status`
  - `agendamento_status`
  - `presenca_status`
  - `performance_avaliacao`
  - `financeiro_tipo`
  - `cc_tipo`

### 2. Script de Atualização de Tipos
- **Arquivo**: `package.json` → script `update-types`
- **Comando**: `npm run update-types`
- **Função**: Gera automaticamente os tipos TypeScript a partir do schema do banco

### 3. Utilitário de Mapeamento de Tipos
- **Arquivo**: `src/lib/types-mapper.ts`
- **Função**: Fornece funções seguras de conversão de tipos com fallbacks
- **Exemplo de uso**:
  ```typescript
  import { safeClienteStatus, safeTipoCliente } from '@/lib/types-mapper';

  // Converter string do banco para tipo seguro
  const status = safeClienteStatus(rawStatus); // Retorna 'LEAD' se inválido
  const tipo = safeTipoCliente(rawTipo); // Retorna 'OUTRO' se inválido
  ```

## Passo a Passo para Aplicar as Correções

### Passo 1: Aplicar a Migração no Supabase

Você tem duas opções:

#### Opção A: Via Supabase Dashboard (RECOMENDADO)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `zxfevlkssljndqqhxkjb`
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Abra o arquivo `supabase/migrations/20251121000014_consolidate_all_enums.sql`
6. Copie TODO o conteúdo do arquivo
7. Cole no SQL Editor
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde 10-20 segundos para a execução
10. Verifique se aparece a mensagem de sucesso

#### Opção B: Via Supabase CLI (Avançado)

```bash
# 1. Login no Supabase
npx supabase login

# 2. Link ao projeto remoto
npx supabase link --project-ref zxfevlkssljndqqhxkjb

# 3. Aplicar a migração
npx supabase db push

# 4. Confirmar que a migração foi aplicada
npx supabase db remote commit
```

### Passo 2: Atualizar os Tipos TypeScript

Após aplicar a migração no banco:

```bash
# Execute o comando de atualização de tipos
npm run update-types
```

Este comando irá:
1. Conectar ao seu projeto Supabase remoto
2. Extrair o schema atualizado do banco de dados
3. Gerar os tipos TypeScript em `src/types/supabase.ts`
4. Sobrescrever o arquivo anterior

### Passo 3: Verificar as Mudanças

1. Abra o arquivo `src/types/supabase.ts`
2. Procure pela seção `Enums`
3. Verifique se os valores estão corretos:

```typescript
Enums: {
  cliente_status: "LEAD" | "CLIENTE_ATIVO" | "CLIENTE_INATIVO"
  tipo_cliente: "PESSOA_FISICA" | "CONDOMINIO" | "CONSTRUTORA" | "INCORPORADORA" | "INDUSTRIA" | "COMERCIO" | "OUTRO"
  os_status_geral: "EM_TRIAGEM" | "AGUARDANDO_INFORMACOES" | "EM_ANDAMENTO" | "EM_VALIDACAO" | "ATRASADA" | "CONCLUIDA" | "CANCELADA" | "PAUSADA" | "AGUARDANDO_CLIENTE"
  // ... etc
}
```

### Passo 4: Testar a Aplicação

1. Recarregue o VS Code para atualizar o IntelliSense:
   - Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
   - Digite "Reload Window"
   - Pressione Enter

2. Verifique se os erros de tipo desapareceram:
   - Abra arquivos que usam ENUMs (ex: páginas de clientes, OS)
   - Verifique se não há mais linhas vermelhas de erro

3. Execute o build do projeto:
   ```bash
   npm run build
   ```

4. Execute os testes:
   ```bash
   npm test
   ```

## Checklist de Validação

Use este checklist para verificar se tudo está funcionando:

- [ ] **Migração aplicada**: A migração SQL foi executada sem erros no Supabase Dashboard
- [ ] **Comando `update-types` executado**: O comando `npm run update-types` rodou sem erros
- [ ] **Arquivo `supabase.ts` atualizado**: O arquivo `src/types/supabase.ts` foi modificado recentemente
- [ ] **VS Code sem erros**: Não há mais erros de tipo relacionados a ENUMs no VS Code
- [ ] **Build funciona**: O comando `npm run build` executa sem erros de TypeScript
- [ ] **Testes passam**: Os testes não falham por problemas de tipo

## Usando o Types Mapper

A partir de agora, use as funções do `types-mapper.ts` para converter valores do banco:

### Exemplo 1: Converter Status de Cliente

```typescript
import { safeClienteStatus } from '@/lib/types-mapper';

// Antes (INSEGURO - poderia dar erro)
const cliente = {
  status: row.status as ClienteStatus // ❌ Pode dar erro se o valor for inválido
};

// Depois (SEGURO - sempre retorna um valor válido)
const cliente = {
  status: safeClienteStatus(row.status) // ✅ Retorna 'LEAD' se inválido
};
```

### Exemplo 2: Validar Valores

```typescript
import { isValidClienteStatus, CLIENTE_STATUS_VALUES } from '@/lib/types-mapper';

// Verificar se um valor é válido
if (isValidClienteStatus(value)) {
  // value é garantidamente um ClienteStatus válido
  console.log('Status válido:', value);
}

// Listar todos os valores possíveis
console.log('Status disponíveis:', CLIENTE_STATUS_VALUES);
// ['LEAD', 'CLIENTE_ATIVO', 'CLIENTE_INATIVO']
```

### Exemplo 3: Uso em Formulários

```typescript
import { TIPO_CLIENTE_VALUES } from '@/lib/types-mapper';

// Criar opções de select
const tipoClienteOptions = TIPO_CLIENTE_VALUES.map(tipo => ({
  value: tipo,
  label: tipo.replace(/_/g, ' ')
}));

// Renderizar select
<select>
  {tipoClienteOptions.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
```

## Resolvendo Problemas Comuns

### Erro: "Supabase CLI not logged in"

```bash
# Faça login no Supabase CLI
npx supabase login
```

Isso abrirá uma janela do navegador para autenticação.

### Erro: "Project not linked"

```bash
# Link ao projeto
npx supabase link --project-ref zxfevlkssljndqqhxkjb
```

### Erro: "Permission denied" ao executar migração

Certifique-se de que você tem permissões de administrador no projeto Supabase. Se não tiver, peça para um administrador executar a migração.

### VS Code ainda mostra erros após atualização

1. Feche todos os arquivos TypeScript
2. Pressione `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Reabra os arquivos

## Manutenção Futura

### Quando Adicionar Novos Valores a ENUMs

1. Crie uma nova migração SQL:
   ```sql
   -- supabase/migrations/YYYYMMDDHHMMSS_add_new_enum_value.sql
   ALTER TYPE cliente_status ADD VALUE IF NOT EXISTS 'NOVO_STATUS';
   ```

2. Execute a migração no Supabase Dashboard

3. Atualize os tipos:
   ```bash
   npm run update-types
   ```

4. Atualize o `types-mapper.ts`:
   ```typescript
   const CLIENTE_STATUS_VALUES: ClienteStatus[] = [
     'LEAD',
     'CLIENTE_ATIVO',
     'CLIENTE_INATIVO',
     'NOVO_STATUS' // Adicione aqui
   ];
   ```

### Quando Remover Valores de ENUMs

⚠️ **ATENÇÃO**: Remover valores de ENUMs é perigoso e pode quebrar a aplicação!

1. Primeiro, migre todos os dados existentes:
   ```sql
   UPDATE clientes SET status = 'OUTRO' WHERE status = 'VALOR_ANTIGO';
   ```

2. Depois, recrie o ENUM:
   ```sql
   -- Remover o ENUM antigo e recriar (igual à migração consolidada)
   ALTER TABLE clientes ALTER COLUMN status TYPE TEXT;
   DROP TYPE cliente_status CASCADE;
   CREATE TYPE cliente_status AS ENUM ('NOVO', 'LISTA', 'DE', 'VALORES');
   ALTER TABLE clientes ALTER COLUMN status TYPE cliente_status USING status::cliente_status;
   ```

3. Atualize os tipos:
   ```bash
   npm run update-types
   ```

## Princípios Importantes

1. **Single Source of Truth**: O banco de dados é a verdade. TypeScript se adapta ao banco.
2. **Sem `any`**: Nunca use `any` ou `as string` para ENUMs.
3. **Imutabilidade**: Não altere a lógica de negócio, apenas a tipagem.
4. **Sempre use Mappers**: Use as funções do `types-mapper.ts` para conversões seguras.

## Suporte

Se encontrar problemas:
1. Verifique o checklist de validação acima
2. Consulte a seção "Resolvendo Problemas Comuns"
3. Verifique os logs do Supabase Dashboard
4. Execute `npm run build` para ver erros detalhados de TypeScript

---

**Documentação criada em**: 2025-11-21
**Última atualização**: 2025-11-21
