'use client';

import React, { useRef, useCallback, useState } from 'react';

declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, host: string) => void;
  }
}

export default function TintQuote() {
  const formId = '252646676868073'; // Tint Quote form ID
  const iframeId = `JotFormIFrame-${formId}`;
  const didRunRef = useRef(false);
  const [visible, setVisible] = useState(false);

  const handleIframeLoad = useCallback(() => {
    if (!didRunRef.current) {
      didRunRef.current = true;
      try {
        if (typeof window !== 'undefined' && typeof window.jotformEmbedHandler === 'function') {
          window.jotformEmbedHandler(`iframe[id='${iframeId}']`, 'https://form.jotform.com/');
        }
      } catch (err) {
        console.error('Jotform init error:', err);
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => setVisible(true), 60);
        });
      });
    } else {
      setVisible(true);
    }
  }, [iframeId]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10 overflow-x-hidden">
      <h1 className="text-4xl font-bold mb-6 text-white">Get Your Free Quote</h1>

      <div className="w-full max-w-4xl" style={{ minHeight: 1600 }}>
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
            visibility: visible ? 'visible' : 'hidden',
          }}
          frameBorder={0}
          scrolling="no"
          onLoad={handleIframeLoad}
        />
      </div>
    </main>
  );
}
