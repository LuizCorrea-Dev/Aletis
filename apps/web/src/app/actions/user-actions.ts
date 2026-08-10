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
      };
    }
    return {
      ...profile,
      email: user.email,
      vibesCount: profile.vibes,
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
      return { vibes: 0, notifications: 0 };
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      "SELECT vibes_balance FROM profiles WHERE id = $1 LIMIT 1",
      [user.id]
    );

    const vibes = rows[0]?.vibes_balance ?? 50;

    const notifRepo = new PostgresNotificationRepository();
    const notifications = await notifRepo.getUnreadCount(user.id);

    return {
      vibes,
      notifications,
    };
  } catch (error) {
    console.error("Error in getUserVibesAndNotificationsAction:", error);
    return { vibes: 0, notifications: 0 };
  }
}


export async function deleteUserAccountAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const sentinelaRepo = new PostgresSentinelaMemoryRepository();
    await sentinelaRepo.deleteUserMemory(user.id);

    const userRepo = new PostgresUserRepository();
    const success = await userRepo.deleteUser(user.id);

    if (success) {
      await clearSessionCookie();
      return { success: true, message: "Conta e dados vetoriais excluídos permanentemente." };
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
