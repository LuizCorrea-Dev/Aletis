"use server";

import { AccessToken } from "livekit-server-sdk";
import { getCurrentUser } from "@/utils/auth";

export async function getLiveKitTokenAction(roomName: string) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: "Usuário não autenticado." };
    }

    const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
    const apiSecret = process.env.LIVEKIT_API_SECRET || "secretsecretsecretsecretsecretsecret";
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "http://localhost:7880";

    const avatarUrl = session.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${session.username || session.id}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.id,
      name: session.username || "Usuário",
      metadata: JSON.stringify({ avatarUrl }),
      ttl: "2h",
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      success: true,
      token,
      wsUrl,
    };
  } catch (error: any) {
    console.error("getLiveKitTokenAction error:", error);
    return { success: false, message: error.message || "Erro ao gerar token para chamada de voz/vídeo." };
  }
}
