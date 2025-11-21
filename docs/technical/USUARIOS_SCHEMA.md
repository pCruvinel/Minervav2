### 2. Arquivo: `docs/guides/usuarios-sistema.md`

Este é o documento funcional. Ele explica *quem* são os usuários e *o que* eles podem fazer.

```markdown
# 👥 Guia de Usuários e Permissões (v2.1)

**Arquitetura:** Relacional (Tabela `cargos` e `setores`)
**Status:** Atualizado em 21/11/2025

---

## 1. Visão Geral dos Cargos

O sistema abandonou os "tipos fixos" e agora usa uma tabela dinâmica de cargos. Cada usuário tem um Cargo e um Setor.

| Cargo (Slug) | Nível | Quem é? | O que faz? |
| :--- | :--- | :--- | :--- |
| **`admin`** | 10 | TI / Desenvolvedor | Acesso irrestrito para manutenção do sistema. |
| **`diretoria`** | 9 | Sócios / Donos | Visão estratégica total. Acessa Financeiro, Todos os Setores e Relatórios. |
| **`gestor_administrativo`** | 5 | Gerente Geral | O "braço direito" da diretoria. Gerencia o Financeiro e supervisiona Obras e Assessoria. |
| **`gestor_obras`** | 5 | Eng. Chefe Obras | Focado apenas na execução. Vê apenas OSs e Equipe de Obras. Sem acesso financeiro. |
| **`gestor_assessoria`** | 5 | Eng. Chefe Laudos | Focado apenas em laudos. Vê apenas OSs e Equipe de Assessoria. Sem acesso financeiro. |
| **`colaborador`** | 1 | Equipe Padrão | Operacional. Vê apenas o que é dele (Responsável) ou o que foi delegado para ele. |
| **`mao_de_obra`** | 0 | Pedreiro/Pintor | **Sem acesso ao sistema**. Usado apenas para compor custos e lista de presença. |

---

## 2. Matriz de Permissões (Quem vê o quê?)

A segurança é garantida pelo banco de dados (RLS).

### Módulo de Ordens de Serviço (OS)
* **Diretoria/Admin/Gestor ADM:** Veem TODAS as OSs de TODOS os setores.
* **Gestor de Obras:** Vê apenas OSs do tipo "Obra" ou "Reforma".
* **Gestor de Assessoria:** Vê apenas OSs do tipo "Laudo" ou "Consultoria".
* **Colaborador:** Vê apenas as OSs onde ele é o **Responsável Técnico** ou recebeu uma **Delegação**.

### Módulo Financeiro
* **Acesso Total (Ler/Criar):** `diretoria`, `gestor_administrativo`, `admin`.
* **Bloqueado:** `gestor_obras`, `gestor_assessoria`, `colaborador`, `mao_de_obra`.

### Módulo de Usuários
* **Gerenciar Equipe:** Apenas usuários de Nível 9 ou 10 (`diretoria`, `admin`) podem criar/editar outros usuários livremente.
* **Ver Lista:** Gestores (Nível 5) podem ver a lista de colaboradores do seu próprio setor para delegar tarefas.

---

## 3. O Novo Perfil: "Mão de Obra"

Criamos um perfil especial para funcionários de campo que não utilizam computador/celular corporativo.

* **Login:** Bloqueado (Se tentar logar, não verá dados).
* **Utilidade:**
    1.  Aparece na lista para o Gestor lançar **Presença**.
    2.  Aparece no Financeiro como **Centro de Custo** (Mão de Obra).
    3.  Pode ser alocado em Cronogramas.

---

## 4. Regras de Delegação

O sistema possui um "Guardião" (Trigger de Banco) que impede delegações erradas.

* **Gestor de Obras** TENTA delegar para **Assessoria** -> ❌ **ERRO:** "Você só pode delegar para seu setor."
* **Gestor Administrativo** TENTA delegar para **Obras** -> ✅ **SUCESSO** (Ele tem visão cruzada).
* **Colaborador** TENTA delegar -> ❌ **ERRO** (Nível insuficiente).

---

## 5. FAQ de Permissões

**Q: Criei um usuário e ele não vê nada.**
**R:** Verifique se ele está com o cargo `colaborador`. Se sim, ele só verá algo quando alguém delegar uma tarefa para ele ou colocá-lo como responsável de uma OS.

**Q: O Gestor de Obras não consegue ver o Financeiro.**
**R:** Comportamento esperado. Financeiro é restrito à Diretoria e Administrativo.

**Q: Mudei o status da OS para 'CONCLUIDA' e deu erro.**
**R:** Verifique se você usou minúsculo (`concluido`). O sistema V2.1 não aceita mais MAIÚSCULAS (`CONCLUIDA`).
````