-- ==============================================================================
-- ALETIS LOCAL POSTGRESQL + PGVECTOR INITIALIZATION MIGRATION
-- 100% Local Infrastructure (Zero External Cloud / Zero Supabase)
-- ==============================================================================

-- 1. Habilitar extensões pgvector e UUID
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários Locais (Autenticação Nativa)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    full_name VARCHAR(100),
    bio TEXT,
    status TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    phone VARCHAR(50),
    country_code VARCHAR(10) DEFAULT '+55',
    tipo_perfil VARCHAR(30) DEFAULT 'comum', -- 'comum', 'verificado', 'ancora'
    vibes_balance INT DEFAULT 50,
    is_anonymous_default BOOLEAN DEFAULT false,
    username_last_changed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Posts e Desabafos
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    media_url TEXT,
    is_private BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    community_id UUID,
    post_type VARCHAR(20) DEFAULT 'post', -- 'post' ou 'diary'
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Comentários
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Curtidas / Vibes em Posts
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- 7. Tabela de Comunidades & Grupos
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    privacy VARCHAR(20) DEFAULT 'PUBLIC', -- 'PUBLIC' ou 'PRIVATE'
    is_suspended BOOLEAN DEFAULT false,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Membros de Comunidades
CREATE TABLE IF NOT EXISTS community_members (
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- 'OWNER', 'MODERATOR', 'MEMBER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
);

-- 9. Tabela de Canais da Comunidade (Discord-Style)
CREATE TABLE IF NOT EXISTS community_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) DEFAULT 'text', -- 'text', 'voice', 'announcements'
    is_private BOOLEAN DEFAULT false,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Mensagens do Chat da Comunidade
CREATE TABLE IF NOT EXISTS channel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabela de Conexões e Seguidores
CREATE TABLE IF NOT EXISTS connections (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted', -- 'pending', 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- 12. Tabela de Obras e Galeria do Átrio
CREATE TABLE IF NOT EXISTS atrio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    vibes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabela de Listas do Santuário (Favoritos do Átrio)
CREATE TABLE IF NOT EXISTS atrio_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cover_item_id UUID REFERENCES atrio_items(id) ON DELETE SET NULL,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabela de Itens em Listas do Santuário
CREATE TABLE IF NOT EXISTS atrio_list_items (
    list_id UUID NOT NULL REFERENCES atrio_lists(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES atrio_items(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, item_id)
);

-- 15. Tabela de Memória Vetorial Contínua do Sentinela (pgvector)
CREATE TABLE IF NOT EXISTS sentinela_user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    key_facts JSONB DEFAULT '[]'::jsonb,
    embedding vector(768), -- Vetor 768d para nomic-embed-text
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Índice HNSW para busca semântica ultrarrápida no pgvector (Distância por Cosseno <=>)
CREATE INDEX IF NOT EXISTS idx_sentinela_memories_embedding 
ON sentinela_user_memories 
USING hnsw (embedding vector_cosine_ops);

-- 17. Tabela de Punições/Time-out do Sentinela
CREATE TABLE IF NOT EXISTS sentinela_timeouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    vibes_deducted INT DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Migração e Compatibilidade de Colunas de Perfis
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultima_data_orvalho DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orvalho_balance INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orvalho_expires_at TIMESTAMP WITH TIME ZONE;


-- 19. Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'LIKE', 'COMMENT', 'FOLLOW', 'COMMUNITY_INVITE', 'SYSTEM'
    title VARCHAR(150),
    content TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 20. Tabela de Mensagens Diretas (DMs)
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(sender_id, recipient_id);

-- 21. Tabela de Colaboradores de Listas do Átrio
CREATE TABLE IF NOT EXISTS atrio_list_collaborators (
    list_id UUID NOT NULL REFERENCES atrio_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'VIEWER', -- 'VIEWER' ou 'EDITOR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, user_id)
);

-- 22. Tabela de Membros Banidos de Comunidades
CREATE TABLE IF NOT EXISTS community_banned_members (
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
);

-- 23. Tabela de Histórico e Auditoria de Transações de VIBES
CREATE TABLE IF NOT EXISTS vibe_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'WELCOME', 'DAILY_ORVALHO', 'POST_REWARD', 'MEDIA_REWARD', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'SENTINELA_PENALTY'
    related_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vibe_transactions_user ON vibe_transactions(user_id, created_at);



