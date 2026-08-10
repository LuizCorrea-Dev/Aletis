import { SideNavigation } from "@/components/organisms/SideNavigation";
import { Header } from "@/components/organisms/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col pt-[73px]">
      {/* Header Fixo no Topo */}
      <Header />

      <div className="flex flex-1 relative">
        {/* Sidebar Desktop e Mobile Navigation integrados */}
        <SideNavigation />

        {/* Conteúdo Principal — alinhado com a sidebar no desktop */}
        <main className="flex-grow min-w-0 xl:pl-24 pb-24 xl:pb-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
