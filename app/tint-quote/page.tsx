"use client";

import Link from "next/link";
import Script from "next/script";

const TINT_FORM_ID = "252646676868073";
const IFRAME_ID = `JotFormIFrame-${TINT_FORM_ID}`;

export default function TintQuotePage() {
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

      {/* Title */}
      <h1 className="text-center text-3xl font-bold">Get Your Free Quote</h1>

      {/* Jotform embed (auto-resizes; only page scrollbar) */}
      <section className="mx-auto w-full max-w-4xl p-4">
        <iframe
          id={IFRAME_ID}
          title="Tint Form"
          src={`https://form.jotform.com/${TINT_FORM_ID}`}
          className="w-full rounded-xl border-0"
          // modest starting height; Jotform script will set the exact height
          style={{ height: 1600, overflow: "hidden" }}
          scrolling="no"
          allow="geolocation; microphone; camera; fullscreen; payment"
        />
        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={() => {
            // provided by Jotform script
            // @ts-ignore
            if (window?.jotformEmbedHandler) {
              // @ts-ignore
              window.jotformEmbedHandler(`iframe[id='${IFRAME_ID}']`, "https://form.jotform.com/");
            }
          }}
        />
      </section>
    </main>
  );
}
