import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/components/providers/ThemeInitializer";
import { DEFAULT_THEME } from "@/config/theme.config";

export const metadata: Metadata = {
  title: "Aletis | Comunidade Segura e Empática",
  description: "Compartilhe suas vibes em um ambiente acolhedor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-theme={DEFAULT_THEME}
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
