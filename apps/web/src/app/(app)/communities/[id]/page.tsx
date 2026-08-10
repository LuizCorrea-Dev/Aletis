import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";
import {
  getCommunityByIdAction,
  getChannelsAction,
} from "@/app/actions/community-actions";
import CommunityViewClient from "./CommunityViewClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailsPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    redirect("/communities");
  }

  const community = await getCommunityByIdAction(id);
  
  if (!community) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-2xl font-black font-display text-white mb-2">Comunidade não encontrada</h1>
          <p className="text-slate-450 text-sm mb-6">
            O grupo solicitado não existe ou você não possui permissão para acessá-lo.
          </p>
          <a
            href="/communities"
            className="bg-mint-500 hover:bg-mint-600 text-slate-900 px-6 py-3 rounded-2xl font-bold transition-all w-full block text-center"
          >
            Voltar ao Catálogo
          </a>
        </div>
      </div>
    );
  }

  const channels = await getChannelsAction(id);
  const user = await getCurrentUser();

  let currentUserProfile = null;
  if (user) {
    currentUserProfile = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl || "",
    };
  }

  return (
    <CommunityViewClient
      initialCommunity={community}
      initialChannels={channels}
      currentUserProfile={currentUserProfile}
    />
  );
}
