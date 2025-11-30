# Regras de Negócio e Especificação Funcional - Minerva ERP v2.0

## 1. Introdução

Este documento detalha as regras de negócio, fluxos de trabalho, perfis de usuário e funcionalidades principais do sistema **Minerva ERP v2.0** - um ERP completo para empresas de engenharia e construção.

### Escopo do Sistema
- **Domínio**: Engenharia civil, construção e consultoria técnica
- **Arquitetura**: Full-stack com Supabase (PostgreSQL), React/TypeScript, Row Level Security
- **Modelo de Dados**: Relacional com triggers automáticos e validações em banco
- **Segurança**: Autenticação JWT + Autorização baseada em cargos/setores

### Princípios Fundamentais
1. **Integridade de Dados**: Validações rigorosas em frontend e backend
2. **Segurança Primeiro**: RLS implementado em todas as tabelas críticas
3. **Experiência do Usuário**: Workflows guiados com validações em tempo real
4. **Performance**: Lazy loading, memoização e otimização de queries
5. **Auditabilidade**: Todas as operações são logadas com contexto completo

## 2. Perfis de Usuário e Permissões

O sistema utiliza um modelo de controle de acesso baseado em níveis numéricos e "slugs" de cargo.

### Hierarquia de Acesso
| Cargo | Nível | Slug | Setor | Responsabilidades |
| :--- | :--- | :--- | :--- | :--- |
| **Admin/TI** | 10 | `admin` | - | Acesso "God Mode". Vê tudo, configurações globais, gestão de usuários. |
| **Diretoria** | 9 | `diretoria` | `diretoria` | Visão estratégica, relatórios financeiros completos, aprovações críticas, delegação para todos. |
| **Gestor Administrativo** | 5 | `gestor_administrativo` | `administrativo` | "Super Gestor". Acesso transversal (obras + assessoria), financeiro completo, RH. |
| **Gestor de Obras** | 5 | `gestor_obras` | `obras` | Gestão isolada de obras, equipes de campo, cronogramas, aprovações técnicas. |
| **Gestor de Assessoria** | 5 | `gestor_assessoria` | `assessoria` | Gestão isolada de consultorias, laudos técnicos, pareceres. |
| **Colaborador** | 1 | `colaborador` | variável | Execução operacional, visualização restrita às próprias OSs/delegações. |
| **Mão de Obra** | 0 | `mao_de_obra` | variável | **BLOQUEADO**: Não acessa sistema, serve apenas para custos/cronogramas. |

### Regras Gerais de Permissão

#### Row Level Security (RLS) - Regras Automáticas
- **Política "block_mao_de_obra_access"**: Usuários com cargo `mao_de_obra` têm SELECT bloqueado (não conseguem fazer login)
- **Política "user_owns_record"**: Usuários só veem/modificam registros próprios ou delegados
- **Política "admin_full_access"**: Cargo `admin` ignora todas as restrições RLS
- **Política "gestor_cross_access"**: `gestor_administrativo` acessa `obras` + `assessoria` + `financeiro`

#### Permissões por Módulo
- **Financeiro**: Apenas `admin`, `diretoria`, `gestor_administrativo`
- **OS (Escrita)**: Nível >= 5 (Gestores) podem criar/editar todas as OSs
- **OS (Leitura)**: Gestores veem tudo; Colaboradores veem apenas OSs onde são `responsavel_id` ou há delegação ativa
- **Agendamentos**: Gestores isolados (`gestor_obras`, `gestor_assessoria`) restritos ao próprio setor
- **Calendário/Turnos**: Apenas usuários nível >= 5 podem criar turnos; Todos podem visualizar

#### Regras de Delegação (Trigger `validar_regras_delegacao`)
- `diretoria`/`admin` → Delegam para **todos os setores**
- `gestor_administrativo` → Delega para `obras` ou `assessoria`
- `gestor_obras` → Delega apenas para `obras`
- `gestor_assessoria` → Delega apenas para `assessoria`
- `colaborador` → **Não pode delegar**

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
    - **Regra de Flexibilidade**: Requisitos mínimos reduzidos para avanço rápido (5 caracteres em textos, 2 no nome, 8 no telefone).
    - Campos obrigatórios mantidos, mas com validações mais permissivas.
4.  **Agendar Visita Técnica** (Resp: Administrativo)
    - Integração com calendário para definir data/hora da visita.
    - **Regra de Flexibilidade**: Agendamento é recomendado mas não obrigatório.
    - Permite avanço para próxima etapa mesmo sem agendamento realizado.
    - Aviso visual orienta sobre benefícios do agendamento prévio.
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

O sistema possui um calendário integrado customizado para gestão de visitas e turnos de trabalho, desenvolvido sem dependências externas para maior controle e performance.

### Entidades Principais

#### Turno
- **Definição**: Bloco de disponibilidade temporal (ex: "Manhã - Equipe A", 08:00 às 12:00)
- **Propriedades**: Horário início/fim, vagas totais, setores associados, cor visual, tipo de recorrência
- **Recorrência**: 'todos' (todos os dias), 'uteis' (segunda a sexta), 'custom' (datas específicas)
- **Validade**: Pode ser configurado para períodos específicos ou recorrência infinita

#### Agendamento
- **Definição**: Compromisso específico dentro de um turno (ex: "Vistoria Inicial - Cliente X")
- **Propriedades**: Data, horário início/fim, duração, categoria, setor, status, vínculo com OS
- **Status**: 'confirmado', 'cancelado', 'realizado', 'ausente'
- **Integração**: Vinculado obrigatoriamente a uma Ordem de Serviço

### Regras de Agendamento

#### Validações Automáticas
1.  **Disponibilidade de Vagas**: Função `verificar_vagas_turno()` valida capacidade antes da criação
2.  **Conflitos de Horário**: Não permite agendamentos fora do intervalo do turno
3.  **Restrições de Setor**: Agendamentos respeitam setores permitidos do turno
4.  **Vínculo Obrigatório**: Todo agendamento deve estar vinculado a uma OS ativa

#### Regras de Negócio
- **Capacidade**: Máximo 10 vagas por turno, controle automático de ocupação
- **Duração**: Mínimo 1 hora, máximo igual à duração do turno
- **Antecedência**: Agendamentos até 30 dias no futuro, validação automática
- **Cancelamento**: Apenas criador, gestor do setor ou admin podem cancelar
- **Vínculo OS**: Todo agendamento deve estar vinculado a uma OS ativa

#### Integração com Ordens de Serviço
- **Agendamento Etapa 4**: "Agendar Visita Técnica" - vincula visita à OS
- **Agendamento Etapa 10**: "Agendar Visita (Apresentação)" - apresentação da proposta
- **Status OS**: Agendamentos refletem no status da OS (ex: visita realizada)
- **Histórico**: Todos os agendamentos ficam registrados no timeline da OS

### Visualizações do Calendário

#### Semana (Principal)
- **Layout**: Grade 7 dias × 11 horários (08:00 às 18:00)
- **Turnos**: Renderizados como blocos posicionados absolutamente
- **Interação**: Click nos turnos disponíveis abre modal de agendamento
- **Navegação**: Botões anterior/próximo semana, botão "Hoje"

#### Dia (Detalhada)
- **Layout**: Lista vertical de turnos por horário
- **Foco**: Execução diária e verificação de disponibilidade
- **Interação**: Seleção direta de turnos disponíveis

#### Componentes Técnicos
- **BlocoTurno**: Componente memoizado para performance
- **CalendarioSemana**: Visualização semanal principal
- **CalendarioDia**: Visualização diária detalhada
- **Modal de Agendamento**: Formulário inteligente com validações em tempo real

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

## 6. Regras Técnicas e Validações

### Validações de Sistema
- **Row Level Security (RLS)**: Implementado em todas as tabelas críticas
- **Triggers Automáticos**: Validação de regras de negócio no banco de dados
- **Auditoria**: Todas as operações são logadas com timestamp e usuário responsável

### Regras de Integridade de Dados
1. **OSs**: Não podem ser deletadas após o status "Em Execução"
2. **Agendamentos**: Validação automática de conflitos de horário
3. **Usuários**: Validação de unicidade de email e CPF/CNPJ
4. **Financeiro**: Controle rigoroso de lançamentos e aprovações

## 7. Regras de Segurança e Conformidade

### Controle de Acesso
- **Autenticação**: JWT com refresh tokens
- **Autorização**: Baseada em cargo e setor do usuário
- **Sessões**: Controle de timeout e múltiplas sessões

### Auditoria e Compliance
- **Logs**: Todas as operações críticas são registradas
- **Backup**: Estratégia de backup diário com retenção de 90 dias
- **Recuperação**: Plano de continuidade de negócio implementado

## 8. Regras de Performance e Escalabilidade

### Otimizações Implementadas
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: Evita re-renders desnecessários
- **Paginação**: Listas grandes são paginadas automaticamente
- **Cache**: Dados frequentes são cacheados no frontend

### Limites do Sistema
- **OS Simultâneas**: Máximo 1000 OSs ativas por usuário gestor
- **Uploads**: Arquivos até 50MB por upload
- **Agendamentos**: Máximo 50 agendamentos por dia por usuário

## 9. Regras de Comunicação e Notificações

### Sistema de Notificações
- **Email**: Confirmações de agendamento e lembretes
- **In-App**: Notificações dentro do sistema
- **WhatsApp**: Integração futura para alertas críticos

### Templates de Comunicação
- **Boas-vindas**: Envio automático para novos usuários
- **Lembretes**: Agendamentos e prazos próximos
- **Alertas**: Aprovações pendentes e itens críticos

---

*Documento atualizado em 28/11/2025.*
