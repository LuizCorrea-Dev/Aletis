"use server";

import { loginAction as internalLogin, signUpAction as internalSignUp } from "./user-actions";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  if (!email || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  const result = await internalLogin(email, password);

  if (!result.success) {
    return { error: result.message || "Credenciais inválidas." };
  }

  redirect("/feed");
}

export async function signUpAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const username = (formData.get("username") as string) || "";
  const fullName = (formData.get("fullName") as string) || username;

  if (!email || !password || !username) {
    return { error: "Por favor, preencha todos os campos obrigatórios." };
  }

  const result = await internalSignUp({
    email,
    password,
    username,
    fullName,
  });

  if (!result.success) {
    return { error: result.message || "Erro ao criar conta." };
  }

  redirect("/feed");
}
