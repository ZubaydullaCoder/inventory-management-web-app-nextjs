import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config.js";

// Initialize NextAuth with the config that includes the `authorized` callback
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Matcher to specify which routes the middleware should run on
  matcher: [
    "/dashboard/:path*",
    // Only protect login route for authenticated users, allow access to landing page
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
