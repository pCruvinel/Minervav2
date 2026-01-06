-- Migration: Enable approval requirement for Step 9 in OS 01-04
-- This ensures the approval modal appears when clicking "Salvar e Continuar" on Step 9

UPDATE os_etapas_config
SET requer_aprovacao = true
WHERE tipo_os_id IN (
    SELECT id FROM tipos_os WHERE codigo IN ('OS-01', 'OS-02', 'OS-03', 'OS-04')
)
AND etapa_numero = 9;
