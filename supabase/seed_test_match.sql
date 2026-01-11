DO $$
DECLARE
    v_match_id UUID;
    v_group_id UUID;
    v_user_id UUID;
    i INT;
    v_names TEXT[] := ARRAY['João', 'Pedro', 'Lucas', 'Matheus', 'Gabriel', 'Rafael', 'Gustavo', 'Felipe', 'Bruno', 'Leonardo', 'Daniel', 'Thiago'];
    v_positions TEXT[] := ARRAY['Meia', 'Atacante', 'Zagueiro', 'Goleiro', 'Meia', 'Atacante', 'Zagueiro', 'Goleiro', 'Lateral', 'Lateral', 'Volante', 'Volante'];
    v_skills NUMERIC[] := ARRAY[4.5, 3.0, 5.0, 4.0, 3.5, 4.2, 2.5, 5.0, 3.8, 4.1, 3.2, 4.7];
BEGIN
    -- Obter a última partida criada
    SELECT id, group_id INTO v_match_id, v_group_id FROM public.matches ORDER BY created_at DESC LIMIT 1;
    
    IF v_match_id IS NULL THEN
        RAISE NOTICE 'Nenhuma partida encontrada.';
        RETURN;
    END IF;

    RAISE NOTICE 'Adicionando jogadores fictícios à partida % (Grupo %)', v_match_id, v_group_id;

    FOR i IN 1..12 LOOP
        -- Gerar ID aleatório para o usuário
        v_user_id := gen_random_uuid();
        
        -- Inserir usuário fake no auth.users (necessário devido à chave estrangeira)
        -- Nota: A senha 'dummy' não permitirá login real, é apenas para satisfazer a estrutura
        BEGIN
            INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
            VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'player' || i || '_' || v_match_id || '@test.com', '$2a$10$dummyhashdummyhashdummyhashdummyhash', now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', '');
        EXCEPTION WHEN unique_violation THEN
            -- Se o ID colidir (raro) ou email duplicado, ignorar
            CONTINUE;
        END;

        -- Inserir perfil público
        INSERT INTO public.profiles (id, full_name, position, skill_level)
        VALUES (v_user_id, v_names[i] || ' Silva', v_positions[i], v_skills[i])
        ON CONFLICT (id) DO NOTHING;

        -- Adicionar ao grupo
        INSERT INTO public.group_members (group_id, user_id, role, status)
        VALUES (v_group_id, v_user_id, 'member', 'active')
        ON CONFLICT DO NOTHING;

        -- Adicionar à partida como confirmado
        INSERT INTO public.match_participants (match_id, user_id, status)
        VALUES (v_match_id, v_user_id, 'confirmed')
        ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;
