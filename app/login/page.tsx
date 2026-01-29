import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-zinc-500">Loading…</div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
