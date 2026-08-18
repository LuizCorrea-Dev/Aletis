"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Check,
  Sparkles,
  HeartHandshake,
  Clock,
  Coins,
  CreditCard,
  Lock,
  BadgeCheck,
  Building2,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Sprout,
  Flame,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createCheckoutSessionAction } from "@/app/actions/billing";

interface BillingClientProps {
  userProfile: {
    id: string;
    name: string;
    username: string;
    tipoPerfil: string;
    vibeSaldoReal: number;
    vibeOrvalho: number;
  };
  subscription: {
    id: string;
    status: string;
    plan_duration_months: number;
    data_inicio: string;
    data_expiracao: string;
  } | null;
  paymentHistory: Array<{
    id: string;
    stripe_checkout_id: string;
    valor: string | number;
    moeda: string;
    tipo_compra: string;
    criado_em: string;
  }>;
  initialTab?: "pro" | "vibe" | "dashboard";
  status?: string;
  purchaseType?: string;
  vibeAmount?: number;
  months?: number;
}

export function BillingClient({
  userProfile,
  subscription,
  paymentHistory,
  initialTab,
  status,
  purchaseType,
  vibeAmount,
  months,
}: BillingClientProps) {
  const router = useRouter();
  const isVibePurchase = status === "success" && (purchaseType === "vibe_boost" || Boolean(vibeAmount));
  const isProPurchase = status === "success" && (purchaseType === "assinatura_profissional" || (Boolean(months) && !vibeAmount));

  const [activeTab, setActiveTab] = useState<"pro" | "vibe" | "dashboard">(
    initialTab || (isProPurchase || userProfile.tipoPerfil === "verificado" ? "dashboard" : "vibe")
  );
  const [currency, setCurrency] = useState<"brl" | "eur">("brl");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showVibeModal, setShowVibeModal] = useState<boolean>(isVibePurchase);
  const [showProModal, setShowProModal] = useState<boolean>(isProPurchase);

  // Efeito para notificar o Header sobre a atualização do saldo ao abrir o modal e revalidar rotas
  React.useEffect(() => {
    if (isVibePurchase && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vibe-updated", { detail: { newBalance: userProfile.vibeSaldoReal } }));
      router.refresh();
    }
  }, [isVibePurchase, userProfile.vibeSaldoReal, router]);


  // Formulário do Profissional
  const [proForm, setProForm] = useState({
    fullName: userProfile.name || "",
    registrationNumber: "",
    specialties: "",
    documentUrl: "",
  });
  const [selectedPlanMonths, setSelectedPlanMonths] = useState<number>(6);

  // Manipulador de Checkout Profissional
  const handleProCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proForm.fullName || !proForm.registrationNumber || !proForm.specialties) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios do credenciamento.");
      return;
    }

    setLoadingKey(`pro-${selectedPlanMonths}`);
    try {
      const res = await createCheckoutSessionAction({
        purchaseType: "assinatura_profissional",
        months: selectedPlanMonths as any,
        fullName: proForm.fullName,
        registrationNumber: proForm.registrationNumber,
        specialties: proForm.specialties,
        documentUrl: proForm.documentUrl,
        currency,
      });

      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        setErrorMessage(res.message || "Erro ao redirecionar para a Stripe.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao criar sessão de pagamento.");
    } finally {
      setLoadingKey(null);
    }
  };

  // Manipulador de Checkout VIBE Boost
  const handleVibeCheckout = async (packageId: "semente" | "orvalho_estendido" | "farol_comunidade") => {
    setErrorMessage(null);
    setLoadingKey(`vibe-${packageId}`);
    try {
      const res = await createCheckoutSessionAction({
        purchaseType: "vibe_boost",
        packageId,
        currency,
      });

      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        setErrorMessage(res.message || "Erro ao redirecionar para a Stripe.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao criar sessão de pagamento.");
    } finally {
      setLoadingKey(null);
    }
  };

  // Cálculo de dias restantes na assinatura
  const getRemainingDays = () => {
    if (!subscription?.data_expiracao) return 0;
    const exp = new Date(subscription.data_expiracao).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Monetização Ética & B2P (Business to Professional)
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
            Ecosistema de Apoio & Saúde Aletis
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            Financie a infraestrutura de apoio onde pessoas em crise recebem ajuda gratuita, sem exploração e sem dados vendidos.
          </p>

          {/* Seletor de Moedas & Navegação entre Abas */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab("pro")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "pro"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Profissional Verificado
              </button>
              <button
                onClick={() => setActiveTab("vibe")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "vibe"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Loja de VIBE Boosts
              </button>
              {userProfile.tipoPerfil === "verificado" && (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 font-bold shadow-lg shadow-amber-900/40"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Meu Painel Clínico
                </button>
              )}
            </div>

            {/* Alternador de Moeda (BRL / EUR) */}
            <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
              <span className="px-2 text-zinc-400">Moeda:</span>
              <button
                onClick={() => setCurrency("brl")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === "brl" ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                BRL (R$)
              </button>
              <button
                onClick={() => setCurrency("eur")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === "eur" ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                EUR (€)
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: CONFIRMAÇÃO DE VIBE BOOSTS (Apoio Voluntário) */}
        {showVibeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/60 overflow-hidden text-center space-y-6">
              <button
                type="button"
                onClick={() => setShowVibeModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-amber-400 p-1 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  Apoio Voluntário Confirmado!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-100">
                  Parabéns pelas VIBEs Adquiridas!
                </h2>
                <p className="text-zinc-400 text-sm">
                  Sua contribuição fortalece o Aletis, permitindo manter o acolhimento para pessoas em sofrimento psíquico 100% gratuito.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">VIBEs Adicionadas:</span>
                  <span className="font-extrabold text-amber-400 flex items-center gap-1 text-base">
                    <Zap className="w-4 h-4 fill-amber-400" /> +{vibeAmount || 20} VIBEs
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-zinc-800/80 pt-2">
                  <span className="text-zinc-400">Seu Saldo Permanente Atual:</span>
                  <span className="font-black text-violet-400 text-base">{userProfile.vibeSaldoReal} VIBEs</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href="/feed"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-sm transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2"
                >
                  <span>Ir para o Feed e Apoiar Pessoas</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowVibeModal(false)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
                >
                  Permanecer na Loja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CONFIRMAÇÃO DE ASSINATURA PROFISSIONAL VERIFICADO */}
        {showProModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden text-center space-y-6">
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  Credenciamento Ativado!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-100">
                  Parabéns! Perfil Profissional Verificado
                </h2>
                <p className="text-zinc-400 text-sm">
                  Sua assinatura profissional está ativa. Suas respostas técnicas e consolidadas agora contam com prioridade no feed de desabafos e selo verificado no perfil.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-left space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Selo Dourado de Suporte Verificado Ativo ({months || 1} Mês/Meses)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Multiplicador Peso 3 no Feed de Crise</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Financiador Oficial do Servidor e da Rede Aletis</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProModal(false);
                    setActiveTab("dashboard");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-zinc-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Acessar Meu Painel Clínico</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href="/feed"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors text-center"
                >
                  Ver Feed
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro Global */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB A: CENTRAL DO PROFISSIONAL DE SAÚDE (B2P) */}
        {activeTab === "pro" && (
          <div className="space-y-10">
            {/* Banner de Ética */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-emerald-300">
                    Sua assinatura profissional financia o servidor da comunidade
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    No Aletis, o acolhimento para pessoas em sofrimento psíquico é 100% gratuito. Como profissional credenciado (Psicólogo, Terapeuta, Conselheiro), a sua assinatura nos permite manter a rede viva, garantindo que você tenha um espaço ético para oferecer suporte técnico qualificado com visibilidade destacada.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de Credenciamento & Escolha de Planos */}
            <form onSubmit={handleProCheckout} className="space-y-8">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <BadgeCheck className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-zinc-100">1. Credenciamento Profissional</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Nome Completo Profissional *
                    </label>
                    <input
                      type="text"
                      required
                      value={proForm.fullName}
                      onChange={(e) => setProForm({ ...proForm, fullName: e.target.value })}
                      placeholder="Ex: Dra. Juliana Silveira"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Nº de Registro Profissional (CRP / OPP) *
                    </label>
                    <input
                      type="text"
                      required
                      value={proForm.registrationNumber}
                      onChange={(e) => setProForm({ ...proForm, registrationNumber: e.target.value })}
                      placeholder="Ex: CRP 06/123456 ou OPP 9876"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Especialidades & Abordagem *
                    </label>
                    <input
                      type="text"
                      required
                      value={proForm.specialties}
                      onChange={(e) => setProForm({ ...proForm, specialties: e.target.value })}
                      placeholder="Ex: TCC, Gestalt-terapia, Ansiedade, Luto, Trauma"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Grid de Seleção de Planos (3 a 6 Opções) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-zinc-100">2. Escolha o Ciclo de Assinatura</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Planos 1, 3, 6, 9, 12, 24 */}
                  {[
                    { months: 1, label: "Mensal", desc: "Experimente a visibilidade clínica", discount: null, priceBrl: "49,90", priceEur: "9,99" },
                    { months: 3, label: "Trimestral", desc: "Construa sua presença constante", discount: "10% OFF", priceBrl: "134,73", priceEur: "26,97" },
                    { months: 6, label: "Semestral", desc: "Plano recomendado para clínicas", discount: "15% OFF • Destaque", featured: true, priceBrl: "254,49", priceEur: "50,95" },
                    { months: 9, label: "Nove Meses", desc: "Maior retenção e peso no feed", discount: "20% OFF", priceBrl: "359,28", priceEur: "71,93" },
                    { months: 12, label: "Anual", desc: "Impacto contínuo o ano todo", discount: "30% OFF", priceBrl: "419,16", priceEur: "83,92" },
                    { months: 24, label: "Plurianual (2 Anos)", desc: "Máximo desconto e autoridade permanente", discount: "40% OFF", priceBrl: "718,56", priceEur: "143,86" },
                  ].map((plan) => {
                    const isSelected = selectedPlanMonths === plan.months;
                    return (
                      <div
                        key={plan.months}
                        onClick={() => setSelectedPlanMonths(plan.months)}
                        className={`relative cursor-pointer rounded-2xl p-6 transition-all border ${
                          isSelected
                            ? "bg-gradient-to-b from-emerald-950/60 to-zinc-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/50"
                            : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70"
                        }`}
                      >
                        {plan.discount && (
                          <span className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                            plan.featured ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {plan.discount}
                          </span>
                        )}

                        <div className="space-y-4">
                          <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{plan.months} Mês(es)</span>
                            <h3 className="text-xl font-extrabold text-zinc-100">{plan.label}</h3>
                            <p className="text-zinc-400 text-xs mt-1">{plan.desc}</p>
                          </div>

                          <div className="pt-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-400">
                                {currency === "eur" ? `${plan.priceEur} €` : `R$ ${plan.priceBrl}`}
                              </span>
                              <span className="text-zinc-500 text-xs">/ total do ciclo</span>
                            </div>
                          </div>

                          <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Selo Dourado Verificado no Perfil
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Multiplicador Peso 3 no Feed de Crise
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Acesso ao Customer Portal da Stripe
                            </li>
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Ação CTA */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={loadingKey !== null}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-zinc-950 font-extrabold text-base tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
                >
                  {loadingKey === `pro-${selectedPlanMonths}` ? (
                    <>
                      <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando com Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Registrar e Ir para Pagamento Seguro</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-zinc-500 text-xs mt-3 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Processamento de cartão protegido criptograficamente via Stripe Checkout
                </p>
              </div>
            </form>
          </div>
        )}

        {/* TAB B: LOJA DE VIBE BOOSTS (APOIO VOLUNTÁRIO) */}
        {activeTab === "vibe" && (
          <div className="space-y-8">
            {/* Indicador de Saldo do Usuário */}
            <div className="bg-gradient-to-r from-zinc-900 via-violet-950/40 to-zinc-900 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                  <Coins className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Seu Saldo Atual de Empatia</h3>
                  <p className="text-zinc-400 text-xs">VIBEs acumuladas organicamente ou por doação voluntária</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center sm:text-right">
                  <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Saldo Permanente</span>
                  <span className="text-2xl font-black text-violet-400 flex items-center gap-1 justify-center sm:justify-end">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /> {userProfile.vibeSaldoReal} VIBEs
                  </span>
                </div>
                <div className="h-10 w-px bg-zinc-800 hidden sm:block"></div>
                <div className="text-center sm:text-right">
                  <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Orvalho Diário</span>
                  <span className="text-2xl font-black text-teal-400 flex items-center gap-1 justify-center sm:justify-end">
                    <Droplets className="w-5 h-5 text-teal-400 fill-teal-400" /> {userProfile.vibeOrvalho} VIBEs
                  </span>
                </div>
              </div>
            </div>

            {/* Cards de Pacotes estilo Loja de Games */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pacote Semente */}
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-6 space-y-6 transition-all hover:bg-zinc-900/90 relative group">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-full">Semente</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-zinc-100">20 VIBEs</h3>
                  <p className="text-zinc-400 text-xs mt-1">Ideal para impulsionar seus primeiros desabafos sem esperar o ciclo diário.</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-400">
                    {currency === "eur" ? "1,99 €" : "R$ 9,90"}
                  </span>
                  <span className="text-xs text-zinc-500">Saldo Permanente</span>
                </div>

                <button
                  onClick={() => handleVibeCheckout("semente")}
                  disabled={loadingKey !== null}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-md shadow-violet-900/30 flex items-center justify-center gap-2"
                >
                  {loadingKey === "vibe-semente" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Comprar Pacote Semente
                    </>
                  )}
                </button>
              </div>

              {/* Pacote Orvalho Estendido */}
              <div className="bg-gradient-to-b from-violet-950/30 to-zinc-900 border border-violet-500/40 rounded-2xl p-6 space-y-6 transition-all relative group shadow-lg shadow-violet-950/40">
                <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-violet-500 text-zinc-950">
                  Mais Popular
                </span>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <Droplets className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-full">Popular</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-zinc-100">100 VIBEs</h3>
                  <p className="text-zinc-400 text-xs mt-1">Recarregue sua reserva de apoio para incentivar dezenas de comentários na rede.</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-violet-400">
                    {currency === "eur" ? "4,99 €" : "R$ 24,90"}
                  </span>
                  <span className="text-xs text-zinc-500">Saldo Permanente</span>
                </div>

                <button
                  onClick={() => handleVibeCheckout("orvalho_estendido")}
                  disabled={loadingKey !== null}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:brightness-110 text-white font-bold text-sm transition-all shadow-md shadow-violet-900/40 flex items-center justify-center gap-2"
                >
                  {loadingKey === "vibe-orvalho_estendido" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Comprar Orvalho Estendido
                    </>
                  )}
                </button>
              </div>

              {/* Pacote Farol da Comunidade */}
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-6 transition-all hover:bg-zinc-900/90 relative group">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Flame className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full">Apoio Máximo</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-zinc-100">300 VIBEs</h3>
                  <p className="text-zinc-400 text-xs mt-1">Para guardiões da comunidade que desejam patrocinar discussões essenciais.</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-400">
                    {currency === "eur" ? "11,99 €" : "R$ 59,90"}
                  </span>
                  <span className="text-xs text-zinc-500">Saldo Permanente</span>
                </div>

                <button
                  onClick={() => handleVibeCheckout("farol_comunidade")}
                  disabled={loadingKey !== null}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-900/30 flex items-center justify-center gap-2"
                >
                  {loadingKey === "vibe-farol_comunidade" ? (
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Comprar Farol da Comunidade
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Aviso Ético de Uso */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300">
                🛡️ Aviso de Uso Ético e Transparência Aletis
              </p>
              <p>
                A compra de VIBEs é 100% voluntária e destina-se a apoiar a sustentabilidade do projeto. Postar desabafos e receber acolhimento básico na rede sempre será gratuito para todos os usuários.
              </p>
            </div>
          </div>
        )}

        {/* TAB C: DASHBOARD DO PROFISSIONAL VERIFICADO (PÓS-PAGAMENTO) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Status do Selo Verificado */}
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-zinc-100">Suporte Verificado Ativo</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        Credenciado
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-1">
                      Sua assinatura clínica está ativa e garantindo relevância técnica às suas respostas.
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Tempo Restante de Validade</span>
                  <span className="text-2xl font-black text-amber-400 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> {getRemainingDays()} Dias
                  </span>
                </div>
              </div>

              {/* Indicador Luminoso de Multiplicador de Algoritmo */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <span className="text-sm font-bold text-zinc-200 block">Multiplicador de Algoritmo</span>
                    <span className="text-xs text-zinc-400">
                      Seus comentários consolidados têm <strong className="text-emerald-400">Peso 3 de visibilidade</strong> nos desabafos em crise.
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Histórico de Faturamento */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" /> Histórico de Faturamento
                </h3>
              </div>

              {paymentHistory.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4 text-center">Nenhum histórico de pagamento localizado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Valor</th>
                        <th className="p-3">ID Stripe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {paymentHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-950/40">
                          <td className="p-3">{new Date(item.criado_em).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3 capitalize">{item.tipo_compra.replace("_", " ")}</td>
                          <td className="p-3 font-semibold text-emerald-400">
                            {item.moeda} {parseFloat(String(item.valor)).toFixed(2)}
                          </td>
                          <td className="p-3 text-zinc-500 font-mono">{item.stripe_checkout_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
