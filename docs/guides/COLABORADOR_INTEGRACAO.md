# GUIA DE INTEGRAÇÃO - MÓDULO COLABORADOR

## 📘 Documentação para Backend Development

Este documento fornece especificações detalhadas para integração do módulo Colaborador com o backend.

---

## 🔑 Autenticação e Autorização

### Context de Usuário
Todas as requisições devem incluir o token JWT do usuário logado:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Validação de Permissões
O backend deve validar:
- `role_nivel === 4` (Colaborador)
- Para Leads: `setor === "COMERCIAL"`

---

## 📡 Endpoints da API

### 1. Dashboard Operacional

#### GET /api/colaborador/dashboard
**Descrição:** Retorna KPIs e tarefas prioritárias do colaborador

**Request:**
```bash
GET /api/colaborador/dashboard
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "kpis": {
    "osEmAberto": 12,
    "tarefasHoje": 5,
    "prazosVencidos": 2,
    "tarefasConcluidas": 45,
    "produtividade": 87.5
  },
  "tarefasPrioritarias": [
    {
      "id": 1,
      "codigo": "OS-007-2025",
      "cliente": "Construtora ABC Ltda",
      "etapaAtual": "VISTORIA",
      "prazo": "2025-11-18T23:59:59Z",
      "status": "EM_ANDAMENTO",
      "prioridade": "ALTA"
    }
  ]
}
```

**Regras de Negócio:**
- Apenas OS onde `responsavel_id === usuario_logado.id`
- Ordenar tarefas por: prazo ASC, prioridade DESC
- Considerar apenas status: PENDENTE, EM_ANDAMENTO, ATRASADO

---

### 2. Minhas Ordens de Serviço

#### GET /api/colaborador/os
**Descrição:** Lista todas as OS delegadas ao colaborador

**Request:**
```bash
GET /api/colaborador/os?status=EM_ANDAMENTO&prioridade=ALTA&search=ABC
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (opcional): PENDENTE | EM_ANDAMENTO | ATRASADO | CONCLUIDO
- `prioridade` (opcional): ALTA | MEDIA | BAIXA
- `search` (opcional): busca por código, cliente ou endereço
- `page` (opcional): número da página (default: 1)
- `limit` (opcional): itens por página (default: 20)

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "codigo": "OS-007-2025",
      "tipo": "OS_07",
      "cliente": {
        "id": 5,
        "nome": "Construtora ABC Ltda"
      },
      "endereco": "Av. Paulista, 1000 - São Paulo/SP",
      "telefone": "(11) 98765-4321",
      "etapaAtual": "VISTORIA",
      "status": "EM_ANDAMENTO",
      "prioridade": "ALTA",
      "prazo": "2025-11-18T23:59:59Z",
      "responsavel": {
        "id": 1,
        "nome": "Carlos Silva"
      },
      "criadoEm": "2025-11-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Regras de Negócio:**
- Filtrar automaticamente por `responsavel_id === usuario_logado.id`
- Não retornar campos financeiros (`valorTotal`, `valorPago`, `custos`)

---

#### GET /api/colaborador/os/:id
**Descrição:** Detalhes completos de uma OS específica

**Request:**
```bash
GET /api/colaborador/os/1
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": 1,
  "codigo": "OS-007-2025",
  "tipo": "OS_07",
  "cliente": {
    "id": 5,
    "nome": "Construtora ABC Ltda",
    "telefone": "(11) 98765-4321",
    "endereco": "Av. Paulista, 1000 - São Paulo/SP"
  },
  "etapaAtual": "VISTORIA",
  "status": "EM_ANDAMENTO",
  "prioridade": "ALTA",
  "prazo": "2025-11-18T23:59:59Z",
  "responsavel": {
    "id": 1,
    "nome": "Carlos Silva"
  },
  "descricao": "Vistoria técnica para análise estrutural",
  "historico": [
    {
      "id": 1,
      "acao": "OS criada",
      "usuario": "João Gestor",
      "dataHora": "2025-11-10T10:00:00Z"
    }
  ],
  "anexos": [
    {
      "id": 1,
      "nome": "planta_baixa.pdf",
      "url": "https://storage.example.com/files/planta_baixa.pdf"
    }
  ],
  "criadoEm": "2025-11-10T10:00:00Z",
  "atualizadoEm": "2025-11-15T14:30:00Z"
}
```

**Response 403 (Forbidden):**
```json
{
  "error": "Acesso negado",
  "message": "Você não tem permissão para acessar esta OS"
}
```

**Regras de Negócio:**
- Validar se `responsavel_id === usuario_logado.id`
- Não retornar dados financeiros

---

#### PATCH /api/colaborador/os/:id/rascunho
**Descrição:** Salva progresso da execução sem submeter

**Request:**
```bash
PATCH /api/colaborador/os/1/rascunho
Authorization: Bearer {token}
Content-Type: application/json

{
  "observacoes": "Vistoria iniciada, 60% concluída",
  "checklistItems": {
    "estrutura": true,
    "instalacoes": true,
    "acabamento": false,
    "seguranca": false,
    "acessibilidade": false
  },
  "medicoes": "Altura pé direito: 2.70m\nÁrea total: 450m²"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Rascunho salvo com sucesso",
  "os": {
    "id": 1,
    "codigo": "OS-007-2025",
    "status": "EM_ANDAMENTO",
    "atualizadoEm": "2025-11-17T16:45:00Z"
  }
}
```

**Regras de Negócio:**
- Validar se OS está com status editável (não aprovada/concluída)
- Não mudar o status da OS
- Salvar log de atualização

---

#### POST /api/colaborador/os/:id/submeter
**Descrição:** Finaliza execução e envia para aprovação do gestor

**Request:**
```bash
POST /api/colaborador/os/1/submeter
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "observacoes": "Vistoria concluída com êxito",
  "checklistItems": {
    "estrutura": true,
    "instalacoes": true,
    "acabamento": true,
    "seguranca": true,
    "acessibilidade": true
  },
  "medicoes": "Dados técnicos completos...",
  "fotos": [File, File, File] // array de arquivos
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "OS submetida para aprovação com sucesso",
  "os": {
    "id": 1,
    "codigo": "OS-007-2025",
    "status": "AGUARDANDO_APROVACAO",
    "submididoEm": "2025-11-17T17:00:00Z"
  }
}
```

**Regras de Negócio:**
- Mudar status para `AGUARDANDO_APROVACAO`
- Bloquear edição pelo colaborador
- Enviar notificação ao gestor responsável
- Salvar arquivos em storage seguro
- Criar registro de histórico

---

### 3. Consulta de Clientes

#### GET /api/colaborador/clientes
**Descrição:** Lista clientes (somente leitura)

**Request:**
```bash
GET /api/colaborador/clientes?search=ABC&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (opcional): busca por nome, endereço, telefone ou email
- `page` (opcional): número da página
- `limit` (opcional): itens por página

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Construtora ABC Ltda",
      "cnpj": "12.345.678/0001-90",
      "endereco": "Av. Paulista, 1000 - São Paulo/SP",
      "cep": "01310-100",
      "telefone": "(11) 98765-4321",
      "email": "contato@construtorabc.com.br",
      "tipo": "PESSOA_JURIDICA",
      "status": "ATIVO"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Regras de Negócio:**
- Retornar apenas status ATIVO
- Não incluir dados sensíveis (conta bancária, senhas)
- Não permitir operações de escrita (POST/PUT/DELETE)

---

### 4. Agenda do Colaborador

#### GET /api/colaborador/agenda
**Descrição:** Retorna eventos/compromissos do colaborador

**Request:**
```bash
GET /api/colaborador/agenda?mes=11&ano=2025
Authorization: Bearer {token}
```

**Query Parameters:**
- `mes` (obrigatório): 1-12
- `ano` (obrigatório): YYYY
- `tipo` (opcional): VISTORIA | REUNIAO | FOLLOW_UP

**Response 200:**
```json
{
  "eventos": [
    {
      "id": 1,
      "titulo": "Vistoria - Construtora ABC",
      "os": {
        "id": 1,
        "codigo": "OS-007-2025"
      },
      "cliente": "Construtora ABC Ltda",
      "endereco": "Av. Paulista, 1000 - São Paulo/SP",
      "data": "2025-11-18",
      "horaInicio": "09:00",
      "horaFim": "11:00",
      "tipo": "VISTORIA",
      "responsavel": {
        "id": 1,
        "nome": "Carlos Silva"
      },
      "observacoes": "Levar equipamentos de medição"
    }
  ]
}
```

**Regras de Negócio:**
- Filtrar eventos onde `responsavel_id === usuario_logado.id`
- Retornar apenas eventos futuros ou do mês atual
- Incluir dados da OS relacionada

---

### 5. Gestão de Leads (Comercial)

#### GET /api/colaborador/leads
**Descrição:** Lista leads do colaborador comercial

**Request:**
```bash
GET /api/colaborador/leads?status=NOVO&potencial=ALTO
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (opcional): NOVO | EM_CONTATO | QUALIFICADO | NAO_QUALIFICADO | CONVERTIDO
- `potencial` (opcional): ALTO | MEDIO | BAIXO
- `origem` (opcional): SITE | TELEFONE | EMAIL | INDICACAO | REDES_SOCIAIS
- `search` (opcional): busca por nome, contato ou email

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Empresa Potencial ABC",
      "contato": "João Pedro",
      "telefone": "(11) 99999-8888",
      "email": "joao@empresaabc.com.br",
      "origem": "INDICACAO",
      "status": "NOVO",
      "potencial": "ALTO",
      "observacoes": "Interessado em assessoria",
      "criadoPor": {
        "id": 1,
        "nome": "Carlos Silva"
      },
      "criadoEm": "2025-11-15T10:00:00Z",
      "atualizadoEm": "2025-11-15T10:00:00Z"
    }
  ],
  "kpis": {
    "total": 15,
    "novos": 5,
    "emContato": 4,
    "qualificados": 3,
    "convertidos": 3
  }
}
```

**Response 403 (se não for comercial):**
```json
{
  "error": "Acesso negado",
  "message": "Esta funcionalidade é exclusiva para colaboradores do setor administrativo"
}
```

**Regras de Negócio:**
- Validar se `usuario.setor === "COMERCIAL"`
- Filtrar por `criadoPor_id === usuario_logado.id`

---

#### POST /api/colaborador/leads
**Descrição:** Cria novo lead

**Request:**
```bash
POST /api/colaborador/leads
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Empresa Nova Ltda",
  "contato": "Maria Silva",
  "telefone": "(11) 98888-7777",
  "email": "maria@empresanova.com",
  "origem": "SITE",
  "potencial": "MEDIO",
  "observacoes": "Solicitou orçamento para vistoria"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Lead criado com sucesso",
  "lead": {
    "id": 16,
    "nome": "Empresa Nova Ltda",
    "status": "NOVO",
    "criadoEm": "2025-11-17T18:00:00Z"
  }
}
```

**Validações:**
- `nome`: obrigatório, max 200 caracteres
- `contato`: obrigatório, max 100 caracteres
- `telefone`: obrigatório, formato brasileiro
- `email`: obrigatório, formato válido
- `origem`: obrigatório, enum válido

---

#### PATCH /api/colaborador/leads/:id
**Descrição:** Atualiza lead existente

**Request:**
```bash
PATCH /api/colaborador/leads/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "EM_CONTATO",
  "potencial": "ALTO",
  "observacoes": "Cliente demonstrou interesse em fechar negócio"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Lead atualizado com sucesso",
  "lead": {
    "id": 1,
    "status": "EM_CONTATO",
    "atualizadoEm": "2025-11-17T18:15:00Z"
  }
}
```

**Regras de Negócio:**
- Validar se `lead.criadoPor_id === usuario_logado.id`
- Criar log de histórico de mudanças
- Se status mudar para CONVERTIDO, opcionalmente criar OS

---

## 📤 Upload de Arquivos

### POST /api/colaborador/os/:id/anexos
**Descrição:** Upload de fotos/documentos da execução

**Request:**
```bash
POST /api/colaborador/os/1/anexos
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "arquivos": [File, File],
  "tipo": "FOTO_VISTORIA",
  "descricao": "Fotos da estrutura"
}
```

**Response 200:**
```json
{
  "success": true,
  "anexos": [
    {
      "id": 1,
      "nome": "foto_1.jpg",
      "url": "https://storage.example.com/os/1/foto_1.jpg",
      "tipo": "FOTO_VISTORIA",
      "tamanho": 2048576,
      "uploadEm": "2025-11-17T18:30:00Z"
    }
  ]
}
```

**Validações:**
- Tamanho máximo por arquivo: 10MB
- Formatos permitidos: JPG, PNG, PDF
- Máximo 10 arquivos por upload

---

## 🔔 Notificações

### Eventos que geram notificações:

1. **OS Delegada ao Colaborador**
   - Tipo: `OS_DELEGADA`
   - Para: Colaborador
   - Mensagem: "Nova OS delegada a você: {codigo}"

2. **Prazo Próximo do Vencimento**
   - Tipo: `PRAZO_PROXIMO`
   - Para: Colaborador
   - Mensagem: "A OS {codigo} vence em {dias} dias"

3. **OS Submetida para Aprovação**
   - Tipo: `OS_SUBMETIDA`
   - Para: Gestor
   - Mensagem: "{colaborador} submeteu a OS {codigo} para aprovação"

4. **OS Aprovada/Reprovada**
   - Tipo: `OS_APROVADA` | `OS_REPROVADA`
   - Para: Colaborador
   - Mensagem: "Sua OS {codigo} foi {status} pelo gestor"

---

## 🔒 Segurança

### Validações Obrigatórias no Backend:

1. **Autenticação:**
   - Validar JWT em todas as requisições
   - Verificar expiração do token

2. **Autorização:**
   - Verificar `role_nivel === 4`
   - Para Leads: verificar `setor === "COMERCIAL"`

3. **Ownership:**
   - OS: validar `responsavel_id === usuario_logado.id`
   - Leads: validar `criadoPor_id === usuario_logado.id`

4. **Restrições:**
   - Bloquear acesso a dados financeiros
   - Bloquear operações de aprovação
   - Bloquear edição de clientes

5. **Rate Limiting:**
   - Máximo 100 requisições/minuto por usuário

6. **Input Validation:**
   - Sanitizar todos os inputs
   - Validar formatos (email, telefone, datas)
   - Prevenir SQL Injection e XSS

---

## 📊 Logs e Auditoria

Registrar em log:
- Todas as ações de criação/edição/exclusão
- Submissões e aprovações
- Uploads de arquivos
- Mudanças de status

**Formato do log:**
```json
{
  "timestamp": "2025-11-17T18:45:00Z",
  "usuario_id": 1,
  "usuario_nome": "Carlos Silva",
  "acao": "OS_SUBMETIDA",
  "recurso": "OrdemServico",
  "recurso_id": 1,
  "recurso_codigo": "OS-007-2025",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

---

## 🧪 Testes Recomendados

1. **Testes de Permissão:**
   - Colaborador não acessa OS de outro responsável
   - Colaborador não-comercial não acessa Leads
   - Colaborador não visualiza dados financeiros

2. **Testes de Fluxo:**
   - Criar lead → Qualificar → Converter em OS
   - Salvar rascunho → Submeter → Aprovar
   - Upload de arquivos → Visualizar anexos

3. **Testes de Validação:**
   - Campos obrigatórios
   - Formatos de dados
   - Limites de tamanho

---

## 📌 Variáveis de Ambiente

```env
# Backend
API_BASE_URL=https://api.minerva.com.br
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h

# Storage
STORAGE_TYPE=s3 # ou local, gcs
AWS_S3_BUCKET=minerva-anexos
AWS_S3_REGION=sa-east-1

# Notificações
NOTIFICATION_SERVICE=firebase # ou pusher, onesignal
FIREBASE_API_KEY=your_firebase_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@minerva.com.br
SMTP_PASS=your_password
```

---

**Documentação atualizada em:** 17/11/2025  
**Versão:** 1.0.0  
**Responsável:** Time de Desenvolvimento Minerva
