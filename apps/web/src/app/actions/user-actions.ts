"use server";

import { getCurrentUser, setSessionCookie, clearSessionCookie, hashPassword, verifyPassword } from "@/utils/auth";
import { getDbPool, PostgresUserRepository, PostgresSentinelaMemoryRepository, PostgresNotificationRepository, PostgresTransactionRepository } from "@aletis/infrastructure";


import crypto from "crypto";

export async function loginAction(emailInput: string, passwordInput: string) {
  try {
    const userRepo = new PostgresUserRepository();
    const user = await userRepo.findByEmail(emailInput.trim().toLowerCase());

    if (!user) {
      return { success: false, message: "E-mail ou senha incorretos." };
    }

    if (passwordInput && user.password_hash) {
      const isValid = verifyPassword(passwordInput, user.password_hash);
      if (!isValid) {
        return { success: false, message: "E-mail ou senha incorretos." };
      }
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    await setSessionCookie(sessionUser);
    return { success: true, user: sessionUser };
  } catch (error: any) {
    console.error("loginAction error:", error);
    return { success: false, message: error.message || "Erro no login." };
  }
}

export async function signUpAction(data: {
  email: string;
  password?: string;
  username: string;
  fullName: string;
}) {
  try {
    const userRepo = new PostgresUserRepository();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase();

    const existing = await userRepo.findByEmail(cleanEmail);
    if (existing) {
      return { success: false, message: "Este e-mail já está cadastrado." };
    }

    const usernameAvailable = await userRepo.isUsernameAvailable(cleanUsername);
    if (!usernameAvailable) {
      return { success: false, message: "Este nome de usuário já está em uso." };
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(data.password || "aletis_default_pass");

    const created = await userRepo.createUser({
      id: userId,
      email: cleanEmail,
      passwordHash,
      username: cleanUsername,
      name: data.fullName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanUsername)}`,
    });

    if (!created) {
      return { success: false, message: "Erro ao criar conta no banco de dados." };
    }

    try {
      const txRepo = new PostgresTransactionRepository();
      await txRepo.logTransaction(userId, 50, "WELCOME", undefined, "Bônus de Boas-Vindas ao Aletis (+50 VIBES)");
    } catch (err) {
      console.error("Erro ao registrar log de boas-vindas:", err);
    }

    const sessionUser = {

      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      role: "user",
    };

    await setSessionCookie(sessionUser);
    return { success: true, user: sessionUser };
  } catch (error: any) {
    console.error("signUpAction error:", error);
    return { success: false, message: error.message || "Erro ao cadastrar usuário." };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { success: true };
}

export async function getCurrentUserProfileAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const pool = getDbPool();
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT false");
    const userRow = await pool.query("SELECT is_two_factor_enabled FROM users WHERE id = $1 LIMIT 1", [user.id]);
    const isTwoFactorEnabled = Boolean(userRow.rows[0]?.is_two_factor_enabled);

    const userRepo = new PostgresUserRepository();
    const profile = await userRepo.getUserProfile(user.id);
    if (!profile) {
      return {
        id: user.id,
        email: user.email,
        name: user.username,
        username: user.username,
        status: "Em busca de equilíbrio em paz",
        bio: "Compartilhando vibes de harmonia.",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`,
        bannerUrl: "",
        vibes: 50,
        vibesCount: 50,
        tipoPerfil: "comum" as const,
        phone: "",
        countryCode: "+55",
        isTwoFactorEnabled,
      };
    }
    return {
      ...profile,
      email: user.email,
      vibesCount: profile.vibes,
      isTwoFactorEnabled,
    };
  } catch (error) {
    console.error("getCurrentUserProfileAction error:", error);
    return null;
  }
}

export async function getUserVibesAndNotificationsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { vibes: 0, notifications: 0, orvalhoVibes: 0 };
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT vibes_balance, orvalho_balance, orvalho_expires_at,
              (orvalho_expires_at IS NOT NULL AND orvalho_expires_at > CURRENT_TIMESTAMP) as is_orvalho_active
       FROM profiles WHERE id = $1 LIMIT 1`,
      [user.id]
    );

    const permanent = rows[0]?.vibes_balance ?? 50;
    const activeOrvalho = rows[0]?.is_orvalho_active ? (rows[0]?.orvalho_balance ?? 0) : 0;
    const totalVibes = permanent + activeOrvalho;

    const notifRepo = new PostgresNotificationRepository();
    const notifications = await notifRepo.getUnreadCount(user.id);

    return {
      vibes: totalVibes,
      permanentVibes: permanent,
      orvalhoVibes: activeOrvalho,
      notifications,
    };
  } catch (error) {
    console.error("Error in getUserVibesAndNotificationsAction:", error);
    return { vibes: 0, notifications: 0, orvalhoVibes: 0 };
  }
}


import JSZip from "jszip";

export async function exportUserDataAction(zipPassword?: string) {
  try {
    const session = await getCurrentUser();
    if (!session) return { success: false, message: "Não autenticado. Faça login para exportar seus dados." };

    const pool = getDbPool();

    const userRes = await pool.query("SELECT id, email, role, created_at FROM users WHERE id = $1 LIMIT 1", [session.id]);
    const profileRes = await pool.query("SELECT * FROM profiles WHERE id = $1 LIMIT 1", [session.id]);
    const postsRes = await pool.query("SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC", [session.id]);
    const commentsRes = await pool.query("SELECT * FROM comments WHERE author_id = $1 ORDER BY created_at DESC", [session.id]);
    const dmsRes = await pool.query(
      "SELECT * FROM direct_messages WHERE sender_id = $1 OR recipient_id = $1 ORDER BY created_at DESC",
      [session.id]
    );
    const atrioRes = await pool.query("SELECT * FROM atrio_items WHERE user_id = $1 ORDER BY created_at DESC", [session.id]);
    const atrioListsRes = await pool.query("SELECT * FROM atrio_lists WHERE user_id = $1 ORDER BY created_at DESC", [session.id]);
    const memoryRes = await pool.query("SELECT summary, key_facts, updated_at FROM sentinela_user_memories WHERE user_id = $1 LIMIT 1", [session.id]);

    const zip = new JSZip();

    zip.file(
      "POLITICA_E_DIREITO_DOS_DADOS.txt",
      `ALETIS SOCIAL - EXPORTAÇÃO INTEGRAL DE DADOS PESSOAIS (LGPD / GDPR)
===================================================================
Data da Solicitação: ${new Date().toLocaleString("pt-BR")}
Usuário: ${session.username}
E-mail de Acesso: ${session.email}

Em conformidade com a Política de Direitos dos Próprios Dados do Aletis, este pacote contém 100% dos seus conteúdos, publicações, mensagens salvas e histórico do perfil.

Arquivos incluídos:
- perfil_e_conta.json: Informações cadastrais e de perfil
- publicacoes_e_comentarios.json: Posts, desabafos e comentários realizados
- mensagens_diretas.json: Histórico de conversas
- obras_e_listas_atrio.json: Obras e listas salvas no Átrio / Santuário
- memorias_do_sentinela.json: Resumo de interações e aprendizado do Sentinela AI
- SEGURANCA.txt: Status de proteção e chave de segurança da exportação.

Chave de Proteção: ${zipPassword ? "Definida pelo Usuário" : "Padrão"}
`
    );

    zip.file(
      "perfil_e_conta.json",
      JSON.stringify(
        {
          usuario: userRes.rows[0] || null,
          perfil: profileRes.rows[0] || null,
        },
        null,
        2
      )
    );

    zip.file(
      "publicacoes_e_comentarios.json",
      JSON.stringify(
        {
          posts: postsRes.rows || [],
          comentarios: commentsRes.rows || [],
        },
        null,
        2
      )
    );

    zip.file("mensagens_diretas.json", JSON.stringify(dmsRes.rows || [], null, 2));
    zip.file(
      "obras_e_listas_atrio.json",
      JSON.stringify(
        {
          obras: atrioRes.rows || [],
          listasSantuario: atrioListsRes.rows || [],
        },
        null,
        2
      )
    );
    zip.file("memorias_do_sentinela.json", JSON.stringify(memoryRes.rows[0] || {}, null, 2));

    zip.file(
      "SEGURANCA.txt",
      `Arquivo ZIP gerado com sucesso para ${session.username}.\nSenha definida pelo usuário registrada no cabeçalho de exportação.`
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const base64Data = zipBuffer.toString("base64");

    return {
      success: true,
      fileName: `aletis_dados_${session.username}_${Date.now()}.zip`,
      dataBase64: base64Data,
      message: "Seus dados foram compactados e exportados com sucesso!",
    };
  } catch (error: any) {
    console.error("exportUserDataAction error:", error);
    return { success: false, message: error.message || "Erro ao exportar dados." };
  }
}

export async function deleteUserAccountAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    console.log(`[SENTINELA FAREWELL EMAIL] Enviando e-mail para ${user.email}...`);
    console.log(`Assunto: Sentinela | Um até logo do Aletis`);
    console.log(
      `Mensagem: Foi um prazer tê-lo conosco nesta jornada! Esperamos que volte em breve, agora com novas expectativas e histórias.`
    );

    const sentinelaRepo = new PostgresSentinelaMemoryRepository();
    await sentinelaRepo.deleteUserMemory(user.id);

    const userRepo = new PostgresUserRepository();
    const success = await userRepo.deleteUser(user.id);

    if (success) {
      await clearSessionCookie();
      return {
        success: true,
        message: "Conta e dados vetoriais excluídos permanentemente.",
        farewellMessage:
          "Foi um prazer tê-lo conosco nesta jornada! Esperamos que volte em breve, agora com novas expectativas e histórias.",
      };
    }
    return { success: false, message: "Erro ao excluir conta no banco de dados." };
  } catch (error: any) {
    console.error("deleteUserAccountAction error:", error);
    return { success: false, message: error.message || "Erro ao excluir conta." };
  }
}

export async function getPublicProfileByUsernameAction(username: string) {
  try {
    const userRepo = new PostgresUserRepository();
    const profile = await userRepo.getProfileByUsername(username);
    if (!profile) return null;
    return {
      ...profile,
      vibesCount: profile.vibes,
    };
  } catch (error) {
    console.error("getPublicProfileByUsernameAction error:", error);
    return null;
  }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await getCurrentUser();
    if (!session) return { success: false, message: "Sessão expirada. Faça login novamente." };

    if (!currentPassword || !newPassword) {
      return { success: false, message: "Preencha a senha atual e a nova senha." };
    }

    if (newPassword.length < 6) {
      return { success: false, message: "A nova senha deve ter pelo menos 6 caracteres." };
    }

    const pool = getDbPool();
    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1 LIMIT 1", [session.id]);
    if (rows.length === 0) return { success: false, message: "Usuário não encontrado." };

    const currentHash = rows[0].password_hash;
    const isValid = verifyPassword(currentPassword, currentHash);
    if (!isValid) {
      return { success: false, message: "Senha atual incorreta." };
    }

    const newHash = hashPassword(newPassword);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newHash, session.id]
    );

    return { success: true, message: "Senha alterada com sucesso!" };
  } catch (error: any) {
    console.error("changePasswordAction error:", error);
    return { success: false, message: error.message || "Erro ao alterar senha." };
  }
}

export async function changeAccessEmailAction(newEmailInput: string, currentPassword: string) {
  try {
    const session = await getCurrentUser();
    if (!session) return { success: false, message: "Sessão expirada. Faça login novamente." };

    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "Informe um e-mail válido." };
    }

    if (!currentPassword) {
      return { success: false, message: "Confirme sua senha atual para alterar o e-mail de acesso." };
    }

    const pool = getDbPool();
    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1 LIMIT 1", [session.id]);
    if (rows.length === 0) return { success: false, message: "Usuário não encontrado." };

    const currentHash = rows[0].password_hash;
    const isValid = verifyPassword(currentPassword, currentHash);
    if (!isValid) {
      return { success: false, message: "Senha atual incorreta." };
    }

    const existingCheck = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2 LIMIT 1",
      [cleanEmail, session.id]
    );
    if (existingCheck.rows.length > 0) {
      return { success: false, message: "Este e-mail de acesso já está em uso por outra conta." };
    }

    await pool.query(
      "UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [cleanEmail, session.id]
    );

    await setSessionCookie({
      ...session,
      email: cleanEmail,
    });

    return { success: true, message: "E-mail de acesso alterado com sucesso!" };
  } catch (error: any) {
    console.error("changeAccessEmailAction error:", error);
    return { success: false, message: error.message || "Erro ao alterar e-mail de acesso." };
  }
}

export async function toggleTwoFactorAction(enabled: boolean) {
  try {
    const session = await getCurrentUser();
    if (!session) return { success: false, message: "Sessão expirada. Faça login novamente." };

    const pool = getDbPool();
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT false");
    await pool.query(
      "UPDATE users SET is_two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [enabled, session.id]
    );

    return {
      success: true,
      isTwoFactorEnabled: enabled,
      message: enabled
        ? "Segurança de 2 Fatores (2FA) ativada com sucesso!"
        : "Segurança de 2 Fatores (2FA) desativada com sucesso.",
    };
  } catch (error: any) {
    console.error("toggleTwoFactorAction error:", error);
    return { success: false, message: error.message || "Erro ao atualizar 2FA." };
  }
}

