"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGate() {
  const pathname = usePathname() || "/";

  // Never show footer in admin
  if (pathname.startsWith("/admin")) return null;

  // ✅ Only show on these public routes
  const ALLOWED_PUBLIC_PATHS = ["/", "/quote"];
  const showFooter = ALLOWED_PUBLIC_PATHS.includes(pathname);

  return showFooter ? <Footer /> : null;
}
