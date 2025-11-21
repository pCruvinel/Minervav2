Com certeza\! Atualizar a documentação é crucial para que futuras IAs (e desenvolvedores) entendam que o sistema migrou para a **Arquitetura V2.1** (Relacional e Minúscula).

Aqui estão os dois documentos reescritos seguindo a **Regra de Ouro** (Lógica de Negócio + Schema Compacto).

-----

### 1\. Arquivo: `docs/technical/DATABASE_SCHEMA.md`

Este é o documento técnico principal. Ele explica para a IA *como* o banco funciona.

````markdown
# AI Context: Minerva Database Schema (v2.1)

**Contexto:** ERP para empresa de engenharia/construção (Minerva).
**Arquitetura:** Supabase (PostgreSQL).
**Modelo de Permissão:** Relacional e Dinâmico (RBAC via tabelas `cargos` e `setores`).
**Padrão de Dados:** Snake Case e Minúsculo (ex: `em_triagem`, `concluido`).
**Última Atualização:** 21/11/2025

---

## 1. Lógica de Negócio e Permissões (Crucial)

### 🧠 Hierarquia de Acesso (Quem manda em quem)
O sistema utiliza RLS (Row Level Security) rigoroso baseado no `cargo_id` e `setor_id` do usuário.
**Não usamos mais ENUMs para cargos, usamos a tabela `cargos`.**

1.  **Nível 10 - Admin/TI (`admin`)**: Acesso "God Mode". Vê tudo.
2.  **Nível 9 - Diretoria (`diretoria`)**: Acesso total a todas as tabelas, incluindo **Financeiro**. Pode delegar para qualquer um.
3.  **Nível 5 - Gestores (Acesso Cruzado vs Isolado)**:
    * **Gestor Administrativo:** É um "Super Gerente". Vê o setor `administrativo` **E TAMBÉM** `obras` e `assessoria`. Tem acesso total ao **Financeiro**.
    * **Gestor de Obras:** Isolado. Vê/Edita apenas dados do setor `obras`. **SEM** acesso ao Financeiro.
    * **Gestor de Assessoria:** Isolado. Vê/Edita apenas dados do setor `assessoria`. **SEM** acesso ao Financeiro.
4.  **Nível 1 - Colaborador (`colaborador`)**:
    * Vê apenas o próprio perfil.
    * Vê apenas OSs onde é o `responsavel_id` ou foi explicitamente delegado (`delegacoes`).
    * Não pode delegar tarefas.
5.  **Nível 0 - Mão de Obra (`mao_de_obra`)**:
    * **BLOQUEADO:** Não consegue fazer login (RLS impede leitura do próprio user).
    * Serve apenas para constar em custos, cronogramas e listas de presença.

### 🛡️ Regras de Delegação (Trigger `validar_regras_delegacao`)
O banco impede inserções na tabela `delegacoes` que violem estas regras:
* `diretoria` / `admin` -> Delegam para **Todos**.
* `gestor_administrativo` -> Delega para **Obras** ou **Assessoria**.
* `gestor_obras` -> Delega apenas para **Obras**.
* `gestor_assessoria` -> Delega apenas para **Assessoria**.

---

## 2. Definição do Schema (Compacto)

### 2.1 Organização & Acessos

```sql
TABLE public.cargos (
  id uuid PK,
  nome text, -- Ex: "Gestor de Obras"
  slug text UNIQUE, -- 'admin', 'diretoria', 'gestor_administrativo', 'gestor_obras', 'gestor_assessoria', 'colaborador', 'mao_de_obra'
  nivel_acesso int -- 10=Admin, 9=Diretoria, 5=Gestor, 1=Operacional, 0=Bloqueado
);

TABLE public.setores (
  id uuid PK,
  nome text, -- "Obras", "Assessoria"
  slug text UNIQUE -- 'obras', 'assessoria', 'administrativo', 'diretoria'
);

TABLE public.colaboradores (
  id uuid PK FK(auth.users), -- 1:1 com Auth
  nome_completo text,
  email text,
  cargo_id uuid FK(cargos.id),
  setor_id uuid FK(setores.id),
  ativo boolean DEFAULT true
  -- Trigger: handle_new_user() cria automaticamente ao registrar no Auth
);
````

### 2.2 Core Business (Ordens de Serviço)

```sql
TABLE public.ordens_servico (
  id uuid PK,
  codigo_os varchar UNIQUE, -- 'OS-2024-001' (Gerado auto por trigger)
  cliente_id uuid FK(clientes.id),
  tipo_os_id uuid FK(tipos_os.id),
  responsavel_id uuid FK(colaboradores.id),
  criado_por_id uuid FK(colaboradores.id),
  status_geral enum, -- 'em_triagem', 'em_andamento', 'concluido', 'cancelado'
  valor_contrato numeric,
  descricao text
);

TABLE public.os_etapas (
  id uuid PK,
  os_id uuid FK(ordens_servico.id),
  nome_etapa text,
  status enum, -- 'pendente', 'em_andamento', 'concluida', 'bloqueada'
  dados_etapa jsonb -- Formulários dinâmicos
);

TABLE public.delegacoes (
  id uuid PK,
  os_id uuid FK(ordens_servico.id),
  delegante_id uuid FK(colaboradores.id), -- Quem mandou
  delegado_id uuid FK(colaboradores.id), -- Quem vai fazer
  status_delegacao enum, -- 'pendente', 'aceita', 'recusada', 'concluida'
  descricao_tarefa text
  -- Trigger: validar_regras_delegacao() roda BEFORE INSERT
);
```

### 2.3 Financeiro & CRM

```sql
TABLE public.financeiro_lancamentos (
  id uuid PK,
  descricao text,
  valor numeric,
  tipo enum, -- 'receita', 'despesa'
  data_vencimento date,
  cc_id uuid FK(centros_custo.id)
  -- Policy: Apenas 'admin', 'diretoria', 'gestor_administrativo' podem ler/escrever
);

TABLE public.clientes (
  id uuid PK,
  nome_razao_social text,
  status enum, -- 'lead', 'ativo', 'inativo', 'blacklist'
  responsavel_id uuid FK(colaboradores.id)
);
```

-----

## 3\. Reference: Valid Values (Minúsculo)

O banco é estrito. Use exatamente estes valores (lowercase):

  * **Cargos (Slugs):** `admin`, `diretoria`, `gestor_administrativo`, `gestor_obras`, `gestor_assessoria`, `colaborador`, `mao_de_obra`.
  * **Setores (Slugs):** `diretoria`, `administrativo`, `obras`, `assessoria`.
  * **OS Status:** `em_triagem`, `em_andamento`, `concluido`, `cancelado`.
  * **Delegacao Status:** `pendente`, `aceita`, `concluida`, `recusada`.

<!-- end list -->

````

