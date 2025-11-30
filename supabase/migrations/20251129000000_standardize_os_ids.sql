-- Migration: Standardize OS ID Generation
-- Description: Creates a sequence tracking table and a trigger to automatically generate OS IDs in the format OS{TYPE}{SEQUENCE} (e.g., OS1300001).
-- Date: 2025-11-29 22:45:00

-- =====================================================
-- STEP 1: CREATE SEQUENCE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.os_sequences (
    tipo_os_id UUID PRIMARY KEY REFERENCES public.tipos_os(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (although mostly used by server-side triggers)
ALTER TABLE public.os_sequences ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read/write for authenticated users (needed if trigger runs with user permissions)
-- Ideally, triggers run as the function owner (SECURITY DEFINER), but let's add basic policies.
CREATE POLICY "Sequences visible to authenticated users" ON public.os_sequences
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 2: CREATE GENERATOR FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_os_id()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_codigo TEXT;
    v_tipo_num TEXT;
    v_seq INTEGER;
    v_new_id TEXT;
BEGIN
    -- Only generate if codigo_os is not provided or is empty
    IF NEW.codigo_os IS NOT NULL AND NEW.codigo_os != '' THEN
        RETURN NEW;
    END IF;

    -- Get the OS type code (e.g., 'OS-13')
    SELECT codigo INTO v_tipo_codigo
    FROM public.tipos_os
    WHERE id = NEW.tipo_os_id;

    IF v_tipo_codigo IS NULL THEN
        RAISE EXCEPTION 'Tipo de OS inválido ou não encontrado (ID: %).', NEW.tipo_os_id;
    END IF;

    -- Extract the number part (e.g., '13' from 'OS-13')
    -- We assume the format is 'OS-' followed by digits.
    v_tipo_num := SUBSTRING(v_tipo_codigo FROM 'OS-([0-9]+)');
    
    -- Fallback if format doesn't match (e.g. 'OS-GEN' -> '00' or just use 00)
    IF v_tipo_num IS NULL THEN
        -- Try to just get digits
        v_tipo_num := SUBSTRING(v_tipo_codigo FROM '[0-9]+');
    END IF;

    IF v_tipo_num IS NULL THEN
        v_tipo_num := '00';
    END IF;

    -- Increment sequence atomically
    INSERT INTO public.os_sequences (tipo_os_id, current_value, updated_at)
    VALUES (NEW.tipo_os_id, 1, NOW())
    ON CONFLICT (tipo_os_id)
    DO UPDATE SET
        current_value = os_sequences.current_value + 1,
        updated_at = NOW()
    RETURNING current_value INTO v_seq;

    -- Format: OS + TYPE_NUM + SEQ (5 digits, padded)
    -- Example: OS1300001
    v_new_id := 'OS' || v_tipo_num || LPAD(v_seq::TEXT, 5, '0');

    NEW.codigo_os := v_new_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: CREATE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS trigger_generate_os_id ON public.ordens_servico;

CREATE TRIGGER trigger_generate_os_id
BEFORE INSERT ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.generate_os_id();

-- =====================================================
-- STEP 4: INITIALIZE SEQUENCES (OPTIONAL)
-- =====================================================
-- We can optionally initialize sequences based on existing max IDs if we wanted to continue numbering,
-- but the requirement implies a new standard. We start from 1 for this new format.
-- If we needed to backfill, we would do it here.

COMMENT ON TABLE public.os_sequences IS 'Tracks the current sequence number for each OS type to generate unique IDs.';
