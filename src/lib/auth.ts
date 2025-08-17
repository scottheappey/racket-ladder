import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import "../types/auth";

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id;
        // Add role from user record
        session.user.role = user.role || 'PLAYER';
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

export const { GET, POST } = handlers;
