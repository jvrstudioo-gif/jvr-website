// app/admin/bookings/page.tsx
import Link from "next/link";
import { getAllBookings } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookings – JVR Studio",
};

type BookingRow = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  service: string;
  date: string;        // "YYYY-MM-DD"
  time?: string;       // "HH:mm"
  notes?: string;
  // add any extra fields your store returns
};

function fmtDate(d: string) {
  // If your dates are already "YYYY-MM-DD", this keeps it concise.
  // Swap to locale if you prefer:
  // return new Date(d + "T12:00:00").toLocaleDateString();
  return d;
}

function fmtTime(t?: string) {
  return t ?? "—";
}

export default async function AdminBookingsPage() {
  // Fetch from your JSON store (or future Google Calendar) via lib/bookings
  const raw = (await getAllBookings()) as BookingRow[];

  // Sort upcoming first: by date then time
  const rows = [...raw].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header / toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/block-date"
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90"
            >
              Block Off Date
            </Link>
            <Link
              href="/admin/generate-link"
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
            >
              Generate Booking Link
            </Link>
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-300">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-400" colSpan={7}>
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id ?? `${r.name}-${r.date}-${r.time}-${i}`}>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3">{fmtTime(r.time)}</td>
                    <td className="px-4 py-3">{r.service}</td>
                    <td className="px-4 py-3">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3">{r.email ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[28rem] truncate" title={r.notes}>
                      {r.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Small footer/legend if you want */}
        <p className="mt-4 text-xs text-zinc-500">
          Showing {rows.length} {rows.length === 1 ? "booking" : "bookings"}.
        </p>
      </div>
    </main>
  );
}
