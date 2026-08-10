"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Shield, Lock } from "lucide-react";
import { joinCommunityAction } from "@/app/actions/community-actions";
import { Community } from "@aletis/domain";

interface InviteClientWrapperProps {
  community: Community;
  hasSession: boolean;
}

export default function InviteClientWrapper({
  community,
  hasSession,
}: InviteClientWrapperProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequested, setIsRequested] = useState(community.currentUserRole === "PENDING");

  const handleAction = async () => {
    if (!hasSession) {
      // Redireciona para a raiz onde está o formulário de autenticação
      router.push("/");
      return;
    }

    if (community.isMember) {
      router.push(`/communities/${community.id}`);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await joinCommunityAction(community.id);
      if (result.success) {
        if (result.data?.role === "PENDING") {
          setIsRequested(true);
          alert(
            "Solicitação de acesso enviada com sucesso! Aguarde a aprovação dos moderadores."
          );
        } else {
          router.push(`/communities/${community.id}`);
        }
      } else {
        alert(result.message || "Erro ao processar sua solicitação.");
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao entrar na comunidade.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isPublic = community.privacy === "PUBLIC";

  return (
    <div className="w-full">
      <button
        onClick={handleAction}
        disabled={isProcessing || isRequested}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${community.isMember
          ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          : isRequested
            ? "bg-orange-500/10 text-orange-500 border border-orange-500/30 cursor-default"
            : "bg-mint-500 hover:bg-mint-600 text-slate-900 shadow-mint-500/10"
          }`}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={24} />
        ) : !hasSession ? (
          <>
            <span>Fazer Login para Participar</span>
            <ArrowRight size={20} />
          </>
        ) : community.isMember ? (
          <>
            <span>Acessar Comunidade</span>
            <ArrowRight size={20} />
          </>
        ) : isRequested ? (
          <>
            <span>Aguardando Aprovação</span>
            <Lock size={18} />
          </>
        ) : isPublic ? (
          <>
            <span>Participar Agora</span>
            <Shield size={20} />
          </>
        ) : (
          <>
            <span>Solicitar Acesso</span>
            <Lock size={20} />
          </>
        )}
      </button>

      {!hasSession && (
        <p className="text-center text-slate-500 text-xs mt-4">
          Você precisará de uma conta no Aletis para acessar este grupo.
        </p>
      )}
    </div>
  );
}
