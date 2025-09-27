// app/tint-quote/page.tsx
'use client';

import Script from 'next/script';
import React, { useCallback } from 'react';

export default function TintQuote() {
  const formId = '252646676868073'; // your Tint Jotform ID
  const iframeId = `JotFormIFrame-${formId}`;

  const handleJotformLoaded = useCallback(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.jotformEmbedHandler === 'function') {
        // @ts-ignore
        window.jotformEmbedHandler(`iframe[id='${iframeId}']`, 'https://form.jotform.com/');
      } else {
        console.warn('Jotform handler not found (using fallback height).');
      }
    } catch (err) {
      console.error('Jotform init error:', err);
    }
  }, [iframeId]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10 overflow-x-hidden">
      <h1 className="text-4xl font-bold mb-6 text-white">Get A Free Quote</h1>

      <div className="w-full max-w-4xl">
        {/* Fallback height so only the page scrolls, no inner scrollbars */}
        <iframe
          id={iframeId}
          title="Tint Quote Form"
          allow="geolocation; microphone; camera; fullscreen; payment"
          src={`https://form.jotform.com/${formId}?isIframeEmbed=1`}
          style={{
            minWidth: '100%',
            maxWidth: '100%',
            height: '1600px',
            border: 'none',
          }}
          frameBorder={0}
          scrolling="no"
        />

        {/* Load Jotform library and initialize once loaded */}
        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          onLoad={handleJotformLoaded}
        />
      </div>
    </main>
  );
}
