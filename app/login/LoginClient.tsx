"use client";

import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-zinc-600">
        Login client loaded. Next: <b>{next}</b>
      </div>
    </main>
  );
}
