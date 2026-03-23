# Checklist Unificado — Projeto Minerva

> **Última atualização:** 16/03/2026
> **Fontes:** `checklist_completo_minerva.md` (IDs #1–60) · `Checklist de tarefas.md` (IDs G-*, O1-*, A5-*, V8-*, C-*, RH-*, P-*) · Reunião 11/03/2026 (IDs R11-*)
> **Legenda:** ✅ Concluído | ⬜ Pendente | ⏳ Aguardando input | 🆕 Novo (Reunião 11/03)

---

## 1 · Página Inicial & Kanban

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #1 | Kanban de Gestores | ⬜ | `action-kanban.tsx`, `workload-kanban.tsx` existem no dashboard, mas não é o Kanban de delegação operacional descrito |
| #2 | Página inicial com Kanban de delegação (gestor vê e delega OS) | ⬜ | `delegacao/modal-delegar-os.tsx` existe; Kanban visual não implementado |
| R11-1 | 🆕 Kanban geral unificado com filtro por tipo de OS (visão diretoria) | ⬜ | Val quer gerir TODAS as OS num único Kanban. Filtro tipo OS para visão macro. Prioridade alta |
| R11-2 | 🆕 Kanban específico por setor — assessoria (prioridade), obras, recrutamento, compras | ⬜ | Val: "assessoria seria prioridade". Val ficou de enviar etapas específicas. Assessoria, obras, recrutamento e compras |
| R11-3 | 🆕 Dashboard executivo (visão diretoria) — coordenadores e suas OS | ⬜ | Pedro mencionou que já está em construção parcial; consulta de OS por coordenador funciona, mas visualização pendente |

> [!IMPORTANT]
> **Reunião 11/03:** Val quer um Kanban geral para todas as OS (visão macro de diretoria) + Kanbans específicos por setor. O de assessoria é a prioridade principal. Val ficou de enviar as etapas (colunas) de cada Kanban.
> **Reunião 26/02:** Kanban do coordenador = ferramenta principal de delegação (ex: Camila ~50 demandas → distribui). Kanban da diretoria = visão de todos os coordenadores. Colunas personalizáveis por coordenador.

---

## 2 · Dashboards

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #3 | Dashboard Operacional — Etapas "X de Y" | ✅ | `manager-table.tsx` L468-470: `{os.etapaAtual.numero}/{os.totalEtapas}` |
| #4 | Dashboard Executivo — SLA, config OS, upload contrato | ✅ | `ordens-servico-settings-page.tsx` tabs SLA+Taxas. DB: `os_etapas_config` (134 rows), `precificacao_config` (12 rows) |
| RH-8 | Alertas na dashboard do gestor (presença não conciliada, lançamentos bancários não conciliados) | ⬜ | Não implementado |

---

## 3 · Navegação & Menu Lateral

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #5 | Separar Leads de Clientes no menu lateral | ⬜ | Sidebar tem `Novo Lead` mas sem seção "Clientes" separada. Páginas `clientes/` existem |
| R11-4 | 🆕 Remover atalhos de OS do menu lateral (link direto por tipo de OS) | ⬜ | Pedro confirmou que vai retirar: "isso aqui eu troco rapidinho, retira aqui esses OS do contrato" |

---

## 4 · Calendário

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #35 | Férias no calendário do sistema | ⬜ | Módulo calendário robusto (20 arquivos), sem status "férias" |
| C-1 | Feriados — entidade `feriados` no banco + marcar dias indisponíveis | ⬜ | Adicionar tabela `feriados (data, descricao)`. Ajustar `CalendarioIntegracao` |
| C-2 | Aniversário do contratante — evento recorrente anual | ⬜ | Armazenar `dataNascimento` do cliente; criar evento no calendário do gestor |
| C-3 | Alocação automática ao gestor — associar evento ao `responsavelAgendamentoId` | ⬜ | Ajustar `CalendarioIntegracao` |
| C-4 | Cálculo de custo por dia útil — config dias úteis/mês | ⬜ | Adicionar configuração no módulo financeiro |
| C-5 | Excluir dados de teste — rotina de limpeza | ⬜ | Script admin que limpe `leads`, `clientes`, `colaboradores` em staging |
| C-6 | Birthdays — trigger edge function gerar evento ao cadastrar/atualizar cliente | ⬜ | Revisar trigger na edge function do calendário |

---

## 5 · Comercial (Leads & Clientes)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #6 | Cadastro = Lead. Título "Cadastrar Novo Lead" | ✅ | `lista-leads.tsx` L356; sidebar: `Novo Lead`; `os-creation-hub.tsx` |
| #31 | Vínculo CPF/CNPJ automático e manual | ✅ | DB: `cliente_pagadores_conhecidos` (7 rows); `clientes.cpf_cnpj` |
| #32 | Nova página de Detalhes do Contato | ✅ | `comercial/detalhes-lead.tsx` + `clientes/cliente-detalhes-page.tsx` (6 tabs) |
| R11-5 | 🆕 Remover campo "Tipo de Empresa" do cadastro de Lead | ⬜ | Val: "essa informação não é relevante". Campo ainda presente em `lead-form-identificacao.tsx` L81-97 e `cadastrar-lead.tsx` L977-993 |
| R11-6 | 🆕 Cadastro de Lead — adicionar sub-pergunta "Quantos elevadores?" quando "Possui elevador? = Sim" | ⬜ | Campo `qtdElevadores` não encontrado no código |
| R11-7 | 🆕 Cadastro de Lead — adicionar sub-pergunta "Quantas piscinas?" quando "Possui piscina? = Sim" | ⬜ | Campo `qtdPiscinas` não encontrado no código |
| R11-8 | 🆕 Bug: edificação tipo "condomínio residencial de casas" → não deve perguntar "quantidade de pavimentos" | ⬜ | Regra condicional ausente. Lógica de condicional por tipo de edificação inexistente |
| R11-9 | 🆕 Bug: campo numérico no cadastro de Lead não aceita valores de 2 a 9 (só aceita 1 ou ≥10) | ⬜ | Val e Pedro confirmaram o bug; afeta vários campos numéricos (pavimentos, unidades, etc.) |
| R11-10 | 🆕 Bug: CNPJ sem formatação no cadastro de Lead | ⬜ | Pedro: "vi que não está formatando o CNPJ" |
| R11-11 | 🆕 Bug: cadastro de Lead congela a tela (não conclui/salva) | ⬜ | Val: "tentei cadastrar um lead e ficou travado, congelou". Afeta OS-01 a OS-04. Pedro confirmou bug |
| R11-12 | 🆕 Excluir todos os dados de teste e permitir Val cadastrar clientes reais | ⬜ | Val: "queria excluir todos os cadastros que tu já fez aí, cadastrar os meus próprios clientes" |

---

## 6 · Financeiro

### 6.1 Geral

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #7 | Fluxo de Caixa — Refatorar queries | ⬜ | `fluxo-caixa-page.tsx` existe; funcionalidade reportada como quebrada |
| #8 | Receita — Exclusivamente via OS 11/12/13 | ⬜ | `receitas-recorrentes-page.tsx`; DB: `contas_receber` (0 rows), `faturas` (37 rows). Regra de restrição não verificada |
| #20 | Despesas — Filtrar apenas categoria "despesa" | ⬜ | `gestao-despesas-page.tsx`; DB: `categorias_financeiras` (15 rows). Filtro não verificado |
| #21 | Vincular Existente — Modal conciliação só faturas de clientes via OS 11/12/13 | ⬜ | `modal-conciliacao.tsx` existe; filtro de receita não encontrado |
| #27 | Conciliação vincula à receita | ✅ | `conciliacao-bancaria-page.tsx` + `lancamentos_bancarios` (438 rows) + `faturas` (37 rows) |
| #28 | Regra de desprezo em Custo Geral/Tributo | ✅ | DB: `custos_overhead_mensal`, `custos_variaveis_colaborador` (98 rows). Lógica provavelmente no backend |
| #29 | Anexo obrigatório ao Colaborador na Conciliação | ✅ | `modal-classificar-lancamento.tsx` + `colaboradores_documentos` |
| #36 | Criar dados de teste financeiro | ⬜ | `contas_receber` (0 rows) confirma necessidade |
| R11-13 | 🆕 Painel financeiro — exibir indicadores: receber hoje, a pagar hoje, projeção 30 dias, saldo atual | ✅ | `financeiro-dashboard-page.tsx` com cards KPI. Sidebar link "Painel Financeiro" confirmado |
| R11-14 | 🆕 Despesas — mostrar APENAS projeções cadastradas (previsibilidade), não conciliações | ⬜ | Val: "é para aparecer só o que está projetado". Página de despesas exibe tudo; filtrar para mostrar só projeções |
| R11-15 | 🆕 Conciliação bancária — permitir conciliar valores diferentes dos previstos (sem exigir alterar previsão) | ⬜ | Val: "eu não preciso prever perfeitamente cada centavo, posso conciliar valores diferentes". Usar modelo tipo Conta Azul |
| R11-16 | 🆕 Entrada na conciliação — duas opções: "Aplicação" ou "Vincular Receita Prevista" (fatura recorrente) | ⬜ | Val: "sempre que aparecer uma entrada, vou ter essas duas opções". Verificar se já funciona conforme #57 |
| R11-17 | 🆕 Cálculos de custo por setor (administração local, escritório, obras) não estão concluídos | ⬜ | Val: "onde é que está sendo calculado aquele custo da administração local?" Pedro: "começamos mas não finalizamos" |

### 6.2 Conciliação Bancária (Feedback 10/03/2026)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #48 | **BUG**: "mão de obra" selecionada → anexo não fica disponível após conciliado | ✅ | `modal-conciliacao.tsx` — coluna "Anexo" adicionada na tabela MO read-only com link "Ver" |
| #49 | Atualização automática do extrato (ex: 1h) | ✅ | `useAutoSyncExtrato` em `use-lancamentos-bancarios.ts` — intervalo 60min, backoff exponencial, re-sync no window focus. Badge "Última sync: HH:mm" na page |
| #50 | Painel de previsão: receita / fatura / mês / hoje | ✅ | `conciliacao-bancaria-page.tsx` — 4 cards: Receitas Previstas, Faturas Vencidas, Pendentes, % Conciliado. Dados via `useReceitasPrevistasConciliacao` |
| #51 | "Escritório" / "Setor Obras" / "Setor Assessoria": não perguntar setor/CC, cobrar anexo, sem "detalhamento" | ✅ | `useCategoriaBehavior` + tabela `categoria_comportamento` — exige_setor=false, exige_cc=false, exige_anexo=true, exige_detalhamento=false |
| #52 | Alterar legenda: Saída → "Vincular Fatura Recorrente" / Entrada → "Vincular Receita Recorrente" | ✅ | `modal-conciliacao.tsx` — TabsList oculto para entradas (single tab), label "Vincular Fatura Recorrente" para saídas |
| #53 | Incluir coluna/campo "Detalhamento" para descrição do lançamento | ✅ | `modal-conciliacao.tsx` — Textarea condicionado por `mostrarDetalhamento`, salva em `observacoes` |
| #54 | Saída "Tributo Empresa" — sem setor/CC, SÓ anexo, sem "detalhamento" | ✅ | `categoria_comportamento` row: exige_setor=false, exige_cc=false, exige_anexo=true, exige_detalhamento=false |
| #55 | Saída e Entrada "Aplicação" — sem setor, CC, anexo ou "detalhamento" | ✅ | `categoria_comportamento` row: is_descartavel=true, all flags false. Hint "Aplicação financeira — apenas classificação necessária" |
| #56 | Setor: remover extras — manter somente "OBRAS" e "ASSESSORIA" | ✅ | `SETORES_CONCILIACAO` em `constants/conciliacao.ts` — 2 opções: `setor_obras` e `setor_assessoria`. Importado na page e modal |
| #57 | Entrada: atribuir a fatura recorrente ou APLICAÇÃO | ✅ | `modal-conciliacao.tsx` — tab "vincular" com `ENTRY_EXTRA_CATEGORIES` incluindo Aplicação + Resgate; lógica de entrada usa lista de receitas previstas |
| #58 | Entrada: não dar opção de "criar novo" | ✅ | `modal-conciliacao.tsx` — `{!isEntrada && (...)}` oculta TabsTrigger "Criar Novo". TabsList inteiramente oculto para entradas |
| #59 | Entrada: opção de anexar NF (não obrigatório) | ✅ | `modal-conciliacao.tsx` — Input file (.pdf/.png/.jpg) com label "Anexar NF (opcional)" + badge com nome do arquivo. Usa state `notaFiscal` existente |
| #60 | Entrada: remover duplicidade "Cliente vinculado" / "Vincular existente" — manter somente "Vincular Fatura Recorrente" | ✅ | `modal-conciliacao.tsx` — seção "Cliente Vinculado" removida (140 linhas), substituída por chip Popover compacto no header. "Recebido:" removido dos cards de receita |

> [!NOTE]
> **Melhorias UX adicionais (fora do checklist):**
> - Card "Saldo Atual" removido da page (dados do Cora não mais exibidos inline)
> - Cliente Vinculado movido para chip/Popover no header do modal (economia de ~40% da altura)
> - Tab strip removido para Entradas (apenas 1 aba, sem tabs visuais)
> - "Recebido:" removido dos cards de receita na lista (compactação)
> - Painel "Previsão Financeira" com 4 KPIs na page principal

### 6.3 Centro de Custos & Composição (Reunião 11/03)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| R11-18 | 🆕 Clique no item de custo do CC → exibir detalhamento de tudo conciliado naquela categoria/CC | ⬜ | Pedro: "vai clicar assim, vai exibir tudo referente aqui a esse custo de conciliação". Funcionalidade parcialmente em construção |
| R11-19 | 🆕 Mão de obra no CC puxa valor da presença diária (não conciliação) | ⬜ | Val: "com exceção da mão de obra que vai puxar da presença diária". Pedro confirmou |
| R11-20 | 🆕 Concluir cálculos de tributos e valores gerais por CC (depende de OES) | ⬜ | Pedro: "tem alguns valores gerais, tributos, que não colocamos ainda, depende da OES" |

---

## 7 · Recursos Humanos & Colaboradores

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #9 | Alterar fluxo de cadastro de colaborador | ✅ | `modal-cadastro-colaborador.tsx` (1281 linhas) — Zod, ViaCEP, cálculos CLT/contrato |
| #10 | Documentos fixos e predefinidos | ✅ | `colaboradores_documentos`; payload tem `documentos_obrigatorios: string[]` |
| #11 | Solicitação mão de obra — tela congelada | ⬜ | `recrutamento/` com kanban e modals. Problema de re-render reportado |
| #12 | Presença — CC sem divisão não lista opções 1-7 | ⬜ | `controle-presenca-page.tsx`; `alocacao_horas_cc` (40 rows). Filtro CC não verificado |
| #13 | Presença — CC com divisão lista só opções do setor | ⬜ | Mesma situação do #12 |
| #22 | Abono de Falta — campo Sim/Não | ✅ | `modal-abonar-falta.tsx` (select motivos + confirmação) |
| #23 | Relatório Contabilidade | ✅ | `presenca-historico-page.tsx`: `handleExportExcel`, `ResumoColaborador` com faltas, faltasAbonadas, minutosAtrasoTotal |
| #30 | Filtros por período no perfil de colaboradores | ✅ | `presenca-historico-page.tsx` (seletor período data início/fim) |
| #33 | Página do Colaborador (filtros, exportar) | ✅ | `colaborador-detalhes-page.tsx` + `presenca-historico-colaborador-page.tsx` + tabs |
| #37 / RH-9 | Documentos obrigatórios (100% ou não cadastra) | ⬜ | `documentos_obrigatorios` existe no payload. Validar preenchimento antes de salvar, impedindo cadastro incompleto |
| #38 | Abono — campo de anexo | ✅ | `modal-abonar-falta.tsx` L99-108: Input file (pdf/png/jpg) |
| #39 / RH-10 | Abono — edição só diretoria | ⬜ | Ajustar RBAC para somente nível diretoria editar abonos |
| #40 / RH-11 | Minutos → Horas (>60 min) | ⬜ | Atualizar `formatMinutosAtraso` para converter >60 min em horas (2 casas decimais) |
| #41 / RH-12 | Botão "Voltar" no detalhamento de frequência | ⬜ | Adicionar `<Button variant="ghost">Voltar</Button>` em `presenca-detalhes-page.tsx` |
| RH-1 | Disponibilidade do colaborador (escritório/obras/outros) | ⬜ | Adicionar campo `disponibilidade` em `colaboradores` + `modal-cadastro-colaborador.tsx` |
| RH-2 | Modelos de contratos (CLT, prestador) | ⬜ | Criar área em "Modelos" (ver G-4) e associar ao modal de admissão |
| RH-3 | Controle de presença: folga/férias + desprezar custo dia | ⬜ | Incluir opção "folga/férias" no controle diário; ajustar cálculo de custos no back-end |
| RH-4 | Faltas e CC — lógica condicional por `nivelCargo` | ⬜ | Diretoria: ocultar na lista. Coordenação: só presença (sem rateio CC). Operacional: todas opções. Faltas: desprezar custo dia |
| RH-5 | Botão "Repetir de ontem" — copiar alocações CC do dia anterior | ⬜ | Garantir cópia incluindo percentagens |
| RH-6 | Documentos periódicos e penalidades | ⬜ | `colaborador-detalhes-page.tsx`: nova aba "Documentos" com upload categorizado (Atestados, Penalidades, EPIs…) |
| RH-7 | Página financeira do colaborador | ⬜ | Página unificada: salários, férias, EPIs, links para documentos |
| R11-21 | 🆕 Presença — verificar se CC filtra por setor do colaborador (só CCs do setor) | ⬜ | Pedro: "a gente estava fazendo isso, não conferi ainda". Val confirmou que é necessário |
| R11-22 | 🆕 Remover setores fictícios — empresa só tem 2 setores (obras + assessoria/administrativo) | ⬜ | Val: "vocês criaram vários setores, TI, administrativo… a empresa só tem dois setores." Pedro confirmou que vai limpar |

> [!NOTE]
> **Relatório Contabilidade:** 2 botões (completo + contabilidade), período 1º–último dia do mês, dados = nome + faltas não abonadas + atraso total em horas.

---

## 8 · Ordens de Serviço — Geral

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #18 | Remover OS 11/12/13 da tela principal | ⬜ | `os-creation-hub.tsx` ainda lista todas as OS |
| #45 / G-1 | Status "Cancelado" para OS | ⬜ | Adicionar `cancelada` à enum `status_geral`; permitir cancelamento por gestores/coordenadores; atualizar stepper |
| G-2 | Validação de campos obrigatórios | ⬜ | Validar por campo nos `Step*`; usar `toast.error`; centralizar em utilitário reutilizado em `useWorkflowCompletion` |
| G-3 | Rastreamento de OS07/OS08 (formulários públicos) | ⬜ | Criar página de acompanhamento das OS criadas via links públicos; permitir download do PDF via `generate-pdf` |
| G-4 | Área de Modelos de Documentos — expandir para TODOS os modelos (não só contratos) | ⬜ | `use-modelos-contrato.ts` existe mas suporta apenas modelos de contrato (1 por tipo de OS). Val: "eu tenho vários modelos, não só de contrato". Expandir para suportar N modelos por etapa, incluindo propostas comerciais, apresentação da empresa, etc. |
| G-5 | Proposta comercial pronta (OS-01 a OS-06) — upload de PDF | ⬜ | Na etapa Gerar Proposta, permitir upload de PDF; se upload → marcar etapa concluída |
| G-6 | Aprovação do gestor | ⬜ | Reaproveitar `aprovacao-modal.tsx` (shared/components). Botões "aprovar"/"reprovar" + justificativa |
| R11-23 | 🆕 OS-10 (recrutamento): unificar formulário numa única página (remover separação em etapas) | ⬜ | Val: "ficar tudo na mesma página, todas as informações na mesma pasta". Pedro confirmou a alteração de UI |
| R11-24 | 🆕 OS-10 (recrutamento): cada vaga pode ter um centro de custo diferente (não global) | ⬜ | Val: "uma mesma solicitação pode ter requisição de vários colaboradores de vários centros de custos diferentes" |
| R11-25 | 🆕 OS-10 (recrutamento): adicionar subcategoria de qualificação por tipo de vaga | ⬜ | Val: tipo "operacional administrativo" → subcategorias "auxiliar/assistente"; tipo "10" → "encarregado, oficial pedreiro, servente, etc." Campo `subcategoria` não encontrado no código |
| R11-26 | 🆕 OS-10 (recrutamento): adicionar campo "expectativa de início" (dias) por vaga | ⬜ | Val: "dois oficiais, pedreiros, um tempo, sete dias" — expetativa de quando precisa do colaborador |
| R11-27 | 🆕 OS-13 → link para OS-10: ao criar requisição de mão de obra via OS-13, trazer CC pré-preenchido | ⬜ | Pedro confirmou: "da OS13 é como se ele já trouxesse a informação do centro de custo" |
| R11-28 | 🆕 Mapear TODAS as etapas com modelos de upload (não só contratos) e adicionar botão de download | ⬜ | Val mostrou que há modelos em etapas amarelas: apresentação empresa, proposta comercial, etc. Pedro: "vou mapear essas etapas e adicionar" |

---

## 9 · OS 01–04 (Obras)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| O1-1 | Bug no Follow-up 1 | ⬜ | Revisar `completionRules` passo 3 no fluxo OS-01/04. Corrigir propriedades vs campos do formulário |
| O1-2 | Opção "Não se aplica" no Follow-up 1 | ⬜ | `step-followup-1-os-obra.tsx`: adicionar opção "N/A" nas perguntas 3, 4 e 5 |
| O1-3 | Cadastro de lead (tipo obras) | ⬜ | `cadastrar-lead.tsx`: adicionar `qtdElevadores`, `qtdPiscinas`; remover "Qtd de unidades", "Tipo de empresa", "Qtd pavimentos" |
| O1-4 | Laudo SPCI — campos título/área + fotos + itens extra | ⬜ | `spci-bloco-form.tsx`, `spci-pavimento-form.tsx`, `lib/pdf/spci-dynamic-schema.ts`. Adicionar array `itensExtra` |
| #42 / O1-6 | Tipos de vistoria — incluir "Parecer elétrica" | ⬜ | Tipo `parecer_tecnico + ELÉTRICA` existe em `visita-tecnica-types.ts` mas não deployed/visível no select |
| O1-5 | Relatório de recebimento de unidade autônoma | ⬜ | Template PDF não encontrado no codebase (`recebimento-unidade` 0 resultados) |

---

## 10 · OS-05 / OS-06 (Assessoria)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #14 / A5-1 | OS-05 Escopo → Proposta Comercial | ⬜ | `StepEscopoAssessoria`: edição de modelo de proposta. `StepPrecificacaoAssessoria`: só `valorMensalidade` |
| A5-2 | Agenda de apresentação (Follow-up 3) | ⬜ | `StepAgendarApresentacao`: campo `setorFiltroOverride`; para OS-05/06 passar `administrativo` no `CalendarioIntegracao` |
| A5-3 | Confirmação da Visita — upload de foto obrigatório | ⬜ | `StepRealizarApresentacao`: campo upload (imagem) obrigatório |
| A5-4 | Remover campo "Observações" do Follow-up 3 (OS-05/06) | ⬜ | — |
| A5-5 | Fidelidade ao arquivo do Drive para perguntas do follow-up 3 | ⬜ | Usar documento de referência do cliente como base em `StepAnaliseRelatorio` |
| A5-6 | Bug da cópia do OS-05 na OS-06 | ⬜ | Criar subpasta exclusiva `assessoria/os-6`; duplicar somente componentes comuns; ajustar textos/precificação para avulsa/laudo pontual |
| A5-7 | Percentual de entrada editável (OS-06) | ⬜ | `StepPrecificacaoAssessoria`: permitir edição/remoção do percentual de entrada |
| A5-8 | Campo "Investimento por unidade" (OS-06) | ⬜ | Incluir no modelo de proposta + componente escopo/precificação; mapear para PDF |

---

## 11 · OS-08, OS-11, OS-13 (Vistorias & Recebimento)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #15 | OS-08/OS-11 — Linhas dinâmicas nos formulários | ⬜ | `step-formulario-pos-visita.tsx` existe; lógica linhas extras não confirmada |
| #19 | OS-09 — Dropdown endereço entrega | ✅ | `step-requisicao-compra.tsx`: dropdown escritório/cliente/outro + campo condicional |
| #34 | OS 12/13 só selecionam "Clientes" | ✅ | Diretórios `os-12/`, `os-13/` com steps separados |
| #43 | OS-09 — Endereço escritório sede nas configurações | ⬜ | Endereço hardcoded; configuração dinâmica não implementada |
| #44 | Filtro por tipo de vistoria no Dashboard | ⬜ | Não encontrado |
| V8-1 | Remover opção "Recebimento de imóvel" da lista de tipos de vistoria | ⬜ | Atualizar enumerado de tipos de vistoria (OS-8/11) |
| V8-2 | Adicionar vistoria "Vistoria comum – elétrica" | ⬜ | Incluir na lista `tiposVistoria` e validar fluxos posteriores |
| V8-3 | OS-11 não seguiu o fluxo — etapa questionário pós visita | ⬜ | Garantir inclusão de etapa semelhante ao follow-up 3; criar `step-formulario-pos-visita.tsx` específico se necessário |
| V8-4 | Erros nos modelos da OS-13 | ⬜ | Investigar/corrigir URLs de download e caminhos de storage no Supabase |
| V8-5 | Criar contratos a partir de OS-11/12/13 | ⬜ | Filtrar `ordens_servico` com `status_geral = 'pronto_para_contrato'` e tipo compatível. Exibir lista de seleção |

> [!NOTE]
> **6 tipos de vistoria** (OS 8/11): Recebimento de imóvel, Recebimento unitário autônomo, Vistoria comum elétrica, Vistoria comum civil, Laudo SPDA, Laudo SPCI

---

## 12 · Formulários Dinâmicos (SPCI & SPDA)

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #24 | Regra de Blocos | ✅ | `spci-bloco-form.tsx` + `spda-bloco-form.tsx` com `SPCI_PER_BLOCK_SECTIONS` |
| #25 | Regra de Pavimentos | ✅ | `spci-pavimento-form.tsx` + tabs dinâmicas `getPavimentoLabel()` |
| #26 | PDF dinâmico SPCI/SPDA | ✅ | `lib/pdf/` + `spci-dynamic-schema.ts` |
| #46 | Revisão perguntas formulário | ⏳ | Aguardando Val reanalisar e detalhar |
| R11-29 | 🆕 SPCI — PDF gerado não inclui nome da seção (ex: "Extintores de Incêndio", "Sinalização de Emergência") | ⬜ | Val: "quando gero o documento, ele não vem com essa informação da seção". Os itens são listados sem agrupamento por seção |
| R11-30 | 🆕 SPCI — fotos de "não conforme" não estão sendo salvas/exportadas no PDF | ⬜ | Val: "adicionei fotos em todas onde coloquei não conforme, mas não foi, como se tivesse desprezado". Pedro confirmou bug |
| R11-31 | 🆕 SPCI — conclusão do laudo deve listar qtd de não conformidades com foto e observação | ⬜ | Val: "foram identificadas 32 não conformidades, tem que estar com a foto e a observação do lado" |
| R11-32 | 🆕 Recebimento de unidade autônoma — checklist (conforme/não conforme) vem vazio no PDF | ⬜ | Val: "esse checklist conforme/não conforme e os itens, muito menos a foto" — não gera. Pedro confirmou: "isso é algum bug" |
| R11-33 | 🆕 Recebimento de unidade autônoma — não permite adicionar nova linha (SPCI e SPDA permitem) | ⬜ | Val: "o de recebimento de unidade não está abrindo essa possibilidade de abrir mais uma linha" |

---

## 13 · Integrações Assíncronas

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #16 | WhatsApp e e-mail (estilo iFood) | ⬜ | `mensagem_templates` (6 rows), `mensagens_enviadas` (0 rows). Edge functions `send-email`, `cora-integration` existem — não operacional |
| #17 | Diário de Obras — integração API + exibição na página do cliente | ⬜ | API já implementada no backend (Pedro confirmou), mas **front-end não existe**. Nenhum ficheiro `diario-de-obras` encontrado em `src/`. Relatórios aprovados devem aparecer na página do cliente |
| R11-34 | 🆕 Diário de Obras — mover da página do contrato para a página do cliente | ⬜ | Val: "tem que ficar na página do cliente". Pedro: "eu estava pensando que era no contrato, mas é para o cliente" |
| R11-35 | 🆕 Página do cliente (obras) — logo do cliente, relatórios diário de obras (API), alerta de atraso, percentual de andamento, documentos anexos, botão WhatsApp, botão portfólio | ⬜ | Val detalhou os requisitos da página. Só relatórios aprovados devem aparecer |
| R11-36 | 🆕 Página de contratos — OS de cada contrato, faturas, centro de custos, histórico de OS | ⬜ | Pedro: "a página do contrato vai ser onde a partir desse contrato você vai abrir aquelas outras OS" |

---

## 14 · Gestão do Projeto

| ID | Tarefa | Status | Contexto / Arquivos |
|----|--------|--------|---------------------|
| #47 | Backlog no ClickUp | ⏳ | Em andamento |

---

## 15 · Perguntas & Pendências Gerais

| ID | Tarefa | Status | Contexto |
|----|--------|--------|----------|
| P-1 | Cálculo de custos por setor | ℹ️ Info | Usa `custos_overhead_mensal` e `custos_variaveis_colaborador`; alocado aos CCs na conciliação bancária e rateio de presença |
| P-2 | Excluir dados fictícios | ⬜ | Vide C-5 / R11-12 — rotina de limpeza de `leads`, `clientes`, `colaboradores` de teste |
| P-3 | Agendamento de aniversários | ⬜ | Confirmar se a rotina de criação de eventos de aniversário está ativa na edge function de cliente |
| P-4 | 🆕 Investigar modelo Conta Azul para benchmark de conciliação bancária | ⬜ | Pedro: "vou dar uma olhada na conta azul, como eles fazem essa solução" |

---

## 📈 Resumo de Progresso

| Métrica | Valor |
|---------|-------|
| **Total de tarefas únicas** | ~121 |
| **Concluídas** ✅ | 34 |
| **Pendentes** ⬜ | ~83 |
| **Aguardando input** ⏳ | 3 |
| **Informativas** ℹ️ | 1 |
| **Novas da Reunião 11/03** 🆕 | 36 |

> [!WARNING]
> **Itens que NÃO puderam ser 100% verificados no frontend (pode estar no backend/edge functions):**
> - #28 Regra de desprezo — lógica provavelmente em SQL/backend
> - #23 Relatório contabilidade — botão "contabilidade" vs "completo" não confirmado visualmente
> - #34 OS 12/13 só clientes — filtro explícito `tipo !== 'lead'` não encontrado textualmente
> - #17 Diário de Obras — Pedro confirmou que API backend está implementada, mas front-end não existe
