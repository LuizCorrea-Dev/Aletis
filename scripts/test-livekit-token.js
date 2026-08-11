const { AccessToken } = require("livekit-server-sdk");

async function testTokenGeneration() {
  console.log("🧪 Testando geração de Token JWT do LiveKit...");

  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secretsecretsecretsecretsecretsecret";
  const roomName = "test-community-channel";

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: "user_test_123",
      name: "TestUser",
      ttl: "1h",
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    console.log("✅ Token gerado com sucesso!");
    console.log("🔑 JWT Token Sample:", token.substring(0, 40) + "...");
    console.log("🏠 Room Name:", roomName);
    console.log("🎉 Teste de geração de token passou sem erros.");
  } catch (err) {
    console.error("❌ Falha na geração do token:", err);
    process.exit(1);
  }
}

testTokenGeneration();
