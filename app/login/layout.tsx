import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | HomeRenovAi",
  description:
    "Sign in or create your free account to start transforming spaces with AI. Get 3 free credits to experience the future of interior design.",
  keywords:
    "HomeRenovAi login, sign in, create account, AI design account, free credits, interior design app",
  openGraph: {
    title: "Sign In | HomeRenovAi",
    description:
      "Sign in or create your free account to start transforming spaces with AI. Get 3 free credits.",
    url: "https://homerenovai.com/login",
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
    title: "Sign In | HomeRenovAi",
    description:
      "Sign in or create your free account to start transforming spaces with AI. Get 3 free credits.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
