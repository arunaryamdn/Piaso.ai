// Requires: AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, POSTGRES_URL, JWT_SECRET in env
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  ssl: { rejectUnauthorized: false },
});

declare module "next-auth" {
  interface Session {
    backendToken: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.backendToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET ?? "changeme",
        { expiresIn: "7d" }
      );
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
