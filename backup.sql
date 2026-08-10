-- ==============================================================================
-- ⚠️ BACKUP AUTOMÁTICO DO BANCO DE DADOS (ALETIS)
-- Gerado em: 2026-07-16T10:01:25.653Z
-- ==============================================================================

-- ==============================================================================
-- 1. FUNÇÕES (FUNCTIONS)
-- ==============================================================================

-- Função: protect_profile_columns
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Se o saldo de vibes ou status de suspensão forem alterados por uma conexão comum
  -- (que não seja o superusuário postgres executando uma RPC autorizada no servidor)
  IF current_user <> 'postgres' THEN
    IF OLD.vibes IS DISTINCT FROM NEW.vibes THEN
      NEW.vibes := OLD.vibes; -- Reverte a alteração de saldo
    END IF;
    IF OLD.is_suspended IS DISTINCT FROM NEW.is_suspended THEN
      NEW.is_suspended := OLD.is_suspended; -- Reverte alteração de suspensão
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- Função: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, vibes)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text),
    10 -- 10 Vibes de boas-vindas (fixas, não expiram)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

-- Função: increment_vibe
CREATE OR REPLACE FUNCTION public.increment_vibe(amount_to_add integer, reward_type text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_user_id UUID := auth.uid();
    current_balance INTEGER;
BEGIN
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não autenticado.');
    END IF;

    UPDATE public.profiles 
    SET vibes = vibes + amount_to_add
    WHERE id = current_user_id 
    RETURNING vibes INTO current_balance;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Perfil não encontrado.');
    END IF;

    RETURN json_build_object(
      'success',      true, 
      'new_balance',  current_balance,
      'reward_type',  reward_type
    );
END;
$function$
;

-- Função: claim_daily_dew
CREATE OR REPLACE FUNCTION public.claim_daily_dew(dew_amount integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_user_id       UUID := auth.uid();
    last_claim            TIMESTAMPTZ;
    current_dew_vibes     INTEGER;
    current_dew_expires_at TIMESTAMPTZ;
    current_balance       INTEGER;
    vibes_to_expire       INTEGER := 0;
BEGIN
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não autenticado.');
    END IF;

    -- Busca estado atual do Orvalho
    SELECT last_dew_claim, dew_vibes, dew_expires_at
    INTO last_claim, current_dew_vibes, current_dew_expires_at
    FROM public.profiles 
    WHERE id = current_user_id;
    
    -- PASSO 1: Se o Orvalho anterior expirou, subtrai os vibes não transferidos
    IF current_dew_expires_at IS NOT NULL AND current_dew_expires_at < NOW() AND current_dew_vibes > 0 THEN
        vibes_to_expire := current_dew_vibes;
        UPDATE public.profiles 
        SET vibes = GREATEST(0, vibes - vibes_to_expire),
            dew_vibes = 0,
            dew_expires_at = NULL
        WHERE id = current_user_id;
    END IF;
    
    -- PASSO 2: Verifica se já coletou Orvalho hoje
    IF last_claim IS NOT NULL AND last_claim >= CURRENT_DATE THEN
        RETURN json_build_object(
          'success',     false, 
          'message',     'Orvalho já coletado hoje.',
          'expired_dew', vibes_to_expire
        );
    END IF;
    
    -- PASSO 3: Concede o Orvalho Diário (+7 vibes temporárias)
    UPDATE public.profiles 
    SET vibes = vibes + dew_amount,
        dew_vibes = dew_amount,
        last_dew_claim = NOW(),
        dew_expires_at = NOW() + INTERVAL '24 hours'
    WHERE id = current_user_id 
    RETURNING vibes INTO current_balance;
    
    RETURN json_build_object(
      'success',        true, 
      'new_balance',    current_balance,
      'dew_expires_at', (NOW() + INTERVAL '24 hours')::TEXT,
      'expired_dew',    vibes_to_expire
    );
END;
$function$
;

-- Função: mark_dew_used
CREATE OR REPLACE FUNCTION public.mark_dew_used(amount_used integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_user_id UUID := auth.uid();
    current_dew     INTEGER;
BEGIN
    SELECT dew_vibes INTO current_dew 
    FROM public.profiles 
    WHERE id = current_user_id;
    
    UPDATE public.profiles
    SET dew_vibes = GREATEST(0, current_dew - amount_used)
    WHERE id = current_user_id;
END;
$function$
;

-- ==============================================================================
-- 2. TABELAS (TABLES)
-- ==============================================================================

-- Tabela: public.posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  user_id UUID,
  content TEXT NOT NULL,
  media_url TEXT,
  tags ARRAY,
  approved_by_sentinel BOOLEAN DEFAULT false,
  sentinel_score INTEGER DEFAULT 0,
  sentinel_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Tabela: public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  vibes_balance INTEGER DEFAULT 10,
  prestige_rank TEXT DEFAULT 'Neófito'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  banner_url TEXT,
  bio TEXT,
  phone TEXT,
  country_code TEXT,
  status TEXT,
  last_username_change TIMESTAMP WITH TIME ZONE,
  is_suspended BOOLEAN DEFAULT false,
  vibes INTEGER DEFAULT 10,
  last_dew_claim TIMESTAMP WITH TIME ZONE,
  dew_vibes INTEGER DEFAULT 0,
  dew_expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_vibes_check CHECK ((vibes >= 0))
);

-- Tabela: public.vibe_transactions
CREATE TABLE IF NOT EXISTS public.vibe_transactions (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  sender_id UUID,
  receiver_id UUID,
  amount INTEGER NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT vibe_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT vibe_transactions_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id),
  CONSTRAINT vibe_transactions_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id),
  CONSTRAINT vibe_transactions_type_check CHECK ((type = ANY (ARRAY['daily_grant'::text, 'post_reward'::text, 'like_transfer'::text, 'fee'::text])))
);

-- ==============================================================================
-- 3. GATILHOS (TRIGGERS)
-- ==============================================================================

-- Trigger: trg_protect_profile_columns
CREATE TRIGGER trg_protect_profile_columns BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_columns();

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ==============================================================================

-- Política RLS: Postar exige autenticação na tabela posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Postar exige autenticação" ON public.posts FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

-- Política RLS: Ver apenas posts aprovados na tabela posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver apenas posts aprovados" ON public.posts FOR SELECT TO public USING (((approved_by_sentinel = true) OR (auth.uid() = user_id)));

-- Política RLS: Perfis visíveis por todos na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis visíveis por todos" ON public.profiles FOR SELECT TO public USING (true);

-- Política RLS: Public profiles are viewable by everyone. na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT TO public USING (true);

-- Política RLS: Users can insert their own profile. na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT TO public WITH CHECK ((auth.uid() = id));

-- Política RLS: Users can update own profile. na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));

-- Política RLS: Usuário edita próprio perfil na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário edita próprio perfil" ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));

