import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Workspace | HomeRenovAi",
  description:
    "Upload your room photo and generate AI-powered interior designs. Choose from 8 premium styles including Modern, Scandinavian, Industrial, and Super Luxury.",
  keywords:
    "AI room design, interior design generator, room makeover AI, upload room photo, design styles, modern design, scandinavian design, industrial design, super luxury",
  openGraph: {
    title: "Design Workspace | HomeRenovAi",
    description:
      "Upload your room photo and generate AI-powered interior designs. Choose from 8 premium styles.",
    url: "https://homerenovai.com/workspace",
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
    title: "Design Workspace | HomeRenovAi",
    description:
      "Upload your room photo and generate AI-powered interior designs. Choose from 8 premium styles.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
