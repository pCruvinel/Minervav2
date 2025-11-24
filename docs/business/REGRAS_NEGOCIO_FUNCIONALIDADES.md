# Regras de Negócio e Especificação Funcional - Minerva ERP v2.0

## 1. Introdução
Este documento detalha as regras de negócio, fluxos de trabalho, perfis de usuário e funcionalidades principais do sistema Minerva ERP v2.0. Ele serve como guia de referência para o comportamento esperado do sistema.

## 2. Perfis de Usuário e Permissões

O sistema utiliza um modelo de controle de acesso baseado em níveis numéricos e "slugs" de cargo.

### Hierarquia de Acesso
| Cargo | Nível | Slug | Responsabilidades |
| :--- | :--- | :--- | :--- |
| **Admin** | 10 | `admin` | Acesso total ao sistema, configurações globais, gestão de usuários. |
| **Diretoria** | 9 | `diretoria` | Visão estratégica, relatórios financeiros completos, aprovações críticas. |
| **Gestor Administrativo** | 5 | `gestor_administrativo` | "Super Gestor". Acesso transversal a todos os setores, financeiro e RH. |
| **Gestor de Obras** | 5 | `gestor_obras` | Gestão de equipes de campo, cronogramas de obra, aprovação técnica. |
| **Gestor de Assessoria** | 5 | `gestor_assessoria` | Gestão de consultorias e laudos técnicos. |
| **Colaborador** | 1 | `colaborador` | Execução de tarefas, preenchimento de relatórios, visualização restrita. |

### Regras Gerais de Permissão
- **Financeiro**: Apenas `admin`, `diretoria` e `gestor_administrativo` têm acesso.
- **OS (Escrita)**: Qualquer usuário com nível >= 5 pode criar e editar Ordens de Serviço.
- **OS (Leitura)**: Gestores veem tudo. Colaboradores veem apenas OSs onde são responsáveis ou delegados.
- **Agendamentos**: Gestores (exceto Admin) são restritos aos agendamentos do seu próprio setor.

## 3. Workflow de Ordens de Serviço (OS)

O fluxo de vida de uma OS é composto por 15 etapas sequenciais. O sistema guia o usuário através deste "wizard".

### Etapas do Processo
1.  **Identificação do Cliente** (Resp: Administrativo)
    - Cadastro ou seleção de cliente existente.
    - Definição do contato principal.
2.  **Seleção do Tipo de OS** (Resp: Administrativo)
    - Classificação: Perícia, Revitalização, Reforço Estrutural, Outros.
3.  **Follow-up 1 (Entrevista Inicial)** (Resp: Administrativo)
    - Coleta de necessidades iniciais.
    - Upload de arquivos preliminares.
4.  **Agendar Visita Técnica** (Resp: Administrativo)
    - Integração com calendário para definir data/hora da visita.
5.  **Realizar Visita** (Resp: Obras)
    - Checklist de vistoria in-loco.
    - Registro fotográfico.
6.  **Follow-up 2 (Pós-Visita)** (Resp: Obras)
    - Relatório técnico preliminar.
7.  **Formulário Memorial (Escopo)** (Resp: Obras)
    - Definição detalhada do escopo do serviço.
8.  **Precificação** (Resp: Obras)
    - Cálculo de custos de materiais, mão de obra e equipamentos.
9.  **Gerar Proposta Comercial** (Resp: Administrativo)
    - Geração automática de PDF com base nos dados anteriores.
10. **Agendar Visita (Apresentação)** (Resp: Administrativo)
    - Agendamento para apresentar a proposta ao cliente.
11. **Realizar Visita (Apresentação)** (Resp: Administrativo)
    - Registro do feedback do cliente sobre a proposta.
12. **Follow-up 3 (Pós-Apresentação)** (Resp: Administrativo)
    - Negociação e ajustes finais.
13. **Gerar Contrato (Upload)** (Resp: Administrativo)
    - Minuta do contrato.
14. **Contrato Assinado** (Resp: Administrativo)
    - Upload do contrato assinado e validação jurídica.
15. **Iniciar Contrato de Obra** (Resp: Sistema)
    - Transição automática para status "Em Execução".

### Regras de Transição
- **Validação**: Cada etapa possui validação estrita (campos obrigatórios) antes de permitir o avanço.
- **Auto-save**: O progresso é salvo automaticamente para evitar perda de dados.
- **Rascunho**: Etapas complexas (3, 6, 7, 8) permitem salvar como rascunho sem validar.

## 4. Módulo de Agendamentos e Calendário

O sistema possui um calendário integrado para gestão de visitas e turnos de trabalho.

### Entidades
- **Turno**: Define um bloco de disponibilidade (ex: "Manhã - Equipe A", 08:00 às 12:00). Possui cor e setores associados.
- **Agendamento**: Um compromisso específico dentro de um turno (ex: "Visita Técnica - Cliente X").

### Regras de Agendamento
1.  **Disponibilidade**: O sistema valida se há "vagas" no turno antes de criar um agendamento (regra `verificar_vagas_turno`).
2.  **Conflitos**: Não é permitido agendar fora do horário do turno.
3.  **Setorização**: Agendamentos são categorizados por setor (Obras, Comercial, etc.).
4.  **Vínculo com OS**: Agendamentos podem (e devem) ser vinculados a uma OS específica.

### Visualizações do Calendário
- **Mês**: Visão geral de ocupação.
- **Semana**: Visão detalhada para planejamento operacional.
- **Dia**: Foco na execução diária.
- **Navegação**: Botões para transitar entre períodos (anterior/próximo) e atalho para "Hoje".

## 5. Visualizações e Dashboards

### Dashboard Principal (`/dashboard`)
Adapta-se ao perfil do usuário:
- **Diretoria**: KPIs financeiros (Faturamento, Lucro), Gráficos de desempenho global.
- **Gestor**: KPIs operacionais do setor, Lista de OSs críticas, Aprovações pendentes.
- **Colaborador**: "Minhas Tarefas", Próximas visitas, Avisos importantes.

### Lista de OS (`/os`)
- **Filtros**: Por status, cliente, responsável, data.
- **Kanban (Futuro)**: Visualização de cards por etapa.

### Detalhe da OS (`/os/$id`)
- **Timeline**: Histórico de todas as ações realizadas na OS.
- **Abas**: Dados Gerais, Financeiro, Arquivos, Diário de Obra.

---
*Documento gerado em 23/11/2025.*
