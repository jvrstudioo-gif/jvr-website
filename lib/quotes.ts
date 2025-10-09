// lib/quotes.ts
import { promises as fs } from "fs";
import path from "path";

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

const QUOTES_PATH = path.join(process.cwd(), "data", "quotes.json");

async function ensureFile() {
  try { await fs.access(QUOTES_PATH); }
  catch {
    await fs.mkdir(path.dirname(QUOTES_PATH), { recursive: true });
    await fs.writeFile(QUOTES_PATH, "[]", "utf8");
  }
}

export async function readQuotes(): Promise<QuoteRecord[]> {
  await ensureFile();
  const txt = await fs.readFile(QUOTES_PATH, "utf8");
  const arr = JSON.parse(txt || "[]");
  return Array.isArray(arr) ? arr : [];
}

export async function addQuote(newQuote: QuoteRecord) {
  const all = await readQuotes();
  all.unshift(newQuote);
  await fs.writeFile(QUOTES_PATH, JSON.stringify(all, null, 2), "utf8");
}

export async function updateQuote(id: string, patch: Partial<QuoteRecord>) {
  const all = await readQuotes();
  const i = all.findIndex((q) => q.id === id);
  if (i === -1) return false;
  all[i] = { ...all[i], ...patch };
  await fs.writeFile(QUOTES_PATH, JSON.stringify(all, null, 2), "utf8");
  return true;
}

export async function removeQuote(id: string) {
  const all = await readQuotes();
  const next = all.filter((q) => q.id !== id);
  if (next.length === all.length) return false;
  await fs.writeFile(QUOTES_PATH, JSON.stringify(next, null, 2), "utf8");
  return true;
}

export async function findQuote(id: string) {
  const all = await readQuotes();
  return all.find((q) => q.id === id) ?? null;
}

