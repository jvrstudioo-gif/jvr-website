// app/admin/quotes/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { readQuotes, type QuoteRecord } from "@/lib/quotes";
import { formatDenver } from "@/lib/time";

export const revalidate = 0;

type Params = { params: { id: string } };

export default async function QuoteDetailPage({ params }: Params) {
  const { id } = params;

  // Be defensive: load list and find client-side to avoid throws from a helper.
  // (If you have a safe readQuote that returns null instead of throwing, you can call that.)
  let q: QuoteRecord | undefined;
  try {
    const all = await readQuotes();
    q = all.find((r) => r.id === id);
  } catch {
    // If the backing store fails (blob/network), bounce back gracefully.
    redirect("/admin/quotes?error=unavailable");
  }

  if (!q) {
    // No such quote — show a 404 page (Next.js will render /404 if present)
    notFound();
  }

  const fullName =
    [q.firstName, q.lastName, (q as any)?.name].filter(Boolean).join(" ").trim() || "—";

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quote Details</h1>
        <Link
          href="/admin/quotes"
          className="rounded border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
        >
          ← Back to all quotes
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 p-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Item label="Received">{formatDenver(q.receivedAt)}</Item>
          <Item label="Status">{q.status ?? "new"}</Item>

          <Item label="Name">{fullName}</Item>
          <Item label="Email">{q.email ?? "—"}</Item>
          <Item label="Phone">{q.phone ?? "—"}</Item>
          <Item label="Service">{q.service ?? "—"}</Item>

          <Item label="Vehicle (YMM)">{q.ymm ?? "—"}</Item>
          <Item label="VIN">{q.vin ?? "—"}</Item>

          <Item label="Tint Type">{q.tintType ?? "—"}</Item>
          <Item label="Tint Shade">{q.tintShade ?? "—"}</Item>
          <Item label="Vehicle Type">{q.vehicleType ?? "—"}</Item>

          <Item label="Coverage">
            {Array.isArray(q.coverage) && q.coverage.length ? q.coverage.join(", ") : "—"}
          </Item>
          <Item label="Removal Areas">
            {Array.isArray(q.removalAreas) && q.removalAreas.length
              ? q.removalAreas.join(", ")
              : "—"}
          </Item>
          <Item label="Chrome Areas">
            {Array.isArray(q.chromeAreas) && q.chromeAreas.length
              ? q.chromeAreas.join(", ")
              : "—"}
          </Item>

          <Item label="Decal Size">{q.decalSize ?? "—"}</Item>
          <Item label="Decal Color">{q.decalColor ?? "—"}</Item>
          <Item label="Decal Placement">{q.decalPlacement ?? "—"}</Item>

          <Item label="Message" className="sm:col-span-2">
            {q.details ?? q.message ?? "—"}
          </Item>
        </dl>
      </div>
    </main>
  );
}

function Item({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide opacity-60">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
