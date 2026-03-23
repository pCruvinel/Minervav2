# 📚 Documentação Técnica de Integração: API Diários de Obra

> **Versão do Portal:** v1.0.4 — Extraída em 11/03/2026
> **Fonte:** [https://api.diariodeobra.app/documentacao/](https://api.diariodeobra.app/documentacao/) (acesso autenticado)

---

## 1. Visão Geral e Autenticação

A API do **APP Diário de Obra** é uma interface **REST** projetada para **exportação de dados** inseridos no sistema, retornando informações em formato **JSON**. A API é **somente leitura** (read-only) — apenas métodos `GET` estão disponíveis.

### Base URL

```
https://apiexterna.diariodeobra.app/v1
```

### Autenticação (JWT Token)

Todas as requisições exigem um token JWT enviado no **header** `token`.

| Item | Detalhe |
|:--|:--|
| **Método** | Token JWT no header da requisição |
| **Header** | `token` |
| **Obtenção** | Painel administrativo: `Cadastros > Empresa > Gerar token` |
| **Expiração** | Não documentada explicitamente; token inválido retorna `401` |

**Exemplo de chamada via cURL:**

```bash
curl -X GET "https://apiexterna.diariodeobra.app/v1/empresa" \
  -H "token: SEU_TOKEN_JWT_AQUI"
```

### Rate Limiting

| Regra | Valor |
|:--|:--|
| **Limite** | 150 requisições por minuto |
| **Reset** | O contador reinicia a cada minuto |
| **Excedente** | Retorna HTTP `429 Too Many Requests` |

> [!WARNING]
> A API não documenta mecanismos de retry ou headers de rate-limit (como `X-RateLimit-Remaining`). Recomenda-se implementar **backoff exponencial** no consumidor.

---

## 2. Referência de Endpoints

### Mapa de Rotas

| # | Método | Rota | Descrição |
|:--|:--|:--|:--|
| 1 | `GET` | `/empresa` | Dados cadastrais da empresa |
| 2 | `GET` | `/cadastros` | Tabelas auxiliares (usuários, grupos, listas) |
| 3 | `GET` | `/obras` | Lista de obras |
| 4 | `GET` | `/obras/{obra-id}` | Detalhes de uma obra |
| 5 | `GET` | `/obras/{obra-id}/lista-de-tarefas` | Cronograma/tarefas da obra |
| 6 | `GET` | `/obras/{obra-id}/lista-de-tarefas/{tarefa-id}` | Detalhes de uma tarefa |
| 7 | `GET` | `/obras/{obra-id}/relatorios` | Relatórios (RDO) da obra |
| 8 | `GET` | `/obras/{obra-id}/relatorios/{relatorio-id}` | Detalhes de um relatório |

---

### 2.1 Empresa

Retorna os dados cadastrais e estatísticas de uso da empresa vinculada ao token.

- **Endpoint:** `GET /empresa`
- **Descrição:** Recupera informações da empresa como Razão Social, CNPJ, logomarca e totais consolidados (obras, usuários, relatórios, fotos, vídeos e armazenamento).
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros:** Nenhum.
- **Exemplo de Response (200 OK):**

```json
{
  "_id": "57fa4eebffd18769058b4567",
  "nome": "Update Construções",
  "razaoSocial": "UPDATE DIGITAL TECNOLOGIA DA INFORMAÇÃO LTDA",
  "cpfCnpj": "21.600.669/0001-94",
  "logoUrl": "https://.../logomarca_01_54968_20220930_141358.jpg",
  "log": {
    "totalObras": 8,
    "totalUsuarios": 6,
    "totalRelatorios": 121,
    "totalFotos": 149,
    "totalVideos": 5,
    "totalAnexos": 15,
    "tamanhoFotos": 17192572,
    "tamanhoVideos": 15143507,
    "tamanhoAnexos": 46482591,
    "armazenamentoTotal": 78818670
  }
}
```

---

### 2.2 Cadastros (Tabelas Auxiliares)

Retorna as listas de referência globais utilizadas em todo o sistema.

- **Endpoint:** `GET /cadastros`
- **Descrição:** Lista usuários, grupos de obra, modelos de relatórios, categorias de mão de obra, equipamentos cadastrados, tipos de ocorrência e status.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros:** Nenhum.
- **Exemplo de Response (200 OK):**

```json
{
  "usuarios": [
    {
      "_id": "5a1b2c3d...",
      "nome": "André Silva",
      "email": "andre@empresa.com"
    }
  ],
  "gruposObra": [
    {
      "_id": "5a1b2c3d...",
      "descricao": "Residencial"
    }
  ],
  "modelosDeRelatorio": [
    {
      "_id": "5a1b2c3d...",
      "descricao": "Modelo Padrão"
    }
  ],
  "listaMaoDeObra": {
    "categorias": [
      {
        "_id": "5a1b2c3d...",
        "descricao": "Mão de Obra Direta"
      }
    ],
    "padrao": [
      {
        "descricao": "Engenheiro",
        "quantidade": 1
      }
    ]
  },
  "listaEquipamentos": [
    {
      "descricao": "Betoneira",
      "quantidade": 1
    }
  ],
  "tiposDeOcorrencia": [
    {
      "_id": "5a1b2c3d...",
      "descricao": "Acidente de Trabalho"
    }
  ],
  "statusObra": [
    { "id": 1, "descricao": "Não Iniciada" },
    { "id": 2, "descricao": "Paralisada" },
    { "id": 3, "descricao": "Em Andamento" },
    { "id": 4, "descricao": "Concluída" }
  ],
  "statusRelatorio": [
    { "id": 1, "descricao": "Preenchendo" },
    { "id": 2, "descricao": "Aguardando Revisão" },
    { "id": 3, "descricao": "Revisado" },
    { "id": 4, "descricao": "Aprovado" }
  ]
}
```

---

### 2.3 Obras

Gerenciamento e visualização de projetos/obras.

#### Listar Obras

- **Endpoint:** `GET /obras`
- **Descrição:** Retorna a lista de todas as obras cadastradas. Pode agrupar por categoria e filtrar por status.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|:--|:--|:--|:--|:--|
| `grupoObra` | `boolean` | Não | `true` | Agrupa as obras por categoria/grupo |
| `status` | `string` | Não | — | Filtra pelo ID do status (referência em `/cadastros`) |

- **Exemplo de Response (200 OK):**

```json
[
  {
    "_id": "5ea4a9ee1cab5d1b693f95d1",
    "nome": "Edifício Solar",
    "status": {
      "descricao": "Em andamento"
    },
    "totalRelatorios": 45,
    "modified": "2023-10-27T14:20:00Z"
  }
]
```

---

#### Visualizar Obra (Detalhes)

- **Endpoint:** `GET /obras/{obra-id}`
- **Descrição:** Retorna os detalhes completos de uma obra, incluindo endereço, prazos, responsável e visão geral de totais.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `obra-id` | `string` | ✅ Sim | ID único da obra (MongoDB ObjectId) |

- **Exemplo de Response (200 OK):**

```json
{
  "_id": "5c4f206f33e3821f9e559902",
  "nome": "Casa Ana Laura",
  "endereco": "Santa Luzia, Minas Gerais",
  "status": {
    "descricao": "Concluída"
  },
  "prazo": {
    "contratual": 1005,
    "decorrido": 1005
  },
  "dataInicio": "2019-01-28",
  "usuarioResponsavel": {
    "nome": "Eng. Ricardo"
  },
  "visaoGeral": {
    "total": {
      "relatorios": 35,
      "fotos": 23,
      "videos": 0,
      "anexos": 2,
      "tarefasCronograma": 429
    }
  }
}
```

---

### 2.4 Cronograma e Tarefas

Estrutura de atividades planejadas e o progresso físico de execução da obra.

#### Listar Tarefas da Obra

- **Endpoint:** `GET /obras/{obra-id}/lista-de-tarefas`
- **Descrição:** Retorna a árvore de etapas (itens do cronograma) e suas respectivas tarefas, com percentuais de execução.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `obra-id` | `string` | ✅ Sim | ID único da obra |

- **Exemplo de Response (200 OK):**

```json
[
  {
    "_id": "5c4f206f...",
    "item": "1",
    "descricao": "Serviços Preliminares",
    "porcentagem": 100,
    "subItens": [
      {
        "_id": "5c4f206f...",
        "item": "1.1",
        "descricao": "Terraplanagem",
        "porcentagem": 100
      },
      {
        "_id": "5c4f206f...",
        "item": "1.2",
        "descricao": "Locação da Obra",
        "porcentagem": 75
      }
    ]
  }
]
```

---

#### Visualizar Detalhes da Tarefa

- **Endpoint:** `GET /obras/{obra-id}/lista-de-tarefas/{tarefa-id}`
- **Descrição:** Exibe os detalhes e o histórico de execução de uma tarefa específica, incluindo em quais relatórios diários ela foi citada.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `obra-id` | `string` | ✅ Sim | ID único da obra |
| `tarefa-id` | `string` | ✅ Sim | ID único da tarefa |

- **Exemplo de Response (200 OK):**

```json
{
  "_id": "5c4f206f...",
  "item": "1.1",
  "descricao": "Terraplanagem",
  "porcentagem": 100,
  "controleDeProducao": {
    "unidade": "m³",
    "total": 500
  },
  "historicoRelatorios": [
    {
      "relatorioId": "5ea4a9ee...",
      "data": "2023-02-15",
      "porcentagem": 50
    },
    {
      "relatorioId": "5ea4a9ef...",
      "data": "2023-03-01",
      "porcentagem": 100
    }
  ]
}
```

---

### 2.5 Relatórios Diários (RDO)

Documentação diária das atividades realizadas em campo. Este é o recurso mais rico e complexo da API.

#### Listar Relatórios da Obra

- **Endpoint:** `GET /obras/{obra-id}/relatorios`
- **Descrição:** Lista os relatórios diários de uma obra com suporte a múltiplos filtros.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `obra-id` | `string` | ✅ Sim | ID único da obra |

- **Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|:--|:--|:--|:--|:--|
| `limite` | `number` | Não | — | Quantidade máxima de registros retornados |
| `usuarioId` | `string` | Não | — | Filtra por ID do autor do relatório |
| `statusId` | `number` | Não | — | Filtra pelo status (referência em `/cadastros`) |
| `modeloDeRelatorioId` | `string` | Não | — | Filtra pelo modelo de relatório utilizado |
| `dataInicio` | `string` | Não | — | Data inicial do período (`AAAA-MM-DD`) |
| `dataFim` | `string` | Não | — | Data final do período (`AAAA-MM-DD`) |
| `ordem` | `string` | Não | — | Ordenação: `asc` ou `desc` |

- **Exemplo de Response (200 OK):**

```json
[
  {
    "_id": "5ea4a9ee...95d1",
    "data": "2023-11-05",
    "usuario": "Almoxarife João",
    "status": {
      "descricao": "Aprovado"
    },
    "clima": {
      "manha": "Sol",
      "tarde": "Chuva"
    }
  }
]
```

---

#### Visualizar Relatório Detalhado

- **Endpoint:** `GET /obras/{obra-id}/relatorios/{relatorio-id}`
- **Descrição:** Retorna o conteúdo completo e integral de um Diário de Obra (RDO). Inclui todas as seções do relatório.
- **Headers:**

| Header | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `token` | `string` | ✅ Sim | Token JWT da empresa |

- **Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|:--|:--|:--|:--|
| `obra-id` | `string` | ✅ Sim | ID único da obra |
| `relatorio-id` | `string` | ✅ Sim | ID único do relatório |

- **Seções retornadas no Response:**

| Seção | Campo JSON | Descrição |
|:--|:--|:--|
| **Clima** | `clima` | Condições climáticas (manhã, tarde, noite) |
| **Mão de Obra** | `maoDeObra` | Efetivo presente com categorias e quantidades |
| **Equipamentos** | `equipamentos` | Máquinas utilizadas, condição e quantidade |
| **Atividades** | `atividades` | Descrição textual dos serviços realizados |
| **Ocorrências** | `ocorrencias` | Eventos inesperados, acidentes ou problemas |
| **Controle de Material** | `controleDeMaterial` | Materiais recebidos e consumidos |
| **Comentários** | `comentarios` | Observações adicionais |
| **Fotos** | `galeriaDeFotos` | URLs das fotos com legendas |
| **Vídeos** | `galeriaDeVideos` | URLs dos vídeos com metadados |
| **Anexos** | `anexos` | Documentos anexados (PDF, etc.) |
| **Link PDF** | `linkPdf` | URL para download do relatório em PDF |

- **Exemplo de Response (200 OK):**

```json
{
  "_id": "60ccaa2dd5c62c5be11c5ac8",
  "data": "05/11/2023 08:00:00",
  "usuario": {
    "nome": "Almoxarife João",
    "email": "joao@empresa.com"
  },
  "status": {
    "descricao": "Aprovado"
  },
  "clima": {
    "manha": "Sol",
    "tarde": "Nublado",
    "noite": "Chuva"
  },
  "maoDeObra": [
    {
      "descricao": "Pedreiro",
      "quantidade": 5,
      "categoria": {
        "descricao": "Mão de Obra Direta"
      }
    },
    {
      "descricao": "Servente",
      "quantidade": 3,
      "categoria": {
        "descricao": "Mão de Obra Direta"
      }
    }
  ],
  "equipamentos": [
    {
      "descricao": "Betoneira",
      "quantidade": 2,
      "condicao": "Operante"
    }
  ],
  "atividades": "Conclusão da laje do 2º pavimento. Início da alvenaria do 3º andar.",
  "ocorrencias": [
    {
      "tipo": "Chuva",
      "descricao": "Chuva intensa no período da tarde, paralisando serviços externos."
    }
  ],
  "controleDeMaterial": [
    {
      "descricao": "Cimento CP II",
      "quantidade": 50,
      "unidade": "sacos"
    }
  ],
  "galeriaDeFotos": [
    {
      "id": "60ccaa2dd5c62c5be11c5ac9",
      "arquivo": "foto_laje_51539_20210514_085020.jpg",
      "descricao": "Laje nivelada e pronta",
      "extensao": "jpg",
      "tamanho": 2456789,
      "url": "https://.../foto_laje_51539_20210514_085020.jpg"
    }
  ],
  "galeriaDeVideos": [
    {
      "id": "60ccaa2dd5c62c5be11c5ac8",
      "arquivo": "app-ios_video__51539_20210514_085020.mp4",
      "arquivoFoto": "app-ios_video__51539_20210514_085020.jpg",
      "extensao": "mp4",
      "duracao": "00:25",
      "tamanho": 4533830,
      "descricao": null,
      "appIss": "app-ios",
      "timestamp": 0,
      "url": "https://.../app-ios_video__51539_20210514_085020.mp4",
      "urlFoto": "https://.../app-ios_video__51539_20210514_085020.jpg"
    }
  ],
  "anexos": [
    {
      "arquivo": "projeto_ele_trico_44500_20220707_092748.pdf",
      "descricao": "Projeto Elétrico",
      "extensao": "pdf",
      "tamanho": 1749888,
      "timestamp": 1657196868,
      "url": "https://.../projeto_ele_trico_44500_20220707_092748.pdf"
    }
  ],
  "linkPdf": "https://.../relatorio_60ccaa2d.pdf"
}
```

---

## 3. Códigos de Erro Mapeados

| Código HTTP | Mensagem | Descrição / Causa Comum |
|:--|:--|:--|
| **200** | OK | Requisição processada com sucesso |
| **401** | Token API inválido | Token ausente, expirado ou mal formatado |
| **403** | Email ou Senha inválido | Falha de permissão ou credenciais incorretas (fluxo de login) |
| **404** | Not Found | Recurso solicitado (obra, tarefa, relatório) não existe |
| **429** | Limite de 150 requisições por minuto excedido | Rate limit atingido; aguarde o próximo minuto para retomar |
| **500** | Internal Server Error | Falha interna no servidor da API |

---

## 4. Notas Técnicas para Integração

> [!IMPORTANT]
> **API Read-Only:** A documentação descreve **exclusivamente métodos `GET`**. Não há endpoints documentados para criação, edição ou exclusão de dados (`POST`, `PUT`, `DELETE`).

### Formatos de Data

| Contexto | Formato | Exemplo |
|:--|:--|:--|
| **Filtros de Query** (input) | `AAAA-MM-DD` | `2023-11-05` |
| **Respostas** (output) | `DD/MM/AAAA HH:MM:SS` | `05/11/2023 08:00:00` |
| **Datas ISO** (alguns campos) | `YYYY-MM-DDTHH:mm:ssZ` | `2023-10-27T14:20:00Z` |

### Identificadores

Todos os IDs (obras, relatórios, tarefas, usuários) utilizam o formato **MongoDB ObjectId** (string hexadecimal de 24 caracteres).

### Integrações Suportadas

A documentação oficial menciona suporte para consumo via:
- **cURL** (linha de comando)
- **Python** (requests)
- **JavaScript** (fetch/axios)
- **Power BI** (conector web com autenticação via header)

### Alertas de Acesso

> [!NOTE]
> **Sem bloqueios de segurança detectados.** Não foram encontrados CAPTCHAs, WAFs ou mecanismos adicionais de bloqueio durante o acesso e extração da documentação. O portal utiliza autenticação simples via e-mail/senha no frontend, com token JWT para a API.

---

*Documento gerado automaticamente via browser automation a partir do portal [api.diariodeobra.app/documentacao](https://api.diariodeobra.app/documentacao/) em 11/03/2026.*
