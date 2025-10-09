'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
    >
      Print / PDF
    </button>
  );
}

