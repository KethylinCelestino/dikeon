import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * O middleware do Clerk lança se as chaves não estiverem no ambiente. Como a
 * conta é opcional no Dikeon (sem ela o progresso fica no localStorage), sem
 * chaves passamos direto em vez de derrubar o site inteiro.
 */
const configurado = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default configurado ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Tudo menos arquivos estáticos e internos do Next.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
