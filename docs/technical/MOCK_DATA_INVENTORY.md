# Inventário de Dados Mockados - MinervaV2

## 📋 Sumário Executivo

Este documento mapeia **todos os dados mockados** (falsos/simulados) presentes no sistema MinervaV2, identificando:
- **Onde** estão definidos
- **Como** são usados
- **Qual tabela do Supabase** deve substituí-los
- **Complexidade** estimada para a migração

**Status Atual**: Sistema opera majoritariamente com dados mockados. A migração para Supabase está em andamento.

---

## 📊 Estatísticas do Inventário

| Categoria | Arquivos Mock | Componentes Afetados | Complexidade Geral |
|-----------|---------------|----------------------|-------------------|
| Dados Centralizados | 4 arquivos | 23+ componentes | Média-Alta |
| Dados Inline | 16+ componentes | 16+ | Baixa-Média |
| **Total** | **20+** | **39+** | **Média** |

---

## 🗂️ Arquivos Mock Centralizados

### 1. `src/lib/mock-data.ts`
**Descrição**: Arquivo principal contendo dados mockados do core do sistema.

#### 1.1 Tipos de OS (`tiposOS`)
- **Localização**: `src/lib/mock-data.ts:19-33`
- **Descrição**: Lista de 13 tipos de Ordem de Serviço (OS 01 a OS 13)
- **Estrutura**: Array de objetos `{ id, label }`
- **Uso**:
  - Importado em `src/components/os/os-filters-card.tsx`
  - Usado em formulários de criação de OS
  - Usado em filtros de listagem
- **Destino (Backend)**: `public.tipos_os` (tabela)
  - Campos: `id`, `codigo`, `nome`, `descricao`, `setor_slug`
- **Complexidade**: **Baixa**
  - ✅ Tabela já existe no banco
  - ✅ Migração: Substituir importação por `tiposOSAPI.list()`
- **Discrepância de Tipos**: ⚠️ Mock usa `id: string`, banco usa `id: integer`

#### 1.2 Clientes (`mockClientes`)
- **Localização**: `src/lib/mock-data.ts:40-51`
- **Descrição**: Lista de 10 clientes mockados (status: 'cliente')
- **Estrutura**: Array de `{ id, nome, cnpj }`
- **Uso**:
  - Formulários de seleção de cliente
  - Autocomplete de clientes
- **Destino (Backend)**: `public.clientes`
  - Campos: `id`, `nome`, `cnpj_cpf`, `tipo_pessoa`, `status`
- **Complexidade**: **Baixa**
  - ✅ Tabela existe
  - ✅ API disponível: `clientesAPI.list()`
  - ⚠️ Filtrar por `status = 'ativo'`

#### 1.3 Leads (`mockLeads`)
- **Localização**: `src/lib/mock-data.ts:54-195`
- **Descrição**: Lista de 10 leads mockados com dados completos (status: 'lead')
- **Estrutura**: Array de objetos com 14 campos cada
- **Campos**: `id, nome, cpfCnpj, tipo, tipoEdificacao, qtdUnidades, qtdBlocos, tipoTelhado, endereco, telefone, email, status`
- **Uso**:
  - `src/app/colaborador/leads/page.tsx`
  - `src/components/comercial/lista-leads.tsx`
  - Formulários de captação de leads
- **Destino (Backend)**: `public.clientes` (mesmo destino que clientes)
  - Filtrar por `status = 'lead'`
- **Complexidade**: **Média**
  - ✅ Estrutura de tabela existe
  - ⚠️ Campos extras de lead podem estar em tabela separada ou JSONB
  - Verificar se campos `tipoEdificacao`, `qtdUnidades`, `tipoTelhado` estão mapeados

#### 1.4 Usuários (`mockUsers`)
- **Localização**: `src/lib/mock-data.ts:201-524`
- **Descrição**: Estrutura hierárquica completa com 13 usuários mockados
- **Níveis**: Diretoria (1) → Gestores (3) → Colaboradores (6) → Mão de Obra (3)
- **Estrutura**: Array de objetos `User` (17 campos)
- **Campos**: `id, nome_completo, email, role_nivel, setor, supervisor_id, status_colaborador, data_admissao, telefone, cpf, avatar, pode_delegar, pode_aprovar, setores_acesso, modulos_acesso`
- **Uso**:
  - `src/components/delegacao/modal-delegar-os.tsx`
  - `src/components/configuracoes/usuarios-permissoes-page.tsx`
  - `src/components/colaboradores/colaboradores-lista-page.tsx`
  - Autenticação e controle de acesso
- **Destino (Backend)**:
  - `auth.users` (autenticação)
  - `public.usuarios` (dados complementares)
  - `public.cargos` (roles e permissões)
  - `public.setores` (departamentos)
- **Complexidade**: **Alta**
  - ⚠️ Estrutura hierárquica complexa
  - ⚠️ Múltiplas tabelas envolvidas
  - ⚠️ RLS (Row Level Security) precisa ser configurado
  - ⚠️ Migração de permissões e relacionamentos supervisor-subordinado

#### 1.5 Ordens de Serviço (`mockOrdensServico`)
- **Localização**: `src/lib/mock-data.ts:526-659`
- **Descrição**: 6 Ordens de Serviço mockadas com diferentes status
- **Estrutura**: Array de objetos `OrdemServico` (15+ campos)
- **Campos**: `id, codigo, cliente, tipo, titulo, descricao, status, setor, responsavel, prazoInicio, prazoFim, createdAt, updatedAt, numeroEtapaAtual, statusEtapaAtual, etapaAtual`
- **Uso**:
  - `src/components/os/os-list-page.tsx`
  - `src/app/colaborador/minhas-os/page.tsx`
  - `src/routes/_auth/os/$osId.tsx`
  - Dashboard e listagens
- **Destino (Backend)**: `public.ordens_servico`
  - Join com `public.clientes`, `public.tipos_os`, `public.usuarios`
- **Complexidade**: **Alta**
  - ✅ Tabela existe
  - ⚠️ Relacionamentos complexos (cliente, responsável, tipo)
  - ⚠️ Etapas em tabela separada (`os_etapas`)
  - ⚠️ Status de etapa precisa ser calculado dinamicamente

#### 1.6 Etapas de OS (`mockEtapas`)
- **Localização**: `src/lib/mock-data.ts:667-704`
- **Descrição**: Etapas mockadas para 4 OSs (OS 1, 2, 3, 5)
- **Estrutura**: Array de objetos `OsEtapa` (9 campos)
- **Campos**: `id, os_id, ordem, nome_etapa, status, dados_etapa, data_inicio, data_conclusao`
- **Uso**:
  - Hook customizado (verificar `src/lib/hooks/use-etapas.ts` se existir)
  - Visualização de workflow de OS
- **Destino (Backend)**: `public.os_etapas`
- **Complexidade**: **Média**
  - ✅ Estrutura de workflow já definida
  - ⚠️ Campo `dados_etapa` é JSONB (flexível)
  - Migração: Usar `ordensServicoAPI.getEtapas(osId)`

#### 1.7 Comentários (`mockComentarios`)
- **Localização**: `src/lib/mock-data.ts:706-734`
- **Descrição**: 3 comentários mockados para OS-001
- **Estrutura**: Array de `Comentario` (7 campos)
- **Destino (Backend)**: `public.os_comentarios`
- **Complexidade**: **Baixa**
  - Relação simples 1:N com `ordens_servico`

#### 1.8 Documentos (`mockDocumentos`)
- **Localização**: `src/lib/mock-data.ts:736-764`
- **Descrição**: 3 documentos mockados (PDFs)
- **Destino (Backend)**:
  - `public.os_documentos` (metadados)
  - `storage.os-documentos` (arquivos)
- **Complexidade**: **Média**
  - ⚠️ Integração com Supabase Storage necessária

#### 1.9 Histórico (`mockHistorico`)
- **Localização**: `src/lib/mock-data.ts:766-831`
- **Descrição**: 8 eventos de histórico para OS-001
- **Destino (Backend)**: `public.os_historico` ou trigger automático
- **Complexidade**: **Baixa**

---

### 2. `src/lib/mock-data-colaborador.ts`
**Descrição**: Dados mockados para o módulo Colaborador.

#### 2.1 Usuário Colaborador Logado (`mockUserColaborador`)
- **Localização**: `src/lib/mock-data-colaborador.ts:9-17`
- **Descrição**: Dados do colaborador logado (Carlos Silva)
- **Uso**:
  - `src/app/colaborador/dashboard/page.tsx`
  - Contexto de autenticação do módulo colaborador
- **Destino (Backend)**: `auth.users` + `public.usuarios`
- **Complexidade**: **Baixa**
  - Substituir por `useAuth()` hook ou `supabase.auth.getUser()`

#### 2.2 Ordens de Serviço do Colaborador (`mockOrdensServico`)
- **Localização**: `src/lib/mock-data-colaborador.ts:20-328`
- **Descrição**: 18 OSs atribuídas ao colaborador "Carlos Silva"
- **Campos**: Similar ao mock-data.ts, mas com foco em dados operacionais
- **Uso**:
  - `src/app/colaborador/minhas-os/page.tsx`
  - `src/app/colaborador/minhas-os/[id]/page.tsx`
- **Destino (Backend)**: `public.ordens_servico`
  - Filtrar por `responsavel_id = {user_id}`
- **Complexidade**: **Média**
  - ⚠️ Necessário filtro por usuário logado

#### 2.3 Clientes (`mockClientes`)
- **Localização**: `src/lib/mock-data-colaborador.ts:331-662`
- **Descrição**: 30 clientes mockados (PJ e PF)
- **Uso**:
  - `src/app/colaborador/clientes/page.tsx`
  - Autocomplete de seleção de clientes
- **Destino (Backend)**: `public.clientes`
- **Complexidade**: **Baixa**

#### 2.4 Eventos de Agenda (`mockEventosAgenda`)
- **Localização**: `src/lib/mock-data-colaborador.ts:665-900`
- **Descrição**: 18 eventos de agenda (vistorias, reuniões, follow-ups)
- **Campos**: `id, titulo, osId, osCodigo, cliente, endereco, data, horaInicio, horaFim, tipo, responsavel`
- **Uso**:
  - `src/app/colaborador/agenda/page.tsx`
  - Calendário do colaborador
- **Destino (Backend)**: `public.agendamentos`
  - Relacionado com `ordens_servico`
- **Complexidade**: **Média**
  - ⚠️ Integração com calendário (FullCalendar ou similar)
  - Verificar se tabela `agendamentos` existe

#### 2.5 Leads Comerciais (`mockLeads`)
- **Localização**: `src/lib/mock-data-colaborador.ts:903-1164`
- **Descrição**: 20 leads comerciais mockados
- **Campos**: `id, nome, contato, telefone, email, origem, status, potencial, observacoes, criadoPor, criadoEm`
- **Uso**:
  - `src/app/colaborador/leads/page.tsx`
  - Módulo comercial/CRM
- **Destino (Backend)**: `public.clientes` (filtrar por `status = 'lead'`)
  - Ou tabela separada `public.leads`
- **Complexidade**: **Média**

---

### 3. `src/lib/mock-data-comercial.ts`
**Descrição**: Dados mockados para o módulo Comercial/CRM.

#### 3.1 Leads (`mockLeads`)
- **Localização**: `src/lib/mock-data-comercial.ts:110-418`
- **Descrição**: 20 leads detalhados com interações
- **Interface**: `Lead` (13 campos)
- **Campos**: `id, nome, email, telefone, origem, status, dataCadastro, ultimaInteracao, interesse, valorEstimado, responsavelId, responsavelNome, cidade, observacoes`
- **Uso**:
  - `src/components/comercial/lista-leads.tsx`
  - `src/components/comercial/detalhes-lead.tsx`
  - `src/components/comercial/dashboard-comercial.tsx`
- **Destino (Backend)**: `public.leads` ou `public.clientes` (status = 'lead')
- **Complexidade**: **Média-Alta**
  - ⚠️ Funil de vendas complexo (8 status diferentes)
  - ⚠️ Integração com histórico de interações

#### 3.2 Interações com Leads (`mockInteracoes`)
- **Localização**: `src/lib/mock-data-comercial.ts:424-702`
- **Descrição**: 28 interações mockadas (ligações, emails, reuniões, etc.)
- **Interface**: `InteracaoLead` (7 campos)
- **Campos**: `id, leadId, tipo, data, usuarioId, usuarioNome, descricao, proximo_passo`
- **Uso**:
  - `src/components/comercial/detalhes-lead.tsx`
  - Linha do tempo de interações com cliente
- **Destino (Backend)**: `public.lead_interacoes`
- **Complexidade**: **Média**
  - Relação 1:N com leads

#### 3.3 Propostas Comerciais (`mockPropostasComerciais`)
- **Localização**: `src/lib/mock-data-comercial.ts:708-907`
- **Descrição**: 10 propostas comerciais mockadas
- **Interface**: `PropostaComercial` (18 campos)
- **Campos**: `id, osId, osNumero, osTipo, leadId, leadNome, clienteNome, valorProposta, dataEnvio, dataValidade, status, tipoServico, descricaoServico, prazoExecucao, responsavelId, responsavelNome, feedbacks`
- **Uso**:
  - `src/components/comercial/propostas-comerciais.tsx`
  - Dashboard comercial
- **Destino (Backend)**: `public.propostas_comerciais`
  - Relacionado com `ordens_servico` e `leads`
- **Complexidade**: **Alta**
  - ⚠️ Ciclo de vida complexo (aguardando → negociação → aprovada/recusada)
  - ⚠️ Conversão de lead em cliente após aprovação

#### 3.4 Métricas Comerciais (`mockMetricasComerciais`)
- **Localização**: `src/lib/mock-data-comercial.ts:913-922`
- **Descrição**: KPIs do módulo comercial
- **Campos**: `totalLeads, leadsMes, taxaConversao, propostasAbertas, valorPropostasAbertas, contratosFechados, contratosMes, valorContratosMes`
- **Destino (Backend)**: Views calculadas ou RPC functions
  - Exemplo: `v_metricas_comerciais`, `fn_calcular_taxa_conversao()`
- **Complexidade**: **Média**
  - ⚠️ Requer agregações e cálculos dinâmicos

#### 3.5 Funil de Vendas (`mockFunilVendas`)
- **Localização**: `src/lib/mock-data-comercial.ts:928-969`
- **Descrição**: Dados do funil por etapa
- **Interface**: `FunilVendas` (3 campos)
- **Destino (Backend)**: View ou função: `v_funil_vendas`
- **Complexidade**: **Média**

---

### 4. `src/lib/mock-data-gestores.ts`
**Descrição**: Dados mockados para módulos de Gestor de Assessoria e Gestor de Obras.

#### 4.1 Laudos Pendentes (`mockLaudosPendentes`)
- **Localização**: `src/lib/mock-data-gestores.ts:45-104`
- **Descrição**: 5 laudos técnicos pendentes de aprovação
- **Interface**: `LaudoPendente` (9 campos)
- **Campos**: `id, codigo, cliente, tipoLaudo, tipoOS, autor, dataSubmissao, status, arquivoRascunho, observacoes`
- **Uso**:
  - `src/components/assessoria/fila-aprovacao-laudos.tsx`
  - `src/components/dashboard/dashboard-gestor-assessoria.tsx`
- **Destino (Backend)**: `public.laudos`
  - Filtrar por `status IN ('PENDENTE_REVISAO', 'EM_REVISAO')`
- **Complexidade**: **Média**
  - ⚠️ Integração com Supabase Storage para PDFs
  - ⚠️ Workflow de aprovação (gestor → aprovado/rejeitado)

#### 4.2 Reformas Pendentes (`mockReformasPendentes`)
- **Localização**: `src/lib/mock-data-gestores.ts:107-186`
- **Descrição**: 5 reformas condominiais pendentes de análise
- **Interface**: `ReformaPendente` (10+ campos)
- **Campos**: `id, codigo, condominio, unidade, tipoReforma, statusDocumentacao, statusAprovacao, dataSolicitacao, responsavel, valorEstimado, documentos`
- **Uso**:
  - `src/components/assessoria/analise-reformas.tsx`
  - Gestão de reformas em condomínios (OS-07)
- **Destino (Backend)**: `public.reformas`
  - Ou subcoleção dentro de `ordens_servico` (tipo OS_07)
- **Complexidade**: **Alta**
  - ⚠️ Workflow complexo: documentação → análise técnica → aprovação
  - ⚠️ Múltiplos documentos (ART, RRT, projetos, memoriais)

#### 4.3 KPIs Assessoria (`mockKPIsAssessoria`)
- **Localização**: `src/lib/mock-data-gestores.ts:189-196`
- **Descrição**: Indicadores do Gestor de Assessoria
- **Destino (Backend)**: Views ou RPCs
  - `v_kpis_assessoria`
- **Complexidade**: **Média**

#### 4.4 Obras Ativas (`mockObrasAtivas`)
- **Localização**: `src/lib/mock-data-gestores.ts:239-330`
- **Descrição**: 6 obras em andamento
- **Interface**: `ObraAtiva` (13 campos)
- **Campos**: `id, codigo, tipoOS, cliente, tituloObra, percentualConcluido, statusCronograma, dataInicio, dataPrevistaTermino, responsavel, ultimoDiarioObra, valorContrato, localidade`
- **Uso**:
  - `src/components/obras/lista-obras-ativas.tsx`
  - `src/components/dashboard/dashboard-gestor-obras.tsx`
- **Destino (Backend)**: `public.obras`
  - Ou filtro em `ordens_servico` (tipos OS_01, OS_02, OS_03, OS_04, OS_13)
- **Complexidade**: **Alta**
  - ⚠️ Controle de cronograma físico-financeiro
  - ⚠️ Diário de obra (tabela separada ou storage)

#### 4.5 Medições Pendentes (`mockMedicoesPendentes`)
- **Localização**: `src/lib/mock-data-gestores.ts:333-422`
- **Descrição**: 5 medições de obra pendentes de aprovação
- **Interface**: `MedicaoPendente` (12+ campos)
- **Campos**: `id, codigo, obraId, obraCliente, numeroMedicao, tipoMedicao, percentualMedido, valorMedicao, dataEnvio, responsavel, statusAprovacao, documentos, observacoes`
- **Uso**:
  - `src/components/obras/aprovacao-medicoes.tsx`
- **Destino (Backend)**: `public.medicoes`
  - Relacionado com `obras` ou `ordens_servico`
- **Complexidade**: **Alta**
  - ⚠️ Workflow de aprovação financeira
  - ⚠️ Medições física vs. financeira
  - ⚠️ Documentos: relatório fotográfico, planilha, diário de obra

#### 4.6 KPIs Obras (`mockKPIsObras`)
- **Localização**: `src/lib/mock-data-gestores.ts:425-432`
- **Descrição**: Indicadores do Gestor de Obras
- **Destino (Backend)**: `v_kpis_obras`
- **Complexidade**: **Média**

#### 4.7 Evolução Física Geral (`mockEvolucaoFisicaGeral`)
- **Localização**: `src/lib/mock-data-gestores.ts:435-442`
- **Descrição**: Dados de gráfico (planejado vs. executado)
- **Destino (Backend)**: Função ou view: `fn_evolucao_fisica_obras()`
- **Complexidade**: **Média**

---

## 📦 Dados Mockados Inline em Componentes

### Módulo Financeiro

#### 1. `src/components/financeiro/financeiro-dashboard-page.tsx`
- **Dados Mockados**:
  - `mockKPIs` (linhas 30-37): KPIs financeiros
  - `mockReceitasComparacao` (linhas 40-47): Histórico de receitas
  - `mockDespesasComparacao` (linhas 49-56): Histórico de despesas
- **Destino (Backend)**:
  - `public.financeiro` (receitas e despesas)
  - Views: `v_kpis_financeiros`, `v_receitas_mensais`, `v_despesas_mensais`
- **Complexidade**: **Média**

#### 2. `src/components/financeiro/contas-pagar-page.tsx`
- **Provável Mock**: Lista de contas a pagar
- **Destino**: `public.financeiro` (tipo = 'despesa')
- **Complexidade**: **Baixa**

#### 3. `src/components/financeiro/contas-receber-page.tsx`
- **Provável Mock**: Lista de contas a receber
- **Destino**: `public.financeiro` (tipo = 'receita')
- **Complexidade**: **Baixa**

#### 4. `src/components/financeiro/prestacao-contas-page.tsx`
- **Provável Mock**: Relatórios de prestação de contas
- **Destino**: `public.prestacoes_contas` ou função de relatório
- **Complexidade**: **Média**

#### 5. `src/components/financeiro/conciliacao-bancaria-page.tsx`
- **Provável Mock**: Extratos bancários e conciliações
- **Destino**: `public.conciliacoes_bancarias`
- **Complexidade**: **Alta** (integração bancária)

#### 6. `src/components/financeiro/modal-custo-flutuante.tsx`
- **Provável Mock**: Tipos de custos flutuantes
- **Destino**: `public.tipos_custos` ou inline no componente
- **Complexidade**: **Baixa**

---

### Módulo Portal do Cliente

#### 7. `src/components/portal/portal-cliente-assessoria.tsx`
- **Dados Mockados**:
  - `mockSolicitacoes` (linhas 43-75): Solicitações de vistoria e reforma
  - `mockRelatorios` (linhas 77-81): Relatórios mensais
- **Destino (Backend)**:
  - `public.solicitacoes_cliente` (vistorias/reformas)
  - `public.relatorios_mensais` ou storage
- **Complexidade**: **Média**

#### 8. `src/components/portal/portal-cliente-obras.tsx`
- **Provável Mock**: Medições de obra, cronograma, fotos
- **Destino**:
  - `public.medicoes`
  - `storage.fotos-obra`
- **Complexidade**: **Média**

---

### Módulo Colaboradores/RH

#### 9. `src/components/colaboradores/colaboradores-lista-page.tsx`
- **Uso**: Importa `mockUsers` de `mock-data.ts`
- **Destino**: `public.usuarios`
- **Complexidade**: **Baixa** (já mapeado acima)

#### 10. `src/components/colaboradores/controle-presenca-page.tsx`
- **Provável Mock**: Registros de ponto/presença
- **Destino**: `public.registros_presenca`
- **Complexidade**: **Média**

#### 11. `src/components/colaboradores/controle-presenca-tabela-page.tsx`
- **Similar ao anterior**
- **Complexidade**: **Média**

---

### Módulo Admin/Configurações

#### 12. `src/components/configuracoes/usuarios-permissoes-page.tsx`
- **Uso**: Importa `mockUsers` de `mock-data.ts`
- **Destino**: `public.usuarios` + `public.permissoes`
- **Complexidade**: **Média**

#### 13. `src/components/admin/seed-usuarios-page.tsx`
- **Uso**: Página de seed (popular banco com usuários mockados)
- **Ação**: Migração one-time, não precisa substituir
- **Complexidade**: **N/A** (ferramenta de desenvolvimento)

---

### Outros Componentes

#### 14. `src/components/os/os-list-page.tsx`
- **Uso**: Importa `mockOrdensServico` de `mock-data.ts`
- **Destino**: `public.ordens_servico`
- **Complexidade**: **Média**

#### 15. `src/components/os/steps/os08/step-gerar-documento.tsx`
- **Provável Mock**: Templates de documentos
- **Destino**: `public.templates_documentos` ou inline
- **Complexidade**: **Baixa**

#### 16. `src/components/os/os-filters-card.tsx`
- **Uso**: Importa `tiposOS` de `mock-data.ts`
- **Destino**: `public.tipos_os`
- **Complexidade**: **Baixa**

---

## 🔄 Plano de Migração Recomendado

### Fase 1: Dados de Referência (1-2 dias)
**Complexidade**: Baixa
**Prioridade**: Alta

1. ✅ **Tipos de OS** (`tiposOS`)
   - Substituir por `tiposOSAPI.list()`
   - Arquivos afetados: 2-3

2. ✅ **Clientes** (`mockClientes`)
   - Substituir por `clientesAPI.list({ status: 'ativo' })`
   - Arquivos afetados: 5-7

3. ✅ **Usuários** (`mockUsers`)
   - Substituir por `usuariosAPI.list()`
   - ⚠️ Atenção para hierarquia e permissões
   - Arquivos afetados: 8-10

---

### Fase 2: Ordens de Serviço (3-5 dias)
**Complexidade**: Média-Alta
**Prioridade**: Alta

1. **OSs Principais** (`mockOrdensServico`)
   - Substituir por `ordensServicoAPI.list()`
   - Implementar filtros (status, responsável, setor)
   - Arquivos afetados: 10-15

2. **Etapas de OS** (`mockEtapas`)
   - Substituir por `ordensServicoAPI.getEtapas(osId)`
   - Implementar cálculo de status dinâmico
   - Arquivos afetados: 3-5

3. **Comentários e Documentos**
   - APIs: `osComentariosAPI`, `osDocumentosAPI`
   - Integrar Supabase Storage
   - Arquivos afetados: 2-3

---

### Fase 3: Módulo Comercial/CRM (5-7 dias)
**Complexidade**: Alta
**Prioridade**: Média

1. **Leads** (`mockLeads` - comercial)
   - Criar `leadsAPI.list()`, `leadsAPI.create()`, etc.
   - Implementar funil de vendas
   - Arquivos afetados: 8-12

2. **Interações com Leads**
   - API: `leadInteracoesAPI`
   - Timeline/histórico
   - Arquivos afetados: 3-5

3. **Propostas Comerciais**
   - API: `propostasAPI`
   - Workflow de aprovação
   - Arquivos afetados: 2-3

4. **Métricas e Funil**
   - Views/RPCs: `v_metricas_comerciais`, `v_funil_vendas`
   - Dashboard dinâmico
   - Arquivos afetados: 2-3

---

### Fase 4: Módulos de Gestores (5-7 dias)
**Complexidade**: Alta
**Prioridade**: Média

#### Gestor de Assessoria
1. **Laudos Pendentes**
   - API: `laudosAPI.listPendentes()`
   - Workflow de aprovação
   - Storage para PDFs
   - Arquivos afetados: 3-4

2. **Reformas Pendentes**
   - API: `reformasAPI.listPendentes()`
   - Gestão de documentos (ART, RRT)
   - Arquivos afetados: 2-3

#### Gestor de Obras
1. **Obras Ativas**
   - API: `obrasAPI.listAtivas()`
   - Cronograma físico-financeiro
   - Arquivos afetados: 4-5

2. **Medições Pendentes**
   - API: `medicoesAPI.listPendentes()`
   - Workflow de aprovação
   - Relatórios fotográficos (Storage)
   - Arquivos afetados: 2-3

---

### Fase 5: Módulo Financeiro (3-5 dias)
**Complexidade**: Média-Alta
**Prioridade**: Média

1. **Contas a Pagar/Receber**
   - API: `financeiroAPI.list({ tipo: 'receita|despesa' })`
   - Filtros por período, status
   - Arquivos afetados: 6-8

2. **Dashboard Financeiro**
   - Views: `v_kpis_financeiros`, `v_receitas_mensais`
   - Gráficos dinâmicos (Recharts)
   - Arquivos afetados: 3-4

3. **Prestação de Contas e Conciliação**
   - APIs específicas
   - ⚠️ Pode requerer integração externa (bancária)
   - Arquivos afetados: 3-4

---

### Fase 6: Módulo Colaborador (3-4 dias)
**Complexidade**: Média
**Prioridade**: Baixa (usa dados já migrados)

1. **Dashboard Colaborador**
   - Reutilizar APIs de OSs, Agendamentos, Leads
   - Filtrar por usuário logado: `responsavel_id = {auth.uid()}`
   - Arquivos afetados: 5-7

2. **Agenda**
   - API: `agendamentosAPI.list({ usuario_id })`
   - Integração com calendário
   - Arquivos afetados: 1-2

3. **Presença/Ponto**
   - API: `presencaAPI`
   - Arquivos afetados: 2-3

---

### Fase 7: Portal do Cliente (2-3 dias)
**Complexidade**: Baixa-Média
**Prioridade**: Baixa

1. **Portal Assessoria**
   - APIs: `solicitacoesClienteAPI`, `relatoriosAPI`
   - Arquivos afetados: 1

2. **Portal Obras**
   - Reutilizar APIs de medições e obras
   - Filtrar por cliente
   - Arquivos afetados: 1

---

## 📋 Checklist de Migração (Por Arquivo Mock)

### ✅ `src/lib/mock-data.ts`
- [ ] `tiposOS` → `tiposOSAPI.list()`
- [ ] `mockClientes` → `clientesAPI.list({ status: 'ativo' })`
- [ ] `mockLeads` → `clientesAPI.list({ status: 'lead' })`
- [ ] `mockUsers` → `usuariosAPI.list()`
- [ ] `mockOrdensServico` → `ordensServicoAPI.list()`
- [ ] `mockEtapas` → `ordensServicoAPI.getEtapas(osId)`
- [ ] `mockComentarios` → `osComentariosAPI.list(osId)`
- [ ] `mockDocumentos` → `osDocumentosAPI.list(osId)` + Storage
- [ ] `mockHistorico` → `osHistoricoAPI.list(osId)` ou trigger

### ✅ `src/lib/mock-data-colaborador.ts`
- [ ] `mockUserColaborador` → `useAuth().user` + `usuariosAPI.getById()`
- [ ] `mockOrdensServico` → `ordensServicoAPI.listByUser(userId)`
- [ ] `mockClientes` → `clientesAPI.list()`
- [ ] `mockEventosAgenda` → `agendamentosAPI.list({ usuario_id })`
- [ ] `mockLeads` → `leadsAPI.listByUser(userId)`

### ✅ `src/lib/mock-data-comercial.ts`
- [ ] `mockLeads` → `leadsAPI.list()`
- [ ] `mockInteracoes` → `leadInteracoesAPI.list(leadId)`
- [ ] `mockPropostasComerciais` → `propostasAPI.list()`
- [ ] `mockMetricasComerciais` → `v_metricas_comerciais` (view)
- [ ] `mockFunilVendas` → `v_funil_vendas` (view)

### ✅ `src/lib/mock-data-gestores.ts`
- [ ] `mockLaudosPendentes` → `laudosAPI.listPendentes()`
- [ ] `mockReformasPendentes` → `reformasAPI.listPendentes()`
- [ ] `mockKPIsAssessoria` → `v_kpis_assessoria` (view)
- [ ] `mockObrasAtivas` → `obrasAPI.listAtivas()`
- [ ] `mockMedicoesPendentes` → `medicoesAPI.listPendentes()`
- [ ] `mockKPIsObras` → `v_kpis_obras` (view)
- [ ] `mockEvolucaoFisicaGeral` → `fn_evolucao_fisica_obras()` (RPC)

---

## ⚠️ Discrepâncias de Tipos Identificadas

### 1. Tipos de OS - ID
- **Mock**: `id: string` (ex: '01', '02')
- **Banco**: `id: integer` (autoincrement)
- **Solução**: Usar campo `codigo` (string) como identificador de negócio

### 2. Datas
- **Mock**: Mix de `Date`, `string` (ISO), `string` (BR)
- **Banco**: `timestamp with time zone`
- **Solução**: Padronizar para ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)

### 3. Status (Enums)
- **Mock**: Mix de UPPERCASE e camelCase
- **Banco**: Sempre lowercase com underscore (`em_andamento`, `concluida`)
- **Solução**: Usar enums do banco (`src/lib/types.ts:32-64`)

### 4. Campos Opcionais
- **Mock**: Vários campos obrigatórios
- **Banco**: Muitos campos `NULL` permitidos
- **Solução**: Atualizar interfaces TypeScript com `?` (opcional)

---

## 🚀 Próximos Passos

1. **Revisão com o Time**
   - Validar prioridades das fases
   - Alocar desenvolvedores por fase

2. **Setup de APIs**
   - Criar estrutura base em `src/lib/api/` (se ainda não existe)
   - Implementar padrão de API client (ex: `api-client.ts`)

3. **Migrations e Seeds**
   - Popular tabelas de referência (tipos_os, setores, cargos)
   - Criar dados de teste no Supabase

4. **Testes**
   - Testar cada API antes de integrar no frontend
   - Validar RLS policies (segurança)

5. **Documentação**
   - Atualizar este documento conforme migrações forem concluídas
   - Documentar APIs criadas

---

## 📚 Referências

- **Tipos do Sistema**: `src/lib/types.ts`
- **Cliente Supabase**: `src/lib/supabase-client.ts`
- **Migrations**: `supabase/migrations/`
- **Diretrizes do Projeto**: `CLAUDE.md`

---

**Última Atualização**: 2025-11-22
**Responsável**: Claude Code
**Status**: Inventário Completo ✅
