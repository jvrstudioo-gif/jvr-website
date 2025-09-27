import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "JVR Studio",
  description: "Premium Automotive Tinting",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
