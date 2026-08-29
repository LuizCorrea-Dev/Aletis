import { NextResponse, type NextRequest } from "next/server";

/**
 * Definição das rotas protegidas que exigem autenticação no Aletis
 * Inclui o Santuário (Feed), Átrio, Tribos/Comunidades, Perfil e Billing
 */
const PROTECTED_PATHS = [
  "/feed",
  "/atrio",
  "/communities",
  "/profile",
  "/connections",
  "/billing",
  "/u",
];

/**
 * Rotas de autenticação que não devem ser acessadas por quem já está logado
 */
const AUTH_ONLY_PATHS = ["/login", "/cadastro"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificação de sessão local (aletis_session)
  const sessionCookie = request.cookies.get("aletis_session")?.value;
  const hasSession = !!sessionCookie && sessionCookie.length > 10;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  // 1. Redirecionar usuários logados tentando acessar a Landing Page (/) ou telas de Auth
  if (hasSession && (pathname === "/" || isAuthPage)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // 2. Proteger rotas privadas para usuários não logados
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
