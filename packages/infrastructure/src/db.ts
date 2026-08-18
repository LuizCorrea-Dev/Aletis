import { Pool } from "pg";

let poolInstance: Pool | null = null;

async function ensureBillingTables(pool: Pool) {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(30) DEFAULT 'comum';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vibe_saldo_real INT DEFAULT 100;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vibe_orvalho INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ultima_data_orvalho TIMESTAMP WITH TIME ZONE;

      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(30) DEFAULT 'comum';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vibe_saldo_real INT DEFAULT 100;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vibe_orvalho INT DEFAULT 0;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultima_data_orvalho TIMESTAMP WITH TIME ZONE;

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

      CREATE TABLE IF NOT EXISTS payment_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_checkout_id VARCHAR(255) UNIQUE NOT NULL,
        valor NUMERIC(10, 2) NOT NULL,
        moeda VARCHAR(10) NOT NULL DEFAULT 'EUR',
        tipo_compra VARCHAR(50) NOT NULL,
        detalhes JSONB DEFAULT '{}'::jsonb,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE vibe_transactions ADD COLUMN IF NOT EXISTS referencia_id VARCHAR(255);
      ALTER TABLE vibe_transactions DROP CONSTRAINT IF EXISTS vibe_transactions_type_check;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_vibe_transactions_referencia ON vibe_transactions(referencia_id) WHERE referencia_id IS NOT NULL;
    `);
  } catch (err) {
    console.error("Auto-migration ensureBillingTables notice:", err);
  }
}

export function getDbPool(): Pool {
  if (!poolInstance) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://aletis:aletis_secret_pass@localhost:5432/aletis_db";

    poolInstance = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    ensureBillingTables(poolInstance).catch(() => {});
  }

  return poolInstance;
}

