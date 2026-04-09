import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | HomeRenovAi",
  description:
    "Manage your HomeRenovAi account, credits, subscription plan, and personal settings.",
  keywords:
    "HomeRenovAi account, profile settings, manage subscription, design credits, user profile",
  openGraph: {
    title: "My Profile | HomeRenovAi",
    description:
      "Manage your HomeRenovAi account, credits, subscription plan, and personal settings.",
    url: "https://homerenovai.com/profile",
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
    title: "My Profile | HomeRenovAi",
    description:
      "Manage your HomeRenovAi account, credits, subscription plan, and personal settings.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
