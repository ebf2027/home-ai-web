export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Support</h1>
      <p className="mt-3 text-zinc-700">
        Need help with Home AI? Contact us and we’ll get back to you as soon as possible.
      </p>

      <div className="mt-6 space-y-2">
        <p className="text-zinc-700">
          Email:{" "}
          <a className="underline" href="mailto:greatbuy.on@gmail.com">
            greatbuy.on@gmail.com
          </a>
        </p>
        <p className="text-zinc-700">
          Subject suggestion: “Home AI — Billing/Subscription” or “Home AI — Technical Support”
        </p>
      </div>
    </main>
  );
}
