// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'JVR Studio',
  description: '…',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Load Jotform embed handler ONCE for the whole app */}
        <Script
          src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
          strategy="afterInteractive"
          id="jotform-embed-handler"
        />
      </body>
    </html>
  );
}
