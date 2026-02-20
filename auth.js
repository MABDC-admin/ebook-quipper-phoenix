import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./lib/db";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log(`Checking user: ${credentials.username}`);
          const { rows } = await pool.query(
            'SELECT * FROM "User" WHERE "username" = $1',
            [credentials.username]
          );
          const user = rows[0];

          if (!user) {
            console.log("User not found in DB");
            return null;
          }

          console.log("User found, comparing password hash...");
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) {
            console.log("Password mismatch");
            return null;
          }

          console.log("Authentication successful!");
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            gradeLevel: user.gradeLevel,
          };
        } catch (error) {
          console.error("Critical Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
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
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
