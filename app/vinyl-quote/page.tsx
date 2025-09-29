"use client";

import Link from "next/link";
import Script from "next/script";

const VINYL_FORM_ID = "252658441657163";
const IFRAME_ID = `JotFormIFrame-${VINYL_FORM_ID}`;

type JotformEmbed = (selector: string, base: string) => void;

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
          id={IFRAME_ID}
          title="Vinyl Form"
          src={`https://form.jotform.com/${VINYL_FORM_ID}`}
          className="w-full rounded-xl border-0"
          style={{ height: 1600, overflow: "hidden" }}
          scrolling="no"
          allow="geolocation; microphone; camera; fullscreen; payment"
        />

        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={() => {
            const w = window as unknown as { jotformEmbedHandler?: JotformEmbed };
            w.jotformEmbedHandler?.(`iframe[id='${IFRAME_ID}']`, "https://form.jotform.com/");
          }}
        />
      </section>
    </main>
  );
}
