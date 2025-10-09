import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import FooterGate from "./components/FooterGate";

export const metadata: Metadata = {
  title: "JVR Studio",
  description: "Custom Style, Professional Results",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          {children}
          {/* ✅ Footer only appears where FooterGate allows */}
          <FooterGate />
        </Providers>
      </body>
    </html>
  );
}
