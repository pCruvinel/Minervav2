# GUIA DE TESTES - MÓDULO COLABORADOR

## 🧪 Casos de Teste para o Módulo Colaborador

Este documento contém casos de teste para validação completa do módulo.

---

## 1️⃣ Testes de Autenticação e Autorização

### TC-001: Acesso ao Dashboard sem autenticação
**Pré-condição:** Usuário não logado  
**Passos:**
1. Acessar `/colaborador/dashboard`

**Resultado Esperado:**  
✅ Redirecionar para página de login

---

### TC-002: Acesso com perfil Colaborador
**Pré-condição:** Usuário logado com `role_nivel = 4`  
**Passos:**
1. Acessar `/colaborador/dashboard`

**Resultado Esperado:**  
✅ Dashboard exibido com sucesso  
✅ KPIs visíveis  
✅ Tabela de tarefas carregada

---

### TC-003: Tentativa de acesso com perfil Gestor
**Pré-condição:** Usuário logado com `role_nivel = 3` (Gestor)  
**Passos:**
1. Acessar `/colaborador/dashboard`

**Resultado Esperado:**  
⚠️ Acesso permitido (gestores têm acesso a todas as áreas)  
✅ Dashboard exibido normalmente

---

### TC-004: Acesso a Leads sem ser Comercial
**Pré-condição:** Usuário logado com `setor = "OPERACIONAL"`  
**Passos:**
1. Acessar `/colaborador/leads`

**Resultado Esperado:**  
❌ Mensagem: "Acesso Restrito - Esta área é exclusiva para colaboradores do setor administrativo"  
✅ Botão "Voltar" disponível

---

## 2️⃣ Testes de Dashboard

### TC-101: Exibição de KPIs
**Pré-condição:** Colaborador com 12 OS ativas  
**Passos:**
1. Acessar dashboard

**Resultado Esperado:**  
✅ Card "Minhas OS em Aberto" exibe "12"  
✅ Card "Tarefas para Hoje" exibe quantidade correta  
✅ Card "Prazos Vencidos" exibe quantidade correta

---

### TC-102: Ordenação de tarefas por prazo
**Pré-condição:** Colaborador com múltiplas OS  
**Passos:**
1. Verificar ordem da tabela

**Resultado Esperado:**  
✅ Primeira linha: OS com prazo mais próximo  
✅ Última linha: OS com prazo mais distante  
✅ OS vencidas aparecem com ícone de alerta

---

### TC-103: Botão "Executar" na tarefa
**Pré-condição:** Dashboard carregado  
**Passos:**
1. Clicar em "Executar" na primeira tarefa

**Resultado Esperado:**  
✅ Redireciona para `/colaborador/minhas-os/[id]`  
✅ Detalhes da OS carregados corretamente

---

## 3️⃣ Testes de Minhas OS

### TC-201: Filtro automático por responsável
**Pré-condição:** Sistema com 100 OS totais, 12 do colaborador  
**Passos:**
1. Acessar `/colaborador/minhas-os`

**Resultado Esperado:**  
✅ Exibe apenas 12 OS (filtradas por responsável)  
✅ Não exibe OS de outros colaboradores

---

### TC-202: Busca por código da OS
**Pré-condição:** Lista de OS carregada  
**Passos:**
1. Digitar "OS-007" no campo de busca
2. Aguardar filtragem

**Resultado Esperado:**  
✅ Exibe apenas OS-007-2025  
✅ Outras OS ficam ocultas

---

### TC-203: Filtro por Status
**Pré-condição:** Lista de OS carregada  
**Passos:**
1. Selecionar "Em Andamento" no filtro de status

**Resultado Esperado:**  
✅ Exibe apenas OS com `status = EM_ANDAMENTO`  
✅ OS com outros status ficam ocultas

---

### TC-204: Filtro combinado
**Pré-condição:** Lista de OS carregada  
**Passos:**
1. Buscar "ABC" no campo de busca
2. Selecionar "Alta" no filtro de prioridade

**Resultado Esperado:**  
✅ Exibe apenas OS que contêm "ABC" E têm prioridade ALTA  
✅ Filtros funcionam em conjunto (AND)

---

## 4️⃣ Testes de Execução de OS

### TC-301: Carregamento de detalhes da OS
**Pré-condição:** Colaborador acessa OS-007-2025  
**Passos:**
1. Acessar `/colaborador/minhas-os/1`

**Resultado Esperado:**  
✅ Cabeçalho exibe código, cliente e endereço  
✅ Sidebar exibe informações completas  
✅ Formulário da etapa atual visível  
✅ Dados financeiros NÃO visíveis

---

### TC-302: Preenchimento de checklist
**Pré-condição:** OS na etapa VISTORIA  
**Passos:**
1. Marcar checkbox "Estrutura"
2. Marcar checkbox "Instalações"
3. Deixar outros desmarcados

**Resultado Esperado:**  
✅ Checkboxes marcados permanecem marcados  
✅ Estado salvo no formulário

---

### TC-303: Salvar rascunho
**Pré-condição:** Formulário parcialmente preenchido  
**Passos:**
1. Preencher campo "Observações"
2. Clicar em "Salvar Rascunho"

**Resultado Esperado:**  
✅ Toast: "Rascunho salvo com sucesso!"  
✅ Status da OS permanece "Em Andamento"  
✅ Dados salvos no backend

---

### TC-304: Submeter para aprovação
**Pré-condição:** Formulário completamente preenchido  
**Passos:**
1. Marcar todos os checkboxes
2. Preencher observações
3. Clicar em "Submeter para Aprovação"

**Resultado Esperado:**  
✅ Toast: "OS enviada para aprovação do gestor!"  
✅ Redirecionamento para `/colaborador/minhas-os`  
✅ Status alterado para "Aguardando Aprovação"  
✅ Edição bloqueada

---

### TC-305: Tentativa de editar OS aprovada
**Pré-condição:** OS com `status = AGUARDANDO_APROVACAO`  
**Passos:**
1. Acessar detalhes da OS
2. Tentar editar campos

**Resultado Esperado:**  
❌ Campos bloqueados para edição  
⚠️ Mensagem informativa exibida

---

### TC-306: Upload de fotos
**Pré-condição:** Formulário de execução aberto  
**Passos:**
1. Clicar no input de arquivos
2. Selecionar 3 fotos (JPG)
3. Confirmar seleção

**Resultado Esperado:**  
✅ 3 arquivos selecionados  
✅ Nomes dos arquivos visíveis  
✅ Preview das imagens (opcional)

---

## 5️⃣ Testes de Consulta de Clientes

### TC-401: Visualização em modo leitura
**Pré-condição:** Acessar `/colaborador/clientes`  
**Passos:**
1. Verificar interface

**Resultado Esperado:**  
✅ Cards de clientes exibidos  
✅ Badge "Acesso Somente Leitura" visível  
✅ Sem botões de "Novo", "Editar", "Excluir"

---

### TC-402: Busca por cliente
**Pré-condição:** Lista de clientes carregada  
**Passos:**
1. Digitar "Construtora" no campo de busca

**Resultado Esperado:**  
✅ Exibe apenas clientes com "Construtora" no nome  
✅ Outros clientes ficam ocultos

---

### TC-403: Clique no telefone
**Pré-condição:** Card de cliente visível  
**Passos:**
1. Clicar no número de telefone

**Resultado Esperado:**  
✅ Abre aplicativo de ligação (mobile) ou Skype/Teams (desktop)  
✅ Número preenchido automaticamente

---

### TC-404: Clique no e-mail
**Pré-condição:** Card de cliente visível  
**Passos:**
1. Clicar no endereço de e-mail

**Resultado Esperado:**  
✅ Abre cliente de e-mail padrão  
✅ Destinatário preenchido automaticamente

---

## 6️⃣ Testes de Agenda

### TC-501: Exibição do calendário
**Pré-condição:** Acessar `/colaborador/agenda`  
**Passos:**
1. Verificar calendário do mês atual

**Resultado Esperado:**  
✅ Calendário mensal exibido  
✅ Dia atual destacado  
✅ Eventos marcados nos dias corretos

---

### TC-502: Navegação entre meses
**Pré-condição:** Calendário de novembro/2025 aberto  
**Passos:**
1. Clicar em "←" (mês anterior)
2. Verificar calendário
3. Clicar em "Hoje"

**Resultado Esperado:**  
✅ Exibe outubro/2025  
✅ Botão "Hoje" retorna para novembro/2025  
✅ Eventos carregados corretamente em cada mês

---

### TC-503: Clique em evento do calendário
**Pré-condição:** Dia com evento agendado  
**Passos:**
1. Clicar no evento "09:00 - VISTORIA"

**Resultado Esperado:**  
✅ Modal de detalhes abre  
✅ Exibe título, data, horário, cliente, endereço  
✅ Badge de tipo correto  
✅ Link para OS disponível

---

### TC-504: Botão "Abrir Ordem de Serviço"
**Pré-condição:** Modal de evento aberto  
**Passos:**
1. Clicar em "Abrir Ordem de Serviço"

**Resultado Esperado:**  
✅ Redireciona para `/colaborador/minhas-os/[id]`  
✅ Modal fecha  
✅ Detalhes da OS carregados

---

### TC-505: Lista de próximos compromissos
**Pré-condição:** Agenda carregada  
**Passos:**
1. Rolar para "Próximos Compromissos"

**Resultado Esperado:**  
✅ Lista exibe até 5 eventos futuros  
✅ Ordenação por data crescente  
✅ Cada item clicável abre modal

---

## 7️⃣ Testes de Gestão de Leads

### TC-601: Criar novo lead
**Pré-condição:** Colaborador comercial logado  
**Passos:**
1. Clicar em "Novo Lead"
2. Preencher formulário:
   - Nome: "Empresa Teste Ltda"
   - Contato: "João Silva"
   - Telefone: "(11) 99999-8888"
   - E-mail: "joao@teste.com"
   - Origem: "SITE"
3. Clicar em "Criar Lead"

**Resultado Esperado:**  
✅ Toast: "Lead criado com sucesso!"  
✅ Modal fecha  
✅ Novo lead aparece na lista  
✅ Status inicial: "NOVO"

---

### TC-602: Editar lead existente
**Pré-condição:** Lead criado  
**Passos:**
1. Clicar no ícone de editar (lápis)
2. Alterar status para "EM_CONTATO"
3. Atualizar observações
4. Clicar em "Salvar Alterações"

**Resultado Esperado:**  
✅ Toast: "Lead atualizado com sucesso!"  
✅ Badge de status atualizado  
✅ Observações atualizadas no card

---

### TC-603: Filtro por status
**Pré-condição:** Leads com status variados  
**Passos:**
1. Selecionar "Qualificado" no filtro

**Resultado Esperado:**  
✅ Exibe apenas leads com `status = QUALIFICADO`  
✅ KPIs atualizados corretamente

---

### TC-604: KPIs de leads
**Pré-condição:** 15 leads cadastrados (5 novos, 4 em contato, 3 qualificados, 3 convertidos)  
**Passos:**
1. Verificar cards de KPI

**Resultado Esperado:**  
✅ Total de Leads: 15  
✅ Novos: 5  
✅ Em Contato: 4  
✅ Qualificados: 3

---

### TC-605: Busca por lead
**Pré-condição:** Lista de leads carregada  
**Passos:**
1. Digitar "Empresa" no campo de busca

**Resultado Esperado:**  
✅ Exibe apenas leads com "Empresa" no nome, contato ou e-mail  
✅ Busca case-insensitive

---

## 8️⃣ Testes de Navegação

### TC-701: Página inicial do módulo
**Pré-condição:** Acessar `/colaborador`  
**Passos:**
1. Verificar interface

**Resultado Esperado:**  
✅ Cards de navegação exibidos  
✅ Permissões listadas corretamente  
✅ Dicas e atalhos visíveis  
✅ Card "Leads" visível apenas se setor = COMERCIAL

---

### TC-702: Links de navegação
**Pré-condição:** Página inicial do colaborador  
**Passos:**
1. Clicar em cada card de navegação

**Resultado Esperado:**  
✅ Dashboard → `/colaborador/dashboard`  
✅ Minhas OS → `/colaborador/minhas-os`  
✅ Clientes → `/colaborador/clientes`  
✅ Agenda → `/colaborador/agenda`  
✅ Leads → `/colaborador/leads` (se comercial)

---

## 9️⃣ Testes de Responsividade

### TC-801: Dashboard em mobile
**Pré-condição:** Viewport 375px  
**Passos:**
1. Acessar dashboard
2. Verificar layout

**Resultado Esperado:**  
✅ KPIs empilhados (1 coluna)  
✅ Tabela com scroll horizontal  
✅ Botões acessíveis

---

### TC-802: Formulário de OS em tablet
**Pré-condição:** Viewport 768px  
**Passos:**
1. Acessar detalhes de OS
2. Verificar layout

**Resultado Esperado:**  
✅ Grid adaptativo (2 colunas)  
✅ Sidebar visível  
✅ Campos de formulário legíveis

---

## 🔟 Testes de Performance

### TC-901: Carregamento inicial
**Passos:**
1. Acessar dashboard
2. Medir tempo de carregamento

**Resultado Esperado:**  
✅ Primeira renderização < 1s  
✅ Dados carregados < 2s

---

### TC-902: Busca em tempo real
**Pré-condição:** 100 clientes cadastrados  
**Passos:**
1. Digitar caracteres no campo de busca
2. Verificar responsividade

**Resultado Esperado:**  
✅ Filtro aplicado instantaneamente  
✅ Sem lag ou travamento

---

## 1️⃣1️⃣ Testes de Validação

### TC-1001: Campo obrigatório vazio
**Pré-condição:** Formulário de novo lead  
**Passos:**
1. Deixar "Nome da Empresa" vazio
2. Tentar criar lead

**Resultado Esperado:**  
❌ Erro de validação  
⚠️ Campo destacado em vermelho  
⚠️ Mensagem: "Campo obrigatório"

---

### TC-1002: E-mail inválido
**Pré-condição:** Formulário de lead  
**Passos:**
1. Preencher e-mail: "emailinvalido"
2. Tentar salvar

**Resultado Esperado:**  
❌ Erro de validação  
⚠️ Mensagem: "E-mail inválido"

---

## ✅ Checklist de Testes

### Funcionalidades Principais
- [ ] Dashboard carrega KPIs corretamente
- [ ] Filtro de OS por responsável funciona
- [ ] Salvar rascunho mantém dados
- [ ] Submeter para aprovação bloqueia edição
- [ ] Upload de fotos aceita formatos válidos
- [ ] Consulta de clientes é read-only
- [ ] Calendário exibe apenas eventos do colaborador
- [ ] Leads acessível apenas para comerciais
- [ ] Navegação entre páginas fluida

### Segurança
- [ ] Usuário não-autenticado redirecionado
- [ ] Colaborador não vê OS de outros
- [ ] Colaborador não vê dados financeiros
- [ ] Colaborador não pode aprovar OS
- [ ] Setor não-comercial não acessa Leads

### Performance
- [ ] Carregamento < 2s
- [ ] Busca em tempo real responsiva
- [ ] Scroll suave em listas grandes
- [ ] Upload de arquivos com feedback

### UX/UI
- [ ] Design System aplicado
- [ ] Cores Minerva (#D3AF37) consistentes
- [ ] Ícones Lucide visíveis
- [ ] Toasts de feedback exibidos
- [ ] Responsivo em mobile/tablet/desktop

---

**Última atualização:** 17/11/2025  
**Total de casos de teste:** 60+  
**Cobertura:** Funcional, Segurança, Performance, UX
