// Efeito visual de folhas flutuantes — Server Component (sem "use client")
// As animações são feitas 100% em CSS injetado na tag <style>

interface FloatingLeavesProps {
  count?: number;
}

export const FloatingLeaves = ({ count = 10 }: FloatingLeavesProps) => {
  const items = Array.from({ length: Math.min(count, 10) });

  // Configurações das partículas (posição, tamanho, duração, delay)
  const configs = [
    { left: "25%", size: 80, duration: 25, delay: 0 },
    { left: "10%", size: 20, duration: 12, delay: 2 },
    { left: "70%", size: 20, duration: 20, delay: 4 },
    { left: "40%", size: 60, duration: 18, delay: 0 },
    { left: "65%", size: 20, duration: 22, delay: 0 },
    { left: "75%", size: 110, duration: 25, delay: 3 },
    { left: "35%", size: 150, duration: 20, delay: 7 },
    { left: "50%", size: 25, duration: 45, delay: 15 },
    { left: "20%", size: 15, duration: 35, delay: 2 },
    { left: "85%", size: 150, duration: 11, delay: 0 },
  ];

  return (
    <>
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        .leaf-particle {
          position: absolute;
          bottom: -150px;
          display: block;
          animation: float-up linear infinite;
          color: rgba(80, 200, 120, 0.12);
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        {items.map((_, i) => {
          const cfg = configs[i];
          return (
            <span
              key={i}
              className="leaf-particle"
              style={{
                left: cfg.left,
                width: cfg.size,
                height: cfg.size,
                animationDuration: `${cfg.duration}s`,
                animationDelay: `${cfg.delay}s`,
              }}
            >
              {/* Ícone SVG de folha inline (sem import de lucide no server) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </span>
          );
        })}
      </div>
    </>
  );
};

export default FloatingLeaves;
