Documento de Arquitetura e Especificação Funcional: Módulo Centro de Custo

1.0 Introdução e Visão Estratégica

1.1 Finalidade do Documento

Este documento serve como o guia técnico e funcional definitivo para o desenvolvimento e integração do módulo de "Centro de Custo" no ecossistema Minerva ERP v2.0. Seu propósito é detalhar a arquitetura de dados, as regras de negócio e as especificações de interface necessárias para transformar a gestão de projetos da Minerva Engenharia. O objetivo fundamental é centralizar a gestão financeira e operacional de cada contrato, convertendo dados brutos de Ordens de Serviço (OS), registros de presença diária e transações financeiras em inteligência de negócio acionável e precisa.

1.2 O Conceito de Centro de Custo no Ecossistema Minerva

No ecossistema Minerva, o Centro de Custo (CC) é a unidade fundamental de análise de lucratividade e saúde financeira da empresa. Ele representa um projeto ou contrato individual e age como o nexo que conecta as operações de campo com a gestão financeira. Estrategicamente, um Centro de Custo é instanciado no momento em que uma Ordem de Serviço (OS) evolui para o status de "Contrato Assinado". A partir desse gatilho, o CC se torna o repositório central para todas as receitas (o valor global do contrato) e todos os custos associados àquele projeto específico, sejam eles diretos (materiais, equipamentos), de mão de obra ou rateados (overhead administrativo).

1.3 Escopo e Objetivos

O desenvolvimento deste módulo visa solucionar a fragmentação do controle financeiro, que atualmente dificulta o cálculo preciso da lucratividade por projeto. Com base nos desafios operacionais identificados, os objetivos principais do módulo são:

* Centralizar o controle financeiro por projeto, consolidando todas as receitas e despesas em uma única entidade de dados.
* Automatizar o cálculo de custos e a apuração da lucratividade, eliminando a dependência de planilhas manuais e reduzindo o risco de erro humano.
* Prover visibilidade gerencial em tempo real sobre a saúde financeira de cada contrato, através de dashboards e relatórios analíticos.
* Integrar nativamente os dados provenientes dos módulos de Ordens de Serviço (OS), Financeiro (Conciliação Bancária) e Recursos Humanos (Presença Diária).

Para suportar esses objetivos, é imperativo estabelecer uma arquitetura de dados robusta e escalável, que garanta a integridade e a rastreabilidade de cada lançamento financeiro.

2.0 Arquitetura de Dados e Modelo Relacional

2.1 Visão Geral da Arquitetura de Dados

A eficácia do módulo Centro de Custo depende diretamente de um modelo de dados bem definido. A arquitetura a seguir foi projetada para garantir a integridade referencial, a rastreabilidade completa das transações e a performance necessária para os cálculos analíticos em tempo real. O modelo conecta as entidades primárias do sistema — Clientes, Colaboradores, OS e Transações Financeiras — a um CentroCusto central, que serve como o ponto de agregação para todas as análises financeiras.

2.2 Novas Entidades de Banco de Dados

Para suportar as funcionalidades do módulo, as seguintes tabelas serão introduzidas no banco de dados do Minerva ERP v2.0.

2.2.1 Tabela CentrosCusto

Esta tabela é o coração do módulo, representando cada contrato ativo ou concluído da empresa. Cada registro é uma unidade de análise financeira.

Nome da Coluna	Tipo de Dados	Chave/Índice	Descrição/Regras
id	UUID	PK	Identificador único universal para o Centro de Custo.
cliente_id	UUID	FK (Clientes.id)	Referência ao cliente associado a este contrato.
os_origem_id	TEXT	FK (OS.codigo_os)	Código da Ordem de Serviço que originou este Centro de Custo.
nome_cc	TEXT	INDEX	Nome descritivo do Centro de Custo (ex: "CENTRO DE CUSTOS - CLIENTE DL - OS01-1907").
tipo_servico	ENUM	INDEX	Tipo de serviço principal ('Obra', 'Assessoria').
valor_global_contrato	NUMERIC(12, 2)		Valor total da receita a ser faturada para este CC.
data_inicio	DATE		Data de início oficial do contrato.
data_termino_prevista	DATE		Data prevista para a conclusão do contrato.
status	ENUM	INDEX	Status atual do CC ('Ativo', 'Concluído', 'Cancelado').

2.2.2 Tabela CustosAlocados

Esta tabela consolida todos os custos diretos que não são de mão de obra, provenientes da conciliação bancária ou de OS de compras, além dos custos calculados (impostos, comissões).

Nome da Coluna	Tipo de Dados	Chave/Índice	Descrição/Regras
id	UUID	PK	Identificador único do lançamento de custo.
centro_custo_id	UUID	FK (CentrosCusto.id)	Vínculo com o Centro de Custo ao qual este custo pertence.
data_lancamento	DATE	INDEX	Data em que o custo foi incorrido ou registrado.
origem_id	TEXT		ID da transação na tabela de origem (ex: ID da conciliação).
origem_tabela	ENUM		Tabela de origem do dado ('ConciliacaoBancaria', 'OS').
favorecido	TEXT		Nome do fornecedor ou pessoa que recebeu o pagamento.
detalhamento	TEXT		Descrição detalhada do custo.
tipo_custo	ENUM	INDEX	Categoria do custo: 'Material', 'Equipamento - Locação', 'Equipamento - Aquisição', 'Segurança', 'Logística', 'Documentação', 'Prejuízo', 'NF', 'Comissão Comercial'.
valor	NUMERIC(10, 2)		Valor monetário do custo.
recibo_nf_anexo	TEXT		URL para o arquivo de comprovante (recibo, nota fiscal) armazenado.

2.2.3 Tabela AlocacaoMaoDeObra

Esta tabela registra os custos diários de mão de obra alocados a cada Centro de Custo, preenchida a partir do sistema de "Presença Diária".

Nome da Coluna	Tipo de Dados	Chave/Índice	Descrição/Regras
id	UUID	PK	Identificador único do registro de alocação.
centro_custo_id	UUID	FK (CentrosCusto.id)	Vínculo com o Centro de Custo.
colaborador_id	UUID	FK (Colaboradores.id)	Referência ao colaborador alocado.
data	DATE	INDEX	Data do dia de trabalho.
custo_dia	NUMERIC(8, 2)		Custo diário do colaborador, pré-definido em seu cadastro.
status_presenca	ENUM		Status da presença: 'Presença', 'Falta Justificada', 'Falta Injustificada', 'Atraso', 'Férias', 'Folga'.

2.2.4 Tabela CustosOverheadMensal

Esta tabela armazena o resultado do cálculo de rateio mensal dos custos de escritório e setor (overhead) para cada Centro de Custo ativo.

Nome da Coluna	Tipo de Dados	Chave/Índice	Descrição/Regras
id	UUID	PK	Identificador único do registro de rateio.
centro_custo_id	UUID	FK (CentrosCusto.id)	Vínculo com o Centro de Custo.
mes_referencia	DATE	INDEX	Primeiro dia do mês de referência do cálculo (ex: '2024-11-01').
custo_escritorio_rateado	NUMERIC(10, 2)		Parcela do custo do escritório alocada a este CC.
custo_setor_rateado	NUMERIC(10, 2)		Parcela do custo do setor (Obras/Assessoria) alocada a este CC.
valor_total_alocado	NUMERIC(10, 2)		Soma dos custos rateados (custo_escritorio_rateado + custo_setor_rateado).

2.3 Relacionamentos entre Entidades

As entidades definidas acima se conectam da seguinte forma para formar o modelo de dados do módulo:

* Um Cliente pode ter múltiplos CentrosCusto, mas cada CentroCusto pertence a um único Cliente.
* Um CentroCusto está associado a uma única OS de origem, que serve como seu gatilho de criação.
* Um CentroCusto agrega múltiplos registros de CustosAlocados, AlocacaoMaoDeObra e CustosOverheadMensal, que juntos formam seu perfil financeiro completo.
* Um Colaborador pode ter múltiplos registros em AlocacaoMaoDeObra, associados a diferentes CentrosCusto ao longo do tempo, refletindo sua alocação em diferentes projetos.

Com as estruturas de dados estabelecidas, o próximo passo é definir como os dados de outros módulos fluem para popular essas tabelas.

3.0 Fontes de Dados e Lógica de Integração

3.1 Introdução à Integração de Dados

O poder do Centro de Custo reside em sua capacidade de agregar informações de fontes díspares para fornecer uma visão financeira unificada. A integração de dados de diferentes módulos é, portanto, de importância estratégica. Esta seção detalhará os gatilhos de sistema, os fluxos de trabalho do usuário e os mapeamentos de dados que alimentarão o modelo de dados definido anteriormente, garantindo que o CC reflita com precisão a realidade operacional e financeira da empresa.

3.2 Integração com Ordens de Serviço (OS) e Contratos

O ciclo de vida de um Centro de Custo começa com a conversão de uma oportunidade de negócio em um contrato formal.

1. Gatilho: O processo é iniciado quando uma Ordem de Serviço (OS) atinge o status "Contrato Assinado", correspondente à etapa 14 do fluxo de OS.
2. Ação: Ao detectar essa mudança de status, o sistema deve criar automaticamente um novo registro na tabela CentrosCusto.
3. Mapeamento de Dados: Os campos do novo registro CentroCusto serão populados com base nos dados da OS e do cliente associado:
  * cliente_id ← ID do cliente vinculado à OS.
  * os_origem_id ← Código único da OS de origem.
  * nome_cc ← Gerado programaticamente no formato: "CENTRO DE CUSTOS - CLIENTE [Nome/Sigla do Cliente] - [Código da OS]". Ex: "CENTRO DE CUSTOS - CLIENTE DL - OS01-1907".
  * tipo_servico ← Derivado do setor da OS (Obras ou Assessoria).
  * valor_global_contrato ← Valor final negociado e registrado na OS.
  * data_inicio ← Data da assinatura do contrato.
4. Custos Iniciais: Custos de "equipamento/ferramenta" (locação ou aquisição) que foram registrados em uma OS do tipo 9 (Compras) associada ao projeto devem gerar um registro inicial correspondente na tabela CustosAlocados, vinculando-os ao CC recém-criado.

3.3 Integração com Presença Diária (Mão de Obra)

A alocação dos custos de mão de obra é um processo diário, conduzido pelos gestores de setor, conforme o fluxo a seguir:

* O gestor de setor (Obras ou Assessoria) acessa o módulo de "Presença Diária" para registrar o status de cada colaborador sob sua gestão.
* Para cada registro de presença, a interface deve obrigatoriamente exigir que o gestor associe aquele dia de trabalho a um CentroCusto específico. Conforme regra de negócio, um colaborador só pode ser alocado a um único CC por dia.
* Ao salvar o registro de presença, o sistema cria automaticamente um novo registro na tabela AlocacaoMaoDeObra, utilizando o colaborador_id, a data, o status_presenca selecionado e o valor custo_dia que já está pré-definido no cadastro do colaborador.

3.4 Integração com Módulo Financeiro (Conciliação Bancária)

Os custos operacionais diretos, como materiais, logística e documentação, são capturados através do módulo financeiro.

1. O Gestor Administrativo executa o processo de conciliação bancária no módulo financeiro.
2. Para cada lançamento de despesa (saída de caixa), a interface do sistema deve permitir (e, em muitos casos, exigir) que o gestor associe o lançamento a um CentroCusto existente.
3. No mesmo formulário, o gestor deve categorizar a despesa selecionando um tipo_custo da lista padronizada (Material, Segurança, Logística, etc.).
4. Ao confirmar a associação e a categorização, o sistema cria um novo registro na tabela CustosAlocados, populando-o com os dados da transação bancária e as informações inseridas pelo gestor.

Com todos os dados de receita e custo devidamente integrados e estruturados, o sistema está preparado para aplicar as regras de negócio e realizar os cálculos financeiros.

4.0 Regras de Negócio e Cálculos Financeiros

4.1 Visão Geral das Regras de Cálculo

Esta seção define a lógica matemática e as regras de negócio que transformam os dados brutos, coletados das diversas fontes de integração, em indicadores de performance chave (KPIs) financeiros. A precisão e a consistência desses cálculos são cruciais, pois formam a base para a tomada de decisão gerencial, desde a análise de rentabilidade de projetos até o planejamento estratégico da empresa.

4.2 Definição dos KPIs Principais

Os seguintes KPIs devem ser calculados e exibidos de forma proeminente na página de cada Centro de Custo.

4.2.1 Previsão de Custos

Este valor representa o orçamento de custos inicial do projeto. Ele é extraído do documento "memorial descritivo de custos", uma planilha gerada e anexada durante as etapas iniciais do fluxo da OS de origem. Este valor é estático e serve como a principal linha de base (baseline) para comparar com os custos reais incorridos ao longo do projeto.

4.2.2 Orçamento Disponível

Este KPI dinâmico informa o saldo restante do contrato para cobrir custos futuros. É calculado em tempo real.

Orçamento Disponível = T.valor_global_contrato - (SUM(C.valor) + SUM(M.custo_dia) + SUM(O.valor_total_alocado))

Onde:
- T = CentrosCusto
- C = CustosAlocados
- M = AlocacaoMaoDeObra
- O = CustosOverheadMensal


4.2.3 Lucro

Este é o KPI final de rentabilidade do projeto. Conforme a regra de negócio RN-014, ele representa a diferença entre a receita total e todos os custos acumulados.

* Fórmula: Lucro = Valor Global do Contrato - Custo Total Acumulado
* Onde: Custo Total Acumulado é a soma de todos os custos registrados nas tabelas CustosAlocados, AlocacaoMaoDeObra e CustosOverheadMensal.

4.3 Regras de Alocação de Custos

A seguir estão detalhadas as regras de negócio para o cálculo e alocação de categorias de custo específicas.

1. Custo de Mão de Obra: O custo é alocado diretamente através da criação de registros na tabela AlocacaoMaoDeObra. Este processo é acionado pelo registro de presença diária, onde o gestor de setor informa obrigatoriamente o CC ao qual o colaborador dedicou seu dia.
2. Custos Diretos: Todos os custos operacionais provenientes da Conciliação Bancária ou de uma OS de Compra (Tipo 9) são alocados diretamente ao CentroCusto selecionado pelo usuário (Gestor Administrativo) no momento do registro da despesa no sistema financeiro.
3. Impostos (NF): O sistema deve calcular este custo automaticamente no momento da criação do Centro de Custo. O cálculo aplica uma porcentagem pré-definida (ex: 17%) sobre o Valor Global do Contrato. O resultado deve ser registrado como uma única entrada na tabela CustosAlocados, com tipo_custo definido como 'NF'.
4. Comissão Comercial: Similarmente aos impostos, este custo é calculado automaticamente na criação do CC. O sistema aplica a porcentagem de comissão (ex: 1,5%) sobre o Valor Global do Contrato e registra o valor resultante como uma entrada na tabela CustosAlocados com tipo_custo 'Comissão Comercial'.
5. Custo de Administração e Setor (Overhead): Este custo é rateado mensalmente entre todos os projetos ativos. A lógica é a seguinte:
  * No final de cada mês, um processo automatizado calcula o Custo Mês Escritório (custos administrativos gerais) e o Custo Mês Setor (custos específicos dos setores de Obras e Assessoria).
  * O sistema então conta a QTD CLIENTES ATIVOS, que corresponde ao número total de registros na tabela CentrosCusto com status 'Ativo' para aquele mês, independentemente do setor.
  * A fórmula para determinar o custo de overhead por cliente é: Custo por Cliente = (CUSTO MÊS ESCRITORIO + CUSTO MÊS SETOR) / QTD CLIENTES ATIVOS.
  * O sistema, então, cria um novo registro na tabela CustosOverheadMensal para cada Centro de Custo ativo, atribuindo o valor rateado calculado.
6. RN-CC-01: Exclusividade de Alocação Diária de Mão de Obra: Um colaborador só pode ter seu custo diário alocado a um único CentroCusto por dia. O sistema deve impor uma restrição (constraint) na tabela AlocacaoMaoDeObra que impeça a inserção de múltiplos registros para o mesmo colaborador_id e data.

Com a lógica de cálculo definida, a próxima seção abordará como essas informações complexas serão estruturadas e apresentadas ao usuário de forma clara e funcional.

5.0 Design da Interface (UI) e Experiência do Usuário (UX) da Página do Centro de Custo

5.1 Visão Geral da Página

A Página do Centro de Custo será o dashboard central para a gestão de um projeto específico. O design deve priorizar a clareza, a densidade informacional e a funcionalidade, atendendo a dois perfis de uso principais: uma visão geral rápida e de alto nível para a diretoria, focada em KPIs de saúde financeira, e uma visão detalhada e analítica para os gestores de projeto, permitindo um mergulho profundo nos custos e na operação.

5.2 Estrutura e Layout Geral

A página será organizada em três seções principais para garantir uma navegação intuitiva.

* Cabeçalho: A seção superior da página deve exibir de forma proeminente a identidade visual do projeto.
  * À esquerda: A Logo do Cliente.
  * Centralizado/Direita: O Nome do Centro de Custo (ex: "CENTRO DE CUSTOS - CLIENTE DL - OS01-1907") e o Setor (ex: "OBRAS") em destaque.
* Painel de KPIs: Logo abaixo do cabeçalho, uma seção de alto impacto visual exibirá os três KPIs principais (Previsão Custos, Orçamento Disponível, Lucro) em cards distintos, permitindo uma avaliação financeira instantânea.
* Abas de Navegação: O corpo principal da página será organizado por um sistema de abas, permitindo ao usuário alternar entre diferentes contextos de informação sem perder a visão geral do projeto. As abas serão: "Resumo Financeiro", "Detalhe de Custos" e "Operacional e Documentos".

5.3 Aba 1: Resumo Financeiro

Esta aba é a visualização padrão e fornece um sumário consolidado da estrutura financeira do projeto. O layout será dividido em duas colunas.

* Coluna Esquerda: Apresentará uma tabela consolidada intitulada "Estrutura de Custos e Receita".

Item	Valor
RECEITA (VALOR DE CONTRATO)	R$ 1.004.500,00
mão de obra	R$ 30.710,20
equipamento/ferramenta - LOCAÇÃO	R$ 8.500,00
equipamento/ferramenta - AQUISIÇÃO	R$ 2.542,18
SEGURANÇA: EPIs, treinamentos e sinalização	R$ 98.745,00
materiais	R$ 89.650,00
logistica	R$ 87.400,00
documentação	R$ 35.487,00
prejuízo	R$ 58.000,00
Custo administração local + custo setor OBRAS	R$ 17.500,00
NF - nota fiscal	R$ 170.765,00
Comissão comercial 1,5%	R$ 15.067,50
CUSTO (TOTAL)	R$ 614.366,88
LUCRO (TOTAL)	R$ 390.133,12
PL gestor de obras - 1,5% lucro	R$ 5.852,00

* Coluna Direita: Conterá um componente visual para demonstrar a composição dos custos totais. Em vez de um gráfico complexo, será utilizada uma lista formatada que representa a proporção de cada categoria de custo em relação ao custo total, utilizando barras de progresso textuais simples para uma compreensão rápida e acessível.
* Composição de Custos:
  * NF - nota fiscal (27.8%): █████░░░░░░░░░░░░░░░░
  * SEGURANÇA (16.1%): ███░░░░░░░░░░░░░░░░░
  * materiais (14.6%): ███░░░░░░░░░░░░░░░░░
  * logistica (14.2%): ██░░░░░░░░░░░░░░░░░░
  * ... e assim por diante.

5.4 Aba 2: Detalhe de Custos (Visão Analítica)

Esta aba fornecerá as ferramentas para uma auditoria detalhada de todos os custos, organizados em seções expansíveis (formato accordion).

5.4.1 Custo Analítico de Mão de Obra

Esta seção conterá uma tabela detalhada que replica fielmente o relatório de origem, com todos os registros de alocação de mão de obra para o CC. A tabela será paginada e permitirá filtros por colaborador e por período.

TIPO DE CUSTO	CENTRO DE CUSTO	Data	Colaborador	Tipo	Custo Dia	Pontualidade
mão de obra	DL OS01-1907	01.08.2023	MÁRCIO	MEIO OFICIAL AJUDANTE	R$ 78,40	PRESENÇA
mão de obra	DL OS01-1907	02.08.2023	MÁRCIO	MEIO OFICIAL AJUDANTE	R$ 78,40	FALTA JUSTIFICADA
mão de obra	DL OS01-1907	03.08.2023	GUSTAVO	ESTAGIÁRIO	R$ 21,66	PRESENÇA

5.4.2 Custo Analítico da Conciliação Bancária

Apresentará uma tabela com todos os custos diretos originados do módulo financeiro, espelhando o relatório de origem para garantir a rastreabilidade. A tabela será filtrável e pesquisável.

Data	Identificação	Favorecido	Detalhamento	Tipo	SETOR	CENTRO DE CUSTO	Valor	Recibo / NF
27.06.2023	SAIDA	LOJA VEM KI TEM	CABO DE AÇO 8MM	Equipamento - Aquisição	OBRAS	DL OS01-1907	R$ 1.799,58	[Visualizar]
27.07.2023	SAIDA	A POTIGUAR	ESTILETE CG 200	Equipamento - Aquisição	OBRAS	DL OS01-1907	R$ 11,90	[Visualizar]
27.07.2023	SAIDA	CIA DOS PARAFUSOS	BARRA ROSCADA INOX 14MM - 1M	Material	OBRAS	DL OS01-1907	R$ 1.120,32	[Visualizar]

5.4.3 Custo Analítico de Setor + Escritório

Exibirá uma tabela simples com o histórico de alocação de custos de overhead para este Centro de Custo.

Mês de Referência	QTD CLIENTES ATIVOS	Custo Mês Escritório	Custo Mês Setor	Custo Alocado ao CC
Nov/2024	9	R$ 25.784,00	R$ 7.840,00	R$ 2.303,56
Dez/2024	6	R$ 25.784,00	R$ 7.840,00	R$ 3.455,33

5.5 Aba 3: Operacional e Documentos

Esta aba centraliza informações operacionais e a gestão de arquivos do projeto.

* Andamento da Obra: Um componente de destaque exibirá o percentual de conclusão da obra (TRAZER % ANDAMENTO DA OBRA). Este dado será consumido via API a partir do sistema de "Diário de Obras", garantindo que a informação esteja sempre atualizada.
* Relatórios Diários: Uma área dedicada listará os relatórios diários do "diário de obras", também integrados via API. O sistema deve exibir um alerta visual (ex: um ícone vermelho) ao lado do dia correspondente caso o envio do relatório esteja atrasado.
* Área de Documentos: Uma funcionalidade de gerenciamento de arquivos permitirá o upload, listagem e download de documentos vitais para o projeto. Haverá uma clara separação entre duas seções:
  * Documentos do Cliente: Área para upload de arquivos como projetos, cronograma, etc.
  * Documentos Minerva: Área para listagem de documentos gerados pela Minerva, como a ART (Anotação de Responsabilidade Técnica).
* Portfólio Minerva: Uma seção dedicada a exibir o portfólio da Minerva Engenharia, apresentando outros projetos e capacidades da empresa, servindo como ferramenta de marketing e reforço de marca.
* Funcionalidades de Contato: Para facilitar a comunicação, a página incluirá um Botão WhatsApp com a label "Contato com MINERVA", que iniciará uma conversa direta com o responsável pelo projeto.

6.0 Requisitos Não Funcionais

6.1 Permissões e Controle de Acesso

O acesso às informações do Centro de Custo será rigorosamente controlado com base no perfil do usuário, conforme a hierarquia definida no sistema Minerva ERP v2.0, garantindo a confidencialidade dos dados financeiros.

* Diretoria/Admin: Terão acesso total (leitura e escrita) a todos os Centros de Custo e a todos os seus dados financeiros, operacionais e de configuração.
* Gestor Administrativo: Possuirá acesso total aos dados financeiros e de custos de todos os Centros de Custo, podendo realizar lançamentos e conciliações.
* Gestor de Obras/Assessoria: Terá acesso de leitura a todos os dados dos Centros de Custo pertencentes ao seu respectivo setor (Obras ou Assessoria). O acesso de escrita será limitado a funcionalidades operacionais, como a alocação de mão de obra no sistema de presença e a validação de etapas.
* Colaborador: Terá acesso de leitura estritamente restrito aos dados operacionais (documentos, andamento da obra, relatórios diários) dos Centros de Custo aos quais está formalmente alocado. Colaboradores não devem, em hipótese alguma, visualizar dados financeiros compilados, como Lucro, Orçamento Disponível ou Custo Total.

6.2 Exportação de Dados

Para atender às necessidades de prestação de contas e auditoria, a página do Centro de Custo deve incluir uma funcionalidade de "Exportar Relatório".

* Esta ação deverá gerar um documento em formato PDF, com layout e conteúdo idênticos à planilha de referência relatorio analitico prestação de contas (imprimir PDF) - Planilha1.
* O relatório exportado deve compilar dinamicamente todas as visões analíticas (resumo financeiro, detalhe de mão de obra, detalhe de custos da conciliação e histórico de overhead) em um único documento coeso e profissional, pronto para ser compartilhado com clientes ou para análise interna.
