export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-3 text-zinc-700">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-6 space-y-4 text-zinc-700">
        <p>
          By using Home AI, you agree to use the service responsibly and not upload illegal or harmful content.
        </p>
        <p>
          Subscriptions are billed periodically and can be managed/canceled through the customer portal.
        </p>
        <p>
          The service is provided “as is”. Generated results may vary and are for informational/creative use.
        </p>
      </section>
    </main>
  );
}
