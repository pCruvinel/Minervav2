-- Add new columns to colaboradores table
ALTER TABLE public.colaboradores
ADD COLUMN IF NOT EXISTS tipo_contratacao text CHECK (tipo_contratacao IN ('CLT', 'PJ', 'ESTAGIO')),
ADD COLUMN IF NOT EXISTS salario_base numeric,
ADD COLUMN IF NOT EXISTS custo_dia numeric,
ADD COLUMN IF NOT EXISTS funcao text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add comments for documentation
COMMENT ON COLUMN public.colaboradores.tipo_contratacao IS 'Tipo de contratação: CLT, PJ ou ESTAGIO';
COMMENT ON COLUMN public.colaboradores.salario_base IS 'Salário base para CLT';
COMMENT ON COLUMN public.colaboradores.custo_dia IS 'Custo diário para PJ';
COMMENT ON COLUMN public.colaboradores.funcao IS 'Função ou cargo do colaborador';
COMMENT ON COLUMN public.colaboradores.avatar_url IS 'URL da foto do colaborador';
