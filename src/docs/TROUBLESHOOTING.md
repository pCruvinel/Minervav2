# TROUBLESHOOTING - MINERVA ENGENHARIA ERP

## 🔧 Problemas Conhecidos e Soluções

### ❌ Erro: "Lead inválido detectado"

**Sintoma:**
```
⚠️ Lead inválido detectado: {
  "id": "1",
  "nome": "João Silva",
  ...
}
```

**Causa:**
Incompatibilidade entre estrutura de dados dos leads mock e a estrutura esperada pelo componente.

**Solução:** ✅ RESOLVIDA
Os leads mock em `/lib/hooks/use-clientes.tsx` agora incluem ambos os campos:
- `nome_razao_social` (esperado pelo componente)
- `nome` (compatibilidade)
- `tipo_cliente` (PESSOA_FISICA ou PESSOA_JURIDICA)

---

### ❌ Erro 403: Deploy Supabase Edge Function

**Sintoma:**
```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" failed with status 403
```

**Causa:**
Erro de permissão ao tentar fazer deploy automático da edge function do Supabase.

**Impacto:**
- ⚠️ **NENHUM** - O sistema está funcionando em modo **frontend-only**
- Todas as funcionalidades usam dados mock
- A edge function é necessária apenas para produção com Supabase conectado

**Soluções:**

1. **Modo Development (Recomendado)**
   - Ignorar o erro - não afeta desenvolvimento
   - Sistema funciona 100% com dados mock
   - Todas as páginas renderizam corretamente

2. **Se precisar conectar Supabase:**
   - Verificar permissões do projeto Supabase
   - Verificar se o token de API está válido
   - Fazer deploy manual da função via CLI:
     ```bash
     supabase functions deploy make-server
     ```

3. **Desabilitar tentativas de deploy:**
   - Comentar código de deploy automático
   - Usar apenas mock data

---

### ⚠️ Warnings de Console Esperados

**Em modo development, os seguintes warnings são normais:**

1. **"Mock data sendo usado"**
   - ✅ Normal - sistema em modo frontend-only
   - Aparece em: Dashboard, OS, Clientes, etc.

2. **"Supabase não conectado"**
   - ✅ Normal - desenvolvimento local sem backend
   - Não afeta funcionalidades

3. **"Não foi possível buscar nome do cliente"**
   - ✅ Normal - dados mock podem estar incompletos
   - Sistema usa fallback "Cliente"

---

### 🐛 Problemas de Renderização

#### Tabelas vazias
**Causa:** Filtros muito restritivos ou dados mock vazios

**Solução:**
1. Verificar filtros aplicados
2. Clicar em "Limpar Filtros" se disponível
3. Verificar dados mock no arquivo correspondente

#### Páginas em branco
**Causa:** Erro de JavaScript não tratado

**Solução:**
1. Abrir Console do navegador (F12)
2. Verificar erro específico
3. Reportar com stack trace completo

---

### 🔐 Problemas de Permissões

#### "Acesso Restrito" para Colaborador
**Causa:** Usuário mock com `role_nivel` incorreto

**Solução:**
```typescript
// Verificar em cada página:
const mockUser = {
  id: 1,
  nome: "Carlos Silva",
  role_nivel: 4, // ← Deve ser 4 para Colaborador
  setor: "COMERCIAL" // ou "OPERACIONAL"
};
```

#### Leads não aparecem para Colaborador
**Causa:** Setor do usuário não é "COMERCIAL"

**Solução:**
- Alterar `setor: "COMERCIAL"` no mock user
- Ou verificar controle de acesso na página

---

### 📱 Problemas de Responsividade

#### Layout quebrado em mobile
**Causa:** Grid não adaptativo

**Solução:**
- Usar classes Tailwind responsivas:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  ```

#### Scroll horizontal não funciona
**Causa:** Overflow não configurado

**Solução:**
```tsx
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

---

### 🚀 Problemas de Performance

#### Carregamento lento
**Causa:** Mock delays muito altos

**Solução:**
Reduzir delays em simulações:
```typescript
setTimeout(() => {
  // ...
}, 100); // ← Reduzir de 500 para 100
```

#### Busca travando
**Causa:** Filtro executando em todo keystroke

**Solução:**
Implementar debounce:
```typescript
import { debounce } from 'lodash';

const handleSearch = debounce((term) => {
  setSearchTerm(term);
}, 300);
```

---

### 🎨 Problemas de Estilo

#### Cores Minerva não aplicadas
**Causa:** Classes Tailwind incorretas

**Solução:**
Usar cores corretas:
- Primary: `bg-[#D3AF37]`, `text-[#D3AF37]`, `border-[#D3AF37]`
- Secondary: `bg-[#DDC063]`
- Sempre texto preto: `text-black`

#### Ícones não aparecem
**Causa:** Import incorreto do Lucide

**Solução:**
```typescript
import { Icon } from 'lucide-react'; // ✅ Correto
// não: import Icon from 'lucide-react' ❌
```

---

### 📝 Problemas de Formulários

#### Validação não funciona
**Causa:** Campos não marcados como required

**Solução:**
```tsx
<Input
  required
  value={value}
  onChange={onChange}
/>
```

#### Toast não aparece
**Causa:** Import incorreto do Sonner

**Solução:**
```typescript
import { toast } from "sonner@2.0.3"; // ✅ Com versão específica
```

---

## 🔍 Debugging Tips

### 1. Console Logs Úteis
```typescript
console.log('🔍 [DEBUG] Variável:', variavel);
console.log('📊 [DATA] Dados:', data);
console.log('❌ [ERROR] Erro:', error);
console.log('✅ [SUCCESS] Sucesso!');
```

### 2. React DevTools
- Instalar extensão React DevTools
- Verificar props e state dos componentes
- Inspecionar hooks ativos

### 3. Network Tab
- Abrir DevTools > Network
- Verificar chamadas de API (mock)
- Checar responses e status codes

### 4. Verificar Estado do Componente
```typescript
useEffect(() => {
  console.log('Estado atual:', { data, loading, error });
}, [data, loading, error]);
```

---

## 📞 Suporte

### Checklist antes de reportar bug:

- [ ] Limpar cache do navegador (Ctrl + Shift + Del)
- [ ] Verificar console para erros
- [ ] Testar em navegador incognito
- [ ] Verificar se dados mock existem
- [ ] Conferir permissões do usuário mock
- [ ] Tentar em outro navegador

### Informações necessárias para reportar:

1. **Descrição do problema**
   - O que você esperava que acontecesse?
   - O que realmente aconteceu?

2. **Passos para reproduzir**
   - Passo 1: ...
   - Passo 2: ...
   - Resultado: ...

3. **Environment**
   - Navegador e versão
   - Sistema operacional
   - Resolução de tela

4. **Logs e erros**
   - Screenshot do erro
   - Mensagens do console
   - Stack trace completo

5. **Dados mock**
   - Qual usuário está logado?
   - Qual página está acessando?
   - Quais filtros/buscas aplicados?

---

## ✅ Testes de Sanidade

Execute estes testes para verificar se o sistema está funcionando:

### 1. Dashboard Colaborador
- [ ] Acessar `/colaborador/dashboard`
- [ ] Verificar 3 KPIs visíveis
- [ ] Verificar tabela de tarefas carrega
- [ ] Clicar em "Executar" redireciona

### 2. Minhas OS
- [ ] Acessar `/colaborador/minhas-os`
- [ ] Verificar lista de OS carrega
- [ ] Testar busca por código
- [ ] Testar filtros de status/prioridade

### 3. Detalhes da OS
- [ ] Acessar `/colaborador/minhas-os/1`
- [ ] Verificar formulário carrega
- [ ] Marcar checkboxes funciona
- [ ] Salvar rascunho mostra toast

### 4. Consulta Clientes
- [ ] Acessar `/colaborador/clientes`
- [ ] Verificar cards de clientes
- [ ] Badge "Somente Leitura" visível
- [ ] Busca funciona

### 5. Agenda
- [ ] Acessar `/colaborador/agenda`
- [ ] Calendário renderiza
- [ ] Eventos visíveis nos dias
- [ ] Modal de detalhes abre

### 6. Leads (Comercial)
- [ ] Acessar `/colaborador/leads`
- [ ] Verificar se setor = COMERCIAL permite acesso
- [ ] KPIs visíveis
- [ ] Criar novo lead funciona

---

## 🔄 Reset do Sistema

Se tudo mais falhar, execute reset completo:

1. **Limpar dados do navegador**
   ```
   - Ctrl + Shift + Del
   - Limpar cache
   - Limpar cookies
   - Limpar localStorage
   ```

2. **Recarregar página**
   ```
   - Ctrl + Shift + R (hard reload)
   ```

3. **Verificar modo**
   - Console deve mostrar: "🎨 Sistema em modo FRONTEND ONLY"
   - Se não aparecer, há problema de inicialização

4. **Testar rota básica**
   - Acessar `/colaborador`
   - Deve mostrar portal de navegação

---

**Última atualização:** 17/11/2025  
**Versão do sistema:** 1.0.0  
**Ambiente:** Frontend Only (Mock Data)
