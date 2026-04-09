import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Design Gallery | HomeRenovAi",
  description:
    "Browse, download, and share your AI-generated interior designs. Your personal collection of reimagined spaces.",
  keywords:
    "AI design gallery, interior design portfolio, generated designs, room transformations, HomeRenovAi gallery",
  openGraph: {
    title: "My Design Gallery | HomeRenovAi",
    description:
      "Browse, download, and share your AI-generated interior designs. Your personal collection of reimagined spaces.",
    url: "https://homerenovai.com/gallery",
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
    title: "My Design Gallery | HomeRenovAi",
    description:
      "Browse, download, and share your AI-generated interior designs. Your personal collection of reimagined spaces.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
