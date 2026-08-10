import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostgresTransactionRepository } from "@aletis/infrastructure";
import { Pool } from "pg";

describe("Economia e Transações de VIBES (Regras e Orvalho)", () => {
  let mockPool: any;
  let mockClient: any;
  let txRepo: PostgresTransactionRepository;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };

    mockPool = {
      query: vi.fn(),
      connect: vi.fn().mockResolvedValue(mockClient),
    };

    txRepo = new PostgresTransactionRepository(mockPool as unknown as Pool);
    vi.clearAllMocks();
  });

  describe("Recompensas de Post & Orvalho do Dia (6 Orvalho Temporário 24h + 1 Post + 1 Mídia)", () => {
    it("deve conceder +8 VIBES no 1º post do dia com mídia (6 Orvalho Temporário 24h + 1 Post + 1 Mídia)", async () => {
      // Configura retorno do 1º post do dia
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 50, orvalho_balance: 0, ultima_data_orvalho: null, is_first_today: true }],
        }) // SELECT FOR UPDATE
        .mockResolvedValueOnce({ rows: [] }) // UPDATE profiles
        .mockResolvedValueOnce({ rows: [] }) // INSERT DAILY_ORVALHO
        .mockResolvedValueOnce({ rows: [] }) // INSERT POST_REWARD
        .mockResolvedValueOnce({ rows: [] }) // INSERT MEDIA_REWARD
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 52, orvalho_balance: 6, is_orvalho_active: true }],
        }) // SELECT updated balance
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await txRepo.processPostRewards("user-1", true, "post-100");

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(58); // 52 permanentes + 6 Orvalho temporário = 58 total
      expect(result.breakdown).toEqual({
        total: 8,
        orvalho: 6,
        post: 1,
        media: 1,
      });
      expect(result.message).toContain("+8 VIBES");
    });

    it("deve conceder +2 VIBES no 2º post do mesmo dia com mídia (0 Orvalho + 1 Post + 1 Mídia)", async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 52, orvalho_balance: 6, ultima_data_orvalho: "2026-08-10", is_first_today: false }],
        }) // SELECT FOR UPDATE
        .mockResolvedValueOnce({ rows: [] }) // UPDATE profiles
        .mockResolvedValueOnce({ rows: [] }) // INSERT POST_REWARD
        .mockResolvedValueOnce({ rows: [] }) // INSERT MEDIA_REWARD
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 54, orvalho_balance: 6, is_orvalho_active: true }],
        }) // SELECT updated balance
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await txRepo.processPostRewards("user-1", true, "post-101");

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(60); // 54 permanentes + 6 Orvalho = 60
      expect(result.breakdown).toEqual({
        total: 2,
        orvalho: 0,
        post: 1,
        media: 1,
      });
    });
  });

  describe("Transferências Atômicas de Vibes entre Usuários (Doações de Orvalho e Conversão Permanente)", () => {
    it("deve priorizar a dedução de Orvalho temporário e converter em saldo permanente para o destinatário", async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 50, orvalho_balance: 6, is_orvalho_active: true }],
        }) // SELECT FOR UPDATE sender
        .mockResolvedValueOnce({ rows: [] }) // UPDATE sender (orvalho_balance vira 5, vibes_balance continua 50)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE recipient (vibes_balance + 1 permanente)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE post likes
        .mockResolvedValueOnce({ rows: [] }) // INSERT vibe_transactions
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await txRepo.transferVibe("recipient-1", 1, "post-1", undefined, "sender-1");

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(55); // 50 permanentes + 5 Orvalho restante = 55
      expect(result.message).toContain("sucesso");
    });

    it("deve recusar transferência se o saldo total (permanente + Orvalho ativo) for insuficiente", async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ vibes_balance: 2, orvalho_balance: 0, is_orvalho_active: false }],
        }) // SELECT FOR UPDATE sender
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      const result = await txRepo.transferVibe("recipient-1", 5, "post-1", undefined, "sender-empty");

      expect(result.success).toBe(false);
      expect(result.message).toContain("insuficiente");
    });

    it("deve recusar transferência do usuário para si mesmo", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ vibes_balance: 50, orvalho_balance: 0, is_orvalho_active: false }] });

      const result = await txRepo.transferVibe("user-1", 1, "post-1", undefined, "user-1");

      expect(result.success).toBe(false);
      expect(result.message).toContain("si mesmo");
    });
  });

});
