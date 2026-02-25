import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ConditionalBottomBar from "./components/ConditionalBottomBar"; // Importamos o porteiro
import { ReferralTracker } from "./components/ReferralTracker"; // 1. Importamos o nosso Rastreador Invisível

export const metadata: Metadata = {
  title: "HomeRenovAi",
  description: "Transform your home with AI",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "HomeRenovAi",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* 2. Colocamos o Rastreador aqui para rodar em todas as páginas */}
          <ReferralTracker />

          <div className="min-h-screen pb-24">
            {children}
          </div>
          {/* Usamos o porteiro aqui em vez do BottomTabs direto */}
          <ConditionalBottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}