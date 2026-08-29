"use client";

import React, { useState, useTransition } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AletisLogo, FloatingLeaves } from "@/components/atoms";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 selection:bg-[#2dd4bf]/30 relative overflow-hidden">
      {/* Animação de Folhas Flutuantes no Background */}
      <FloatingLeaves count={10} />

      {/* Logo e Título */}
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity z-10">
        <AletisLogo size="lg" />
      </Link>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-[32px] shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm italic">"A sua jornada recomeça no agora."</p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 animate-in fade-in">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          {/* Campo de E-mail */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" />
              <input 
                name="email"
                type="email" 
                required
                placeholder="exemplo@email.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2dd4bf]/50 focus:ring-4 focus:ring-[#2dd4bf]/10 transition-all"
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Senha</label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" />
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2dd4bf]/50 focus:ring-4 focus:ring-[#2dd4bf]/10 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Botão de Submissão */}
          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-[#2dd4bf] text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2dd4bf]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#2dd4bf]/10 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Acessar Santuário
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" className="text-white font-bold hover:text-[#2dd4bf] transition-colors">
            Cadastre-se grátis
          </Link>
        </div>
      </div>
      
      <p className="mt-12 text-slate-600 text-xs text-center max-w-xs leading-relaxed">
        Protegido pela arquitetura de Soberania de Dados Aletis. Suas credenciais são verificadas offline na nossa infraestrutura privada.
      </p>
    </div>
  );
}
