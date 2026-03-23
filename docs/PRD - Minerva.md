# PRD

# **Documentação de Projeto \- Sistema Minerva**

## **1\. Documento de Situação Problema**

### **Contexto Atual**

A empresa Minerva opera no setor de engenharia e assessoria, oferecendo serviços que incluem obras de reforço estrutural, assessoria técnica anual, perícias de fachada e laudos pontuais. Atualmente, a empresa enfrenta desafios significativos na gestão de seus processos internos, que envolvem:

* **Gestão de Ordens de Serviço**: Existem 13 tipos diferentes de demandas/OS que são gerenciadas de forma fragmentada  
* **Controle Financeiro**: Conciliação bancária manual, dificuldade no rateio de custos por projeto e controle de inadimplência  
* **Gestão de Colaboradores**: Controle manual de presença, cálculo complexo de custos por projeto e acompanhamento de performance  
* **Prestação de Contas**: Dificuldade em consolidar custos e receitas por cliente/projeto para cálculo de lucratividade  
* **Acompanhamento de Clientes**: Falta de transparência para clientes sobre o andamento de seus projetos

### **Problema Principal**

A ausência de um sistema integrado de gestão resulta em:

* **Ineficiência Operacional**: Processos manuais consomem tempo excessivo da equipe gestora  
* **Falta de Visibilidade Financeira**: Dificuldade em calcular lucratividade real por projeto em tempo hábil  
* **Controle Precário de Custos**: Impossibilidade de rastrear adequadamente custos de mão de obra por centro de custo  
* **Comunicação Deficiente**: Clientes não têm acesso transparente ao status de seus projetos  
* **Tomada de Decisão Comprometida**: Ausência de dashboards e relatórios consolidados impede análises estratégicas

### **Justificativa**

É fundamental resolver este problema agora porque:

* **Crescimento da Empresa**: O aumento no volume de projetos torna os processos manuais insustentáveis  
* **Competitividade**: Clientes demandam maior transparência e agilidade na prestação de serviços  
* **Compliance**: Necessidade de melhor controle financeiro e prestação de contas para auditoria  
* **Eficiência de Custos**: Redução de retrabalho e otimização do uso de recursos humanos

### **Objetivos do Projeto (SMART)**

* **Específico**: Implementar um sistema web integrado que centralize a gestão de OS, finanças, colaboradores e prestação de contas  
* **Mensurável**: Reduzir em 60% o tempo gasto em processos administrativos manuais nos primeiros 6 meses  
* **Atingível**: Automatizar 80% dos processos atualmente manuais através do sistema  
* **Relevante**: Aumentar a transparência para clientes e melhorar a tomada de decisão gerencial

### **Escopo Proposto**

**O que a solução fará:**

* Gestão completa do fluxo de Ordens de Serviço (13 tipos)  
* Cadastro e gestão de leads, clientes e colaboradores  
* Conciliação bancária automatizada via API do Banco Cora  
* Controle de recorrência de receitas e faturas  
* Prestação de contas automatizada por centro de custo  
* Painéis de gestão (Kanban, financeiro, colaboradores)  
* Portal do cliente para acompanhamento de projetos  
* Integração com API do Diário de Obras  
* Calendário de disponibilidade e agendamentos

**O que a solução NÃO fará:**

* Contabilidade fiscal completa (será integrada com sistema contábil existente)  
* Gestão de estoque de materiais de construção  
* Sistema de ponto eletrônico (apenas controle de presença por projeto)  
* Emissão de notas fiscais (será integrada com sistema fiscal)

---

## **2\. Regras de Negócio**

| Cód | Nome da Regra | Descrição Detalhada |
| ----- | ----- | ----- |
| RN-001 | Geração Automática de Código OS | O sistema deve criar automaticamente uma numeração aleatória para cada nova OS (formato: OS \+ tipo \+ 5 dígitos), que servirá como código de identificação único e código do centro de custo. |
| RN-002 | Conversão Lead para Cliente | Quando um lead fecha um contrato, o sistema deve automaticamente atualizar seus dados de lead para cliente, gerar um centro de custo e criar a recorrência financeira correspondente. |
| RN-003 | Manutenção de Histórico | É vedada a exclusão de qualquer informação do sistema. Todos os dados (leads, clientes, colaboradores, OS, alterações salariais) devem ser mantidos no histórico e apenas inativados. |
| RN-004 | Cálculo de Custo-Dia do Colaborador | O custo-dia do colaborador deve ser calculado automaticamente com base em salário, benefícios, encargos CLT e custos flutuantes do mês, dividido pelos dias úteis. |
| RN-005 | Atribuição de Custo por Presença | Custos de mão de obra só são atribuídos a um centro de custo quando há registro de presença do colaborador naquele projeto/dia. |
| RN-006 | Geração Automática de OS Tipo 13 | A conclusão de OS dos tipos 1 a 4 deve automaticamente gerar uma OS tipo 13 (start de contrato de obra) como OS interna. |
| RN-007 | Renovação Automática de Contratos Anuais | Contratos anuais com previsão de renovação devem ser automaticamente reajustados e gerar novas 12 parcelas após o 12º mês. |
| RN-008 | Rateio Proporcional de Custos Administrativos | Custos administrativos e setoriais devem ser rateados proporcionalmente entre todos os centros de custo ativos do período. |
| RN-009 | Exclusão de Aplicações Financeiras | Transações do tipo "aplicação financeira" devem ser desprezadas e não contabilizadas no painel financeiro nem na prestação de contas. |
| RN-010 | Alerta de Inadimplência | Se uma receita não for conciliada na conciliação bancária até o final do mês, deve ser gerado automaticamente um alerta de inadimplência. |
| RN-011 | Hierarquia de Aprovação | Algumas etapas do fluxo de OS exigem aprovação do gestor responsável para que a OS possa avançar, especialmente tarefas delegadas. |
| RN-012 | Obrigatoriedade de Anexos | Nos follow-ups (especialmente 1 e 2), é obrigatório anexar documentos, fotos e vídeos relevantes com espaço para comentários. |
| RN-013 | Controle de Disponibilidade | Ao agendar uma visita utilizando o calendário, o horário correspondente deve ser automaticamente bloqueado para futuras marcações. |

---

## **3\. Requisitos Funcionais (RF)**

| Cód | Nome do Requisito | Descrição Detalhada |
| ----- | ----- | ----- |
| RF-001 | Cadastro de Colaboradores | O sistema deve permitir o cadastro completo de colaboradores com dados pessoais, contratuais, hierarquia organizacional, cálculo automático de custo-dia e upload de documentos obrigatórios. |
| RF-002 | Cadastro de Leads | O sistema deve permitir o cadastro de leads com formulário contendo tipo de oportunidade, dados de contato, endereço e geração automática de código da oportunidade. |
| RF-003 | Conversão Lead para Cliente | O sistema deve permitir a conversão de leads para clientes aproveitando dados já cadastrados e complementando com informações contratuais e financeiras. |
| RF-004 | Gestão de Ordens de Serviço | O sistema deve gerenciar o fluxo completo de OS com 13 tipos diferentes, desde abertura até finalização, incluindo delegação, controle de status e upload de documentos. |
| RF-005 | Painel Kanban | O sistema deve apresentar um painel visual Kanban para acompanhamento do progresso das OS com identificação de responsáveis e possibilidade de delegação. |
| RF-006 | Conciliação Bancária | O sistema deve integrar via API com o Banco Cora para importação automática de extratos e permitir classificação de lançamentos com rateio por centro de custo. |
| RF-007 | Gestão de Recorrência | O sistema deve cadastrar e controlar receitas fixas e faturas por contrato, com geração de alertas e integração automática com conciliação bancária. |
| RF-008 | Controle de Presença | O sistema deve permitir que gestores registrem presença de colaboradores associando ao centro de custo correspondente para cálculo de custos. |
| RF-009 | Prestação de Contas | O sistema deve calcular automaticamente a prestação de contas por cliente consolidando todos os custos e receitas para cálculo de lucratividade. |
| RF-010 | Painel Financeiro | O sistema deve apresentar dashboard com gráficos de custo, receita, lucro e inadimplência com filtros por período, contrato e cliente. |
| RF-011 | Portal do Cliente | O sistema deve fornecer acesso restrito para clientes visualizarem documentos, relatórios e status de seus projetos conforme tipo de contrato. |
| RF-012 | Calendário de Disponibilidade | O sistema deve gerenciar calendário de disponibilidade para agendamentos com bloqueio automático de horários ocupados. |
| RF-013 | Geração de Relatórios | O sistema deve gerar relatórios mensais e consolidados em PDF/Excel para prestação de contas, histórico de OS e dados financeiros. |
| RF-014 | Integração Diário de Obras | O sistema deve integrar com a API pública do Diário de Obras para exibição automática de relatórios para clientes de obras. |
| RF-015 | Controle de Acessos | O sistema deve implementar diferentes níveis de acesso baseados no perfil do usuário (Diretoria, Gestores, Colaboradores, Clientes). |

---

## **4\. Requisitos Não Funcionais (RNF)**

| Cód | Nome do Requisito | Descrição Detalhada |
| ----- | ----- | ----- |
| RNF-001 | Performance | O sistema deve carregar qualquer tela em no máximo 3 segundos, com até 100 usuários simultâneos, e processar relatórios complexos em no máximo 30 segundos. |
| RNF-002 | Disponibilidade | O sistema deve ter disponibilidade de 99% durante horário comercial (7h às 19h, segunda a sexta-feira) e 95% nos demais períodos. |
| RNF-003 | Segurança | Todas as senhas devem ser criptografadas usando hash SHA-256 com salt, e os dados sensíveis devem ser transmitidos via HTTPS com certificado SSL. |
| RNF-004 | Usabilidade | A interface deve ser intuitiva, responsiva e acessível em dispositivos desktop, tablet e mobile, seguindo padrões de UX/UI modernos. |
| RNF-005 | Compatibilidade | O sistema deve funcionar nos principais navegadores (Chrome, Firefox, Safari, Edge) em suas versões mais recentes. |
| RNF-006 | Escalabilidade | A arquitetura deve suportar crescimento de até 500 usuários e 10.000 OS por mês sem degradação significativa de performance. |
| RNF-007 | Backup e Recuperação | O sistema deve realizar backup automático diário dos dados com possibilidade de recuperação em no máximo 4 horas em caso de falha. |
| RNF-008 | Integração | O sistema deve ser capaz de integrar com APIs externas (Banco Cora, Diário de Obras, WhatsApp) de forma estável e confiável. |
| RNF-009 | Auditoria | Todas as ações críticas (criação, edição, exclusão) devem ser logadas com timestamp, usuário responsável e dados alterados. |
| RNF-010 | Conformidade LGPD | O sistema deve estar em conformidade com a Lei Geral de Proteção de Dados, permitindo controle de consentimento e exclusão de dados pessoais quando solicitado. |

---

## **5\. User Stories e Acceptance Criteria**

### **US-001: Cadastro de Lead**

**Como um** colaborador administrativo, **Eu quero** cadastrar informações de novos leads no sistema, **Para que** eu possa acompanhar oportunidades de negócio e convertê-las em clientes.

**Critérios de Aceitação:**

* **Cenário 1: Cadastro bem-sucedido**  
  * **Dado** que estou na tela de cadastro de leads  
  * **Quando** preencho todos os campos obrigatórios (nome, contato, tipo de oportunidade, endereço)  
  * **Então** o sistema gera automaticamente um código único para o lead e salva as informações  
* **Cenário 2: Campos obrigatórios não preenchidos**  
  * **Dado** que estou cadastrando um lead  
  * **Quando** tento salvar sem preencher campos obrigatórios  
  * **Então** o sistema exibe mensagens de erro específicas para cada campo

### **US-002: Abertura de Ordem de Serviço**

**Como um** gestor de setor, **Eu quero** abrir uma nova ordem de serviço para um cliente, **Para que** eu possa organizar e acompanhar as atividades do projeto.

**Critérios de Aceitação:**

* **Cenário 1: Abertura de OS para cliente existente**  
  * **Dado** que estou na tela de abertura de OS  
  * **Quando** seleciono um cliente existente e defino o tipo de OS  
  * **Então** o sistema gera automaticamente o código da OS e inicia o fluxo correspondente  
* **Cenário 2: OS com prazo definido**  
  * **Dado** que estou criando uma OS  
  * **Quando** defino um prazo específico para conclusão  
  * **Então** o sistema calcula automaticamente os prazos intermediários conforme o tipo de OS

### **US-003: Registro de Presença**

**Como um** gestor de setor, **Eu quero** registrar a presença dos meus colaboradores por projeto, **Para que** os custos de mão de obra sejam corretamente atribuídos ao centro de custo.

**Critérios de Aceitação:**

* **Cenário 1: Registro de presença simples**  
  * **Dado** que tenho colaboradores trabalhando em um projeto  
  * **Quando** registro a presença diária associando ao centro de custo  
  * **Então** o sistema calcula automaticamente o custo baseado no custo-dia do colaborador  
* **Cenário 2: Justificativa de ausência**  
  * **Dado** que um colaborador está ausente  
  * **Quando** registro a ausência com justificativa e anexo  
  * **Então** o sistema não atribui custo ao centro de custo para aquele dia

### **US-004: Conciliação Bancária**

**Como um** gestor financeiro, **Eu quero** conciliar automaticamente os extratos bancários, **Para que** eu possa classificar receitas e despesas por centro de custo.

**Critérios de Aceitação:**

* **Cenário 1: Conciliação automática**  
  * **Dado** que o extrato foi importado via API do Banco Cora  
  * **Quando** classifico um lançamento de entrada  
  * **Então** o sistema associa automaticamente com faturas a receber e marca como pago  
* **Cenário 2: Rateio de despesas**  
  * **Dado** que tenho uma despesa que deve ser rateada  
  * **Quando** defino os percentuais por centro de custo  
  * **Então** o sistema distribui o valor proporcionalmente e valida que a soma é 100%

### **US-005: Visualização de Dashboard Financeiro**

**Como um** diretor, **Eu quero** visualizar um dashboard com indicadores financeiros, **Para que** eu possa tomar decisões estratégicas baseadas em dados consolidados.

**Critérios de Aceitação:**

* **Cenário 1: Dashboard atualizado**  
  * **Dado** que acesso o painel financeiro  
  * **Quando** seleciono um período específico  
  * **Então** vejo gráficos atualizados de receita, custos, lucro e inadimplência  
* **Cenário 2: Drill-down de informações**  
  * **Dado** que estou visualizando um gráfico  
  * **Quando** clico em uma categoria específica  
  * **Então** posso ver o detalhamento dos lançamentos que compõem aquele valor

### **US-006: Portal do Cliente**

**Como um** cliente com contrato ativo, **Eu quero** acessar um portal para acompanhar meu projeto, **Para que** eu tenha transparência sobre o andamento dos serviços contratados.

**Critérios de Aceitação:**

* **Cenário 1: Acesso a documentos (Cliente de Assessoria)**  
  * **Dado** que sou um cliente de assessoria com login válido  
  * **Quando** acesso meu portal  
  * **Então** vejo todos os documentos OS07 e OS08 organizados por data e status  
* **Cenário 2: Visualização de relatórios (Cliente de Obras)**  
  * **Dado** que sou um cliente de obras  
  * **Quando** acesso meu portal  
  * **Então** vejo automaticamente os relatórios do Diário de Obras vinculados ao meu contrato

---

## **7\. Product Backlog**

| ID | Item (Épico/História de Usuário) | Prioridade | Estimativa de Esforço | Critérios de Priorização |
| ----- | ----- | ----- | ----- | ----- |
| PB-001 | Épico: Sistema de Autenticação e Permissões | Alta | 21 pontos | Pré-requisito para todos os outros módulos, segurança crítica |
| PB-002 | Épico: Cadastro de Entidades (Leads, Clientes, Colaboradores) | Alta | 34 pontos | Base fundamental para funcionamento do sistema |
| PB-003 | US: Cadastro de Lead | Alta | 8 pontos | Entrada principal de dados do negócio |
| PB-004 | US: Conversão Lead para Cliente | Alta | 5 pontos | Processo crítico de conversão de oportunidades |
| PB-005 | US: Cadastro de Colaboradores | Alta | 13 pontos | Necessário para controle de custos e presença |
| PB-006 | Épico: Gestão de Ordens de Serviço | Alta | 55 pontos | Core business da empresa, maior valor agregado |
| PB-007 | US: Abertura e Gestão de OS | Alta | 21 pontos | Funcionalidade principal do sistema |
| PB-008 | US: Painel Kanban para OS | Média | 13 pontos | Melhora significativa na gestão visual |
| PB-009 | US: Workflow de Aprovação de OS | Média | 8 pontos | Necessário para controle de qualidade |
| PB-010 | Épico: Sistema Financeiro | Alta | 89 pontos | Impacto direto na lucratividade e controle |
| PB-011 | US: Integração com Banco Cora | Alta | 34 pontos | Automatização crítica para eficiência |
| PB-012 | US: Conciliação Bancária | Alta | 21 pontos | Processo manual crítico a ser automatizado |
| PB-013 | US: Gestão de Recorrência | Alta | 13 pontos | Controle de receitas essencial |
| PB-014 | US: Prestação de Contas Automatizada | Média | 21 pontos | Alto valor para análise de lucratividade |
| PB-015 | Épico: Gestão de Colaboradores e Presença | Média | 34 pontos | Impacto direto no controle de custos |
| PB-016 | US: Registro de Presença | Média | 13 pontos | Necessário para cálculo correto de custos |
| PB-017 | US: Cálculo Automático de Custo-Dia | Média | 8 pontos | Automatização de processo complexo |
| PB-018 | Épico: Painéis de Gestão e Relatórios | Média | 55 pontos | Visibilidade gerencial estratégica |
| PB-019 | US: Dashboard Financeiro | Média | 21 pontos | Tomada de decisão baseada em dados |
| PB-020 | US: Painel de Bordo de OS | Baixa | 13 pontos | Melhoria na gestão operacional |
| PB-021 | US: Relatórios em PDF/Excel | Baixa | 8 pontos | Funcionalidade complementar |
| PB-022 | Épico: Portal do Cliente | Baixa | 34 pontos | Diferencial competitivo, transparência |
| PB-023 | US: Portal para Clientes de Assessoria | Baixa | 13 pontos | Melhoria na experiência do cliente |
| PB-024 | US: Portal para Clientes de Obras | Baixa | 13 pontos | Integração com sistema externo |
| PB-025 | US: Integração com Diário de Obras | Baixa | 8 pontos | Automatização de processo específico |
| PB-026 | Épico: Calendário e Agendamentos | Baixa | 21 pontos | Organização operacional |
| PB-027 | US: Calendário de Disponibilidade | Baixa | 13 pontos | Melhoria na gestão de agenda |
| PB-028 | US: Integração WhatsApp (Futuro) | Baixa | 21 pontos | Funcionalidade futura, comunicação automatizada |

**Total Estimado: 456 pontos**

# Resumo

Qual o objetivo do software?

**Centralizar e automatizar a gestão interna da empresa**, integrando ordens de serviço, finanças, pessoal, obras e performance por meio de um sistema modular com geração de documentos, dashboards e APIs externas.

Quais as funcionalidades do software?

1. ADM:  
* Cadastrar ordem de serviço e gerenciar (quanto a prazo, responsável, status)  
* Cada OS gera uma informação: follow up, proposta comercial, contrato, documento para o cliente  
* Calendário de disponibilidade (para agendar visitas / editar disponibilidade de setor)  
* Painel de gestão a vista KANBAN (atividades são “delegáveis” pelo gestor / hierarquia de aprovação)  
* Gerar histórico (passível de navegação e download)  
2. CADASTROS:  
* Cadastro de LEAD  
* Cadastro de cliente (criar centro de custo, gerar prestação de contas)  
* Cadastro de colaborador (gerar custo na lista de presença para prestação de contas)  
* Gerar histórico (passível de navegação e download)  
3. FINANCEIRO:  
* Conciliação bancária (rateio, gerar informações para dashboard financeiro, gerar prestações de contas)  
* Recorrencia (receita x fatura)  
* Prestação de contas cada cliente  
* Gerar histórico (passível de navegação e download)  
4. ENGENHARIA:  
* OBRAS: diário de obras  
* ASS: documentos emitidos (OS07 e OS08)  
5. PAINEL DE BORDO  
* OS (status)  
* FINANCEIRO (receita, lucro, inadimplência)  
* MÃO DE OBRA (performance)

API: banco para colher extrato  
API: software diario de obras  
API: Whatsapp

# Observações Funcionamento

# **1\. Gestão de Cadastros (Colaborador, Cliente, LEAD)**

* **Cadastro de Colaborador:**  
  * Função (Coord. Adm.): Inserir, editar, inativar, folga (sem opção de excluir).  
  * Manter o histórico completo de admissão até demissão.  
* **Cadastro de Cliente (CC):**  
  * Função (Coord. Adm.): Inserir, editar, inativar (sem opção de excluir).  
  * Manter o histórico de admissão do cliente.  
* **Cadastro de LEAD (Potencial Cliente):**  
  * Função (Coord. Adm.): Inserir, editar, inativar (sem opção de excluir).  
  * Manter o histórico do LEAD.  
* **Conversão de LEAD para Cliente:**  
  * Quando um LEAD se torna cliente (abertura de OS 11, 12 ou 13), o Coord. Adm. deve atualizar os dados.  
  * O sistema deve automaticamente:  
    * Gerar um Centro de Custo (CC).  
    * Habilitar a Prestação de Contas (item 5).  
    * Habilitar a Recorrência (item 4).

# **2\. Fluxo de Ordem de Serviço (OS)**

* **Tipos de OS:**  
  * OS 01 a 06: Oportunidades (Proposta Comercial).  
  * OS 07 e 08: (Relacionadas a Contrato Anual ASS).  
  * OS 11, 12, 13: Abertura que converte LEAD em Cliente.  
* **Criação e Oportunidades:**  
  * Qualquer colaborador com acesso ao sistema pode abrir uma OS (tipos 1 a 13).  
  * Se um cliente existente quer um novo orçamento, utilizar o cadastro existente (não recadastrar).  
  * Um mesmo Cliente ou LEAD pode ter várias oportunidades (OS) de diferentes serviços.  
  * Caso a oportunidade (OS 01 a 06\) seja de um LEAD já cadastrado, pular a etapa 1 (cadastro).  
  * Opção de inserir proposta comercial pronta (OS 01 a 06), eliminando a etapa 8 do fluxo.  
* **Código da OS:**  
  * Cada OS criada deve gerar um código de acompanhamento (ex: "OS01-11807").  
  * O sistema deve usar um código interno que começa na OS e se torna o código do CC (ex: OS01-12321 se torna CC-12321).  
  * Documentos emitidos na OS07 e OS08 terão o código da OS onde foram gerados para pesquisa.  
* **Gestão e Delegação (Painel KANBAN):**  
  * Gerar painel de gestão à vista (KANBAN) com todas as OS elencadas.  
  * Toda OS gerada deve ir para o gestor responsável (Adm, Ass, ou Obras) de forma automática.  
  * O gestor pode delegar a execução da OS a alguém da sua equipe ou aos diretores.  
  * A pessoa que recebe a delegação é responsável pela OS até a conclusão.  
  * Gestor gerencia, delega, aprova, reprova ou edita a OS no KANBAN.  
* **Aprovações:**  
  * Atividades delegadas precisam de aprovação do gestor para finalizar (exceto etapas "sem validação").  
  * Toda OS que exige aprovação deve ter opção "aprovar/reprovar".  
  * Se reprovada, a OS retorna ao executante com um campo "justificativa" preenchido pelo gestor.  
* **Cancelamento e Observações:**  
  * Opção de "cancelar oportunidade" (OS 01 a 06\) em qualquer etapa.  
  * Não deve ser possível apagar; ao cancelar, a OS deve ficar "inativa".  
  * Obriga o preenchimento de "justificativa" ao cancelar.  
  * Manter histórico de OS canceladas.  
  * Toda OS e cada etapa devem ter um campo "observação" (preenchimento não obrigatório).  
* **Histórico de OS:**  
  * Tela com 2 abas: Status OS / Histórico de OS.  
  * Opção de pesquisar OS e visualizar todas as informações: documentos, prazos, colaboradores.  
  * Manter histórico de todas as alterações (data e responsável).  
  * Opção de Imprimir (PDF) e Editar.

# **3\. Módulo Financeiro**

## **3.1. Conciliação Bancária**

* Receber extrato da conta bancária (atualização diária \- 3 contas).  
* **SAÍDA (Regra Geral \- ex: equipam, segurança, material, etc.):**  
  * Conciliar: Atribuir descrição, tipo, setor, CC, rateio, NF, etc.  
  * Exceções (não precisam conciliar com CC): mão de obra, tributos, escritório, setor obras, setor ass, aplicação.  
* **SAÍDA (Regras Específicas):**  
  * **Mão de obra, tributos, escritório, setor obras, setor ass:** Somente os campos detalhamento e recibo são necessários.  
  * **Aplicação:** Desprezar, nenhuma ação é necessária.  
  * **"Mão de obra" (Tipo):** Elencar lista de colaboradores ativos para atribuir o custo (ou opção "todos").  
    * Após selecionar, definir como "custo flutuante" (EPI, fardamento, etc. \- soma ao custo mensal) ou "custo geral" (tributos, salário, etc. \- não soma ao custo mensal).  
* **ENTRADA (Receita):**  
  * Selecionar Setor / CC Ativo (somente). Nenhum outro campo precisa ser preenchido.  
* **Regra de Lançamento:**  
  * Quando selecionado o tipo "escritório", "setor obras", "setor ass", "aplicação", não pedir para conciliar setor nem centro de custo; finalizar lançamento.  
* **Histórico e Pesquisa:**  
  * Criar tela para pesquisar histórico da conciliação bancária.  
  * Autonomia para imprimir relatório PDF e Excel.  
  * Deve ser possível pesquisar e puxar custos por período, tipo, setor, CC.

## **3.2. Recorrência (Receita x Fatura)**

* Gerar fatura/cobrança de todos os colaboradores admitidos "ativos" para pagamento no 5º dia útil.  
* Ao cadastrar colaborador, gerar automático a recorrência (item 4\) de pagamento no 5º dia útil.

## **3.3. Prestação de Contas (PC) \- Cliente (CC)**

* Gerar relatório mensal para todo CC.  
* Gerar informação no painel financeiro.  
* **Tipos de PC:**  
  * OBRAS: Soma global (início ao fim).  
  * ASSESSORIA PONTUAL: Soma global (início ao fim).  
  * ASSESSORIA ANUAL: Soma mensal.  
* **Inativação de CC:**  
  * Ao alterar status para "CC inativo", gerar relatório final de prestação de contas.  
  * PC de Obras: Só inativar após anexar "termo de entrega de obra" e "atestado de capacidade técnica assinado".  
  * PC de Contrato Anual Assessoria: Só inativar após inserir justificativa.  
* **Analítico da PC:**  
  * Cada linha da PC deve permitir "abrir" para ver o detalhamento de cada lançamento (histórico navegável).

## **3.4. Gestão de Custos**

* Gerar custo dia (a partir do custo do colaborador) \-\> lançar no CC e na PC.  
* Opção de ratear custo por diferentes CC (ex: Uber, compras, etc.).  
* **Custo Colaborador:**  
  * O custo do colaborador depende dos dias úteis no mês (ex: R$ 3890 / 25 dias \= R$ 155,60; R$ 3890 / 26 dias \= R$ 149,61).  
* **Custos de Setor / Adm (Não atribuídos a CC):**  
  * Tipos: "custo setor ass", "custo setor obras", "custo escritório".  
  * Não precisam ser atribuídos a um CC.  
  * Devem entrar na contabilidade do "Custo administração \+ custo setor" (memória de cálculo pasta 5).  
  * Entram na soma na linha "custo setor X" no painel de bordo financeiro.  
* **Custos "Desprezados" (Não atribuídos a CC):**  
  * Tipos: "mão de obra" e "tributos".  
  * Não entram na contabilidade da PC pela conciliação bancária.  
  * Entram na soma na linha "custo setor X" no painel de bordo financeiro.  
  * Tipo: "aplicação" (entrada e saída) deve ser desprezado. Não somar no painel financeiro nem na PC.  
* **Custo ADM Local (Cálculo Mensal):**  
  * Calcular custo adm local para gerar % na PC do CC mensalmente (memória de cálculo pasta 5).  
  * **Custo Escritório:** Soma do custo mensal de todos os funcionários ADM \+ prolabore diretoria \+ todos os lançamentos "escritório" na conciliação.  
  * **Custo Setor ASS:** Soma do custo mensal do coordenador ASS \+ todos os lançamentos "setor ASS" na conciliação.  
  * **Custo Setor OBRAS:** Soma do custo mensal do coordenador OBRAS \+ todos os lançamentos "setor OBRAS" na conciliação.  
* **Lançamento Contábil:**  
  * A linha "CUSTO ADM LOCAL \+ CUSTO SETOR" deve ser contabilizada e lançada mensalmente.  
* **Custo ADM e Diretoria:**  
  * Todos os colaboradores "ADM" e "Diretoria" devem entrar como "custo escritório" e não precisam ter custo rateado por cliente.

## **3.5. Gestão de Receitas e Faturas**

* **Cadastro de Receita:**  
  * Conciliar entrada na conciliação bancária com cadastro de receitas.  
  * Elencar todas as receitas a serem conciliadas até o fechamento do mês.  
* **Cadastro de Fatura (Despesa):**  
  * Conciliar saída na conciliação bancária com cadastro de faturas.  
  * Elencar todas as faturas a serem conciliadas até o fechamento do mês.  
* **Inadimplência e Atrasos:**  
  * Receitas não conciliadas (não pagas) no mês devem gerar "inadimplência".  
  * Faturas não conciliadas (não pagas) no mês devem gerar "atrasos de contas a pagar".  
* **Resumos Diários:**  
  * Gerar resumo diário de "faturas do dia" (contas a pagar).  
  * Gerar resumo diário de "faturas de receita do dia" (contas a receber).

## **3.6. Lucro**

* Gerar lucro no painel financeiro (3 tipos):  
  * **CC OBRAS:** Gerar lucro no painel financeiro quando a obra encerrar ("cliente inativo").  
  * **CC ASS Laudo Pontual:** Gerar lucro no painel financeiro quando o serviço encerrar.  
  * **CC ASS Contrato Anual:** Gerar lucro no painel financeiro mensalmente.

# **4\. Painéis de Bordo (Dashboards)**

* **Painel de Bordo OS:**  
  * Imprimir % de performance de OS (concluídas, atrasadas, em validação, etc.).  
  * Filtros: período, geral empresa, por área, por setor, colaborador.  
* **Painel de Bordo Financeiro:**  
  * Consolida o mês anterior.  
  * Parâmetros no display estático são um relatório consolidado do 1º ao último dia do mês anterior.  
  * Somar custos somente dos itens de "saída" (desprezar "aplicação").  
  * Somar entrada/receita somente dos itens de "entrada" (desprezar "aplicação").  
* **Painel de Gestão (Gestor do Setor):**  
  * (KANBAN de OS).  
* **Geral:**  
  * Gerar cálculos internos para alimentar números e gráficos.

# **5\. Relatórios e Exportação**

* **Relatório Geral de CC:**  
  * Gerar relatório geral (início ao fim) para todo CC (fim \= gestor alterar status para "inativo").  
* **Relatório de Colaborador:**  
  * Informações: Setor, OS atribuídas, pontualidade e assiduidade.  
  * Formato: PDF.  
* **Relatório de Presença (Folha):**  
  * Puxar relatório de todos os colaboradores ativos: presença no mês, faltas, minutos de atraso (para gerar folha).  
* **Requisitos Gerais de Relatórios:**  
  * Gerar relatórios PDF de todas as tabelas (com opção de filtrar por período).  
  * Toda tela de dados deve ter a opção de:  
    * Filtrar por: período, geral empresa, por área, por setor, colaborador.  
    * Gerar relatório PDF.  
    * Manter histórico.  
  * Toda lista deve ser passível de navegação pelo histórico e download em PDF e Excel.

# **6\. Gestão de Colaboradores**

* **Cadastro e Funções:**  
  * Função (Coord. Adm.): Inserir, editar, inativar, folga (sem opção de excluir).  
  * Atribuir ao cargo: nível hierárquico e setor (10 tipos).  
  * Todos os dados admissionais são de preenchimento obrigatório.  
  * Cadastro tipo 10 (Obras): Sem acesso ao sistema, apenas gera custo no CC.  
* **Status e Gerenciamento:**  
  * Status "Folga": Colaborador em folga não deve aparecer na lista para gerar presença.  
  * Gerenciamento de equipe (Gestor): Gerar faltas (anexar justificativa), performance, atribuir a CC (com opção de ratear por mais de 1 CC).  
* **Histórico e Documentação:**  
  * **Página/Painel do Colaborador:**  
    * Acesso a todas as informações: pagamentos (com anexos), EPIs, bonificações, documentos, etc.  
    * Termos de EPI e fardamento assinados (anexar na "pasta").  
    * Advertências disciplinares (anexar na "pasta").  
    * Atestados (anexar na "pasta").  
    * Histórico de performance.  
    * Documentação admissional.  
    * Salário (com histórico de alteração).  
  * Manter histórico de documentos, admissão, demissão, pagamentos, etc.  
* **Salário e Desligamento:**  
  * Manter histórico de salário anterior quando houver aumento.  
  * Gerar rescisão ao "desligar" colaborador:  
    * Alterar status para "inativo".  
    * Cobrar anexo de "termo de quitação".

# **7\. Gestão de Clientes e Centros de Custo (CC)**

* **Cadastro:**  
  * Cadastro de cada Cliente gerará um CC.  
  * O CC deverá gerar previsão de receita conforme contrato acordado.  
* **Página Customizada do Cliente:**  
  * **OS Tipo 1, 2, 3, 4 (Obras):**  
    * Relatórios diário de obras.  
    * Documentos diversos (anexados com legenda).  
    * Informações comerciais da empresa.  
    * API Diário de Obras: Deve gerar relatórios diariamente na página do cliente (gerar alerta se atrasar 2 dias).  
  * **OS Tipo 5 (Anual ASS):**  
    * Documentos gerados nas OS07 e OS08.  
    * Documentos diversos (anexados com legenda).  
    * Informações comerciais da empresa.  
* **Visitas Obrigatórias (Contrato Anual ASS \- OS12):**  
  * Obrigatório ter uma visita semanal (OS08).  
  * Incluir disponibilidade no calendário.  
  * Gerar a cobrança (como no painel de recorrência).  
  * Gerar alerta caso algum cliente não seja visitado.  
* **Histórico:**  
  * Ver contratos ativos.  
  * Deve ser possível navegar pelas informações de contratos "inativos".

# **8\. Calendário e Alertas**

* **Calendário:**  
  * Deve exibir:  
    * Cronograma de visitas agendadas pelo fluxo de OS.  
    * Aniversário do contrato.  
    * Aniversário do colaborador.  
    * Aniversário do cliente (contratante).  
* **Calendário de Visitas (Comercial, Assessoria, Obras):**  
  * Criar calendário de disponibilidade para visitas (3x).  
  * Gestor deve poder editar a disponibilidade semanal no calendário.  
* **Alertas:**  
  * Alerta de aniversário do contratante (no calendário).  
  * Alerta de aniversário (colaborador/cliente) (no mesmo calendário das OS).  
  * Alerta de atraso (2 dias) na API do diário de obras.  
  * Alerta se cliente de contrato anual (OS12) não for visitado na semana.

# **9\. Regras Gerais do Sistema e Permissões**

* **Permissões e Hierarquia:**  
  * Gestores têm autonomia para delegar OS para os diretores.  
  * Regra Geral: Cada ação consolidada só pode ser alterada pelo superior (ex: caixa de supermercado).  
* **Interface e Usabilidade:**  
  * Toda tela de dados deve ter filtros: período, geral empresa, por área, por setor, colaborador.  
  * Toda lista deve ser passível de navegação pelo histórico e download em PDF e Excel.  
  * Toda etapa que exige "upload" de documento deve ter um "documento modelo" para baixar.

# Cadastro Lead, Colaborador, Cliente

Com base na análise dos arquivos CSV fornecidos, organizei a estrutura de dados de cada planilha.

Aqui está a organização das informações, detalhando os campos (colunas) de cada cadastro:

### **1\. Cadastro de Colaborador**

**(Arquivo: cadastro colaborador (1).xlsx \- DADOS PESSOAIS.csv)**

Este arquivo define a estrutura para o registro de dados pessoais, contratuais e financeiros dos funcionários.

**Campos Identificados:**

* ID  
* DATA ADMISSÃO  
* NOME COMPLETO  
* DATA NASCIMENTO  
* CPF  
* RG  
* TELEFONE  
* EMAIL  
* **Endereço:**  
  * ENDEREÇO  
  * Nº  
  * BAIRRO  
  * CIDADE  
  * ESTADO  
  * CEP  
* **Informações de Trabalho:**  
  * FUNÇÃO  
  * SETOR  
  * TIPO DE CONTRATO  
* **Informações Financeiras:**  
  * SALÁRIO  
  * DADOS BANCÁRIOS (BANCO)  
  * AGÊNCIA  
  * CONTA  
  * PIX  
* **Status/Desligamento:**  
  * STATUS (Ativo, Inativo, etc.)  
  * DATA DEMISSÃO  
  * MOTIVO

---

### **2\. Cadastro de Cliente**

**(Arquivo: cadastro cliente.xlsx \- CLIENTES.csv)**

Este arquivo detalha a estrutura para o cadastro de clientes ativos, com um foco maior na gestão do contrato e nos diferentes pontos de contato (contratual, financeiro, técnico).

**Campos Identificados:**

* ID CLIENTE  
* STATUS  
* DATA DE INÍCIO (provavelmente do contrato)  
* **Dados da Empresa:**  
  * NOME FANTASIA  
  * RAZÃO SOCIAL  
  * CNPJ  
  * INSC. ESTADUAL  
* **Endereço:**  
  * ENDEREÇO  
  * Nº  
  * COMPLEMENTO  
  * BAIRRO  
  * CIDADE  
  * ESTADO  
  * CEP  
* **Pontos de Contato:**  
  * RESPONSÁVEL CONTRATO  
  * TELEFONE  
  * EMAIL  
  * RESPONSÁVEL FINANCEIRO  
  * TELEFONE FIN  
  * EMAIL FIN  
  * RESPONSÁVEL TÉCNICO  
  * TELEFONE TEC  
  * EMAIL TEC  
* **Informações do Contrato:**  
  * TIPO DE CONTRATO  
  * SERVIÇO CONTRATADO  
  * VALOR MENSAL  
  * DIA DE VENCIMENTO  
* OBSERVAÇÕES

---

### **3\. Cadastro de LEAD**

**(Arquivo: cadastro LEAD (1).xlsx \- CLIENTES.csv)**

Este arquivo é usado para o registro inicial de potenciais clientes (LEADs), capturando as informações básicas de identificação, contato e origem.

**Campos Identificados:**

* ID  
* DATA DO CADASTRO  
* **Dados do LEAD:**  
  * NOME FANTASIA / NOME  
  * RAZÃO SOCIAL  
  * CNPJ / CPF  
  * INSC. ESTADUAL / RG  
* **Informações de Contato:**  
  * RESPONSÁVEL  
  * EMAIL  
  * TELEFONE  
  * CELULAR/WHATSAPP  
* **Endereço:**  
  * ENDEREÇO  
  * Nº  
  * BAIRRO  
  * CIDADE  
  * ESTADO  
  * CEP  
* **Gestão do LEAD:**  
  * COMO CHEGOU  
  * STATUS  
* OBSERVAÇÕES

---

### **4\. Listas de Apoio (para Cadastro de LEAD)**

**(Arquivo: cadastro LEAD (1).xlsx \- LISTAS.csv)**

Este arquivo complementar define as opções que devem ser usadas em campos de seleção (dropdown) dentro do "Cadastro de LEAD", garantindo a padronização dos dados.

**Listas Identificadas:**

* **COMO CHEGOU**: Contém as fontes de origem do LEAD (ex: Indicação, Google, Prospecção Ativa, etc.).  
* **STATUS**: Contém as etapas do funil do LEAD (ex: Em Atendimento, Sem Interesse, Contrato Fechado, etc.).

