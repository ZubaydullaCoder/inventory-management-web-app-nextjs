import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config.js";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
