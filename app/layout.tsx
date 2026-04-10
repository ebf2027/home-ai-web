import { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
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
  title: "HomeRenovAi — AI Interior & Exterior Design Tool",
  description:
    "Transform any room or facade into a stunning design in seconds. Upload a photo, choose a style, and let AI reimagine your space with professional precision.",
  keywords:
    "AI interior design, home renovation, room design AI, interior decorator, AI architecture, home makeover, virtual staging, AI room transformer, facade design, scandinavian design, modern interior, luxury interior design",
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
  openGraph: {
    title: "HomeRenovAi — AI Interior & Exterior Design Tool",
    description:
      "Transform any room or facade into a stunning design in seconds. Upload a photo, choose a style, and let AI reimagine your space.",
    url: "https://homerenovai.com",
    siteName: "HomeRenovAi",
    images: [
      {
        url: "https://homerenovai.com/OG_1200x630_.jpg",
        width: 1200,
        height: 630,
        alt: "HomeRenovAi — AI-Powered Interior Design",
      },
    ],
    locale: "en_US",
    type: "website",
    videos: [
      {
        url: "https://homerenovai.com/16X9_HomeRenovAi_720P.mp4",
        width: 1280,
        height: 720,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeRenovAi — AI Interior & Exterior Design Tool",
    description:
      "Transform any room or facade into a stunning design in seconds. Upload a photo, choose a style, and let AI reimagine your space.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Schema.org WebApplication Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["WebApplication", "SoftwareApplication"],
              "name": "HomeRenovAi",
              "url": "https://homerenovai.com",
              "image": "https://homerenovai.com/OG_1200x630_.jpg",
              "description": "Transform any room or facade into a stunning design in seconds with AI.",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="font-sans">
        {/* Google Tag (gtag.js) - Movido para body para obedecer o padrão Next */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-9VPVJCNYHH" 
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9VPVJCNYHH');
          `}
        </Script>

        {/* Script existente do PWA */}
        <Script id="pwa-install-prompt" strategy="lazyOnload">
          {`
            window.__deferredInstallPrompt = null;
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.__deferredInstallPrompt = e;
            });
          `}
        </Script>

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