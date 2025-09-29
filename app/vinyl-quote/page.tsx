"use client";

import React from "react";
import Script from "next/script";
import Link from "next/link";

const VINYL_FORM_ID = "252658441657163";

const VinylQuotePage: React.FC = () => {
  const iframeId = `JotFormIFrame-${VINYL_FORM_ID}`;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Back to Home */}
    <Link
  href="/"
  className="fixed top-4 left-4 z-50 font-bold py-2 px-4 rounded-lg shadow-md transition"
  style={{
    backgroundColor: "#2c4ece",   // JVR Blue
    color: "#ffffff",
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6A0DAD")} // Purple hover
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2c4ece")}
>
  ← Back to Home
</Link>


      <h1 className="pt-16 text-center text-3xl font-bold">Get Your Free Quote</h1>

      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8 mt-6">
        <iframe
          id={iframeId}
          title="Vinyl Form"
          src={`https://form.jotform.com/${VINYL_FORM_ID}`}
          style={{ minWidth: "100%", maxWidth: "100%", width: "100%", height: 1200, border: "none", borderRadius: 12 }}
          frameBorder={0}
          scrolling="no"
          allow="geolocation; microphone; camera; fullscreen; payment"
        />

        {/* Jotform embed handler */}
        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={() => {
            const w = window as unknown as { jotformEmbedHandler?: (sel: string, base: string) => void };
            w.jotformEmbedHandler?.(`iframe[id='${iframeId}']`, "https://form.jotform.com/");
          }}
        />
      </section>
    </main>
  );
};

export default VinylQuotePage;
