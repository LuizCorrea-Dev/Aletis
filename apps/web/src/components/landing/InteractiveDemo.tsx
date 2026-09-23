"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Share2, EyeOff, Shield, Sparkles, X, Bookmark, Zap, Send, Brain, Loader2 } from "lucide-react";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"atual" | "atrio">("atrio");
  const [commentText, setCommentText] = useState("");
  const [sentinelStatus, setSentinelStatus] = useState<"idle" | "analyzing" | "rejected">("idle");
  const [vibeSent, setVibeSent] = useState(false);
  const [showVibeToast, setShowVibeToast] = useState(false);

  const minChars = 100;
  const currentChars = commentText.length;
  const charsNeeded = Math.max(0, minChars - currentChars);
  const percentage = Math.min(100, Math.floor((currentChars / minChars) * 100));

  const handleCommentSubmit = () => {
    if (currentChars < minChars || sentinelStatus !== "idle") return;

    setSentinelStatus("analyzing");

    // Simulate AI analysis delay
    setTimeout(() => {
      setSentinelStatus("rejected");
    }, 2000);
  };

  const handleRetry = () => {
    setSentinelStatus("idle");
    setCommentText("");
  };

  const handleVibeClick = () => {
    if (vibeSent) return;
    setVibeSent(true);
    setShowVibeToast(true);
    setTimeout(() => {
      setShowVibeToast(false);
    }, 3000);
  };

  return (
    <section className="py-24 bg-navy text-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-semibold mb-6">
            Conheça os Ambientes
          </h2>
          <p className="font-sans text-lg text-cream/70 max-w-2xl mx-auto">
            Veja a diferença entre o design hostil das redes tradicionais e a arquitetura de paz do Aletis.
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Tabs */}
          <div className="flex p-1 rounded-full bg-cream/10 backdrop-blur-md mb-12 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("atual")}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === "atual"
                ? "bg-red-500 text-white shadow-lg"
                : "text-cream/70 hover:text-cream cursor-pointer"
                }`}
            >
              A Rede Social Atual
            </button>
            <button
              onClick={() => setActiveTab("atrio")}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "atrio"
                ? "bg-navy-light border border-white/10 text-white shadow-lg"
                : "text-cream/70 hover:text-cream cursor-pointer"
                }`}
            >
              O Atrio
            </button>
          </div>

          {/* Demo Container */}
          <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out h-[700px] flex items-center justify-center bg-navy border border-white/5 relative">
            {activeTab === "atual" && (
              <div className="w-full h-full bg-white flex flex-col p-6 animate-in fade-in duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  99+ Notificações
                </div>

                <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-4">
                  <div className="size-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="h-48 w-full bg-gray-100 rounded-xl" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded" />
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4 text-gray-500 mt-4">
                  <div className="flex gap-6">
                    <Heart className="size-6 text-red-500 fill-red-500" />
                    <MessageCircle className="size-6" />
                    <Share2 className="size-6" />
                  </div>
                  <div className="font-bold text-sm">1.4M likes</div>
                </div>

                <div className="absolute bottom-16 left-4 right-4 bg-yellow-300 border-2 border-red-500 p-4 rounded-xl shadow-xl transform -rotate-2">
                  <p className="text-black font-black text-center text-lg uppercase">
                    Compre agora! Oferta imperdível!
                  </p>
                </div>
              </div>
            )}

            {activeTab === "atrio" && (
              <div className="w-full h-full bg-[#F7F5F0] flex flex-col animate-in fade-in duration-300 relative">
                {/* VIBE Toast Notification */}
                {showVibeToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#14213D] text-[#F7F5F0] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4 fade-in fade-out zoom-in-95 duration-300 z-20">
                    <Zap className="size-3.5 text-[#C4820A] fill-[#C4820A]" />
                    -1 VIBE debitada
                  </div>
                )}

                {/* Header Image Area */}
                <div className="h-36 w-full relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" alt="Serenidade Matinal" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-4 right-4 p-2 bg-[#14213D]/40 rounded-full cursor-pointer hover:bg-[#14213D]/60 transition-colors backdrop-blur-sm">
                    <X className="size-4 text-white" />
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Title & Tags */}
                  <h3 className="font-display text-2xl font-bold text-[#14213D] mb-2">Serenidade Matinal</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1FA97D] text-[10px] font-semibold border border-[#E3F4EC]">#paz</span>
                    <span className="px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1FA97D] text-[10px] font-semibold border border-[#E3F4EC]">#silêncio</span>
                    <span className="px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1FA97D] text-[10px] font-semibold border border-[#E3F4EC]">#manhã</span>
                  </div>

                  {/* Content */}
                  <p className="text-[#14213D]/90 text-base mb-4 font-sans">
                    A paz que habita no silêncio da manhã transforma o olhar sobre a vida.
                  </p>

                  {/* Meta Bar */}
                  <div className="flex items-center justify-between border-t border-[#E4E0D6] pt-3 mb-4">
                    <span className="text-xs text-[#5C6472] font-semibold">Por: Aletis Art</span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleVibeClick}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors cursor-pointer ${vibeSent
                            ? "bg-[#FBEFD6] border-[#FBEFD6]"
                            : "bg-[#FFFFFF] border-[#E4E0D6] hover:bg-[#f1f5f9]"
                          }`}
                      >
                        <Zap className={`size-3.5 ${vibeSent ? "text-[#C4820A] fill-[#C4820A]" : "text-[#5C6472]"}`} />
                        <span className={`text-xs font-bold ${vibeSent ? "text-[#C4820A]" : "text-[#14213D]"}`}>
                          {vibeSent ? 43 : 42}
                        </span>
                      </button>
                      <Bookmark className="size-4 text-[#5C6472] hover:text-[#14213D] transition-colors cursor-pointer" />
                      <Share2 className="size-4 text-[#5C6472] hover:text-[#14213D] transition-colors cursor-pointer" />
                    </div>
                  </div>

                  {/* Discussion Area */}
                  <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E4E0D6] mt-auto relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-[#5C6472]">
                        <MessageCircle className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#14213D]">Comentário</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEFD6] border border-[#FBEFD6] text-[#C4820A] text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="size-3" />
                        2 Vibes (Soma Zero)
                      </div>
                    </div>

                    <p className="text-center text-[13px] text-[#5C6472] mb-4 font-sans">
                      Nenhum comentário ainda. Seja o primeiro a adicionar valor à conversa!
                    </p>

                    <div className="bg-[#F7F5F0] border border-[#E4E0D6] rounded-xl overflow-hidden focus-within:border-[#1FA97D]/50 transition-colors">
                      <textarea
                        className="w-full bg-transparent p-3 text-sm text-[#14213D] placeholder:text-[#5C6472]/70 resize-none outline-none min-h-[60px]"
                        placeholder="Adicione valor à conversa (mínimo 100 caracteres)..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={sentinelStatus !== "idle"}
                      />
                      <div className="flex items-center justify-between px-3 py-2.5 bg-[#FFFFFF] border-t border-[#E4E0D6]">
                        <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${charsNeeded > 0 ? 'text-[#B3402F]' : 'text-[#1FA97D]'}`}>
                          {charsNeeded > 0 ? `Faltam ${charsNeeded} chars` : 'Mínimo atingido'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold transition-colors ${charsNeeded > 0 ? 'text-[#B3402F]' : 'text-[#1FA97D]'}`}>
                            {currentChars}/{minChars}
                          </span>
                          <button
                            onClick={handleCommentSubmit}
                            disabled={currentChars < minChars || sentinelStatus !== "idle"}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${currentChars >= minChars && sentinelStatus === "idle"
                              ? "bg-[#14213D] text-[#F7F5F0] hover:bg-[#14213D]/90 cursor-pointer"
                              : "bg-[#E4E0D6]/50 text-[#5C6472]/50 cursor-not-allowed"
                              }`}
                          >
                            {sentinelStatus === "analyzing" ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Send className="size-3" />
                            )}
                            Comentar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sentinel Overlay */}
                    {sentinelStatus === "rejected" && (
                      <div className="absolute inset-0 bg-[#FFFFFF]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="size-10 rounded-full bg-[#E3F4EC] flex items-center justify-center mb-3 border border-[#1FA97D]/30">
                          <Brain className="size-5 text-[#1FA97D]" />
                        </div>
                        <h4 className="font-display font-semibold text-[#14213D] text-base mb-1.5">Reformulação Socrática</h4>
                        <p className="text-xs text-[#5C6472] font-sans mb-4">
                          "Percebo que suas palavras trazem uma forte carga emocional. Tente reformular a ideia focando no aprendizado e na gentileza."
                        </p>
                        <button
                          onClick={handleRetry}
                          className="px-5 py-1.5 rounded-full bg-[#14213D] text-[#F7F5F0] font-semibold text-xs hover:bg-[#14213D]/90 transition-colors cursor-pointer"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
