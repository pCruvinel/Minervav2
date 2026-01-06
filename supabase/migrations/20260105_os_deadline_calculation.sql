
-- Função para verificar se é dia útil
CREATE OR REPLACE FUNCTION public.is_business_day(check_date date)
RETURNS boolean
LANGUAGE plpgsql
AS $$
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
    SELECT EXISTS (
        SELECT 1 
        FROM public.calendario_bloqueios 
        WHERE data = check_date 
        AND ativo = true
        AND (dia_inteiro = true OR dia_inteiro IS NULL) -- Assumindo que null também pode bloquear ou só true. Vamos garantir que bloqueios parciais não afetem o prazo global por enquanto, ou ser conservador.
    ) INTO is_holiday;

    RETURN NOT is_holiday;
END;
$$;

-- Função para adicionar dias úteis a uma data
CREATE OR REPLACE FUNCTION public.add_business_days(start_date timestamptz, num_days integer)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
    current_date_val date := start_date::date;
    days_added integer := 0;
BEGIN
    IF num_days <= 0 THEN
        RETURN start_date;
    END IF;

    WHILE days_added < num_days LOOP
        current_date_val := current_date_val + 1;
        IF public.is_business_day(current_date_val) THEN
            days_added := days_added + 1;
        END IF;
    END LOOP;

    -- Mantém o horário original, apenas muda a data
    RETURN current_date_val + (start_date::time);
END;
$$;

-- Função para calcular o prazo da OS baseado nas etapas + 1 dia útil
CREATE OR REPLACE FUNCTION public.calculate_os_deadline(p_tipo_os_id uuid, p_start_date timestamptz)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_dias_uteis integer;
    v_deadline timestamptz;
BEGIN
    -- Soma os prazos (em dias úteis) de todas as etapas ativas para o tipo de OS
    SELECT COALESCE(SUM(prazo_dias_uteis), 0)
    INTO v_total_dias_uteis
    FROM public.os_etapas_config
    WHERE tipo_os_id = p_tipo_os_id
    AND ativo = true;

    -- Regra de Negócio: Data de Abertura + Prazo dias úteis + 1 dia útil
    v_total_dias_uteis := v_total_dias_uteis + 1;

    -- Calcula a data final usando a função de dias úteis
    v_deadline := public.add_business_days(p_start_date, v_total_dias_uteis);

    RETURN v_deadline;
END;
$$;

-- Trigger para definir automaticamente o prazo ao criar a OS
CREATE OR REPLACE FUNCTION public.trigger_set_os_deadline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Apenas calcula se a data_prazo ainda não foi definida (para permitir override manual se necessário)
    -- E se temos data_abertura (que normalmente é default now())
    IF NEW.data_prazo IS NULL AND NEW.tipo_os_id IS NOT NULL THEN
        NEW.data_prazo := public.calculate_os_deadline(
            NEW.tipo_os_id, 
            COALESCE(NEW.data_abertura, now())
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Remover trigger se existir para evitar duplicação em updates futuros
DROP TRIGGER IF EXISTS trg_set_os_deadline ON public.ordens_servico;

-- Criar trigger
CREATE TRIGGER trg_set_os_deadline
BEFORE INSERT ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_os_deadline();
