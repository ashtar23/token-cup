import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { UserSessionProvider } from "@/providers/UserSessionProvider";
import { getServerUserId } from "@/lib/user-session.server";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Token Cup",
  description:
    "Stake Fan Tokens. Predict matches. Compete for 50,000 reward points.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getServerUserId();

  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-[family-name:var(--font-manrope)] antialiased">
        <ThemeProvider>
          <QueryProvider>
            <UserSessionProvider initialUserId={userId}>
              {children}
            </UserSessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
