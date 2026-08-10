import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/utils/auth";
import {
  getCommunityByInviteCodeAction,
} from "@/app/actions/community-actions";
import { Globe, Lock, Users, Globe2 } from "lucide-react";
import InviteClientWrapper from "./InviteClientWrapper";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;

  if (!code) {
    return <InviteError error="Código de convite inválido." />;
  }

  const community = await getCommunityByInviteCodeAction(code);

  if (!community) {
    return <InviteError error="Comunidade não encontrada ou convite expirado." />;
  }

  const user = await getCurrentUser();
  const hasSession = !!user;

  const isPublic = community.privacy === "PUBLIC";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center p-4">
      {/* Background Banner Blur */}
      {community.bannerUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={community.bannerUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-15 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950"></div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg animate-in fade-in duration-700">
        {/* Aletis Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800/80 mb-4 backdrop-blur-md">
            <span className="text-mint-500 font-extrabold font-display tracking-wider text-xs">ALETIS</span>
            <span className="text-slate-400 text-xs font-semibold">Convite Especial</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-display text-white mb-3">
            Junte-se à jornada.
          </h1>
          <p className="text-slate-400 text-sm md:text-base px-2">
            Você foi convidado para participar de um espaço exclusivo. Descubra, conecte-se e evolua junto com a comunidade.
          </p>
        </div>

        {/* Card da Comunidade */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="h-32 w-full relative">
            {community.bannerUrl && (
              <img src={community.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex justify-between items-end mb-4 -mt-12 relative z-10">
              <img
                src={community.avatarUrl}
                alt="Logo"
                className="w-24 h-24 rounded-[1.5rem] border-4 border-slate-900 object-cover bg-slate-850 shadow-lg"
              />
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-350">
                {isPublic ? (
                  <Globe size={14} className="text-mint-500" />
                ) : (
                  <Lock size={14} className="text-gold-400" />
                )}
                {isPublic ? "PÚBLICA" : "PRIVADA"}
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 font-display">{community.name}</h2>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">
              {community.description}
            </p>

            {community.tags && community.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {community.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={tag}
                    className="text-xs text-mint-500 bg-mint-500/10 px-2.5 py-1 rounded-lg font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold bg-slate-950/40 p-3 rounded-2xl border border-slate-850 mb-6">
              <Users size={16} />
              <span>{community.memberCount} Membros na comunidade</span>
            </div>

            {/* Ações de Cliente */}
            <InviteClientWrapper
              community={community}
              hasSession={hasSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 max-w-md w-full text-center shadow-2xl backdrop-blur-sm">
        <Globe2 className="mx-auto mb-4 text-slate-600" size={48} />
        <h1 className="text-2xl font-black font-display text-white mb-2">Convite Inválido</h1>
        <p className="text-slate-400 text-sm mb-8">{error}</p>
        <Link
          href="/"
          className="bg-mint-500 hover:bg-mint-600 text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition-all w-full block text-center"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
