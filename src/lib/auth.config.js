// src/lib/auth.config.js
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

/**
 * @type {import('next-auth').NextAuthConfig}
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Controls access to protected routes
     * @param {{ auth: import('next-auth').Session | null, request: { nextUrl: URL } }} params
     * @returns {boolean | Response}
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname === "/login";

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        // Only redirect authenticated users away from login page, allow landing page access
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },

    /**
     * JWT callback - handles token creation and user/subscription creation
     * @param {{ token: any, user?: any, account?: any }} params
     * @returns {Promise<any>}
     */
    async jwt({ token, user, account }) {
      // On initial sign-in (when account and user are present)
      if (account?.provider === "google" && user) {
        try {
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { subscription: true },
          });

          if (!existingUser) {
            // Create new user and trial subscription
            existingUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                subscription: {
                  create: {
                    status: "TRIAL",
                    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                  },
                },
              },
              include: { subscription: true },
            });
          }

          // Store user ID in token
          token.id = existingUser.id;
        } catch (error) {
          console.error("Error creating/finding user:", error);
          // Continue with authentication even if DB operation fails
        }
      }

      return token;
    },

    /**
     * Session callback - exposes user data to client
     * @param {{ session: import('next-auth').Session, token: any }} params
     * @returns {Promise<import('next-auth').Session>}
     */
    async session({ session, token }) {
      // Expose user ID to the client-side session object
      if (token.id && session.user) {
        // @ts-ignore - We are intentionally modifying the session user object
        session.user.id = token.id;
      }
      return session;
    },
  },
};
