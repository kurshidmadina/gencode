import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function getNextAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  // `next build` imports authOptions while collecting static page data, including 404 pages.
  // Do not require DATABASE_URL just to render logged-out navigation during build.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "gencode-build-time-nextauth-placeholder-do-not-use-at-runtime";
  }

  return undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const credentials = credentialsSchema.safeParse(rawCredentials);
        if (!credentials.success) return null;
        if (!(await canReachDatabase())) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.data.email.toLowerCase() }
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          username: user.username
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
        token.username = (user as { username?: string }).username ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role ?? "USER");
        session.user.username = typeof token.username === "string" ? token.username : null;
      }
      return session;
    }
  },
  secret: getNextAuthSecret()
};

export function isAdmin(session: { user?: { role?: string | null } } | null) {
  return session?.user?.role === "ADMIN";
}
