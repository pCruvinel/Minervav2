-- Migration: fix_is_business_day_column.sql
-- Data: 2026-01-06
-- Descrição: Corrige a função is_business_day() que referenciava uma coluna inexistente

-- A função anterior usava "WHERE data = check_date" mas a tabela calendario_bloqueios
-- usa data_inicio e data_fim (intervalo), não uma coluna única "data".
-- Isso causava erro 500 ao criar OS: "column 'data' does not exist"

CREATE OR REPLACE FUNCTION public.is_business_day(check_date date)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
    is_weekend boolean;
    is_holiday boolean;
BEGIN
    -- Verifica se é sábado (6) ou domingo (7)
    is_weekend := EXTRACT(ISODOW FROM check_date) IN (6, 7);
    
    IF is_weekend THEN
        RETURN false;
    END IF;

    -- Verifica se é feriado ou data bloqueada na tabela calendario_bloqueios
    -- Consideramos apenas bloqueios que afetam o dia inteiro
    -- FIX: A tabela usa data_inicio e data_fim (intervalo), não "data"
    SELECT EXISTS (
        SELECT 1 
        FROM public.calendario_bloqueios 
        WHERE check_date BETWEEN data_inicio AND COALESCE(data_fim, data_inicio)
        AND ativo = true
        AND (dia_inteiro = true OR dia_inteiro IS NULL)
    ) INTO is_holiday;

    RETURN NOT is_holiday;
END;
$function$;
