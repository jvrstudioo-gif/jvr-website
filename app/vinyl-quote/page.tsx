// app/vinyl-quote/page.tsx
'use client';

import Script from 'next/script';
import React, { useCallback } from 'react';

export default function VinylQuote() {
  const formId = '252658441657163'; // your Jotform ID
  const iframeId = `JotFormIFrame-${formId}`;

  // Will be called ONLY after the Jotform library finishes loading
  const handleJotformLoaded = useCallback(() => {
    try {
      // @ts-ignore - Jotform attaches this on window
      if (typeof window !== 'undefined' && typeof window.jotformEmbedHandler === 'function') {
        // Tell Jotform to auto-resize and handle messages for this iframe
        // @ts-ignore
        window.jotformEmbedHandler(`iframe[id='${iframeId}']`, 'https://form.jotform.com/');
      } else {
        console.warn('Jotform library loaded, but handler not found. Using fallback height.');
      }
    } catch (err) {
      console.error('Jotform init error:', err);
    }
  }, [iframeId]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-6">
        Get A Free <span className="text-white-400">Quote</span>
      </h1>

      <div className="w-full max-w-4xl">
        {/* Start with a tall height so the full form is visible even before auto-resize */}
        <iframe
          id={iframeId}
          title="Vinyl Quote Form"
          allow="geolocation; microphone; camera; fullscreen; payment"
          src={`https://form.jotform.com/${formId}`}
          style={{
            minWidth: '100%',
            maxWidth: '100%',
            height: '1600px', // fallback height so nothing gets cut off
            border: 'none',
          }}
          frameBorder={0}
          scrolling="no"
        />

        {/* Load Jotform library, then call our init in onLoad */}
        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={handleJotformLoaded}
        />
      </div>
    </main>
  );
}
