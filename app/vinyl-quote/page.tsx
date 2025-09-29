"use client";

import Link from "next/link";

export default function VinylQuotePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Back button */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-block font-bold py-2 px-4 rounded-lg shadow-md transition"
          style={{ backgroundColor: "#2c4ece", color: "#fff" }}
          onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = "#6A0DAD")}
          onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = "#2c4ece")}
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-center text-3xl font-bold">Get Your Free Quote</h1>

      <section className="mx-auto w-full max-w-4xl p-4">
        <iframe
          id="vinylForm"
          title="Vinyl Form"
          src="https://form.jotform.com/252658441657163"
          className="w-full rounded-xl border-0 block"
          style={{ height: 6000 }}
          scrolling="no"
          allow="geolocation; microphone; camera; fullscreen; payment"
        />
      </section>
    </main>
  );
}
