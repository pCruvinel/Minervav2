# Relatório de Verificação de Formulários - Sistema Minerva v2

**Data:** 23/11/2025  
**Objetivo:** Verificar se todos os formulários do sistema estão inserindo dados corretamente no Supabase via API

---

## 📊 Resumo Executivo

- **Total de Formulários Analisados:** 6
- **✅ Conformes (conectados ao Supabase):** 3
- **⚠️ Parcialmente Conformes:** 0
- **❌ Não Conformes (dados mockados/simulados):** 3

---

## 📋 Análise Detalhada por Formulário

### 1. ✅ Formulário de Login
**Arquivo:** `src/components/auth/login-page.tsx`  
**Status:** CONFORME

**Análise:**
- Usa `useAuth` context (linha 15)
- Autenticação via Supabase Auth (linha 56: `await login(email, password)`)
- **Conclusão:** Integrado corretamente com Supabase

**Ação Necessária:** Nenhuma

---

### 2. ✅ Modal de Delegação de OS
**Arquivo:** `src/components/delegacao/modal-delegar-os.tsx`  
**Status:** CONFORME

**Análise:**
- Usa `ordensServicoAPI.createDelegacao` (linhas 116-124)
- Insere dados na tabela `delegacoes` do Supabase
- Campos mapeados corretamente:
  - `os_id`: ID da ordem de serviço
  - `delegante_id`: ID do usuário que delega
  - `delegado_id`: ID do colaborador que receberá a tarefa
  - `descricao_tarefa`: Descrição da tarefa
  - `observacoes`: Observações adicionais
  - `data_prazo`: Data limite
  - `status_delegacao`: Status inicial ('pendente')

**Conclusão:** Integrado corretamente com Supabase

**Ação Necessária:** Nenhuma

---

### 3. ❌ Formulário Público de OS (Termo de Comunicação de Reforma)
**Arquivo:** `src/components/os/os07-form-publico.tsx`  
**Status:** NÃO CONFORME

**Problema Identificado:**
- Linhas 270-289: Apenas simula envio com `setTimeout`
- Não persiste dados no Supabase
- Dados são apenas logados no console

```typescript
// Código atual (INCORRETO)
try {
  // Simular envio
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const dados = {
    osId,
    nomeSolicitante,
    // ... outros campos
  };
  
  console.log('📋 Formulário enviado:', dados); // Apenas log
  setSubmitSuccess(true);
}
```

**Ação Necessária:**
1. Criar endpoint na API ou função RPC no Supabase para salvar termos de reforma
2. Persistir dados em `os_etapas.dados_etapa` (campo JSONB)
3. Upload de arquivos (`arquivoART`, `arquivoProjeto`) para Supabase Storage
4. Substituir simulação por chamada real à API

**Sugestão de Implementação:**
```typescript
// Salvar em os_etapas
const etapaData = {
  os_id: osId,
  nome_etapa: 'OS07 - Termo de Comunicação de Reforma',
  status: 'pendente',
  dados_etapa: {
    nomeSolicitante,
    contato,
    email,
    condominio,
    bloco,
    unidade,
    alteracoes,
    executores,
    planoDescarte,
    tiposObra,
    dataEnvio: new Date().toISOString(),
  }
};

await ordensServicoAPI.createEtapa(osId, etapaData);
```

---

### 4. ❌ Formulário Pós-Visita (OS 08)
**Arquivo:** `src/components/os/steps/os08/step-formulario-pos-visita.tsx`  
**Status:** NÃO CONFORME

**Problema Identificado:**
- Apenas atualiza state local via `onDataChange` (linhas 45-48)
- Não persiste no Supabase
- Dados ficam apenas na memória do componente

**Ação Necessária:**
1. Salvar dados em `os_etapas.dados_etapa` (JSONB)
2. Upload de fotos para Supabase Storage
3. Atualizar status da etapa quando concluída

**Sugestão de Implementação:**
```typescript
// Adicionar função para salvar
const handleSalvar = async () => {
  const etapaData = {
    dados_etapa: {
      pontuacaoEngenheiro: data.pontuacaoEngenheiro,
      pontuacaoMorador: data.pontuacaoMorador,
      tipoDocumento: data.tipoDocumento,
      areaVistoriada: data.areaVistoriada,
      manifestacaoPatologica: data.manifestacaoPatologica,
      recomendacoesPrevias: data.recomendacoesPrevias,
      gravidade: data.gravidade,
      origemNBR: data.origemNBR,
      observacoesGerais: data.observacoesGerais,
      resultadoVisita: data.resultadoVisita,
      justificativa: data.justificativa,
    },
    status: 'aprovada', // ou outro status apropriado
  };
  
  await ordensServicoAPI.updateEtapa(etapaId, etapaData);
};
```

---

### 5. ✅ Identificação de Lead (Criação de Cliente)
**Arquivo:** `src/components/os/steps/shared/step-identificacao-lead-completo.tsx`  
**Status:** CONFORME

**Análise:**
- Usa `useClientes()` para buscar leads do banco (linha 82)
- Usa `useCreateCliente()` para criar novo cliente (linha 83)
- Função `handleSaveNewLead` persiste no Supabase (linhas 205-251)
- Insere na tabela `clientes` via `clientesAPI.create`

**Conclusão:** Integrado corretamente com Supabase

**Ação Necessária:** Nenhuma

---

### 6. ❌ Análise de Reformas (Gestor de Assessoria)
**Arquivo:** `src/components/assessoria/analise-reformas.tsx`  
**Status:** NÃO CONFORME

**Problema Identificado:**
- Linha 20: Usa dados mockados `mockReformasPendentes`
- Linhas 86-114: Apenas atualiza state local
- Não persiste aprovações/reprovações no Supabase

```typescript
// Código atual (INCORRETO)
const [reformas, setReformas] = useState<ReformaPendente[]>(mockReformasPendentes);

const handleSalvarAnalise = () => {
  // Apenas atualiza state local
  setReformas(prev =>
    prev.map(r =>
      r.id === reformaSelecionada.id
        ? { ...r, statusAprovacao: novoStatus as any, observacoes }
        : r
    )
  );
  toast.success(mensagem); // Sucesso falso
};
```

**Ação Necessária:**
1. Buscar reformas reais do banco via API
2. Atualizar `os_etapas` com decisão de aprovação
3. Registrar histórico de aprovação em `os_historico_status`

**Sugestão de Implementação:**
```typescript
// 1. Buscar reformas do banco
const { data: reformas } = useApi(() => 
  ordensServicoAPI.getEtapas(osId, { tipo_etapa: 'OS07' })
);

// 2. Salvar análise
const handleSalvarAnalise = async () => {
  await ordensServicoAPI.updateEtapa(reformaSelecionada.id, {
    status: novoStatus === 'aprovado' ? 'aprovada' : 'rejeitada',
    comentarios_aprovacao: observacoes,
    aprovador_id: currentUser.id,
  });
  
  // Registrar histórico
  await ordensServicoAPI.update(reformaSelecionada.os_id, {
    status_geral: novoStatus === 'aprovado' ? 'em_andamento' : 'em_validacao'
  });
};
```

---

## 🔍 Tabelas do Supabase Utilizadas

### Tabelas Corretamente Integradas:
1. ✅ `auth.users` - Login/Autenticação
2. ✅ `clientes` - Cadastro de leads/clientes
3. ✅ `delegacoes` - Delegação de tarefas

### Tabelas que PRECISAM ser Integradas:
1. ❌ `os_etapas` - Dados de etapas de OS (OS07, OS08)
2. ❌ `os_historico_status` - Histórico de aprovações

---

## 📝 Recomendações

### Prioridade ALTA
1. **Formulário Público OS07**
   - Integrar com Supabase para salvar termos de reforma
   - Implementar upload de arquivos (ART/RRT, projetos)
   - Salvar em `os_etapas.dados_etapa`

2. **Análise de Reformas**
   - Substituir dados mockados por queries reais
   - Implementar persistência de aprovações
   - Registrar histórico de mudanças

### Prioridade MÉDIA
3. **Formulário Pós-Visita**
   - Persistir dados em `os_etapas`
   - Implementar upload de fotos
   - Atualizar status da etapa

### Boas Práticas Observadas
- ✅ Uso de hooks customizados (`useClientes`, `useCreateCliente`)
- ✅ API client centralizado (`src/lib/api-client.ts`)
- ✅ Validação com Zod schemas
- ✅ Tratamento de erros com toast

---

## 📋 Checklist de Implementação

### Formulário OS07 - Termo de Reforma
- [ ] Criar função para salvar etapa no Supabase
- [ ] Implementar upload de arquivos para Storage
- [ ] Integrar com `ordensServicoAPI.createEtapa`
- [ ] Testar inserção de dados
- [ ] Validar campos obrigatórios conforme schema

### Formulário Pós-Visita (OS08)
- [ ] Adicionar persistência em `os_etapas.dados_etapa`
- [ ] Implementar upload de fotos
- [ ] Atualizar status da etapa ao salvar
- [ ] Testar fluxo completo

### Análise de Reformas
- [ ] Criar hook `useReformas` para buscar do banco
- [ ] Implementar `handleAprovar` com API
- [ ] Registrar aprovações em `os_historico_status`
- [ ] Remover dados mockados
- [ ] Testar fluxo de aprovação/reprovação

---

## ✅ Conclusão

Dos 6 formulários analisados:
- **3 estão integrados corretamente** com o Supabase
- **3 precisam de implementação** para persistir dados

Os formulários críticos que precisam de atenção imediata são:
1. OS07 - Termo de Comunicação de Reforma (público)
2. Análise de Reformas (gestor)
3. Pós-Visita (técnico)

**Próximos Passos:**
1. Priorizar implementação do OS07 (impacta clientes externos)
2. Implementar análise de reformas (processo crítico)
3. Finalizar pós-visita (complemento do fluxo)

---

**Documento gerado em:** 23/11/2025  
**Revisado por:** Claude (Assistente de IA)
