'use client';

import Script from 'next/script';
import React, { useCallback } from 'react';

// Tell TypeScript that window may have jotformEmbedHandler
declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, host: string) => void;
  }
}

export default function VinylQuote() {
  const formId = '252658441657163';
  const iframeId = `JotFormIFrame-${formId}`;

  const handleJotformLoaded = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.jotformEmbedHandler === 'function') {
        window.jotformEmbedHandler(`iframe[id='${iframeId}']`, 'https://form.jotform.com/');
      } else {
        console.warn('Jotform handler not found (fallback height remains).');
      }
    } catch (err) {
      console.error('Jotform init error:', err);
    }
  }, [iframeId]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-6 text-white">Get Your Free Quote</h1>

      <div className="w-full max-w-4xl">
        <iframe
          id={iframeId}
          title="Vinyl Quote Form"
          allow="geolocation; microphone; camera; fullscreen; payment"
          src={`https://form.jotform.com/${formId}`}
          style={{ minWidth: '100%', maxWidth: '100%', height: '1600px', border: 'none' }}
          frameBorder={0}
          scrolling="no"
        />

        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={handleJotformLoaded}
        />
      </div>
    </main>
  );
}
