// app/admin/quotes/page.tsx
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

import {
  readQuotes,
  updateQuote,
  destroyQuote,
  type QuoteRecord,
  type QuoteStatus,
} from "@/lib/quotes";
import QuotesTable from "./QuotesTable.client";

// ---------- helpers (CSV) ----------
function toCSV(rows: QuoteRecord[]) {
  const headers = [
    "id",
    "receivedAt",
    "updatedAt",
    "status",
    "source",
    "firstName",
    "lastName",
    "email",
    "phone",
    "ymm",
    "vin",
    "service",
    "details",
    "tintType",
    "tintShade",
    "vehicleType",
    "coverage",
    "removalAreas",
    "chromeAreas",
    "decalSize",
    "decalColor",
    "decalPlacement",
  ];

  const escape = (v: unknown) => {
    if (v == null) return "";
    const s =
      Array.isArray(v) ? v.join("; ") : typeof v === "string" ? v : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.receivedAt,
        r.updatedAt ?? "",
        r.status ?? "",
        r.source ?? "",
        r.firstName ?? "",
        r.lastName ?? "",
        r.email ?? "",
        r.phone ?? "",
        r.ymm ?? "",
        r.vin ?? "",
        r.service ?? "",
        r.details ?? r.message ?? "",
        r.tintType ?? "",
        r.tintShade ?? "",
        r.vehicleType ?? "",
        r.coverage?.join("; ") ?? "",
        r.removalAreas?.join("; ") ?? "",
        r.chromeAreas?.join("; ") ?? "",
        r.decalSize ?? "",
        r.decalColor ?? "",
        r.decalPlacement ?? "",
      ]
        .map(escape)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

// write the CSV to a stable filename (overwrite each time)
async function writeCSV(): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN env var. Add it in Vercel → Project → Settings → Environment Variables."
    );
  }

  const rows = await readQuotes();
  const csv = toCSV(rows);

  const res = await put("exports/quotes.csv", csv, {
    access: "public",
    contentType: "text/csv",
    token,
    allowOverwrite: true,
  });

  return res.url;
}

// ---------- Server Actions ----------
export async function exportQuotesCSVAction() {
  "use server";
  const url = await writeCSV();
  redirect(url);
}

export async function setStatusAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as QuoteStatus;
  if (!id || !status) return;

  await updateQuote(id, { status, updatedAt: new Date().toISOString() });
  revalidatePath("/admin/quotes");
}

export async function deleteQuoteAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;

  await destroyQuote(id);
  revalidatePath("/admin/quotes");
}

// ---------- Page ----------
export const revalidate = 0; // always fresh

export default async function AdminQuotesPage() {
  const quotes = await readQuotes();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">All Quotes</h1>

      <form action={exportQuotesCSVAction}>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white ring-1 ring-zinc-600 hover:opacity-90"
        >
          Export CSV (overwrite)
        </button>
      </form>

      <p className="text-sm text-gray-500">
        Exports to <code>exports/quotes.csv</code> and overwrites the same file
        each time.
      </p>

      <QuotesTable
        quotes={quotes}
        setStatusAction={setStatusAction}
        deleteQuoteAction={deleteQuoteAction}
      />

      <div className="text-sm text-gray-400">
        Current quotes: <strong>{quotes.length}</strong>{" "}
        {quotes.length > 0 && (
          <span className="ml-2">
            (latest <code>{quotes[0].id}</code>)
          </span>
        )}
      </div>
    </main>
  );
}
