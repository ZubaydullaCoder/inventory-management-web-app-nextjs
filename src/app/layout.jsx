import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import SessionProviderWrapper from "@/components/providers/session-provider-wrapper";
import QueryProvider from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Retail Inventory & Finance Manager",
  description:
    "Complete inventory and finance management solution for retail shops",
};

/**
 * Root layout component that wraps the entire application
 * @param {{ children: React.ReactNode, modal?: React.ReactNode }} props
 */
export default function RootLayout({ children, modal }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <SessionProviderWrapper>
          <QueryProvider>
            {children}
            {modal}
            <Toaster />
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
