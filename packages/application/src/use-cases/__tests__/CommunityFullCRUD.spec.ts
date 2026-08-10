import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostgresCommunityRepository } from "@aletis/infrastructure";
import { Pool } from "pg";

describe("Comunidades / Grupos e Canais de Texto (Calls de Texto) - Full-CRUD", () => {
  let mockPool: any;
  let repo: PostgresCommunityRepository;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    };

    repo = new PostgresCommunityRepository(mockPool as unknown as Pool);
    vi.clearAllMocks();
  });

  describe("Full-CRUD de Comunidades", () => {
    it("deve criar uma nova comunidade e atribuir o criador como OWNER", async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: "comm-1",
              name: "Grupo de Apoio TDAH",
              slug: "grupo-apoio-tdah",
              description: "Espaço seguro",
              privacy: "PUBLIC",
              owner_id: "user-owner",
              created_at: new Date().toISOString(),
            },
          ],
        }) // INSERT community
        .mockResolvedValueOnce({ rows: [] }) // INSERT community_members OWNER
        .mockResolvedValueOnce({ rows: [{ id: "c1", community_id: "comm-1", name: "Geral", type: "text", is_private: false }] }); // SELECT channels

      const comm = await repo.createCommunity(
        {
          name: "Grupo de Apoio TDAH",
          description: "Espaço seguro",
          privacy: "PUBLIC",
        },
        "user-owner"
      );

      expect(comm.id).toBe("comm-1");
      expect(comm.name).toBe("Grupo de Apoio TDAH");
      expect(comm.currentUserRole).toBe("OWNER");
    });

    it("deve atualizar as configurações avançadas de uma comunidade", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await repo.updateCommunity("comm-1", {
        name: "Grupo TDAH & Foco",
        description: "Nova descrição atualizada",
        privacy: "PRIVATE",
      } as any);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE communities"),
        expect.arrayContaining(["Grupo TDAH & Foco", "Nova descrição atualizada", null, null, "PRIVATE", "comm-1"])
      );
    });


    it("deve excluir uma comunidade com sucesso", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.deleteCommunity("comm-1");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith("DELETE FROM communities WHERE id = $1", ["comm-1"]);
    });
  });

  describe("Full-CRUD de Canais de Texto (Calls de Texto)", () => {
    it("deve criar um canal de texto na comunidade", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: "chan-1",
            community_id: "comm-1",
            name: "Desabafos Rápidos",
            type: "text",
            is_private: false,
          },
        ],
      });

      const channel = await repo.createChannel({
        communityId: "comm-1",
        name: "Desabafos Rápidos",
        type: "text",
        isPrivate: false,
      });

      expect(channel.id).toBe("chan-1");
      expect(channel.name).toBe("Desabafos Rápidos");
    });

    it("deve atualizar um canal de texto (nome e tópico)", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.updateChannel("chan-1", {
        name: "Sala de Texto Noturna",
        topic: "Conversas da madrugada",
      });

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE community_channels"),
        expect.arrayContaining(["Sala de Texto Noturna", "Conversas da madrugada", null, null, "chan-1"])
      );
    });

    it("deve excluir um canal de texto", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.deleteChannel("chan-1");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith("DELETE FROM community_channels WHERE id = $1", ["chan-1"]);
    });
  });

  describe("Full-CRUD de Mensagens no Chat do Canal", () => {
    it("deve enviar uma mensagem no canal de texto", async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: "msg-10",
            channel_id: "chan-1",
            author_id: "user-1",
            content: "Olá pessoal!",
            media_url: null,
            created_at: new Date().toISOString(),
          },
        ],
      });

      const msg = await repo.sendMessage("chan-1", "Olá pessoal!", undefined, "user-1");

      expect(msg.id).toBe("msg-10");
      expect(msg.content).toBe("Olá pessoal!");
    });

    it("deve editar o conteúdo de uma mensagem enviada", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.updateMessage("chan-1", "msg-10", "Mensagem editada!", "user-1");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE channel_messages SET content = $1"),
        ["Mensagem editada!", "msg-10", "chan-1", "user-1"]
      );
    });

    it("deve excluir uma mensagem enviada pelo próprio autor ou moderador", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.deleteMessage("chan-1", "msg-10", "user-1");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM channel_messages"),
        ["msg-10", "user-1", "chan-1"]
      );
    });

    it("deve alternar a fixação (pin/unpin) de uma mensagem no canal", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.togglePinMessage("chan-1", "msg-10");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        "UPDATE channel_messages SET is_pinned = NOT is_pinned WHERE id = $1",
        ["msg-10"]
      );
    });
  });

  describe("Moderação e Gestão de Membros", () => {
    it("deve banir um membro da comunidade", async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // DELETE FROM community_members
        .mockResolvedValueOnce({ rows: [] }); // INSERT INTO community_banned_members

      const result = await repo.banMember("comm-1", "bad-user", "Discurso tóxico");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO community_banned_members"),
        ["comm-1", "bad-user", "Discurso tóxico"]
      );
    });

    it("deve desbanir um membro previamente banido", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await repo.unbanMember("comm-1", "bad-user");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        "DELETE FROM community_banned_members WHERE community_id = $1 AND user_id = $2",
        ["comm-1", "bad-user"]
      );
    });
  });
});
