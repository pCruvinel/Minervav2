# 📋 Instruções para Ativar Delegações - Minerva v2

**Data:** 18/11/2025
**Funcionalidade:** Sistema de Delegação de Tarefas em OS
**Status:** ✅ Código implementado | ⏸️ Aguardando migration SQL

---

## 🎯 O Que Foi Implementado

### ✅ Frontend
- **Bug corrigido:** `podeDelegarParaColaborador()` → `podeDelegarPara()`
- **Modal atualizado:** Integração com API real (sem mock)
- **API Client:** 5 métodos de delegação adicionados

### ✅ Backend
- **5 endpoints REST** implementados no servidor Deno
- **Validações completas** de negócio
- **Logs detalhados** para debugging

### ⏸️ Banco de Dados
- **Script SQL criado:** `supabase/migrations/create_delegacoes_table.sql`
- **Aguardando execução** no Supabase

---

## 🚀 Como Ativar a Funcionalidade

### Passo 1: Executar Migration SQL

1. Acesse o Supabase Dashboard:
   - URL: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb
   - Login necessário

2. Vá para **SQL Editor** (menu lateral)

3. Abra o arquivo da migration:
   - Caminho: `supabase/migrations/create_delegacoes_table.sql`

4. Copie **todo o conteúdo** do arquivo

5. Cole no SQL Editor do Supabase

6. Clique em **Run** (ou pressione Ctrl+Enter)

7. Aguarde confirmação: ✅ Success

### Passo 2: Verificar Tabela Criada

Execute este SQL para verificar:

```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'delegacoes'
ORDER BY ordinal_position;
```

**Esperado:** 13 colunas (id, created_at, updated_at, os_id, delegante_id, etc.)

### Passo 3: Testar Endpoint

Opção A - Via navegador (Chrome DevTools):

```javascript
// No console do navegador
const response = await fetch('https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/delegacoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    os_id: 'ID_DE_UMA_OS_EXISTENTE',
    delegante_id: 'ID_DO_GESTOR',
    delegado_id: 'ID_DO_COLABORADOR',
    descricao_tarefa: 'Tarefa de teste para validar delegação',
    data_prazo: '2025-12-31'
  })
});

const data = await response.json();
console.log(data);
```

Opção B - Via Thunder Client/Postman:

- **Método:** POST
- **URL:** `https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/delegacoes`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {ANON_KEY}`
- **Body:**
```json
{
  "os_id": "uuid-da-os",
  "delegante_id": "uuid-do-gestor",
  "delegado_id": "uuid-do-colaborador",
  "descricao_tarefa": "Realizar follow-up com cliente sobre projeto X",
  "observacoes": "Cliente solicitou retorno até sexta-feira",
  "data_prazo": "2025-11-25"
}
```

### Passo 4: Testar no Sistema

1. **Login como Gestor** (role_nivel = GESTOR_*)

2. **Abrir uma OS**

3. **Clicar em "Delegar Tarefa"**

4. **Preencher formulário:**
   - Selecionar colaborador
   - Descrição (mínimo 10 caracteres)
   - Prazo (data futura)
   - Observações (opcional)

5. **Clicar em "Delegar"**

6. **Verificar toast de sucesso:** ✅ "Tarefa delegada com sucesso para {Nome}!"

7. **Verificar no banco:**

```sql
SELECT * FROM delegacoes
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📋 Endpoints Disponíveis

### 1. Criar Delegação
```
POST /make-server-5ad7fd2c/delegacoes
```

**Body:**
```json
{
  "os_id": "string (UUID, obrigatório)",
  "delegante_id": "string (UUID, obrigatório)",
  "delegado_id": "string (UUID, obrigatório)",
  "descricao_tarefa": "string (min 10 chars, obrigatório)",
  "observacoes": "string (opcional)",
  "data_prazo": "string (YYYY-MM-DD, opcional)",
  "status_delegacao": "string (default: PENDENTE)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "created_at": "2025-11-18T10:30:00Z",
  "updated_at": "2025-11-18T10:30:00Z",
  "os_id": "uuid",
  "delegante_id": "uuid",
  "delegante_nome": "Carlos Diretor",
  "delegado_id": "uuid",
  "delegado_nome": "Ana Silva",
  "status_delegacao": "PENDENTE",
  "descricao_tarefa": "Realizar visita técnica",
  "observacoes": "Levar câmera fotográfica",
  "data_prazo": "2025-11-25"
}
```

### 2. Listar Delegações de uma OS
```
GET /make-server-5ad7fd2c/ordens-servico/:osId/delegacoes
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "status_delegacao": "PENDENTE",
    "delegado_nome": "Ana Silva",
    ...
  }
]
```

### 3. Listar Delegações de um Colaborador
```
GET /make-server-5ad7fd2c/delegacoes/delegado/:colaboradorId
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "ordens_servico": {
      "codigo": "OS-2024-001",
      "titulo": "Laudo Estrutural",
      "status": "EM_ANDAMENTO"
    },
    ...
  }
]
```

### 4. Atualizar Delegação
```
PUT /make-server-5ad7fd2c/delegacoes/:id
```

**Body:**
```json
{
  "status_delegacao": "EM_PROGRESSO",
  "observacoes": "Iniciado em 18/11/2025"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "status_delegacao": "EM_PROGRESSO",
  ...
}
```

### 5. Deletar Delegação (apenas se PENDENTE)
```
DELETE /make-server-5ad7fd2c/delegacoes/:id
```

**Response 200:**
```json
{
  "message": "Delegação removida com sucesso"
}
```

---

## 🔒 Regras de Segurança (RLS)

### Quem pode VER delegações?
- ✅ Delegante (quem delegou)
- ✅ Delegado (quem recebeu)
- ✅ Diretoria (todos)

### Quem pode CRIAR delegações?
- ✅ Gestores (GESTOR_ADMINISTRATIVO, GESTOR_ASSESSORIA, GESTOR_OBRAS)
- ✅ Diretoria

### Quem pode ATUALIZAR delegações?
- ✅ Delegante (pode alterar tudo)
- ✅ Delegado (pode alterar apenas status e observações)
- ✅ Diretoria (pode alterar tudo)

### Quem pode DELETAR delegações?
- ✅ Delegante (apenas se status = PENDENTE)
- ✅ Diretoria (apenas se status = PENDENTE)

---

## ⚠️ Validações Implementadas

### Backend (Servidor)
1. ✅ Campos obrigatórios: `os_id`, `delegante_id`, `delegado_id`, `descricao_tarefa`
2. ✅ Descrição mínima: 10 caracteres
3. ✅ Não pode delegar para si mesmo
4. ✅ Delegante deve ser gestor ou diretor
5. ✅ Delegado deve estar ativo (`status_colaborador = 'ativo'`)
6. ✅ OS deve existir
7. ✅ Colaboradores devem existir

### Frontend (Modal)
1. ✅ Colaborador deve ser selecionado
2. ✅ Descrição obrigatória
3. ✅ Prazo deve ser data futura (se fornecido)
4. ✅ Permissões de delegação validadas

---

## 🎨 Status Possíveis

| Status | Descrição | Quem Pode Definir |
|--------|-----------|-------------------|
| `PENDENTE` | Delegação criada, aguardando início | Sistema (default) |
| `EM_PROGRESSO` | Delegado iniciou a tarefa | Delegado |
| `CONCLUIDA` | Tarefa finalizada | Delegado |
| `REPROVADA` | Delegante reprovou a execução | Delegante |

---

## 🐛 Troubleshooting

### Erro: "Tabela delegacoes não existe"
**Solução:** Execute a migration SQL (Passo 1)

### Erro: "Campos obrigatórios: os_id, delegante_id..."
**Solução:** Verifique se todos os campos obrigatórios estão sendo enviados

### Erro: "Delegante não encontrado"
**Solução:** Verifique se o `delegante_id` existe na tabela `colaboradores`

### Erro: "Apenas gestores e diretores podem delegar"
**Solução:** Usuário logado deve ter `role_nivel` = GESTOR_* ou DIRETORIA

### Erro: "Não é possível delegar para colaborador inativo"
**Solução:** Colaborador selecionado está com `status_colaborador != 'ativo'`

### Erro 403 Forbidden
**Solução:** Verifique se as RLS policies foram criadas corretamente

---

## 📊 Métricas e Monitoramento

### Queries Úteis

**Delegações pendentes por colaborador:**
```sql
SELECT
  delegado_nome,
  COUNT(*) as total_pendentes
FROM delegacoes
WHERE status_delegacao = 'PENDENTE'
GROUP BY delegado_nome
ORDER BY total_pendentes DESC;
```

**Delegações atrasadas:**
```sql
SELECT
  id,
  delegado_nome,
  descricao_tarefa,
  data_prazo,
  CURRENT_DATE - data_prazo as dias_atraso
FROM delegacoes
WHERE data_prazo < CURRENT_DATE
  AND status_delegacao NOT IN ('CONCLUIDA', 'REPROVADA')
ORDER BY dias_atraso DESC;
```

**Taxa de conclusão por delegado:**
```sql
SELECT
  delegado_nome,
  COUNT(*) FILTER (WHERE status_delegacao = 'CONCLUIDA') as concluidas,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status_delegacao = 'CONCLUIDA') / COUNT(*), 2) as taxa_conclusao
FROM delegacoes
GROUP BY delegado_nome
ORDER BY taxa_conclusao DESC;
```

---

## ✅ Checklist de Ativação

- [ ] Executar migration SQL no Supabase
- [ ] Verificar que tabela `delegacoes` foi criada
- [ ] Verificar que RLS policies estão ativas
- [ ] Testar endpoint POST /delegacoes via Postman/Thunder Client
- [ ] Fazer login como gestor no sistema
- [ ] Delegar uma tarefa via modal
- [ ] Verificar delegação criada no banco
- [ ] Atualizar status de uma delegação
- [ ] Listar delegações de uma OS
- [ ] Testar erro ao delegar para colaborador inativo

---

## 🎉 Resultado Final

Após seguir todos os passos:

- ✅ Gestores podem delegar tarefas
- ✅ Delegações são salvas no Supabase
- ✅ Colaboradores veem suas tarefas delegadas
- ✅ Sistema valida permissões e regras de negócio
- ✅ Logs detalhados para debugging
- ✅ RLS garante segurança dos dados

**Status:** TODO 1 COMPLETO 🚀

---

**Próximo TODO:** TODO 4 - Integrar Auth Context com Supabase
