# Scripts do Projeto

Esta pasta contém scripts de manutenção e utilitários do projeto ERP Minerva Engenharia.

## Estrutura

```
scripts/
├── maintenance/        # Scripts de correção e manutenção do banco de dados
└── run-migrations.js   # Script para executar migrações do banco
```

## Scripts de Produção

### `run-migrations.js`
Script Node.js para executar migrações do banco de dados Supabase.

**Uso:**
```bash
node scripts/run-migrations.js
```

---

## Scripts de Manutenção (`/maintenance`)

Esta subpasta contém scripts legados de correção que foram movidos para manter a raiz do projeto organizada.

⚠️ **IMPORTANTE:** Estes scripts são **apenas para referência histórica** e não devem ser executados em produção sem análise prévia.

### Scripts Python

#### `mover_documentacao.py`
Script de organização de documentação do projeto.

**Finalidade:**
- Move arquivos `.md` e `.sql` da raiz do projeto para a pasta `/docs`
- Realiza verificações de integridade antes e depois da movimentação
- Gera relatório detalhado com resumo das operações

**Histórico:**
- Criado em: 18/11/2025
- Usado para: Organização inicial da estrutura do projeto

**Execução:**
```bash
python scripts/maintenance/mover_documentacao.py
```

---

### Scripts SQL de Correção

Estes scripts SQL foram criados para corrigir problemas com ENUMs do banco de dados PostgreSQL/Supabase durante o desenvolvimento.

#### `FIX_ALL_ENUMS_AGORA.sql`
**Script mestre de correção de todos os ENUMs do sistema.**

**Finalidade:**
- Corrige TODOS os ENUMs do sistema em uma única execução
- Normaliza dados existentes antes da conversão
- Utiliza transação (BEGIN/COMMIT) para segurança

**ENUMs corrigidos:**
- `cliente_status` → LEAD, CLIENTE_ATIVO, CLIENTE_INATIVO
- `tipo_cliente` → PESSOA_FISICA, CONDOMINIO, CONSTRUTORA, INCORPORADORA, INDUSTRIA, COMERCIO, OUTRO
- `os_status_geral` → EM_TRIAGEM, EM_ANDAMENTO, AGUARDANDO_APROVACAO, CONCLUIDA, CANCELADA, PAUSADA
- `os_etapa_status` → PENDENTE, EM_ANDAMENTO, AGUARDANDO_APROVACAO, APROVADA, REPROVADA, CONCLUIDA
- `agendamento_status` → AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
- `status_presenca` → PRESENTE, FALTA, FALTA_JUSTIFICADA, ATESTADO, FERIAS
- `avaliacao_performance` → EXCELENTE, BOM, REGULAR, INSATISFATORIO
- `tipo_lancamento` → RECEITA, DESPESA
- `tipo_centro_custo` → OBRA, ADMINISTRATIVO, LABORATORIO, COMERCIAL, GERAL

**Quando usar:**
- Quando múltiplos ENUMs precisam ser corrigidos simultaneamente
- Em ambientes de desenvolvimento para reset completo dos ENUMs

---

#### `FIX_BANCO_AGORA.sql`
**Correção definitiva e detalhada do ENUM `cliente_status`.**

**Finalidade:**
- Corrige o ENUM `cliente_status` com validação passo a passo
- Exibe 10 etapas de verificação e correção
- Inclui testes automatizados após a correção
- Fornece instruções pós-execução para o usuário

**Características:**
- ✅ Verificação do estado atual do ENUM
- ✅ Backup da estrutura antes da modificação
- ✅ Normalização de dados com múltiplas variações de escrita
- ✅ Testes de SELECT e filtros após correção
- ✅ Mensagens de instrução para próximos passos

**Quando usar:**
- Quando o dropdown de clientes não funciona
- Quando há erro "invalid input value for enum cliente_status"
- Para validar a estrutura do ENUM após migration

---

#### `FIX_URGENT_CLIENTE_STATUS.sql`
**Versão urgente e compacta da correção do ENUM `cliente_status`.**

**Finalidade:**
- Corrige rapidamente o ENUM `cliente_status`
- Versão mais enxuta do `FIX_BANCO_AGORA.sql`
- 10 passos de correção com verificação

**Diferença do FIX_BANCO_AGORA:**
- Menos mensagens de validação
- Foco em execução rápida
- Mesma eficácia técnica

**Quando usar:**
- Quando precisa corrigir `cliente_status` rapidamente
- Em situações de emergência de produção

---

#### `FIX_CLIENTE_STATUS_ENUM.sql`
**Script inteligente de criação/correção do ENUM `cliente_status`.**

**Finalidade:**
- Verifica se o ENUM existe antes de criar
- Cria o ENUM se não existir
- Valida se os valores estão corretos
- Fornece bloco comentado para correção manual se necessário

**Características:**
- ✅ Detecção automática de problemas
- ✅ Instruções claras para correção manual
- ✅ Seguro para executar múltiplas vezes
- ⚠️ Requer ação manual se ENUM estiver incorreto

**Quando usar:**
- Em setup inicial do banco
- Para verificar integridade do ENUM
- Como diagnóstico antes de aplicar correção

---

#### `FIX_URGENT_TIPO_CLIENTE.sql`
**Correção urgente do ENUM `tipo_cliente`.**

**Finalidade:**
- Corrige o ENUM `tipo_cliente` com os valores corretos
- Normaliza dados existentes (com/sem acentos, com/sem espaços)
- Define valor padrão 'OUTRO' para casos inválidos

**Valores corretos:**
- PESSOA_FISICA
- CONDOMINIO
- CONSTRUTORA
- INCORPORADORA
- INDUSTRIA
- COMERCIO
- OUTRO

**Quando usar:**
- Quando há erro relacionado ao tipo de cliente
- Após migration que afeta a tabela `clientes`
- Para normalizar dados antigos

---

## Histórico de Organização

**Data:** 21/11/2025
**Ação:** Movimentação de scripts legados da pasta `/src` para `/scripts/maintenance`
**Motivo:** Limpeza da estrutura do projeto e separação de código de produção vs. scripts de manutenção

**Arquivos movidos:**
- `src/mover_documentacao.py` → `scripts/maintenance/mover_documentacao.py`
- `src/FIX_*.sql` → `scripts/maintenance/FIX_*.sql`

**Impacto:**
- ✅ Raiz do projeto mais limpa
- ✅ Separação clara entre código e utilitários
- ✅ Melhor organização para novos desenvolvedores
- ✅ TypeScript não tenta compilar arquivos Python/SQL

---

## Boas Práticas

1. **Scripts SQL:**
   - Sempre faça backup antes de executar
   - Execute primeiro em ambiente de desenvolvimento
   - Leia todo o script antes de executar
   - Verifique as instruções e comentários internos

2. **Scripts Python:**
   - Verifique dependências necessárias
   - Execute com Python 3.x
   - Revise os caminhos de arquivos antes de executar

3. **Manutenção:**
   - Documente novas correções neste README
   - Mantenha scripts antigos para referência histórica
   - Adicione data e contexto ao criar novos scripts

---

## Suporte

Para dúvidas sobre estes scripts ou necessidade de novas correções, consulte a equipe de desenvolvimento ou a documentação em `/docs`.
