import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";
import { getDbPool, PostgresUserRepository, StripeFulfillmentService } from "@aletis/infrastructure";
import { BillingClient } from "./BillingClient";

export const metadata = {
  title: "Central de Planos Profissionais & VIBE Boosts | Aletis",
  description: "Assine como Profissional de Saúde Verificado ou apoie voluntariamente a rede Aletis com VIBE Boosts.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; type?: string; vibeAmount?: string; months?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect("/login");
  }

  // Se retornou com sucesso do Stripe, garante o cumprimento síncrono (evitando depender exclusivamente do webhook em dev)
  if (params.status === "success" && params.session_id) {
    try {
      const fulfillment = new StripeFulfillmentService();
      await fulfillment.fulfillSession(params.session_id);
    } catch (err) {
      console.error("Erro ao sincronizar sessão de pagamento:", err);
    }
  }

  const userRepo = new PostgresUserRepository();
  const profile = await userRepo.getUserProfile(user.id);

  const pool = getDbPool();
  
  // Buscar assinatura ativa se houver
  const { rows: subRows } = await pool.query(
    `SELECT id, status, plan_duration_months, data_inicio, data_expiracao 
     FROM subscriptions 
     WHERE user_id = $1 AND status = 'active' 
     ORDER BY data_expiracao DESC LIMIT 1`,
    [user.id]
  );

  // Buscar histórico de pagamentos
  const { rows: payRows } = await pool.query(
    `SELECT id, stripe_checkout_id, valor, moeda, tipo_compra, criado_em 
     FROM payment_history 
     WHERE user_id = $1 
     ORDER BY criado_em DESC LIMIT 10`,
    [user.id]
  );

  const subscription = subRows.length > 0 ? {
    id: subRows[0].id,
    status: subRows[0].status,
    plan_duration_months: subRows[0].plan_duration_months,
    data_inicio: new Date(subRows[0].data_inicio).toISOString(),
    data_expiracao: new Date(subRows[0].data_expiracao).toISOString(),
  } : null;

  const paymentHistory = payRows.map((row) => ({
    id: row.id,
    stripe_checkout_id: row.stripe_checkout_id,
    valor: row.valor,
    moeda: row.moeda,
    tipo_compra: row.tipo_compra,
    criado_em: new Date(row.criado_em).toISOString(),
  }));

  const userProfile = {
    id: user.id,
    name: profile?.name || user.username || "Membro Aletis",
    username: profile?.username || user.username,
    tipoPerfil: profile?.tipoPerfil || "comum",
    vibeSaldoReal: profile?.vibeSaldoReal ?? 100,
    vibeOrvalho: profile?.vibeOrvalho ?? 0,
  };

  return (
    <BillingClient
      userProfile={userProfile}
      subscription={subscription}
      paymentHistory={paymentHistory}
      initialTab={params.tab as any}
      status={params.status}
      purchaseType={params.type}
      vibeAmount={params.vibeAmount ? parseInt(params.vibeAmount, 10) : undefined}
      months={params.months ? parseInt(params.months, 10) : undefined}
    />
  );
}

