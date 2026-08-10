import { NextRequest } from "next/server";
import { getCurrentUser } from "@/utils/auth";
import { PostgresNotificationRepository } from "@aletis/infrastructure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Não autorizado", { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Stream fechada pelo cliente
        }
      };

      // Notificação inicial de boas-vindas
      sendEvent("connected", { userId: user.id, timestamp: new Date().toISOString() });

      const notifRepo = new PostgresNotificationRepository();

      // Long polling / heartbeat a cada 5 segundos para atualizações em tempo real
      const intervalId = setInterval(async () => {
        try {
          const unreadCount = await notifRepo.getUnreadCount(user.id);
          sendEvent("heartbeat", {
            unreadNotifications: unreadCount,
            serverTime: new Date().toISOString(),
          });
        } catch (err) {
          // Erro silencioso no heartbeat
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch { }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
