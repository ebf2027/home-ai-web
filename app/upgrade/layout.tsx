import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade Plans | HomeRenovAi",
  description:
    "Choose the perfect plan for your design needs. From free credits to Pro+ unlimited access with commercial licensing.",
  keywords:
    "HomeRenovAi pricing, upgrade plan, pro subscription, AI design credits, premium interior design, commercial license",
  openGraph: {
    title: "Upgrade Plans | HomeRenovAi",
    description:
      "Choose the perfect plan for your design needs. From free credits to Pro+ unlimited access with commercial licensing.",
    url: "https://homerenovai.com/upgrade",
    siteName: "HomeRenovAi",
    images: [
      {
        url: "https://homerenovai.com/OG_1200x630_.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgrade Plans | HomeRenovAi",
    description:
      "Choose the perfect plan for your design needs. From free credits to Pro+ unlimited access with commercial licensing.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
