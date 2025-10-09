// app/admin/quotes/[id]/page.tsx
import { findQuote, updateQuote, removeQuote, type QuoteRecord } from "@/lib/quotes";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

/* ----- server actions ----- */
async function setStatusAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new") as QuoteRecord["status"];
  if (!id) return;
  await updateQuote(id, { status });
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
}

async function deleteAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await removeQuote(id);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
}

export const revalidate = 0;

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await findQuote(params.id);
  if (!quote) return notFound();

  const displayName =
    [quote.firstName, quote.lastName, (quote as any)?.name].filter(Boolean).join(" ").trim() || "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Details</h1>
          <p className="text-sm opacity-70">
            {formatDenverTime(quote.receivedAt)} • ID {quote.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/quotes"
            className="px-4 py-2 rounded-2xl border border-white/15 hover:border-white/30 transition"
          >
            ← Back to All Quotes
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-2xl border border-white/15 hover:border-white/30 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <form action={setStatusAction}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="status" value="contacted" />
          <button className="rounded-xl border border-white/15 px-3 py-1 hover:border-white/30 transition">
            Mark Contacted
          </button>
        </form>
        <form action={setStatusAction}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="status" value="new" />
          <button className="rounded-xl border border-white/15 px-3 py-1 hover:border-white/30 transition">
            Mark New
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={quote.id} />
          <button className="rounded-xl border border-white/15 px-3 py-1 hover:border-red-400/60 transition">
            Delete
          </button>
        </form>
      </div>

      {/* Primary info grid */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card title="Contact">
          <Field label="Name" value={displayName} />
          <Field label="Email" value={quote.email} />
          <Field label="Phone" value={quote.phone} />
          <Field label="Status" value={(quote.status ?? "new").toUpperCase()} />
        </Card>

        <Card title="Vehicle & Service">
          <Field label="Year / Make / Model" value={quote.ymm} />
          <Field label="VIN" value={quote.vin} />
          <Field label="Service" value={quote.service} />
          <Field label="Vehicle Type" value={quote.vehicleType} />
        </Card>

        {/* Window Tint block (only if service is Window Tint or tint fields exist) */}
        {(quote.service === "Window Tint" ||
          quote.tintType ||
          quote.tintShade ||
          quote.coverage?.length) && (
          <Card title="Tint Details">
            <Field label="Type" value={quote.tintType} />
            <Field label="Shade" value={quote.tintShade} />
            <Field
              label="Coverage"
              value={
                quote.coverage?.length
                  ? quote.coverage.join(" • ")
                  : "—"
              }
            />
          </Card>
        )}

        {/* Tint Removal block */}
        {(quote.service === "Tint Removal" || quote.removalAreas?.length) && (
          <Card title="Tint Removal">
            <Field
              label="Areas"
              value={quote.removalAreas?.length ? quote.removalAreas.join(" • ") : "—"}
            />
          </Card>
        )}

        {/* Chrome Delete block */}
        {(quote.service === "Chrome Delete" || quote.chromeAreas?.length) && (
          <Card title="Chrome Delete">
            <Field
              label="Areas"
              value={quote.chromeAreas?.length ? quote.chromeAreas.join(" • ") : "—"}
            />
          </Card>
        )}

        {/* Vinyl Decal block */}
        {(quote.service === "Vinyl Decal" ||
          quote.decalSize ||
          quote.decalColor ||
          quote.decalPlacement) && (
          <Card title="Vinyl Decal">
            <Field label="Approx. Size" value={quote.decalSize} />
            <Field label="Color" value={quote.decalColor} />
            <Field label="Placement" value={quote.decalPlacement} />
          </Card>
        )}

        <Card title="Notes">
          <div className="rounded-2xl border border-white/10 p-3 min-h-[60px]">
            {quote.details ?? quote.message ?? "—"}
          </div>
        </Card>
      </section>

      {/* Raw payload */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Raw submission</h2>
        <pre className="rounded-2xl border border-white/10 p-4 overflow-auto text-xs">
{JSON.stringify(quote.raw ?? {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}

/* --- small UI helpers --- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <div className="opacity-70">{label}</div>
      <div className="text-right">{value ?? "—"}</div>
    </div>
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
