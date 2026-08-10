import { getCurrentUser } from "@/utils/auth";
import { AuthForm } from "@/components/features/AuthForm";
import { FloatingLeaves } from "@/components/atoms/FloatingLeaves";
import { Feather } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Decorativo com Folhas Flutuantes */}
      <FloatingLeaves count={10} />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div
          className="p-4 rounded-full mb-3 border shadow-2xl backdrop-blur-md"
          style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)" }}
        >
          <Feather style={{ color: "var(--theme-primary)" }} size={42} strokeWidth={1.75} />
        </div>
        <h1
          className="text-4xl font-extrabold tracking-tight mb-1 font-display"
          style={{ color: "var(--theme-foreground)" }}
        >
          ALETIS
        </h1>
        <p
          className="text-sm font-light italic text-center max-w-sm"
          style={{ color: "var(--theme-muted-foreground)" }}
        >
          "Sua jornada de leveza começa no agora"
        </p>
      </div>

      {/* Formulário de Autenticação */}
      <div className="w-full flex justify-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <AuthForm />
      </div>

      <footer className="absolute bottom-4 text-slate-600 text-[11px] text-center z-10 font-medium">
        © 2026 Aletis Social. Respire fundo.
      </footer>
    </div>
  );
}
