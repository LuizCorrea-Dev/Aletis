import Stripe from "stripe";
import { getDbPool } from "../db";

export class StripeFulfillmentService {
  private stripe: Stripe;

  constructor(secretKey?: string) {
    const key = secretKey || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
    this.stripe = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }

  async fulfillSession(checkoutSessionId: string): Promise<boolean> {
    if (!checkoutSessionId || checkoutSessionId.includes("{CHECKOUT_SESSION_ID}")) {
      return false;
    }

    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Idempotência: verificar se este checkoutId já foi processado em payment_history
      const { rows: existingPay } = await client.query(
        `SELECT id FROM payment_history WHERE stripe_checkout_id = $1 FOR UPDATE`,
        [checkoutSessionId]
      );

      if (existingPay.length > 0) {
        await client.query("ROLLBACK");
        return true; // Já cumprido anteriormente
      }

      // Buscar sessão no Stripe
      let session: Stripe.Checkout.Session;
      try {
        session = await this.stripe.checkout.sessions.retrieve(checkoutSessionId);
      } catch (err: any) {
        console.error(`⚠️ Erro ao recuperar sessão do Stripe (${checkoutSessionId}):`, err.message);
        await client.query("ROLLBACK");
        return false;
      }

      if (session.payment_status !== "paid") {
        console.warn(`ℹ️ Sessão ${checkoutSessionId} ainda não está paga (status: ${session.payment_status}).`);
        await client.query("ROLLBACK");
        return false;
      }

      const userId = session.client_reference_id || session.metadata?.userId;
      const metadata = session.metadata || {};
      const purchaseType = metadata.purchaseType;

      if (!userId) {
        console.error("⚠️ Sessão Stripe sem userId atrelado.");
        await client.query("ROLLBACK");
        return false;
      }

      const totalAmountCents = session.amount_total || 0;
      const amountFormatted = (totalAmountCents / 100).toFixed(2);
      const currency = (session.currency || "brl").toUpperCase();

      if (purchaseType === "assinatura_profissional") {
        const months = parseInt(metadata.months || "1", 10);
        const stripeSubId = (session.subscription as string) || `sub_manual_${checkoutSessionId}`;
        const customerId = (session.customer as string) || null;

        await client.query(`UPDATE users SET tipo_perfil = 'verificado' WHERE id = $1::uuid`, [userId]);
        await client.query(`UPDATE profiles SET tipo_perfil = 'verificado' WHERE id = $1::uuid`, [userId]);

        await client.query(
          `INSERT INTO subscriptions (
            user_id, stripe_subscription_id, stripe_customer_id, status, plan_duration_months, data_inicio, data_expiracao
          ) VALUES ($1::uuid, $2, $3, 'active', $4::int, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($5 || ' month')::interval)
          ON CONFLICT (stripe_subscription_id) 
          DO UPDATE SET 
            status = 'active', 
            plan_duration_months = EXCLUDED.plan_duration_months,
            data_expiracao = CURRENT_TIMESTAMP + (EXCLUDED.plan_duration_months || ' month')::interval`,
          [userId, stripeSubId, customerId, months, `${months}`]
        );

        await client.query(
          `INSERT INTO payment_history (user_id, stripe_checkout_id, valor, moeda, tipo_compra, detalhes)
           VALUES ($1::uuid, $2, $3::numeric, $4, 'assinatura_profissional', $5::jsonb)
           ON CONFLICT (stripe_checkout_id) DO NOTHING`,
          [userId, checkoutSessionId, amountFormatted, currency, JSON.stringify(metadata)]
        );

        await client.query(
          `INSERT INTO vibe_transactions (user_id, amount, type, referencia_id, description)
           SELECT $1::uuid, 0, 'ASSINATURA_PROFISSIONAL', $2::varchar, $3::text
           WHERE NOT EXISTS (
             SELECT 1 FROM vibe_transactions WHERE referencia_id = $2::varchar
           )`,
          [userId, `sync_${checkoutSessionId}`, `Assinatura de Perfil Profissional Verificado (${months} meses)`]
        );

        console.log(`✅ Assinatura profissional ativada para usuário ${userId}.`);
      } else if (purchaseType === "vibe_boost") {
        const vibeAmount = parseInt(metadata.vibeAmount || "0", 10);
        const packageId = metadata.packageId || "desconhecido";

        if (vibeAmount > 0) {
          // 1. Incrementar saldo permanente em users com casting explícito
          await client.query(
            `UPDATE users 
             SET vibe_saldo_real = COALESCE(vibe_saldo_real, 50) + $1::int 
             WHERE id = $2::uuid`,
            [vibeAmount, userId]
          );

          // 2. Incrementar saldo permanente em profiles (tentar UPDATE com casting explícito primeiro)
          const { rowCount } = await client.query(
            `UPDATE profiles 
             SET vibes_balance = COALESCE(vibes_balance, vibe_saldo_real, 50) + $1::int,
                 vibe_saldo_real = COALESCE(vibe_saldo_real, vibes_balance, 50) + $1::int
             WHERE id = $2::uuid`,
            [vibeAmount, userId]
          );

          // 3. Se o perfil ainda não existia, realiza o UPSERT com casting de tipos $1::int e $2::uuid
          if (!rowCount || rowCount === 0) {
            await client.query(
              `INSERT INTO profiles (id, username, display_name, vibes_balance, vibe_saldo_real)
               VALUES ($2::uuid, 'user_' || SUBSTRING($2::text, 1, 8), 'Membro Aletis', 50 + $1::int, 50 + $1::int)
               ON CONFLICT (id) DO UPDATE SET
                 vibes_balance = COALESCE(profiles.vibes_balance, profiles.vibe_saldo_real, 50) + $1::int,
                 vibe_saldo_real = COALESCE(profiles.vibes_balance, profiles.vibe_saldo_real, 50) + $1::int`,
              [vibeAmount, userId]
            );
          }

          await client.query(
            `INSERT INTO vibe_transactions (user_id, amount, type, referencia_id, description)
             SELECT $1::uuid, $2::int, 'compra_vibe_boost', $3::varchar, $4::text
             WHERE NOT EXISTS (
               SELECT 1 FROM vibe_transactions WHERE referencia_id = $3::varchar
             )`,
            [userId, vibeAmount, `sync_${checkoutSessionId}`, `Compra de VIBE Boost (Pacote: ${packageId})`]
          );

          await client.query(
            `INSERT INTO payment_history (user_id, stripe_checkout_id, valor, moeda, tipo_compra, detalhes)
             VALUES ($1::uuid, $2, $3::numeric, $4, 'vibe_boost', $5::jsonb)
             ON CONFLICT (stripe_checkout_id) DO NOTHING`,
            [userId, checkoutSessionId, amountFormatted, currency, JSON.stringify(metadata)]
          );

          console.log(`✅ Crédito de +${vibeAmount} VIBEs somado com sucesso para o usuário ${userId}.`);
        }
      }

      await client.query("COMMIT");
      return true;
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("❌ Erro ao cumprir sessão de checkout:", err);
      return false;
    } finally {
      client.release();
    }
  }
}
