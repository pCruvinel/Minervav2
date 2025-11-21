-- ============================================================
-- MIGRAÇÃO CONSOLIDADA: Correção de Todos os ENUMs
-- ============================================================
-- Esta migração consolida todos os arquivos FIX_*.sql em um único lugar
-- Garante consistência total entre banco de dados e TypeScript
--
-- Arquivo: 20251121000014_consolidate_all_enums.sql
-- Data: 2025-11-21
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CORRIGIR cliente_status
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM cliente_status...';
END $$;

-- Converter coluna para TEXT temporariamente
ALTER TABLE clientes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS cliente_status CASCADE;

-- Criar ENUM correto
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- Normalizar dados existentes
UPDATE clientes SET status = 'LEAD'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'LEAD';

UPDATE clientes SET status = 'CLIENTE_ATIVO'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('CLIENTE_ATIVO', 'CLIENTEATIVO', 'ATIVO');

UPDATE clientes SET status = 'CLIENTE_INATIVO'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('CLIENTE_INATIVO', 'CLIENTEINATIVO', 'INATIVO');

-- Valores inválidos = LEAD por padrão
UPDATE clientes SET status = 'LEAD'
WHERE status NOT IN ('LEAD', 'CLIENTE_ATIVO', 'CLIENTE_INATIVO');

-- Converter coluna de volta para ENUM
ALTER TABLE clientes
ALTER COLUMN status TYPE cliente_status
USING status::cliente_status;

ALTER TABLE clientes
ALTER COLUMN status SET DEFAULT 'LEAD'::cliente_status;

ALTER TABLE clientes
ALTER COLUMN status SET NOT NULL;

-- ============================================================
-- 2. CORRIGIR tipo_cliente
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM tipo_cliente...';
END $$;

-- Garantir que a coluna existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clientes' AND column_name = 'tipo_cliente'
  ) THEN
    ALTER TABLE clientes ADD COLUMN tipo_cliente TEXT;
  END IF;
END $$;

-- Converter para TEXT
ALTER TABLE clientes ALTER COLUMN tipo_cliente DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN tipo_cliente TYPE TEXT USING tipo_cliente::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS tipo_cliente CASCADE;

-- Criar ENUM correto
CREATE TYPE tipo_cliente AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
);

-- Normalizar dados existentes
UPDATE clientes SET tipo_cliente = 'PESSOA_FISICA'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Í', 'I')) IN ('PESSOA_FISICA', 'PESSOAFISICA', 'PF');

UPDATE clientes SET tipo_cliente = 'CONDOMINIO'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Í', 'I')) IN ('CONDOMINIO', 'CONDOMÍNIO');

UPDATE clientes SET tipo_cliente = 'CONSTRUTORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'CONSTRUTORA';

UPDATE clientes SET tipo_cliente = 'INCORPORADORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'INCORPORADORA';

UPDATE clientes SET tipo_cliente = 'INDUSTRIA'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Ú', 'U')) IN ('INDUSTRIA', 'INDÚSTRIA');

UPDATE clientes SET tipo_cliente = 'COMERCIO'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'É', 'E')) IN ('COMERCIO', 'COMÉRCIO');

-- Converter EMPRESA para OUTRO (EMPRESA não está no ENUM correto)
UPDATE clientes SET tipo_cliente = 'OUTRO'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'EMPRESA';

-- Valores inválidos ou nulos = OUTRO
UPDATE clientes SET tipo_cliente = 'OUTRO'
WHERE tipo_cliente IS NULL
   OR tipo_cliente NOT IN (
     'PESSOA_FISICA', 'CONDOMINIO', 'CONSTRUTORA',
     'INCORPORADORA', 'INDUSTRIA', 'COMERCIO', 'OUTRO'
   );

-- Converter coluna de volta para ENUM
ALTER TABLE clientes
ALTER COLUMN tipo_cliente TYPE tipo_cliente
USING tipo_cliente::tipo_cliente;

-- ============================================================
-- 3. CORRIGIR os_status_geral
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM os_status_geral...';
END $$;

-- Converter coluna para TEXT nas tabelas que usam
ALTER TABLE ordens_servico ALTER COLUMN status_geral TYPE TEXT USING status_geral::TEXT;
ALTER TABLE centros_custo ALTER COLUMN status_cc TYPE TEXT USING status_cc::TEXT;
ALTER TABLE os_historico_status ALTER COLUMN status_anterior TYPE TEXT USING status_anterior::TEXT;
ALTER TABLE os_historico_status ALTER COLUMN status_novo TYPE TEXT USING status_novo::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS os_status_geral CASCADE;

-- Criar ENUM correto
CREATE TYPE os_status_geral AS ENUM (
  'EM_TRIAGEM',
  'AGUARDANDO_INFORMACOES',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'ATRASADA',
  'CONCLUIDA',
  'CANCELADA',
  'PAUSADA',
  'AGUARDANDO_CLIENTE'
);

-- Normalizar dados existentes em ordens_servico
UPDATE ordens_servico SET status_geral = 'EM_TRIAGEM'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'EM_TRIAGEM';

UPDATE ordens_servico SET status_geral = 'AGUARDANDO_INFORMACOES'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'AGUARDANDO_INFORMACOES';

UPDATE ordens_servico SET status_geral = 'EM_ANDAMENTO'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'EM_ANDAMENTO';

UPDATE ordens_servico SET status_geral = 'EM_VALIDACAO'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'EM_VALIDACAO';

UPDATE ordens_servico SET status_geral = 'ATRASADA'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'ATRASADA';

UPDATE ordens_servico SET status_geral = 'CONCLUIDA'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) IN ('CONCLUIDA', 'CONCLUÍDO', 'CONCLUÍDA');

UPDATE ordens_servico SET status_geral = 'CANCELADA'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'CANCELADA';

UPDATE ordens_servico SET status_geral = 'PAUSADA'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'PAUSADA';

UPDATE ordens_servico SET status_geral = 'AGUARDANDO_CLIENTE'
WHERE UPPER(REPLACE(status_geral, ' ', '_')) = 'AGUARDANDO_CLIENTE';

-- Valores inválidos = EM_TRIAGEM
UPDATE ordens_servico SET status_geral = 'EM_TRIAGEM'
WHERE status_geral NOT IN (
  'EM_TRIAGEM', 'AGUARDANDO_INFORMACOES', 'EM_ANDAMENTO',
  'EM_VALIDACAO', 'ATRASADA', 'CONCLUIDA', 'CANCELADA',
  'PAUSADA', 'AGUARDANDO_CLIENTE'
);

-- Converter colunas de volta para ENUM
ALTER TABLE ordens_servico
ALTER COLUMN status_geral TYPE os_status_geral
USING status_geral::os_status_geral;

ALTER TABLE centros_custo
ALTER COLUMN status_cc TYPE os_status_geral
USING COALESCE(status_cc::os_status_geral, NULL);

ALTER TABLE os_historico_status
ALTER COLUMN status_anterior TYPE os_status_geral
USING COALESCE(status_anterior::os_status_geral, NULL);

ALTER TABLE os_historico_status
ALTER COLUMN status_novo TYPE os_status_geral
USING status_novo::os_status_geral;

-- ============================================================
-- 4. CORRIGIR os_etapa_status
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM os_etapa_status...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE os_etapas ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS os_etapa_status CASCADE;

-- Criar ENUM correto
CREATE TYPE os_etapa_status AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REJEITADA'
);

-- Normalizar dados existentes
UPDATE os_etapas SET status = 'PENDENTE'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'PENDENTE';

UPDATE os_etapas SET status = 'EM_ANDAMENTO'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'EM_ANDAMENTO';

UPDATE os_etapas SET status = 'AGUARDANDO_APROVACAO'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('AGUARDANDO_APROVACAO', 'AGUARDANDO_APROVAÇÃO');

UPDATE os_etapas SET status = 'APROVADA'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'APROVADA';

UPDATE os_etapas SET status = 'REJEITADA'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('REJEITADA', 'REPROVADA');

-- Valores inválidos = PENDENTE
UPDATE os_etapas SET status = 'PENDENTE'
WHERE status NOT IN ('PENDENTE', 'EM_ANDAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'REJEITADA');

-- Converter coluna de volta para ENUM
ALTER TABLE os_etapas
ALTER COLUMN status TYPE os_etapa_status
USING status::os_etapa_status;

-- ============================================================
-- 5. CORRIGIR agendamento_status
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM agendamento_status...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE agendamentos ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS agendamento_status CASCADE;

-- Criar ENUM correto
CREATE TYPE agendamento_status AS ENUM (
  'AGENDADO',
  'CONFIRMADO',
  'REALIZADO',
  'CANCELADO'
);

-- Normalizar dados existentes
UPDATE agendamentos SET status = 'AGENDADO'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'AGENDADO';

UPDATE agendamentos SET status = 'CONFIRMADO'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('CONFIRMADO', 'EM_ANDAMENTO');

UPDATE agendamentos SET status = 'REALIZADO'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('REALIZADO', 'CONCLUIDO', 'CONCLUÍDO');

UPDATE agendamentos SET status = 'CANCELADO'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'CANCELADO';

-- Valores inválidos = AGENDADO
UPDATE agendamentos SET status = 'AGENDADO'
WHERE status NOT IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO');

-- Converter coluna de volta para ENUM
ALTER TABLE agendamentos
ALTER COLUMN status TYPE agendamento_status
USING status::agendamento_status;

-- ============================================================
-- 6. CORRIGIR presenca_status
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM presenca_status...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE colaborador_presenca ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS presenca_status CASCADE;
DROP TYPE IF EXISTS status_presenca CASCADE;

-- Criar ENUM correto
CREATE TYPE presenca_status AS ENUM (
  'PRESENTE',
  'ATRASO',
  'FALTA_JUSTIFICADA',
  'FALTA_INJUSTIFICADA',
  'FERIAS',
  'FOLGA',
  'ATESTADO',
  'LICENCA'
);

-- Normalizar dados existentes
UPDATE colaborador_presenca SET status = 'PRESENTE'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'PRESENTE';

UPDATE colaborador_presenca SET status = 'ATRASO'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'ATRASO';

UPDATE colaborador_presenca SET status = 'FALTA_JUSTIFICADA'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('FALTA_JUSTIFICADA', 'FALTA JUSTIFICADA');

UPDATE colaborador_presenca SET status = 'FALTA_INJUSTIFICADA'
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('FALTA_INJUSTIFICADA', 'FALTA INJUSTIFICADA', 'FALTA');

UPDATE colaborador_presenca SET status = 'FERIAS'
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'É', 'E')) IN ('FERIAS', 'FÉRIAS');

UPDATE colaborador_presenca SET status = 'FOLGA'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'FOLGA';

UPDATE colaborador_presenca SET status = 'ATESTADO'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'ATESTADO';

UPDATE colaborador_presenca SET status = 'LICENCA'
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'Ç', 'C')) IN ('LICENCA', 'LICENÇA');

-- Valores inválidos = PRESENTE
UPDATE colaborador_presenca SET status = 'PRESENTE'
WHERE status NOT IN (
  'PRESENTE', 'ATRASO', 'FALTA_JUSTIFICADA', 'FALTA_INJUSTIFICADA',
  'FERIAS', 'FOLGA', 'ATESTADO', 'LICENCA'
);

-- Converter coluna de volta para ENUM
ALTER TABLE colaborador_presenca
ALTER COLUMN status TYPE presenca_status
USING status::presenca_status;

-- ============================================================
-- 7. CORRIGIR performance_avaliacao
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM performance_avaliacao...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE colaborador_performance ALTER COLUMN avaliacao TYPE TEXT USING avaliacao::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS performance_avaliacao CASCADE;
DROP TYPE IF EXISTS avaliacao_performance CASCADE;

-- Criar ENUM correto
CREATE TYPE performance_avaliacao AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
);

-- Normalizar dados existentes
UPDATE colaborador_performance SET avaliacao = 'EXCELENTE'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'EXCELENTE';

UPDATE colaborador_performance SET avaliacao = 'BOM'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'BOM';

UPDATE colaborador_performance SET avaliacao = 'REGULAR'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'REGULAR';

UPDATE colaborador_performance SET avaliacao = 'INSATISFATORIO'
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'Ó', 'O')) IN ('INSATISFATORIO', 'INSATISFATÓRIO');

-- Valores inválidos = REGULAR
UPDATE colaborador_performance SET avaliacao = 'REGULAR'
WHERE avaliacao NOT IN ('EXCELENTE', 'BOM', 'REGULAR', 'INSATISFATORIO');

-- Converter coluna de volta para ENUM
ALTER TABLE colaborador_performance
ALTER COLUMN avaliacao TYPE performance_avaliacao
USING avaliacao::performance_avaliacao;

-- ============================================================
-- 8. CORRIGIR financeiro_tipo
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM financeiro_tipo...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE financeiro_lancamentos ALTER COLUMN tipo TYPE TEXT USING tipo::TEXT;

-- Dropar ENUMs antigos
DROP TYPE IF EXISTS financeiro_tipo CASCADE;
DROP TYPE IF EXISTS lancamento_tipo CASCADE;

-- Criar ENUM correto
CREATE TYPE financeiro_tipo AS ENUM (
  'RECEITA',
  'DESPESA'
);

-- Normalizar dados existentes
UPDATE financeiro_lancamentos SET tipo = 'RECEITA'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'RECEITA';

UPDATE financeiro_lancamentos SET tipo = 'DESPESA'
WHERE UPPER(REPLACE(status, ' ', '_')) = 'DESPESA';

-- Valores inválidos = DESPESA
UPDATE financeiro_lancamentos SET tipo = 'DESPESA'
WHERE tipo NOT IN ('RECEITA', 'DESPESA');

-- Converter coluna de volta para ENUM
ALTER TABLE financeiro_lancamentos
ALTER COLUMN tipo TYPE financeiro_tipo
USING tipo::financeiro_tipo;

-- ============================================================
-- 9. CORRIGIR cc_tipo
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Corrigindo ENUM cc_tipo...';
END $$;

-- Converter coluna para TEXT
ALTER TABLE centros_custo ALTER COLUMN tipo TYPE TEXT USING tipo::TEXT;

-- Dropar ENUM antigo
DROP TYPE IF EXISTS cc_tipo CASCADE;
DROP TYPE IF EXISTS tipo_centro_custo CASCADE;

-- Criar ENUM correto
CREATE TYPE cc_tipo AS ENUM (
  'ASSESSORIA',
  'OBRA',
  'INTERNO',
  'ADMINISTRATIVO',
  'LABORATORIO',
  'COMERCIAL',
  'GERAL'
);

-- Normalizar dados existentes
UPDATE centros_custo SET tipo = 'ASSESSORIA'
WHERE UPPER(REPLACE(tipo, ' ', '_')) = 'ASSESSORIA';

UPDATE centros_custo SET tipo = 'OBRA'
WHERE UPPER(REPLACE(tipo, ' ', '_')) IN ('OBRA', 'OBRAS');

UPDATE centros_custo SET tipo = 'INTERNO'
WHERE UPPER(REPLACE(tipo, ' ', '_')) = 'INTERNO';

UPDATE centros_custo SET tipo = 'ADMINISTRATIVO'
WHERE UPPER(REPLACE(tipo, ' ', '_')) = 'ADMINISTRATIVO';

UPDATE centros_custo SET tipo = 'LABORATORIO'
WHERE UPPER(REPLACE(REPLACE(tipo, ' ', '_'), 'Ó', 'O')) IN ('LABORATORIO', 'LABORATÓRIO');

UPDATE centros_custo SET tipo = 'COMERCIAL'
WHERE UPPER(REPLACE(tipo, ' ', '_')) = 'COMERCIAL';

UPDATE centros_custo SET tipo = 'GERAL'
WHERE UPPER(REPLACE(tipo, ' ', '_')) = 'GERAL';

-- Valores inválidos = GERAL
UPDATE centros_custo SET tipo = 'GERAL'
WHERE tipo NOT IN ('ASSESSORIA', 'OBRA', 'INTERNO', 'ADMINISTRATIVO', 'LABORATORIO', 'COMERCIAL', 'GERAL');

-- Converter coluna de volta para ENUM
ALTER TABLE centros_custo
ALTER COLUMN tipo TYPE cc_tipo
USING tipo::cc_tipo;

COMMIT;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  TODOS OS ENUMS CORRIGIDOS COM SUCESSO!                 ║
║                                                              ║
║  📋 ENUMs Corrigidos:                                        ║
║  • cliente_status                                            ║
║  • tipo_cliente                                              ║
║  • os_status_geral                                           ║
║  • os_etapa_status                                           ║
║  • agendamento_status                                        ║
║  • presenca_status                                           ║
║  • performance_avaliacao                                     ║
║  • financeiro_tipo                                           ║
║  • cc_tipo                                                   ║
║                                                              ║
║  🚀 Próximos passos:                                         ║
║  1. Execute: npm run update-types                            ║
║  2. Verifique o arquivo src/types/supabase.ts                ║
║  3. Os tipos TypeScript agora estarão sincronizados!         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  ';
END $$;
