"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Smile,
} from "lucide-react";
import { loginAction, signUpAction } from "@/app/actions/user-actions";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await loginAction(email, password);
        if (!res.success) {
          setError(res.message);
        } else {
          window.location.href = "/feed";
        }
      } else {
        const res = await signUpAction({
          email,
          password,
          username,
          fullName,
        });
        if (!res.success) {
          setError(res.message);
        } else {
          window.location.href = "/feed";
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--theme-surface)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--theme-border)",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "420px",
        padding: "32px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
      }}
    >
      <h2
        style={{
          color: "var(--theme-foreground)",
          fontSize: "20px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {!isLogin && (
          <>
            {/* Nome de Exibição */}
            <div style={{ position: "relative" }}>
              <Smile
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--theme-input-placeholder, #64748b)",
                }}
              />
              <input
                type="text"
                placeholder="Nome de Exibição (ex: Fulano de Tal)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "var(--theme-input-bg, #f1f5f9)",
                  color: "var(--theme-input-text, #1e293b)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Username */}
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--theme-input-placeholder, #64748b)",
                }}
              />
              <input
                type="text"
                placeholder="Nome de Usuário (fulano_tal)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                required={!isLogin}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "var(--theme-input-bg, #f1f5f9)",
                  color: "var(--theme-input-text, #1e293b)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </>
        )}

        {/* Email */}
        <div style={{ position: "relative" }}>
          <Mail
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--theme-input-placeholder, #64748b)",
            }}
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--theme-input-bg, #f1f5f9)",
              color: "var(--theme-input-text, #1e293b)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* Senha */}
        <div style={{ position: "relative" }}>
          <Lock
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--theme-input-placeholder, #64748b)",
            }}
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--theme-input-bg, #f1f5f9)",
              color: "var(--theme-input-text, #1e293b)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#f87171",
              fontSize: "14px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            backgroundColor: "var(--theme-primary)",
            color: "#0f172a",
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "12px",
            cursor: "pointer",
            border: "none",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0px 4px 15px rgba(80, 200, 120, 0.3)",
            marginTop: "8px",
          }}
        >
          {isLoading ? (
            <Loader2 style={{ animation: "spin 1s linear infinite" }} size={18} />
          ) : (
            <>
              <span>{isLogin ? "Entrar" : "Começar Jornada"}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--theme-muted-foreground)", fontSize: "14px" }}>
          {isLogin ? "Ainda não faz parte?" : "Já possui conta?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setUsername("");
              setFullName("");
            }}
            style={{
              marginLeft: "8px",
              color: "var(--theme-accent)",
              fontWeight: "bold",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              fontSize: "14px",
            }}
          >
            {isLogin ? "Crie uma conta" : "Faça login"}
          </button>
        </p>
      </div>
    </div>
  );
};
