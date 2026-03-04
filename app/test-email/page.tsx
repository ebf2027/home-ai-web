"use client";

import { useState } from "react";

export default function TestEmailPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    async function sendTest() {
        if (!email) return alert("Please enter an email address");

        setStatus("loading");
        try {
            const response = await fetch("/api/send-welcome", {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    firstName: "Gabriel" // Testando com o seu nome!
                }),
            });

            if (response.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (e) {
            setStatus("error");
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-md shadow-2xl">
                <h1 className="text-2xl font-black mb-6 text-[#D4AF37]">Email Test Lab 🧪</h1>

                <p className="text-zinc-400 text-sm mb-6">
                    Enter your personal email to receive a sample of the Welcome Email from <strong>hello@homerenovai.com</strong>.
                </p>

                <input
                    type="email"
                    placeholder="your-email@example.com"
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl mb-4 focus:border-[#D4AF37] outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={sendTest}
                    disabled={status === "loading"}
                    className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {status === "loading" ? "Sending..." : "Send Test Email"}
                </button>

                {status === "success" && (
                    <p className="mt-4 text-green-400 text-center font-medium italic">✨ Check your inbox (and spam folder)!</p>
                )}
                {status === "error" && (
                    <p className="mt-4 text-red-400 text-center font-medium italic">❌ Something went wrong. Check the VS Code console.</p>
                )}
            </div>
        </div>
    );
}