// app/admin/quotes/page.tsx
import { readQuotes, updateQuote, removeQuote, type QuoteRecord } from "@/lib/quotes";
import { revalidatePath } from "next/cache";
import Link from "next/link";

/* -------- Server Actions -------- */
async function setStatusAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new") as QuoteRecord["status"];
  if (!id) return;
  await updateQuote(id, { status });
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

/* -------- Page -------- */
type SearchParams = {
  q?: string;
  status?: "all" | "new" | "contacted" | "archived";
  page?: string;
};

export const revalidate = 0;

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const statusFilter = (searchParams?.status ?? "all") as SearchParams["status"];
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const pageSize = 20;

  const all: QuoteRecord[] = await readQuotes();

  // Filter + search (kept rich search so the simplified table is still powerful)
  const filtered = all.filter((rec) => {
    const matchesStatus = statusFilter === "all" ? true : (rec.status ?? "new") === statusFilter;
    if (!q) return matchesStatus;

    const legacyName = (rec as any)?.name as string | undefined;
    const nameCombined = [rec.firstName, rec.lastName, legacyName].filter(Boolean).join(" ");

    const jobBits = [
      rec.tintType,
      rec.tintShade,
      rec.vehicleType,
      ...(rec.coverage ?? []),
      ...(rec.removalAreas ?? []),
      ...(rec.chromeAreas ?? []),
      rec.decalSize,
      rec.decalColor,
      rec.decalPlacement,
    ]
      .filter(Boolean)
      .join(" ");

    const hay = [
      nameCombined,
      rec.email,
      rec.phone,
      rec.service,
      rec.details ?? rec.message,
      rec.id,
      rec.ymm,
      rec.vin,
      jobBits,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && hay.includes(q);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Quotes</h1>
          <p className="text-sm opacity-70">{total} total</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-2xl border border-white/15 hover:border-white/30 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, vehicle, email, phone, service, details…"
          className="w-full sm:w-[360px] rounded-2xl border border-white/15 bg-transparent px-4 py-2 outline-none focus:border-white/30"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-2xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/30"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="archived">Archived</option>
        </select>
        <button
          type="submit"
          className="rounded-2xl border border-white/15 px-4 py-2 hover:border-white/30 transition"
        >
          Apply
        </button>
      </form>

      {/* Simplified Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <Th>Received</Th>
              <Th>Status</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Service</Th>
              <Th className="text-right pr-4">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <Td colSpan={6}>
                  <div className="py-6 text-sm opacity-70 text-center">
                    No quotes match your filters.
                  </div>
                </Td>
              </tr>
            ) : (
              rows.map((q) => {
                const displayName =
                  [q.firstName, q.lastName, (q as any)?.name].filter(Boolean).join(" ").trim() || "—";

                return (
                  <tr key={q.id} className="border-t border-white/10">
                    <Td>{formatDenverTime(q.receivedAt)}</Td>
                    <Td><StatusPill status={q.status ?? "new"} /></Td>
                    <Td>{displayName}</Td>
                    <Td className="truncate max-w-[260px]" title={q.email ?? undefined}>
                      {q.email ?? "—"}
                    </Td>
                    <Td>{q.service ?? "—"}</Td>
                    <Td className="text-right space-x-2">
                      {/* View details */}
                      <Link
                        href={`/admin/quotes/${q.id}`}
                        className="rounded-xl border border-white/15 px-3 py-1 hover:border-white/30 transition"
                        title="View details"
                      >
                        View
                      </Link>

                      {/* Mark contacted */}
                      <form action={setStatusAction} className="inline">
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="status" value="contacted" />
                        <button
                          className="rounded-xl border border-white/15 px-3 py-1 hover:border-white/30 transition"
                          disabled={(q.status ?? "new") === "contacted"}
                          title="Mark as contacted"
                        >
                          Contacted
                        </button>
                      </form>

                      {/* Mark new */}
                      <form action={setStatusAction} className="inline">
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="status" value="new" />
                        <button
                          className="rounded-xl border border-white/15 px-3 py-1 hover:border-white/30 transition"
                          disabled={(q.status ?? "new") === "new"}
                          title="Mark as new"
                        >
                          New
                        </button>
                      </form>

                      {/* Delete */}
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="id" value={q.id} />
                        <button
                          className="rounded-xl border border-white/15 px-3 py-1 hover:border-red-400/60 transition"
                          title="Delete quote"
                        >
                          Delete
                        </button>
                      </form>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const sp = new URLSearchParams();
            if (q) sp.set("q", q);
            if (statusFilter && statusFilter !== "all") sp.set("status", statusFilter);
            sp.set("page", String(n));
            const href = `/admin/quotes?${sp.toString()}`;
            const isActive = n === page;
            return (
              <Link
                key={n}
                href={href}
                className={`rounded-xl px-3 py-1 border ${
                  isActive ? "border-white/60" : "border-white/15 hover:border-white/30"
                } transition`}
              >
                {n}
              </Link>
            );
          })}
        </div>
      )}
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

function StatusPill({ status }: { status: NonNullable<QuoteRecord["status"]> }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const tone =
    status === "new"
      ? "bg-blue-500/20 border-blue-500/40"
      : status === "contacted"
      ? "bg-green-500/20 border-green-500/40"
      : "bg-zinc-500/20 border-zinc-500/40";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${tone}`}>
      {label}
    </span>
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
