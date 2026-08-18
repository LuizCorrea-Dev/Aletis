-- ==============================================================================
-- ALETIS BILLING & STRIPE INTEGRATION MIGRATION (FASE 1)
-- 100% Standalone Relational Infrastructure (ACID Compliant)
-- ==============================================================================

-- 1. Alterar tabela de usuários e perfis com atributos de faturamento
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(30) DEFAULT 'comum';
ALTER TABLE users ADD COLUMN IF NOT EXISTS vibe_saldo_real INT DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vibe_orvalho INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ultima_data_orvalho TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(30) DEFAULT 'comum';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vibe_saldo_real INT DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vibe_orvalho INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultima_data_orvalho TIMESTAMP WITH TIME ZONE;

-- 2. Tabela de Assinaturas de Profissionais de Saúde (Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    plan_duration_months INT NOT NULL DEFAULT 1,
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- 3. Tabela de Histórico de Pagamentos (Auditoria Fria / Payment History)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_checkout_id VARCHAR(255) UNIQUE NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    moeda VARCHAR(10) NOT NULL DEFAULT 'EUR',
    tipo_compra VARCHAR(50) NOT NULL, -- 'vibe_boost' ou 'assinatura_profissional'
    detalhes JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_checkout ON payment_history(stripe_checkout_id);

-- 4. Atualizar a tabela vibe_transactions com campo de idempotencia referencia_id
ALTER TABLE vibe_transactions ADD COLUMN IF NOT EXISTS referencia_id VARCHAR(255);

-- Garantir índice de busca única para idempotência por event.id/checkout_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_vibe_transactions_referencia ON vibe_transactions(referencia_id) WHERE referencia_id IS NOT NULL;

-- ==============================================================================
-- 5. SEGURANÇA E ISOLAMENTO DE DADOS - ROW-LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_transactions ENABLE ROW LEVEL SECURITY;

