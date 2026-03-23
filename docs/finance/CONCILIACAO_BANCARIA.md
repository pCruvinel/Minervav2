# Documentação Técnica: Conciliação Bancária e Custos Variáveis

## Visão Geral
O módulo de conciliação bancária permite associar transações bancárias (importadas via Open Finance/Cora) a registros financeiros do sistema (`contas_pagar`, `contas_receber`), além de classificar despesas de Mão de Obra Variável.

## Arquitetura de Dados

### Tabelas Principais
- `lancamentos_bancarios`: Armazena as transações puras.
- `contas_pagar` / `contas_receber`: Registros financeiros oficiais.
- `custos_variaveis_colaborador`: **[NOVO]** Armazena a parcela de custo variável atribuída a colaboradores.

### Fluxo de Mão de Obra Variável
Para categorias do tipo "Mão de Obra" (ID `843f5fef-fb6a-49bd-bec3-b0917c2d4204`), o sistema permite:
1.  **Rateio entre Colaboradores**:Selecionar 1 ou N colaboradores.
2.  **Definição de Tipo de Custo**:
    -   `Flutuante`: Soma ao custo do colaborador (Ex: Horas extras, Bonificação variável).
    -   `Geral`: Apenas para controle financeiro, não impacta o indicador de custo do RH (Ex: Impostos, Taxas).

### Views
- `vw_custo_total_colaborador_mensal`: Consolida Custo Fixo (Salário/Contrato) + Custo Variável (Flutuante) agrupado por mês.

## Componentes Frontend

### `ModalConciliacao`
-   Localizado em `src/components/financeiro/modal-conciliacao.tsx`.
-   Utiliza `MultiSelect` para seleção de colaboradores.
-   Lógica condicional baseada na Categoria selecionada.
-   Chama RPC `classificar_transacao_bancaria` para criar registros financeiros.
-   Realiza updates secundários para preencher `custos_variaveis_colaborador` (via hooks).

### `ColaboradorDetalhesPage`
-   Localizado em `src/components/colaboradores/colaborador-detalhes-page.tsx`.
-   Exibe tabela "Detalhamento de Custos" consumindo `useCustoTotalMensal`.

## Hooks
-   `useLancamentosBancarios`: Gestão de transações.
-   `useCustosVariaveisColaborador`: Gestão da tabela de custos variáveis.
-   `useCustoTotalMensal`: Busca dados da view consolidada.

## Fluxo de Uso
1.  Usuário abre conciliação.
2.  Selecione "Criar Novo".
3.  Escolhe Categoria "Mão de Obra".
4.  Define Tipo (Flutuante) e seleciona Colaboradores (Ex: João, Maria).
5.  O valor total é dividido igualmente (display) e registrado no banco.
6.  No perfil do colaborador, o custo aparece somado ao fixo no mês de referência.
