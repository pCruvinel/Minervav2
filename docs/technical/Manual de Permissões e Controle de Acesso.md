**Principais descobertas da auditoria (Diferenças do manual anterior):**

1.  **Gestor Administrativo é Nível 5:** No banco, ele tem nível 5, mas ganha superpoderes via *slug* (`gestor_administrativo`) em regras específicas (como no Financeiro e Agendamentos).
2.  **OS Aberta para Gestores:** A regra `os_write_managers` permite que **qualquer nível \>= 5** edite Ordens de Serviço. O bloqueio por setor existe nos *Agendamentos*, mas nas *OS* o RLS atual permite edição cruzada entre gestores.
3.  **Colaboradores:** Qualquer usuário Nível \>= 5 pode ver a lista completa de colaboradores (`colab_read_hierarquia_v2`).

Aqui está o documento definitivo e alinhado com o banco:

-----

# 🔐 Manual de Permissões e Controle de Acesso (Realidade do Banco)

**Versão:** 2.2 (Auditada via SQL)
**Base de Dados:** Supabase Production
**Status RLS:** ✅ Ativo em todas as tabelas críticas

-----

## 1\. Matriz de Acesso (Resumo Executivo)

O sistema utiliza uma combinação de **Nível de Acesso** (numérico) e **Slug do Cargo** (texto) para determinar as permissões.

| Cargo | Slug (DB) | Nível | Escopo de Visão | Financeiro |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | 10 | Global | ✅ Total |
| **Diretoria** | `diretoria` | 9 | Global | ✅ Total |
| **Gestor Admin.** | `gestor_administrativo` | 5 | Global (Cross-Sector) | ✅ Total |
| **Gestor Obras** | `gestor_obras` | 5 | Setorial (Obras)\* | ❌ Bloqueado |
| **Gestor Assessoria**| `gestor_assessoria` | 5 | Setorial (Assessoria)\* | ❌ Bloqueado |
| **Colaborador** | `colaborador` | 1 | Pessoal / Delegado | ❌ Bloqueado |

\*\> *Nota: Nas Ordens de Serviço, o RLS atual permite visão global para Nível 5, mas nos Agendamentos o bloqueio setorial é estrito.*

-----

## 2\. Regras Críticas de Negócio (RLS Policies)

Abaixo, a explicação humana das regras SQL extraídas do banco (`pg_policies`).

### 💰 2.1 Módulo Financeiro (`financeiro_lancamentos`)

**Regra Ativa:** `fin_strict_access`

O acesso (Leitura e Escrita) é restrito estritamente a uma lista branca de slugs. Se o usuário não tiver um desses cargos, a query retorna vazio ou erro.

  * **Quem acessa:**
    1.  `admin`
    2.  `diretoria`
    3.  `gestor_administrativo`
  * **Quem NÃO acessa:** Gestores de Obras, Assessoria e Colaboradores.

### 📅 2.2 Agendamentos (`agendamentos`)

Tabela com lógica mais complexa de setorização.

  * **Admin/Diretoria:** Acesso total irrestrito (`agendamentos_admin_full_access`).
  * **Gestor Administrativo:** Vê e edita agendamentos de **todos os setores** (Exceção explícita na regra `agendamentos_gestor_setor`).
  * **Outros Gestores (Nível 5):**
      * Só podem ver/editar agendamentos onde: `agendamento.setor == usuario.setor`.
  * **Colaboradores:**
      * **Criar:** Podem criar agendamentos livremente (`agendamentos_colaborador_create`).
      * **Ver:** Só veem agendamentos que eles mesmos criaram (`criado_por = auth.uid`).

### 📋 2.3 Ordens de Serviço (`ordens_servico`)

**Atenção:** As regras aqui são mais permissivas para Gestores do que nos agendamentos.

  * **Escrita (Edição/Criação):**
      * Regra: `os_write_managers`
      * Lógica: `nivel_acesso >= 5`
      * **Efeito:** Qualquer gestor (Obras, Assessoria ou Admin) pode criar e editar qualquer OS. Não há trava de setor no nível do banco para *update*.
  * **Leitura (Visualização):**
      * **Gestores (Nível 5+):** Veem todas as OS (`os_read_all_high_level`).
      * **Colaboradores:** Veem apenas se:
        1.  Forem o responsável direto (`responsavel_id`).
        2.  Estiverem na lista de delegações (`delegacoes`).

### 👥 2.4 Colaboradores (`colaboradores`)

Quem pode ver os dados sensíveis (salários, documentos) dos outros funcionários?

  * **Regra Hierárquica:** `colab_read_hierarquia_v2`
      * Se o seu nível for **\>= 5** (Gestor, Diretoria, Admin), você vê **todos** os colaboradores.
  * **Regra Pessoal:**
      * Você sempre vê o seu próprio perfil.

-----

## 3\. Detalhamento Técnico das Policies

Referência rápida para desenvolvedores sobre as policies instaladas no Supabase.

| Tabela | Policy Name | Comportamento SQL Resumido |
| :--- | :--- | :--- |
| `financeiro_lancamentos` | `fin_strict_access` | `slug IN ('admin', 'diretoria', 'gestor_administrativo')` |
| `ordens_servico` | `os_write_managers` | `nivel_acesso >= 5` (Permite INSERT/UPDATE/DELETE) |
| `ordens_servico` | `os_read_own_assigned`| `responsavel_id = me` OR `EXISTS(delegacao para mim)` |
| `agendamentos` | `agendamentos_gestor_setor` | `nivel >= 5` AND (`setor_match` OR `slug = gestor_admin`) |
| `turnos` | `turnos_gestor_read` | `nivel >= 5` (Apenas Leitura/SELECT) |
| `turnos` | `turnos_admin_full_access` | `slug IN ('admin', 'diretoria')` (Escrita total) |

-----

## 4\. Helper Functions (Database)

As regras RLS acima dependem das seguintes *Stored Procedures* que devem existir no banco para funcionar:

1.  `get_auth_user_nivel()`: Retorna o inteiro (ex: 5, 9, 10) do usuário logado.
2.  `get_auth_user_cargo_slug()`: Retorna a string (ex: 'gestor\_obras') do usuário logado.
3.  `check_colaborador_access(setor_id)`: Valida cruzamento de setores (usado em regras legadas).

-----

## 5\. Auditoria de Segurança (Pontos de Atenção)

Baseado na extração atual, observe estes comportamentos:

1.  **Delete em OS:** A regra `os_write_managers` é `ALL`. Isso significa que um **Gestor de Obras pode DELETAR uma OS**. Se isso não for desejado, a policy deve ser alterada para `UPDATE/INSERT` apenas, removendo o `DELETE`.
2.  **Turnos:** Gestores (Nível 5) têm apenas permissão de **Leitura** (`turnos_gestor_read`). Eles não podem criar novos turnos. Apenas Admin e Diretoria criam turnos.
3.  **Auditoria:** A tabela `audit_log` é gravável por `authenticated` (INSERT), mas só pode ser lida pelo próprio usuário ou admins (conforme policies padrão não listadas, mas inferidas pelo padrão de segurança).

-----

## 6\. Frontend: Como verificar permissões

Não tente replicar a query SQL no front. Use os dados do usuário carregados no login.

```typescript
// Exemplo de verificação no Front-end (React/Next.js)

const user = useUser(); // Seu hook de contexto de usuário

// 1. Verificar Acesso Financeiro
const canAccessFinance = ['admin', 'diretoria', 'gestor_administrativo'].includes(user.cargo.slug);

// 2. Verificar Pode Editar OS
const canEditOS = user.cargo.nivel_acesso >= 5;

// 3. Verificar Pode Gerenciar Turnos
const canManageTurnos = ['admin', 'diretoria'].includes(user.cargo.slug);

// 4. Verificar se é Gestor Administrativo (Super Gestor)
const isSuperManager = user.cargo.slug === 'gestor_administrativo';
```