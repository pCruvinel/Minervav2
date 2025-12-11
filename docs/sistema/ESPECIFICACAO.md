# 03 - Especificação Funcional - Minerva ERP v2.7

## 🎯 Visão Geral

O Minerva ERP v2.7 gerencia 13 tipos de Ordens de Serviço (OS) com workflows polimórficos, sistema de transferência automática de setor e isolamento de dados por RLS.

---

## 📋 Features do MVP

### Feature 1: Gestão de OS (13 Tipos)

#### Descrição
Sistema de Ordens de Serviço com workflows personalizados para cada tipo de serviço.

#### User Stories
- Como **Administrativo**, quero cadastrar um lead e iniciar uma OS, para que o processo comercial seja iniciado.
- Como **Gestor de Obras**, quero visualizar minhas OS pendentes, para que eu possa priorizar o trabalho da equipe.
- Como **Diretor**, quero aprovar contratos, para que a empresa possa iniciar a execução.

#### Critérios de Aceitação
- [x] Formulário de criação com seleção de tipo (OS-01 a OS-13)
- [x] Workflow stepper mostrando progresso
- [x] Validação por etapa antes de avançar
- [x] Salvamento automático de dados
- [x] Transferência automática de setor quando etapa muda de responsável

### Feature 2: Transferência Automática de Setor

#### Descrição
Sistema que detecta mudança de setor responsável entre etapas e executa handoff automaticamente.

#### User Stories
- Como **Colaborador**, quero ser notificado quando uma OS chegar ao meu setor, para que eu possa iniciar o trabalho.
- Como **Coordenador**, quero receber alerta de novas OS transferidas, para que eu possa distribuir tarefas.

#### Critérios de Aceitação
- [x] Detecção automática de handoff points
- [x] Registro na tabela `os_transferencias`
- [x] Notificação ao coordenador do setor destino
- [x] Modal de feedback ao usuário após transferência
- [x] Atualização do `setor_atual_id` na OS

### Feature 3: Calendário de Agendamentos

#### Descrição
Sistema de turnos e agendamentos integrado com validação de vagas e conflitos.

#### User Stories
- Como **Administrativo**, quero agendar uma visita técnica, para que a equipe de obras possa comparecer.
- Como **Gestor**, quero visualizar a ocupação dos turnos, para evitar overbooking.

#### Critérios de Aceitação
- [x] Visualização semanal/diária de turnos
- [x] Validação de vagas disponíveis
- [x] Vinculação obrigatória com OS
- [x] Categorização por tipo de visita

---

## 🔐 Regras de Negócio

1. **RN001**: Usuários só acessam OS do próprio setor (exceto Admin/Diretoria)
2. **RN002**: Mão de Obra não acessa o sistema (nível 0)
3. **RN003**: Transferência de setor só ocorre em handoff points definidos
4. **RN004**: Coordenadores são notificados automaticamente em transferências
5. **RN005**: Centro de custo é criado automaticamente para OS-11, OS-12 e OS-13
6. **RN006**: OS filha (OS-13) é criada ao concluir OS de venda (OS-01 a OS-04)

---

## 🚫 Validações

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| cliente_id | required | "Selecione um cliente" |
| tipo_os_id | required | "Selecione o tipo de OS" |
| responsavel_id | required | "Responsável é obrigatório" |
| data_prazo | after:today | "Prazo deve ser uma data futura" |
| endereco_obra | required (OS-01 a OS-04) | "Endereço da obra é obrigatório" |

---

## 🎨 Estados da UI

### Estados Globais
- **Loading**: Skeleton loaders em listas e formulários
- **Error**: Toast de erro com opção de retry
- **Empty**: Mensagem contextual + CTA de criação
- **Success**: Toast de confirmação verde

### Estados por Feature
- **OS em Rascunho**: Badge cinza, editável
- **OS em Andamento**: Badge azul, workflow ativo
- **OS Concluída**: Badge verde, somente leitura
- **OS Cancelada**: Badge vermelho, arquivada

---

**Status**: ✅ Preenchido para Minerva v2.7
**Última Atualização**: 11/12/2025