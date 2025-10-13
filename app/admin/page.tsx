// app/admin/page.tsx
import Link from "next/link";
import { readQuotes, type QuoteRecord } from "@/lib/quotes";
import { formatDenver } from "@/lib/time";

export const revalidate = 0; // always show latest quotes

export default async function AdminPage() {
  // Load the 5 most recent quotes (newest first—stored with unshift)
  const quotes: QuoteRecord[] = await readQuotes();
  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      {/* -------- HEADER -------- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-70">Manage bookings, quotes, and invoices.</p>
      </div>

      {/* -------- QUICK ACTIONS -------- */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/generate-link" className="px-4 py-2 rounded-2xl bg-purple-600/20 border border-purple-600/40 hover:border-purple-600/60">
          Generate Booking Link
        </Link>
        <Link href="/admin/block-date" className="px-4 py-2 rounded-2xl bg-blue-600/20 border border-blue-600/40 hover:border-blue-600/60">
          Block Off Date
        </Link>
        <Link href="/admin/bookings" className="px-4 py-2 rounded-2xl bg-green-600/20 border border-green-600/40 hover:border-green-600/60">
          View Bookings
        </Link>
        <Link href="/admin/invoices" className="px-4 py-2 rounded-2xl bg-teal-600/20 border border-teal-600/40 hover:border-teal-600/60">
          View Invoices
        </Link>
        <Link href="/admin/quotes" className="px-4 py-2 rounded-2xl bg-pink-600/20 border border-pink-600/40 hover:border-pink-600/60">
          View All Quotes
        </Link>
      </div>

      {/* -------- RECENT QUOTES -------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Quotes</h2>
          <Link href="/admin/quotes" className="text-sm underline opacity-80 hover:opacity-100">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Received</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Service</Th>
                <Th>Message</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <div className="py-6 text-sm opacity-70 text-center">
                      No quotes yet. Submit a quote from your website to test.
                    </div>
                  </Td>
                </tr>
              ) : (
                recentQuotes.map((q) => {
                  // Back-compat: some older records may have a single `name`
                  const displayName =
                    [q.firstName, q.lastName, (q as any)?.name]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || "—";

                  return (
                    <tr key={q.id} className="border-t border-white/10">
                      <Td>{q.receivedAt ? `${formatDenver(q.receivedAt)} • (Denver)` : "—"}</Td>
                      <Td>{displayName}</Td>
                      <Td className="truncate max-w-[220px]" title={q.email ?? undefined}>
                        {q.email ?? "—"}
                      </Td>
                      <Td>{q.phone ?? "—"}</Td>
                      <Td>{q.service ?? "—"}</Td>
                      <Td className="truncate max-w-[360px]" title={(q.details ?? q.message) ?? undefined}>
                        {q.details ?? q.message ?? "—"}
                      </Td>
                      <Td className="text-right">
                        <Link
                          href={`/admin/quotes/${q.id}`}
                          className="inline-block px-3 py-1 rounded-xl border border-white/15 hover:border-white/30 transition"
                        >
                          Open
                        </Link>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* -------- RECENT INVOICES -------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Invoices</h2>
          <Link href="/admin/invoices" className="text-sm underline opacity-80 hover:opacity-100">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Invoice</Th>
                <Th>Customer</Th>
                <Th>Issued</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td colSpan={6}>
                  <div className="py-6 text-sm opacity-70 text-center">
                    No invoices yet.
                  </div>
                </Td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* footer links (optional) */}
      <div className="flex items-center gap-6 opacity-70 text-sm">
        <Link href="/terms" className="underline">Terms & Conditions</Link>
        <Link href="/privacy" className="underline">Privacy Policy</Link>
      </div>
    </div>
  );
}

/* -------- UI helpers -------- */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
  colSpan,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  title?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top ${className}`} colSpan={colSpan} title={title}>
      {children}
    </td>
  );
}

function formatDenverTime(timestamp?: string) {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${fmt.format(date)} • (Denver)`;
  } catch {
    return "—";
  }
}
