"use server";

import { AccessToken } from "livekit-server-sdk";
import { getDbPool } from "@aletis/infrastructure";

interface GenerateCallTokenParams {
  tribeId: string;
  userId: string;
  userName: string;
  isModerator?: boolean;
}

export async function generateCallToken({
  tribeId,
  userId,
  userName,
  isModerator = false,
}: GenerateCallTokenParams) {
  // 1. Validação de segurança no Banco Relacional (Soberania de Dados)
  const db = getDbPool();
  const membershipCheck = await db.query(
    "SELECT id FROM tribe_members WHERE user_id = $1 AND tribe_id = $2 AND status = 'active'",
    [userId, tribeId]
  );

  if (membershipCheck.rows.length === 0) {
    throw new Error("Acesso negado: você não pertence a esta Tribo.");
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Credenciais do LiveKit não configuradas no ambiente.");
  }

  // 2. Instanciação e configuração do token de acesso seguro
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userName,
    ttl: "4h", // Tempo estrito de expiração para chamadas
  });

  // 3. Concessão de permissões específicas de sala (SFU Headless)
  at.addGrant({
    room: `tribe_${tribeId}`,
    roomJoin: true,
    canPublish: true,       // Permite abrir câmera/microfone
    canSubscribe: true,     // Recebe mídias de outros usuários
    canPublishData: true,   // Chat de texto leve dentro do canal
    roomAdmin: isModerator, // Permissão de moderação (ejetar/mutar)
  });

  return await at.toJwt();
}
