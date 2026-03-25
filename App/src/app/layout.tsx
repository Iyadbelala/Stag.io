import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/Components/layout/Navbar";
import Footer from "@/Components/layout/Footer";
import { ThemeProvider } from "@/Components/contexts/ThemeContext";
import { LanguageProvider } from "@/Components/contexts/LanguageContext";
import { AuthProvider } from "@/Components/contexts/AuthContext";
import { NotificationProvider } from "@/Components/contexts/NotificationContext";
import ChatBot from "@/Components/features/ChatBot";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stag.io — Internship Management Platform",
  description:
    "Connect students, companies, and universities for seamless internship management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-surface-cream font-body text-text-primary antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
                <ChatBot />
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
