import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | HomeRenovAi",
  description:
    "Need help with HomeRenovAi? Contact our support team for assistance with your account, billing, or design generation.",
  keywords:
    "HomeRenovAi support, help, contact, customer service, billing support, technical support",
  openGraph: {
    title: "Support | HomeRenovAi",
    description:
      "Need help with HomeRenovAi? Contact our support team for assistance with your account, billing, or design generation.",
    url: "https://homerenovai.com/support",
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
    title: "Support | HomeRenovAi",
    description:
      "Need help with HomeRenovAi? Contact our support team for assistance with your account, billing, or design generation.",
    images: ["https://homerenovai.com/OG_1200x630_.jpg"],
  },
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">Support</h1>
        <p className="mt-3 text-zinc-400">
          Need help with HomeRenovAi? Contact us and we will get back to you as soon as possible.
        </p>
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <p className="text-zinc-300">Send us an email and we will respond within 24 hours:</p>
          <a href="mailto:ebf2027@gmail.com" className="inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-black font-semibold hover:opacity-90 transition">
            ebf2027@gmail.com
          </a>
          <p className="text-zinc-500 text-sm">Suggested subject: HomeRenovAi Billing or HomeRenovAi Technical Support</p>
        </div>
      </div>
    </main>
  );
}
