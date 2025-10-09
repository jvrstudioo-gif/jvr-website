// app/components/Footer.tsx
import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Left: Social icons */}
        <div className="flex items-center gap-6 text-xl">
          <a
            href="https://instagram.com/jvrstudioo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://tiktok.com/@jvrstudioo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>
        </div>

        {/* Right: Legal links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/terms"
            className="hover:text-purple-400 underline underline-offset-4"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="hover:text-purple-400 underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
