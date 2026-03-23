# 05 - Documentação de API - Minerva ERP v2.7

## 🔌 Visão Geral

O Minerva ERP utiliza **Supabase** como backend, com acesso direto ao banco PostgreSQL via cliente JS e Edge Functions para operações complexas.

**Base URL (Edge Functions):** `https://lvxbxndwqomxmsrqfwzo.supabase.co/functions/v1`
**Autenticação:** Bearer Token (JWT do Supabase Auth)

---

## ⚡ Edge Functions

### `server` - API Principal (Hono)

**Descrição**: API BFF (Backend for Frontend) com rotas customizadas usando Hono framework.

**Endpoints Principais:**
- `POST /api/clientes` - CRUD de clientes
- `POST /api/os` - Operações em Ordens de Serviço
- `POST /api/colaboradores` - Gestão de colaboradores

---

### `generate-pdf` - Geração de PDFs

**Descrição**: Geração automática de documentos PDF usando React-PDF.

**Request:**
```typescript
{
  template: 'proposta' | 'contrato' | 'laudo-tecnico' | 'visita-tecnica' | 'memorial' | 'documento-sst' | 'parecer-reforma',
  data: {
    // Dados específicos do template
    osId: string,
    clienteNome: string,
    // ... outros campos
  }
}
```

**Templates Disponíveis:**
| Template | Uso | OS Relacionada |
|----------|-----|----------------|
| `proposta` | Proposta Comercial | OS-01 a OS-06 |
| `contrato` | Contrato de Serviço | OS-01 a OS-06, OS-13 |
| `laudo-tecnico` | Laudo Técnico | OS-11 |
| `visita-tecnica` | Relatório de Visita | OS-08 |
| `memorial` | Memorial Descritivo | OS-01 a OS-04 |
| `documento-sst` | Documentos SST | OS-13 |
| `parecer-reforma` | Parecer de Reforma | OS-07 |

---

### `invite-user` - Convite de Usuários

**Descrição**: Envio de convites de acesso por email para novos colaboradores.

**Request:**
```typescript
{
  email: string,
  nome: string,
  cargo_id: string,
  setor_id: string
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Convite enviado com sucesso"
}
```

---

## 🗄️ Acesso Direto ao Banco (Supabase Client)

### Tabelas Principais

```typescript
// Ordens de Serviço
const { data } = await supabase
  .from('ordens_servico')
  .select('*, cliente:clientes(*), responsavel:colaboradores(*)')
  .eq('id', osId);

// Transferências de Setor
const { data } = await supabase
  .from('os_transferencias')
  .select('*, setor_origem:setores!setor_origem_id(*), setor_destino:setores!setor_destino_id(*)')
  .eq('os_id', osId);

// Etapas de OS
const { data } = await supabase
  .from('os_etapas')
  .select('*')
  .eq('os_id', osId)
  .order('ordem');
```

---

## ⚠️ Códigos de Erro

| Código | Descrição | Exemplo |
|--------|-----------|---------|
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Token JWT inválido ou expirado |
| 403 | Forbidden | Violação de RLS (sem permissão) |
| 404 | Not Found | Recurso não existe |
| 422 | Unprocessable Entity | Validação Zod falhou |
| 500 | Internal Server Error | Erro na Edge Function |

---

## 🔐 Autenticação

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@minerva.com.br',
  password: 'senha123'
});
```

### Verificar Sessão
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Logout
```typescript
await supabase.auth.signOut();
```

---

**Status**: ✅ Preenchido para Minerva v2.7
**Última Atualização**: 11/12/2025