import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const { rows } = await pool.query(
            'SELECT * FROM "User" WHERE "username" = $1',
            [credentials.username]
          );
          const user = rows[0];

          if (!user) return null;

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) return null;

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            gradeLevel: user.gradeLevel,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const hasRole = !!auth?.user?.role;
      const isLoginPage = nextUrl.pathname === '/login';
      const isApiAuthPage = nextUrl.pathname.startsWith('/api/auth');

      // Allow API auth and login page always
      if (isApiAuthPage || isLoginPage) return true;

      // If logged in but session is stale (missing role), force redirect to login
      if (isLoggedIn && !hasRole) {
        console.log("Stale session detected, forcing redirect to login");
        return false;
      }

      // Standard protected route check
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.username = user.username;
        token.gradeLevel = user.gradeLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.gradeLevel = token.gradeLevel;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
