// lib/quotes.ts
import { list, put, del } from "@vercel/blob";

export type QuoteRecord = {
  id: string;
  receivedAt: string;
  status?: "new" | "contacted" | "archived";
  source?: string;

  // Contact
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;

  // Vehicle
  ymm?: string | null;            // Year/Make/Model from your form
  vin?: string | null;

  // Service + details
  service?: string | null;        // "Window Tint" | "Tint Removal" | ...
  details?: string | null;        // free-text from your form
  agree?: boolean;

  // Window Tint
  tintType?: string | null;       // "Carbon"
  tintShade?: string | null;      // "5%"
  vehicleType?: string | null;    // "Coupe"
  coverage?: string[] | null;     // ["Front windows", ...]

  // Tint Removal
  removalAreas?: string[] | null;

  // Chrome Delete
  chromeAreas?: string[] | null;

  // Vinyl Decal
  decalSize?: string | null;
  decalColor?: string | null;
  decalPlacement?: string | null;

  // Back-compat / debug
  message?: string | null;        // (alias of details for old code)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
};

// ---- Blob helpers -----------------------------------------------------------

const PREFIX = "quotes/";
const token = process.env.BLOB_READ_WRITE_TOKEN;

function ensureToken() {
  if (!token) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN environment variable. " +
        "Add it in Vercel → Project → Settings → Environment Variables."
    );
  }
}

function filePath(id: string) {
  // keep filenames predictable and safe
  return `${PREFIX}${encodeURIComponent(id)}.json`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch blob JSON: ${res.status}`);
  return (await res.json()) as T;
}

// ---- Public API (same names/signatures as your previous file) ---------------

export async function readQuotes(): Promise<QuoteRecord[]> {
  ensureToken();
  const { blobs } = await list({ prefix: PREFIX, token });
  const records = await Promise.all(
    blobs.map(async (b) => {
      try {
        // list() returns a (short-lived) signed URL we can fetch
        return await fetchJson<QuoteRecord>(b.url);
      } catch {
        return null;
      }
    })
  );

  const items = (records.filter(Boolean) as QuoteRecord[]);

  // Keep your UI expectations: newest first
  items.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  return items;
}

export async function addQuote(newQuote: QuoteRecord) {
  ensureToken();
  if (!newQuote?.id) throw new Error("addQuote: missing quote id");
  await put(filePath(newQuote.id), JSON.stringify(newQuote, null, 2), {
    access: "private",
    contentType: "application/json",
    token,
  });
}

export async function updateQuote(
  id: string,
  patch: Partial<QuoteRecord>
) {
  ensureToken();
  const existing = await findQuote(id);
  if (!existing) return false;

  const updated: QuoteRecord = { ...existing, ...patch };
  await put(filePath(id), JSON.stringify(updated, null, 2), {
    access: "private",
    contentType: "application/json",
    token,
  });
  return true;
}

export async function removeQuote(id: string) {
  ensureToken();
  await del(filePath(id), { token });
  return true;
}

export async function findQuote(id: string) {
  ensureToken();
  // list() by exact prefix to locate the single file
  const { blobs } = await list({ prefix: filePath(id), token });
  if (!blobs.length) return null;
  try {
    return await fetchJson<QuoteRecord>(blobs[0].url);
  } catch {
    return null;
  }
}
