import { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google"; // Importando as fontes
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ConditionalBottomBar from "./components/ConditionalBottomBar";
import { ReferralTracker } from "./components/ReferralTracker";
import { WelcomeTrigger } from "./components/WelcomeTrigger";

// Configurando a Playfair para os títulos (Luxo)
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Configurando a Inter para textos comuns (Leitura)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
      <head>
        {/* ✅ Captura o evento ANTES do React montar, guardando numa variável global */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ReferralTracker />
          <WelcomeTrigger />
          <div className="min-h-screen pb-24">
            {children}
          </div>
          <ConditionalBottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}