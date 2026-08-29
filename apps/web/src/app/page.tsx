import React from "react";
import { 
  Feather, Zap, Shield, Users, Handshake, 
  Flame, ArrowRight, CheckCircle2, Lock 
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import { AletisLogo, FloatingLeaves } from "@/components/atoms";

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Se já autenticado, vai direto para o Santuário (Feed)
  if (user) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-[#50c878]/30 relative overflow-x-hidden">
      {/* Background Decorativo com Animação de Folhas Flutuantes */}
      <FloatingLeaves count={12} />

      {/* --- NAVEGAÇÃO --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AletisLogo size="md" />
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#proposito" className="hover:text-[#50c878] transition-colors">Propósito</a>
            <a href="#economia" className="hover:text-[#50c878] transition-colors">Economia VIBE</a>
            <a href="#sentinela" className="hover:text-[#50c878] transition-colors">O Sentinela</a>
            <a href="#planos" className="hover:text-[#50c878] transition-colors">Profissionais</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-[#50c878] transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="px-5 py-2 bg-[#50c878] text-slate-950 text-sm font-extrabold rounded-full hover:bg-[#50c878]/90 transition-all shadow-lg shadow-[#50c878]/20">
              Começar agora
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#50c878]/10 border border-[#50c878]/30 text-[#50c878] text-xs font-bold mb-8 animate-fade-in">
            <Flame className="w-4 h-4" />
            REVOLUÇÃO SLOW TECH
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Traga sua verdade <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50c878] to-emerald-400">
              para a luz.
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Inspirada na <strong>Aletheia</strong> grega, o Aletis é a rede social onde a vulnerabilidade é recompensada e a empatia é a única moeda que importa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/cadastro" className="px-8 py-4 bg-[#50c878] text-slate-950 font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#50c878]/90 transition-all shadow-xl shadow-[#50c878]/20">
              Criar Perfil Grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#proposito" className="px-8 py-4 bg-slate-800/80 border border-slate-700 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all text-center">
              Ver Manifesto
            </a>
          </div>
        </div>
      </section>

      {/* --- AMBIENTES --- */}
      <section id="proposito" className="py-20 bg-slate-900/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-[#50c878]/50 transition-all group">
              <div className="w-12 h-12 bg-[#50c878]/15 rounded-2xl flex items-center justify-center text-[#50c878] mb-6 group-hover:scale-110 transition-transform">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Santuário (Feed Principal)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Desabafos crus em ordem cronológica. Sem algoritmos de retenção, apenas a realidade nua e crua aguardando acolhimento.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-yellow-500/50 transition-all group">
              <div className="w-12 h-12 bg-yellow-500/15 rounded-2xl flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Átrio da Leveza</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Um contrapeso de esperança, humor e inspiração visual no estilo Pinterest. Um respiro emocional para os dias difíceis.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/15 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Tribos & Chamadas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comunidades temáticas com canais de texto e vídeo em grupo. Terapia coletiva orgânica dentro de grupos de interesse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ECONOMIA VIBE --- */}
      <section id="economia" className="py-24 px-6 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-16">
          <div>
            <h2 className="text-4xl font-black text-white mb-8 leading-tight">
              A Economia da Empatia <br/>
              <span className="text-[#50c878] font-semibold text-2xl tracking-wide uppercase">Soma Zero Ajustada</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 text-[#50c878]"><Zap className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-white">VIBE ZAP (Apoio): Transferência Atômica</h4>
                  <p className="text-slate-400 text-sm">Apoiar custa saldo emocional. Isso garante que cada incentivo recebido seja valioso e intencional.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-[#50c878]"><Handshake className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-white">O Ciclo do Orvalho</h4>
                  <p className="text-slate-400 text-sm">Receba VIBES diárias temporárias que expiram em 24h se não forem doadas para apoiar outros criadores.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-[#50c878]"><Lock className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-white">Privacidade Inviolável</h4>
                  <p className="text-slate-400 text-sm">Desabafe de forma anônima. Nossa segurança no banco de dados mascara sua identidade até de invasores.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#50c878]/15 blur-[120px] rounded-full"></div>
            <div className="bg-slate-900/80 p-8 rounded-[40px] border border-slate-800 shadow-2xl relative z-10">
               <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo do Sistema</span>
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                    <Zap className="w-4 h-4 fill-yellow-400" /> 100 VIBES
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#50c878] w-3/4 rounded-full"></div>
                  </div>
                  <p className="text-xs text-slate-400 text-center italic">"Aqui, o apoio é lastreado em esforço real."</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- O SENTINELA --- */}
      <section id="sentinela" className="py-24 bg-[#50c878] relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-950">
          <div className="w-20 h-20 bg-slate-950 text-[#50c878] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl border border-slate-800">
             <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight">O Sentinela: Seu Mentor Estoico</h2>
          <p className="text-lg font-semibold opacity-95 leading-relaxed mb-8 max-w-3xl mx-auto">
            Nossa Inteligência Artificial local não te vigia para punir, mas para guiar. Utilizando o Filtro de Epicteto e perguntas socráticas, o Sentinela ajuda você a encontrar o "Porquê" por trás da sua dor.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-5 py-2 bg-slate-950/20 text-slate-950 rounded-full text-xs font-extrabold uppercase tracking-widest border border-slate-950/30">Verdade</span>
            <span className="px-5 py-2 bg-slate-950/20 text-slate-950 rounded-full text-xs font-extrabold uppercase tracking-widest border border-slate-950/30">Necessidade</span>
            <span className="px-5 py-2 bg-slate-950/20 text-slate-950 rounded-full text-xs font-extrabold uppercase tracking-widest border border-slate-950/30">Gentileza</span>
          </div>
        </div>
      </section>

      {/* --- ESPAÇO DO PROFISSIONAL DE SAÚDE --- */}
      <section id="planos" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#50c878]/10 border border-[#50c878]/30 text-[#50c878] text-xs font-bold mb-4">
              <Shield className="w-4 h-4" /> ALIANÇA ÉTICA & CLINICA
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Espaço do Profissional de Saúde
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Conecte sua prática clínica a um ecossistema <strong>Slow Tech</strong> transparente. Financie a independência da plataforma enquanto oferece escuta qualificada a quem mais precisa.
            </p>
          </div>

          {/* Três Pilares da Assinatura Profissional */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* 1. Para Quem É */}
            <div className="p-8 rounded-[32px] bg-slate-900/70 border border-slate-800 hover:border-[#50c878]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 bg-[#50c878]/15 border border-[#50c878]/30 rounded-2xl flex items-center justify-center text-[#50c878] mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Para Quem É?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Desenhado exclusivamente para <strong>Psicólogos, Psiquiatras, Terapeutas, Coaches de Saúde Mental</strong> e profissionais de acolhimento humano.
                </p>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Profissionais com registro ou certificação
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Terapeutas de abordagens integrativas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Facilitadores de grupos de apoio
                </li>
              </ul>
            </div>

            {/* 2. O Porquê / Propósito */}
            <div className="p-8 rounded-[32px] bg-slate-900/70 border-2 border-[#50c878]/60 shadow-xl shadow-[#50c878]/5 flex flex-col justify-between group relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#50c878] text-slate-950 px-4 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                Propósito de Aliança
              </div>
              <div>
                <div className="w-14 h-14 bg-[#50c878]/20 border border-[#50c878]/50 rounded-2xl flex items-center justify-center text-[#50c878] mb-6 group-hover:scale-110 transition-transform">
                  <Handshake className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">O Porquê & Propósito</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Financiar o ecossistema autônomo e livre de anúncios apelativos, sustentando a soberania de dados e garantindo um refúgio seguro de escuta ativa.
                </p>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Sustentar a rede social Slow Tech livre de anúncios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Presença de autoridade ética e acolhedora
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Contribuir com mentoria e cura coletiva
                </li>
              </ul>
            </div>

            {/* 3. Vantagens & Funcionalidades */}
            <div className="p-8 rounded-[32px] bg-slate-900/70 border border-slate-800 hover:border-[#50c878]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 bg-[#50c878]/15 border border-[#50c878]/30 rounded-2xl flex items-center justify-center text-[#50c878] mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Vantagens & Ferramentas</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Recursos exclusivos para exercer o acolhimento com visibilidade diferenciada e métricas éticas.
                </p>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> <strong>Visibilidade Peso 3</strong> em respostas de apoio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> <strong>Selo Verificado Clínico</strong> no perfil
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#50c878]" /> Mediação de salas de áudio e vídeo nas Tribos
                </li>
              </ul>
            </div>
          </div>

          {/* Banner de Chamada para Ação */}
          <div className="p-8 md:p-12 rounded-[32px] bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h3 className="text-2xl md:text-3xl font-black text-white">
                Pronto para fazer parte da rede de acolhimento profissional?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Inscreva-se como profissional e ative suas credenciais clínicas no Aletis.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/billing"
                  className="px-8 py-4 bg-[#50c878] text-slate-950 font-extrabold rounded-2xl hover:bg-[#50c878]/90 transition-all shadow-xl shadow-[#50c878]/20 flex items-center justify-center gap-2 text-sm"
                >
                  Conhecer Painel do Profissional <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="mb-6">
              <AletisLogo size="md" />
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Onde a tecnologia serve às pessoas, e não o contrário. 100% Autônomo, Privado e Self-hosted.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Plataforma</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="/feed" className="hover:text-white transition-colors">Santuário</Link></li>
              <li><Link href="/atrio" className="hover:text-white transition-colors">Átrio</Link></li>
              <li><Link href="/communities" className="hover:text-white transition-colors">Tribos</Link></li>
              <li><Link href="/billing" className="hover:text-white transition-colors">Para Profissionais</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Legal</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidade RLS</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Soberania de Dados</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
