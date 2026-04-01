import { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ConditionalBottomBar from "./components/ConditionalBottomBar";
import { ReferralTracker } from "./components/ReferralTracker";
import { WelcomeTrigger } from "./components/WelcomeTrigger";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

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
    icon: "/icon-192x192.png", 
    shortcut: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Google Tag (gtag.js) - Monitoramento HomeRenovAi */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9VPVJCNYHH"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9VPVJCNYHH');
            `,
          }}
        />
        
        {/* Script existente do PWA */}
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
      <body className="font-sans">
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