export const metadata = {
  title: "Privacy Policy — Home AI",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>

      <section className="mt-6 space-y-4 text-zinc-700">
        <p>
          Home AI collects the information you provide to create your account and generate design results,
          including images you upload and basic account data.
        </p>
        <p>
          We use trusted providers to operate the service (authentication, storage, and payments). We do not sell
          personal data.
        </p>
        <p>
          You can request account deletion by contacting support.
        </p>
      </section>
    </main>
  );
}
