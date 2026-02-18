"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CreditsResp = {
  ok: boolean;
  plan?: string;
  totalRemaining?: number;
  breakdown?: {
    freeRemaining: number;
    bonusRemaining: number;
    paidRemaining: number;
  };
  paid_period_end?: string | null;
  error?: string;
};

export default function CreditsBadge({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<CreditsResp | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch("/api/credits", { cache: "no-store" });
        const j = (await r.json()) as CreditsResp;
        if (alive) setData(j);
      } catch {
        // se falhar, só não mostra o badge
        if (alive) setData(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (!data?.ok) return null;

  const total = data.totalRemaining ?? 0;

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full border px-3 py-1 text-sm">
        <span className="font-medium">Credits:</span> {total} left
      </div>

      {total <= 0 && (
        <Link href="/upgrade" className="rounded-full bg-black px-3 py-1 text-sm text-white">
          Upgrade
        </Link>
      )}
    </div>
  );
}
