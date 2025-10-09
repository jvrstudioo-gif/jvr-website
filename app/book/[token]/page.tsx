// app/book/[token]/page.tsx
import Link from "next/link";
import { getBookingByToken } from "@/lib/bookingLinks";
import BookingFormClient from "./BookingFormClient";

export const revalidate = 0;

export default async function BookingFromTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  // Returns: booking record or null if invalid/expired
  const booking = await getBookingByToken(token);

  if (!booking) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Booking link invalid or expired</h1>
        <p className="mt-3 opacity-80">
          Please ask us for a fresh link. If you believe this is a mistake, reply to our message
          and we’ll resend it.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/15 px-4 py-2 hover:border-white/30 transition"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  const validUntil =
    booking.expiresAt
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(booking.expiresAt))
      : "—";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Confirm your booking</h1>

      <div className="mt-6 rounded-2xl border border-white/10 p-4 space-y-3">
        <Row label="Name" value={booking.name ?? "—"} />
        <Row label="Email" value={booking.email ?? "—"} />
        <Row label="Phone" value={booking.phone ?? "—"} />
        <Row label="Service" value={booking.service ?? "—"} />
        <Row
          label="Quoted Price"
          value={
            booking.quotedPrice != null ? `$${booking.quotedPrice}` : "—"
          }
        />
        <Row
          label="Duration"
          value={
            booking.durationHours != null
              ? `${booking.durationHours} hours`
              : "—"
          }
        />
        <Row label="Valid until" value={validUntil} />
      </div>

      <div className="mt-6">
        <BookingFormClient token={token} />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <div className="opacity-70">{label}</div>
      <div className="text-right">{value}</div>
    </div>
  );
}
