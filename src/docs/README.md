# 📚 Documentação - ERP Minerva Engenharia

**Bem-vindo à documentação oficial do sistema!**

> Esta pasta contém toda a documentação técnica, guias de início rápido, troubleshooting e referências do ERP Minerva.

---

## 🎯 COMECE AQUI

### Para Novos Usuários
1. **[START_HERE.md](./START_HERE.md)** - 🚀 Seu ponto de partida absoluto
2. **[USUARIOS_TESTE.md](./USUARIOS_TESTE.md)** - Credenciais para fazer login
3. **[GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)** - Configurar backend (opcional)

### Para Desenvolvedores
1. **[00-INDEX.md](./00-INDEX.md)** - Índice completo de toda documentação
2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Estrutura do banco de dados
3. **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - Guia de integração com API

### Para Troubleshooting
1. **[SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)** - Resolver erro 403 no deploy
2. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problemas gerais
3. **[TEST_API_CONNECTION.md](./TEST_API_CONNECTION.md)** - Testar conexões

---

## 📂 ORGANIZAÇÃO DA DOCUMENTAÇÃO

### 🚀 Início Rápido (3 documentos essenciais)
- `START_HERE.md` - Ponto de partida absoluto
- `GUIA_RAPIDO_SUPABASE.md` - Setup backend em 5 minutos
- `USUARIOS_TESTE.md` - Credenciais de acesso

### 🔌 Supabase & Backend (7 documentos)
- `RESUMO_SUPABASE.md` - Visão geral executiva
- `SUPABASE_CONECTADO.md` - Configuração detalhada
- `SUPABASE_INTEGRATION.md` - Guia de integração
- `COMANDOS_SUPABASE.md` - Comandos práticos de CLI
- `TEST_API_CONNECTION.md` - Testes de conexão
- E mais...

### 🗄️ Banco de Dados (8 documentos + scripts SQL)
- `DATABASE_SCHEMA.md` - Schema completo
- `ENUM_DEFINICOES_SISTEMA.md` - Definições de ENUMs
- `FIX_ALL_ENUMS_AGORA.sql` - Scripts de correção
- E mais scripts de fix...

### 👷 Módulos de Usuário (8 documentos)
#### Colaborador
- `RESUMO_EXECUTIVO_COLABORADOR.md` - Visão geral do módulo
- `QUICK_START_COLABORADOR.md` - Início rápido
- `CHANGELOG_COLABORADOR.md` - Histórico de mudanças
- `COLABORADOR_INTEGRACAO.md` - Integração
- `COLABORADOR_TESTES.md` - Casos de teste
- `DADOS_MOCKADOS_COLABORADOR.md` - Dados de teste

#### Gestores
- `FLUXO_GESTORES_COMPLETO.md` - Fluxos completos
- `ACESSO_RAPIDO_GESTORES.md` - Guia de acesso rápido

#### CRM/Comercial
- `FLUXO_16_RESUMO_EXECUTIVO.md` - Resumo do Fluxo 16
- `ACESSO_RAPIDO_FLUXO_16.md` - Acesso rápido ao CRM
- `FLUXO_16_MENU_PERFIL_COLABORADOR.md` - Menu por perfil

### 🔧 Troubleshooting (10 documentos)
- `SOLUCAO_ERRO_403.md` - ⭐ Erro 403 deploy (mais importante)
- `FIX_ERRO_403_COMPLETO.md` - Documentação completa do erro
- `COMO_CORRIGIR_ERRO_CLIENTE.md` - Erro de cliente/status
- `TROUBLESHOOTING.md` - Problemas gerais
- E mais documentos de correção...

### 📋 Deploy & Configuração (4 documentos)
- `CHECKLIST_DEPLOY.md` - Checklist passo a passo
- `CHECKLIST_MODO_FRONTEND.md` - Checklist modo frontend
- `MODO_FRONTEND_ONLY.md` - Documentação do modo mock
- `STATUS_ATUAL.md` - Status do sistema

### 🧪 API & Integração (2 documentos)
- `API_INTEGRATION_GUIDE.md` - Guia completo de API
- `TEST_API_CONNECTION.md` - Testes de conexão

### 🎨 Design (1 documento)
- `DESIGN_SYSTEM.md` - Sistema completo de design

---

## 📊 ESTATÍSTICAS

```
Total de Documentos: 40+
├── Guias de Início: 3
├── Supabase/Backend: 7
├── Banco de Dados: 8 (+ scripts SQL)
├── Módulos: 8
├── Troubleshooting: 10
├── Deploy: 4
├── API: 2
└── Design: 1
```

---

## 🔍 BUSCA RÁPIDA

### Por Necessidade

**"Quero começar agora"**  
→ [START_HERE.md](./START_HERE.md)

**"Preciso fazer login"**  
→ [USUARIOS_TESTE.md](./USUARIOS_TESTE.md)

**"Quero conectar o backend"**  
→ [GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)

**"Tenho um erro 403"**  
→ [SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)

**"Preciso ver o schema do banco"**  
→ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

**"Quero entender tudo"**  
→ [00-INDEX.md](./00-INDEX.md)

---

## 📝 SOBRE ESTA REORGANIZAÇÃO

**Data:** 18/11/2025

### O Que Mudou?
Toda a documentação que estava espalhada na raiz do projeto foi organizada em `/docs` para melhor navegabilidade e manutenção.

### Estrutura Anterior vs Nova

**Antes:**
```
/
├── README.md
├── START_HERE.md
├── GUIA_RAPIDO_SUPABASE.md
├── SOLUCAO_ERRO_403.md
├── DATABASE_SCHEMA.md
├── ... (35+ arquivos .md na raiz)
└── docs/
    └── TROUBLESHOOTING.md
```

**Agora:**
```
/
├── README.md (atualizado com links para /docs)
├── Attributions.md
└── docs/                    ← TODA DOCUMENTAÇÃO AQUI
    ├── 00-INDEX.md          ← Índice completo
    ├── START_HERE.md
    ├── GUIA_RAPIDO_SUPABASE.md
    └── ... (40+ documentos organizados)
```

### Benefícios
- ✅ Raiz do projeto mais limpa
- ✅ Documentação centralizada
- ✅ Fácil navegação com índice
- ✅ Melhor manutenibilidade
- ✅ Links internos atualizados

---

## 💡 DICAS DE USO

### Para Ler Documentação Localmente
Abra qualquer arquivo `.md` em:
- **VS Code** com extensão Markdown Preview
- **Navegador** (alguns visualizadores de Markdown)
- **Aplicativos** como Typora ou Mark Text

### Para Buscar Algo Específico
1. Use o [00-INDEX.md](./00-INDEX.md) para navegar por categoria
2. Use Ctrl+F para buscar palavras-chave
3. Consulte a seção "Busca Rápida" acima

### Para Contribuir
- Mantenha novos documentos em `/docs`
- Atualize o [00-INDEX.md](./00-INDEX.md) ao adicionar documentos
- Siga o padrão de nomenclatura MAIÚSCULAS_COM_UNDERSCORES.md
- Use markdown padrão para compatibilidade

---

## 📞 SUPORTE

Se não encontrar o que procura:
1. Consulte [00-INDEX.md](./00-INDEX.md) para o índice completo
2. Verifique [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para problemas comuns
3. Leia [START_HERE.md](./START_HERE.md) para orientação geral

---

## 🎉 PRÓXIMOS PASSOS

**Novo no projeto?**  
→ Comece com [START_HERE.md](./START_HERE.md)

**Configurando backend?**  
→ Siga [GUIA_RAPIDO_SUPABASE.md](./GUIA_RAPIDO_SUPABASE.md)

**Desenvolvendo?**  
→ Veja [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

**Com problemas?**  
→ Acesse [SOLUCAO_ERRO_403.md](./SOLUCAO_ERRO_403.md)

---

**Documentação Organizada em:** 18/11/2025  
**Sistema:** ERP Minerva Engenharia v1.0  
**Total de Documentos:** 40+  
**Status:** ✅ Completa e organizada
