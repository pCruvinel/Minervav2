# Normalização de Dados no Backend

**Arquivo:** `src/supabase/functions/server/index.tsx`

O backend implementa funções auxiliares para garantir a compatibilidade entre os dados enviados pelo frontend (que podem usar formatos legados ou simplificados) e os ENUMs estritos do banco de dados PostgreSQL.

## Funções de Normalização

### 1. `normalizeEtapaStatus(status)`
Converte status de etapas para o formato `os_etapa_status`.

- **Entrada:** String (ex: "Concluída", "Reprovada")
- **Processamento:**
    - Remove acentos
    - Converte para Maiúsculas
    - Substitui espaços por `_`
- **Mapeamentos Específicos:**
    - `CONCLUIDA` → `APROVADA`
    - `REPROVADA` → `REJEITADA`
- **Valores Válidos Finais:** `PENDENTE`, `EM_ANDAMENTO`, `AGUARDANDO_APROVACAO`, `APROVADA`, `REJEITADA`.

### 2. `normalizeOsStatusGeral(status)`
Converte status geral da OS para o formato `os_status_geral`.

- **Mapeamentos Específicos:**
    - `AGUARDANDO_APROVACAO` → `EM_VALIDACAO`
    - `PAUSADA` → `EM_ANDAMENTO`
- **Valores Válidos Finais:** `EM_TRIAGEM`, `AGUARDANDO_INFORMACOES`, `EM_ANDAMENTO`, `EM_VALIDACAO`, `ATRASADA`, `CONCLUIDA`, `CANCELADA`.

### 3. `normalizeClienteStatus(status)`
Converte status de clientes para o formato `cliente_status`.

- **Mapeamentos Específicos:**
    - `ATIVO` → `CLIENTE_ATIVO`
    - `INATIVO` → `CLIENTE_INATIVO`
- **Valores Válidos Finais:** `LEAD`, `CLIENTE_ATIVO`, `CLIENTE_INATIVO`.

## Uso nas Rotas

Essas funções são chamadas automaticamente nos endpoints de criação (`POST`) e atualização (`PUT`) antes de enviar os dados para o Supabase.

### Exemplo (Criação de Etapa)
```typescript
// src/supabase/functions/server/index.tsx

if (body.status) {
  body.status = normalizeEtapaStatus(body.status);
}
// ... insert into os_etapas
```
