import "./globals.css";
import BottomTabs from "./components/BottomTabs";

export const metadata = {
  title: "Home AI",
  description: "Redesign your space with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">
        <div className="min-h-screen pb-24">{children}</div>
        <BottomTabs />
      </body>
    </html>
  );
}
