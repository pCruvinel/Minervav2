CREATE OR REPLACE FUNCTION public.gerar_codigo_os(p_tipo_os_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    v_year text;
    v_seq integer;
    v_code text;
BEGIN
    v_year := to_char(current_date, 'YYYY');
    
    -- Count OSs created this year to determine next sequence
    SELECT count(*) + 1 INTO v_seq
    FROM public.ordens_servico
    WHERE to_char(data_entrada::date, 'YYYY') = v_year;
    
    -- Format: OS-YYYY-0001
    v_code := 'OS-' || v_year || '-' || lpad(v_seq::text, 3, '0');
    
    -- Check if exists and increment if necessary
    WHILE EXISTS (SELECT 1 FROM public.ordens_servico WHERE codigo_os = v_code) LOOP
        v_seq := v_seq + 1;
        v_code := 'OS-' || v_year || '-' || lpad(v_seq::text, 3, '0');
    END LOOP;
    
    RETURN v_code;
END;
$function$;
