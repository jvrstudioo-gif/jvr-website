"use client";

import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        {/* Social Icons */}
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/jvrstudioo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:opacity-80 transition"
          >
            <FaInstagram size={48} />
          </a>

          <a
            href="https://tiktok.com/@jvrstudioo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:opacity-80 transition"
          >
            <FaTiktok size={48} />
          </a>
        </div>

        {/* Terms link */}
        <Link
          href="/terms"
          className="text-white hover:opacity-90 underline underline-offset-4 text-sm transition"
        >
          Terms &amp; Conditions
        </Link>
      </div>
    </footer>
  );
}
