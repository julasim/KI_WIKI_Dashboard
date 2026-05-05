import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * Auth.js v5 Konfiguration.
 *
 * Single-User-Setup mit User aus ENV (DASHBOARD_USER_EMAIL +
 * DASHBOARD_USER_PASSWORD_HASH). Später erweiterbar zu DB-User.
 *
 * Session: JWT-basiert (kein DB-Adapter nötig). Cookie ist HttpOnly + Secure
 * im Production-Mode.
 */

const ALLOWED_EMAIL = process.env.DASHBOARD_USER_EMAIL?.trim().toLowerCase();
const PASSWORD_HASH = process.env.DASHBOARD_USER_PASSWORD_HASH?.trim();

if (!ALLOWED_EMAIL || !PASSWORD_HASH) {
  // Boot-Time-Warnung — Server startet trotzdem aber Login wird scheitern.
  console.warn(
    "[auth] DASHBOARD_USER_EMAIL oder DASHBOARD_USER_PASSWORD_HASH fehlt — " +
      "Login wird nicht funktionieren. Setze beide ENV-Variablen.",
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 Tage
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;
        if (!ALLOWED_EMAIL || !PASSWORD_HASH) return null;
        if (email !== ALLOWED_EMAIL) return null;

        const ok = await bcrypt.compare(password, PASSWORD_HASH);
        if (!ok) return null;

        return {
          id: "primary",
          email: ALLOWED_EMAIL,
          name: "Julius",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
