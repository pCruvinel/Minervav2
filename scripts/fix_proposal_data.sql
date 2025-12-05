-- ⚠️ SUBSTITUA 'SEU_UUID_AQUI' PELO ID DA SUA OS ANTES DE RODAR!
-- Exemplo: DO $$ DECLARE os_id uuid := '550e8400-e29b-41d4-a716-446655440000'; ...

DO $$
DECLARE
    -- 👇👇👇 COLE O ID DA SUA OS AQUI DENTRO DAS ASPAS 👇👇👇
    target_os_id uuid := 'SEU_UUID_AQUI'; 
    -- 👆👆👆 ------------------------------------------ 👆👆👆
    
    user_id uuid;
BEGIN
    -- Tenta pegar um usuário qualquer para ser o responsável (opcional, pode ser null)
    SELECT id INTO user_id FROM auth.users LIMIT 1;

    -- 1. Inserir ou Atualizar ETAPA 7 (Memorial Descritivo)
    INSERT INTO public.os_etapas (os_id, nome_etapa, status, ordem, dados_etapa, responsavel_id, data_inicio)
    VALUES (
        target_os_id,
        'Memorial Descritivo',
        'concluida',
        7,
        '{
            "objetivo": "Realizar reforma estrutural conforme vistoria.",
            "tituloProposta": "Proposta de Recuperação Estrutural",
            "preparacaoArea": 2,
            "planejamentoInicial": 3,
            "logisticaTransporte": 1,
            "etapasPrincipais": [
                {
                    "nome": "Recuperação de Pilares",
                    "subetapas": [
                        { "nome": "Escarificação", "m2": "10", "diasUteis": "2", "total": "200" },
                        { "nome": "Aplicação de Grout", "m2": "10", "diasUteis": "3", "total": "500" }
                    ]
                },
                {
                    "nome": "Pintura",
                    "subetapas": [
                        { "nome": "Lixamento", "m2": "50", "diasUteis": "2", "total": "100" },
                        { "nome": "Aplicação de Tinta", "m2": "50", "diasUteis": "2", "total": "300" }
                    ]
                }
            ]
        }'::jsonb,
        user_id,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Nota: idealmente seria update se tivesse constraint única por os_id + ordem, mas vamos assumir insert simples se não existir.
    
    -- Se não tiver constraint unique (os_id, ordem), vamos deletar os antigos para garantir
    DELETE FROM public.os_etapas WHERE os_id = target_os_id AND ordem IN (7, 8);

    -- Re-inserir Etapa 7
    INSERT INTO public.os_etapas (os_id, nome_etapa, status, ordem, dados_etapa, responsavel_id, data_inicio)
    VALUES (
        target_os_id,
        'Memorial Descritivo',
        'concluida',
        7,
        '{
            "objetivo": "Realizar reforma estrutural conforme vistoria.",
            "tituloProposta": "Proposta de Recuperação Estrutural",
            "preparacaoArea": 2,
            "planejamentoInicial": 3,
            "logisticaTransporte": 1,
            "etapasPrincipais": [
                {
                    "nome": "Recuperação de Pilares",
                    "subetapas": [
                        { "nome": "Escarificação", "m2": "10", "diasUteis": "2", "total": "200" },
                        { "nome": "Aplicação de Grout", "m2": "10", "diasUteis": "3", "total": "500" }
                    ]
                }
            ]
        }'::jsonb,
        user_id,
        NOW()
    );

    -- 2. Inserir ou Atualizar ETAPA 8 (Precificação)
    INSERT INTO public.os_etapas (os_id, nome_etapa, status, ordem, dados_etapa, responsavel_id, data_inicio)
    VALUES (
        target_os_id,
        'Precificação',
        'concluida',
        8,
        '{
            "precoFinal": 15000.00,
            "percentualImposto": 14,
            "percentualEntrada": 40,
            "numeroParcelas": 3,
            "percentualLucro": 20,
            "percentualImprevisto": 5
        }'::jsonb,
        user_id,
        NOW()
    );

    RAISE NOTICE ''Dados inseridos com sucesso para OS %'', target_os_id;
END $$;
