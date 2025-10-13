// lib/quotes.ts
// Server-side utilities for reading/writing quotes in Vercel Blob, with
// proper key→URL resolution so reads work (no more "Failed to parse URL").

import { put, del, list } from "@vercel/blob";

// ---- Types -----------------------------------------------------------------
// lib/quotes.ts  — types (drop-in replacement)
// No runtime changes needed elsewhere in this file.

export type QuoteStatus = "new" | "contacted";

export type QuoteRecord = {
  id: string;

  // Timestamps (ISO strings)
  receivedAt: string;
  updatedAt?: string;           // optional for older records

  // Progress/status
  status?: QuoteStatus;         // optional for older records
  source?: string | null;

  // Contact
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;

  // Vehicle
  ymm?: string | null;          // year/make/model as free text
  vin?: string | null;

  // Service details
  service?: string | null;
  details?: string | null;
  message?: string | null;

  // ✅ Option-A: make agree optional so older/newer records remain valid
  agree?: boolean;

  // Tint / wrap extra fields (all optional)
  tintType?: string | null;
  tintShade?: string | null;
  vehicleType?: string | null;

  coverage?: string[] | null;
  removalAreas?: string[] | null;
  chromeAreas?: string[] | null;

  decalSize?: string | null;
  decalColor?: string | null;
  decalPlacement?: string | null;
  
  raw?: Record<string, unknown>;
};

// ---- Configuration ----------------------------------------------------------

const LIST_FILE = "data/quotes.json"; // master list key
const SINGLE_DIR = "quotes";          // per-quote dir

function filePath(id: string) {
  return `${SINGLE_DIR}/${id}.json`;
}

function ensureToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN. Add it in Vercel → Project → Settings → Environment Variables."
    );
  }
  return token;
}

/**
 * Return the public URL for a blob key (or null if it doesn't exist).
 * We use list({ prefix: key }) and match exact pathname === key.
 */
async function getBlobUrlForKey(key: string): Promise<string | null> {
  // list() is publicly readable and does not require the token.
  const { blobs } = await list({ prefix: key });
  const hit = blobs.find((b) => b.pathname === key);
  return hit?.url ?? null;
}

async function fetchJsonByKey<T>(key: string): Promise<T | null> {
  const url = await getBlobUrlForKey(key);
  if (!url) return null; // doesn't exist
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch ${key} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

async function writeJson(key: string, data: unknown) {
  const token = ensureToken();
  await put(key, JSON.stringify(data, null, 2), {
    token,
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
  });
}

// ---- Public API -------------------------------------------------------------

/**
 * Read all quotes from the master list (empty array if list does not exist).
 * Sorted newest-first by receivedAt then id.
 */
export async function readQuotes(): Promise<QuoteRecord[]> {
  const list = (await fetchJsonByKey<QuoteRecord[]>(LIST_FILE)) ?? [];
  list.sort((a, b) => {
    const ta = Date.parse(a.receivedAt || "") || 0;
    const tb = Date.parse(b.receivedAt || "") || 0;
    if (tb !== ta) return tb - ta;
    return (b.id || "").localeCompare(a.id || "");
  });
  return list;
}

/**
 * Tolerant single-read: try per-quote file; if missing, fall back to list scan.
 */
export async function readQuote(id: string): Promise<QuoteRecord> {
  const single = await fetchJsonByKey<QuoteRecord>(filePath(id));
  if (single) return single;

  const list = await readQuotes();
  const found = list.find((q) => q.id === id);
  if (found) return found;

  throw new Error(`Quote ${id} not found`);
}

/**
 * Add a new quote: writes per-quote file and updates the master list.
 */
export async function addQuote(record: QuoteRecord): Promise<QuoteRecord> {
  const nowIso = new Date().toISOString();
  const toSave: QuoteRecord = {
    ...record,
    updatedAt: record.updatedAt ?? nowIso,
  };

  // Write single
  await writeJson(filePath(record.id), toSave);

  // Update list
  const list = await readQuotes();
  const existingIdx = list.findIndex((q) => q.id === record.id);
  if (existingIdx >= 0) list.splice(existingIdx, 1);
  list.unshift(toSave);

  await writeJson(LIST_FILE, list);
  return toSave;
}

/**
 * Update a quote. Always writes the single file and keeps the list in sync.
 * Works even if the single file didn't exist yet (no "not found" crashes).
 */
export async function updateQuote(
  id: string,
  patch: Partial<QuoteRecord>
): Promise<QuoteRecord> {
  const nowIso = new Date().toISOString();

  let existing: QuoteRecord | null = null;
  try {
    existing = await readQuote(id);
  } catch {
    existing = null;
  }

  const merged: QuoteRecord = {
    ...(existing ?? { id, receivedAt: nowIso }),
    ...patch,
    updatedAt: nowIso,
  };

  await writeJson(filePath(id), merged);

  const list = await readQuotes();
  const idx = list.findIndex((q) => q.id === id);
  if (idx >= 0) list[idx] = merged;
  else list.unshift(merged);

  await writeJson(LIST_FILE, list);

  return merged;
}

/**
 * Delete a quote from the list; delete the single blob best-effort.
 */
export async function destroyQuote(id: string): Promise<void> {
  const list = await readQuotes();
  const next = list.filter((q) => q.id !== id);
  await writeJson(LIST_FILE, next);

  try {
    const token = ensureToken();
    await del(filePath(id), { token });
  } catch {
    // ignore
  }
}
