import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ConditionalBottomBar from "./components/ConditionalBottomBar"; // Importamos o porteiro

export const metadata = {
  title: "Home AI",
  description: "Redesign your space with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="min-h-screen pb-24">
            {children}
          </div>
          {/* Usamos o porteiro aqui em vez do BottomTabs direto */}
          <ConditionalBottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}