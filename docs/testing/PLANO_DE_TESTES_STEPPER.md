# Plano de Testes Manual: Unificação do Stepper

Este documento descreve os cenários de teste para validar a unificação do componente `WorkflowStepper` e a integração dos hooks de workflow (`useWorkflowState`, `useWorkflowNavigation`, `useWorkflowCompletion`).

## 1. Navegação Básica

### 1.1. Avançar Etapa (Forward)
- **Cenário:** Usuário preenche todos os campos obrigatórios da etapa atual e clica em "Próximo".
- **Resultado Esperado:**
  - O sistema deve salvar os dados da etapa atual.
  - O sistema deve avançar para a próxima etapa.
  - A URL deve atualizar (se houver roteamento por URL).
  - O indicador de progresso no topo deve marcar a etapa anterior como concluída (check) e a nova como ativa.

### 1.2. Voltar Etapa (Backward)
- **Cenário:** Usuário está na etapa 2 ou superior e clica em "Voltar".
- **Resultado Esperado:**
  - O sistema deve retornar para a etapa anterior.
  - Os dados da etapa anterior devem ser carregados e exibidos corretamente.
  - O estado da etapa atual (que foi deixada) deve ser preservado.

### 1.3. Navegação pelo Stepper (Clique no Header)
- **Cenário:** Usuário clica em uma etapa anterior (já concluída) no cabeçalho do stepper.
- **Resultado Esperado:**
  - O sistema deve navegar para a etapa clicada.
  - O modo de visualização deve mudar para "Histórico" (Read-Only) se configurado.

### 1.4. Bloqueio de Navegação Futura
- **Cenário:** Usuário tenta clicar em uma etapa futura (ainda não alcançada) no cabeçalho.
- **Resultado Esperado:**
  - A navegação deve ser bloqueada.
  - Nenhuma ação deve ocorrer ou um feedback visual (cursor not-allowed) deve ser exibido.

## 2. Validação e Persistência

### 2.1. Validação de Campos Obrigatórios
- **Cenário:** Usuário tenta avançar sem preencher campos obrigatórios.
- **Resultado Esperado:**
  - A navegação deve ser impedida.
  - Mensagens de erro devem ser exibidas nos campos inválidos ou via Toast.
  - O sistema NÃO deve avançar para a próxima etapa.

### 2.2. Auto-Save (Salvamento Automático)
- **Cenário:** Usuário preenche dados e avança para a próxima etapa.
- **Resultado Esperado:**
  - Uma mensagem de "Salvando..." ou similar deve aparecer brevemente.
  - Ao recarregar a página (F5) e voltar para a mesma etapa, os dados devem persistir.

### 2.3. Persistência entre Sessões
- **Cenário:** Usuário faz logout e login novamente, ou fecha e abre o navegador.
- **Resultado Esperado:**
  - O sistema deve restaurar o usuário na última etapa ativa (ou na etapa 1 com dados carregados).
  - Todos os dados preenchidos anteriormente devem estar visíveis.

## 3. Modos de Visualização

### 3.1. Modo Histórico (Read-Only)
- **Cenário:** Usuário navega para uma etapa anterior já concluída.
- **Resultado Esperado:**
  - Um banner "Modo de Visualização Histórica" deve ser exibido.
  - Os campos do formulário devem estar desabilitados (read-only).
  - Botões de ação (Salvar, Upload) devem estar ocultos ou desabilitados.
  - Um botão "Voltar para Etapa Atual" deve estar visível e funcional.

### 3.2. Retorno ao Modo Ativo
- **Cenário:** Estando no modo histórico, usuário clica em "Voltar para Etapa X" (botão flutuante ou no footer).
- **Resultado Esperado:**
  - O sistema deve retornar para a etapa mais avançada (ativa).
  - O modo de edição deve ser reativado.
  - O banner de histórico deve desaparecer.

## 4. Integrações Específicas

### 4.1. Upload de Arquivos (Supabase)
- **Cenário:** Usuário faz upload de um arquivo em uma etapa (ex: OS-01 ou OS-09).
- **Resultado Esperado:**
  - O upload deve ser processado com sucesso.
  - O link do arquivo deve ser gerado e salvo.
  - O componente deve mostrar o arquivo anexado.

### 4.2. Delegação de Tarefa
- **Cenário:** Usuário clica em "Delegar" (se disponível na etapa).
- **Resultado Esperado:**
  - O modal de delegação deve abrir.
  - A lista de colaboradores deve carregar.
  - Ao confirmar, a delegação deve ser registrada no Supabase.

### 4.3. Autenticação Real
- **Cenário:** Verificar se o usuário logado é corretamente identificado.
- **Resultado Esperado:**
  - O ID do usuário deve ser usado para uploads e logs.
  - O nome do usuário deve aparecer no header/menu.

## 5. Casos de Borda

### 5.1. Falha de Rede
- **Cenário:** Simular desconexão de rede ao tentar salvar/avançar.
- **Resultado Esperado:**
  - O sistema deve exibir uma mensagem de erro amigável.
  - Os dados não devem ser perdidos (manter no estado local).

### 5.2. Dados Corrompidos/Incompletos
- **Cenário:** Carregar uma OS com dados de etapas faltando.
- **Resultado Esperado:**
  - O sistema deve lidar graciosamente (ex: assumir campos vazios) sem travar (Crash).
