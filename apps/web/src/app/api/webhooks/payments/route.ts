import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { StripeFulfillmentService } from "@aletis/infrastructure";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_aletis", {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    if (webhookSecret && signature && !webhookSecret.includes("seu_segredo")) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Dev mode: se o segredo for o placeholder padrão, faz parse seguro do payload
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`⚠️  Falha na verificação de assinatura do Webhook Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
  }

  // Processa o evento checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      const fulfillment = new StripeFulfillmentService();
      await fulfillment.fulfillSession(session.id);
      return NextResponse.json({ received: true, success: true }, { status: 200 });
    } catch (dbError: any) {
      console.error("❌ Erro no processamento relacional do Webhook Stripe:", dbError);
      return NextResponse.json({ error: "Database transaction failed", details: dbError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
