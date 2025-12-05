# 🚀 Deploy no Vercel - Minerva ERP v2

## 📋 Pré-requisitos

### 1. Conta no Vercel
- Acesse [vercel.com](https://vercel.com) e faça login
- Conecte sua conta GitHub

### 2. Repositório Git
- Certifique-se de que o código está em um repositório Git público no GitHub
- Todas as mudanças devem estar commitadas

### 3. Variáveis de Ambiente
Configure as seguintes variáveis no painel do Vercel:

```
VITE_SUPABASE_URL=https://zxfevlkssljndqqhxkjb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[sua-chave]
```

## ⚙️ Configurações do Projeto

### ✅ Arquivos de Configuração Criados

1. **`vercel.json`** - Configurações específicas do Vercel
2. **`.nvmrc`** - Versão do Node.js (18.17.0)
3. **`vite.config.ts`** - Configurado para produção
4. **`package.json`** - Scripts de build configurados

### 📦 Build Testado

✅ **Build local bem-sucedido:**
- Comando: `npm run build`
- Output directory: `build/`
- Bundle size: ~2.1MB (chunk principal)
- Status: **Build OK**

## 🚀 Passos para Deploy

### Método 1: Deploy via GitHub (Recomendado)

1. **Importar projeto no Vercel:**
   - Vá para [vercel.com/new](https://vercel.com/new)
   - Conecte seu repositório GitHub
   - Selecione o repositório `Minerva-v2`

2. **Configurar projeto:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (raiz do projeto)
   - **Build Command:** `npm run build` (já configurado)
   - **Output Directory:** `build` (já configurado)

3. **Configurar variáveis de ambiente:**
   - Vá para Settings → Environment Variables
   - Adicione as variáveis do Supabase

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build (cerca de 2-3 minutos)

### Método 2: Deploy Manual (CLI)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ou para preview
vercel
```

## 🔧 Configurações Técnicas

### Build Settings
- **Framework:** Vite
- **Node Version:** 18.17.0 (especificado em `.nvmrc`)
- **Build Command:** `npm run build`
- **Output Directory:** `build/`

### Environment Variables
```env
VITE_SUPABASE_URL=https://zxfevlkssljndqqhxkjb.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Headers de Segurança
Configurados automaticamente via `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Otimizações Aplicadas

### Bundle Splitting
- ✅ Chunk size warning limit: 1000kB
- ✅ Dynamic imports configurados
- ⚠️ **Atenção:** Bundle principal está grande (~2.1MB)
  - Considere code-splitting adicional se necessário

### Performance
- ✅ Target: ES2020
- ✅ Minification habilitada
- ✅ Gzip compression automática

## 🐛 Troubleshooting

### Build Falhando
```bash
# Testar build localmente
npm run build

# Verificar dependências
npm ls --depth=0

# Limpar cache
rm -rf node_modules/.vite
npm run build
```

### Environment Variables
- ✅ Verifique se as variáveis começam com `VITE_`
- ✅ Use as chaves corretas do Supabase
- ✅ Re-deploy após alterar variáveis

### CORS Issues
- Verifique se o domínio do Vercel está na allowlist do Supabase
- URL típica: `https://minerva-v2-[hash].vercel.app`

## 📈 Pós-Deploy

### Verificações
1. ✅ Site carrega corretamente
2. ✅ Login funciona
3. ✅ OS-09 pode ser criada e finalizada
4. ✅ Notificações funcionam sem erros 403
5. ✅ Upload de arquivos funciona

### Analytics
- ✅ Vercel Analytics já configurado (`@vercel/analytics`)
- Monitore performance no dashboard do Vercel

### Custom Domain (Opcional)
- Vá para Settings → Domains
- Adicione seu domínio customizado
- Configure DNS conforme instruções

## 🎯 Status do Deploy

- ✅ **Build:** Testado e funcionando
- ✅ **Configurações:** Completas
- ✅ **Variáveis:** Documentadas
- ✅ **Segurança:** Headers configurados
- ✅ **Performance:** Otimizada

**🎉 Pronto para deploy!**

---

**Nota:** Certifique-se de que o banco Supabase está acessível e as políticas RLS foram corrigidas conforme documentado em `docs/technical/FIX_NOTIFICATIONS_RLS.md`.