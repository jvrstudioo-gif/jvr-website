// lib/invoices.ts
import fs from "fs/promises";
import path from "path";

/* =========================
 * Types
 * ========================= */

export type PaymentMethod = "square_card" | "square_tap" | "cash";
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";

export interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  qty: number;
  /** price in cents for ONE unit */
  unit_price: number;
}

export interface Invoice {
  id: string;               // internal id (same as number unless you change later)
  number: string;           // e.g. INV-2025-0001
  status: InvoiceStatus;

  issue_date: string;       // YYYY-MM-DD
  due_date: string;         // keep equal to issue_date

  customer: {
    name: string;
    email?: string;
    phone?: string;
  };

  items: InvoiceItem[];

  subtotal_cents: number;
  taxes_fees_cents: number;
  total_cents: number;

  amount_paid_cents: number;
  balance_due_cents: number;

  payment_method?: PaymentMethod | null;
  paid_at?: string | null;

  notes?: string;
  terms?: string;
}

export interface CreateInvoiceInput {
  customer: { name: string; email?: string; phone?: string };
  items: InvoiceItem[];
  taxes_fees_cents?: number;
  issue_date?: string;      // default: today
  status?: InvoiceStatus;   // default: SENT
  notes?: string;
  terms?: string;
}

/* =========================
 * Storage (JSON file)
 * ========================= */

const DATA = path.join(process.cwd(), "data", "invoices.json");

/** Ensure the invoices file exists; create an empty one if needed. */
async function ensureFile() {
  try {
    await fs.access(DATA);
  } catch {
    await fs.mkdir(path.dirname(DATA), { recursive: true });
    await fs.writeFile(DATA, "[]", "utf8");
  }
}

export async function readInvoices(): Promise<Invoice[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Invoice[]) : [];
  } catch {
    return [];
  }
}

export async function writeInvoices(all: Invoice[]) {
  await ensureFile();
  await fs.writeFile(DATA, JSON.stringify(all, null, 2), "utf8");
}

/* =========================
 * Helpers
 * ========================= */

export function formatMoney(cents?: number | null) {
  const n = typeof cents === "number" ? cents : 0;
  return (n / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Find an invoice by id OR number. */
export async function getInvoiceById(idOrNumber: string): Promise<Invoice | null> {
  const all = await readInvoices();
  return (
    all.find((x) => x.id === idOrNumber) ||
    all.find((x) => x.number === idOrNumber) ||
    null
  );
}

/** Create the next sequential number like INV-2025-0003. */
function nextInvoiceNumber(all: Invoice[]) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const seqs = all
    .map((i) => i.number)
    .filter((n) => n?.startsWith(prefix))
    .map((n) => Number(n.slice(prefix.length)))
    .filter((n) => Number.isFinite(n)) as number[];

  const max = seqs.length ? Math.max(...seqs) : 0;
  const next = String(max + 1).padStart(4, "0");
  return `${prefix}${next}`;
}

/** Sum line items -> cents */
function calcSubtotal(items: InvoiceItem[]) {
  return items.reduce((acc, it) => acc + Math.round(it.unit_price * it.qty), 0);
}

/** YYYY-MM-DD (local) */
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* =========================
 * Create / Update / Mark Paid
 * ========================= */

/** Create a new invoice, append to file, and return it. */
export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const all = await readInvoices();

  const issueDate = input.issue_date || todayISO();
  const dueDate = issueDate; // your rule: due_date == issue_date

  const subtotal = calcSubtotal(input.items);
  const taxes = input.taxes_fees_cents ?? 0;
  const total = subtotal + taxes;

  const inv: Invoice = {
    id: "", // fill below (same as number)
    number: nextInvoiceNumber(all),
    status: input.status ?? "SENT",

    issue_date: issueDate,
    due_date: dueDate,

    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },

    items: input.items.map((x, idx) => ({
      id: x.id ?? `line-${idx + 1}`,
      name: x.name,
      description: x.description,
      qty: x.qty,
      unit_price: x.unit_price,
    })),

    subtotal_cents: subtotal,
    taxes_fees_cents: taxes,
    total_cents: total,

    amount_paid_cents: 0,
    balance_due_cents: total,

    payment_method: null,
    paid_at: null,

    notes: input.notes,
    terms: input.terms,
  };

  // Use the number as the id for now (keeps URLs clean)
  inv.id = inv.number;

  all.unshift(inv); // newest first
  await writeInvoices(all);
  return inv;
}

/** Shallow patch update. Keeps due_date in sync, recomputes balances, and auto-sets paid_at when needed. */
export async function updateInvoice(
  idOrNumber: string,
  patch: Partial<Invoice>
): Promise<Invoice | null> {
  const all = await readInvoices();
  const idx = all.findIndex((x) => x.id === idOrNumber || x.number === idOrNumber);
  if (idx === -1) return null;

  const current = all[idx];
  const next: Invoice = { ...current, ...patch };

  // Keep your rule: due_date follows issue_date if changed
  if (patch.issue_date) next.due_date = patch.issue_date;

  // Recompute totals if items or taxes changed
  if (patch.items || typeof patch.taxes_fees_cents === "number") {
    const items = patch.items ?? current.items;
    const taxes = typeof patch.taxes_fees_cents === "number"
      ? patch.taxes_fees_cents
      : current.taxes_fees_cents;

    next.subtotal_cents = calcSubtotal(items);
    next.taxes_fees_cents = taxes;
    next.total_cents = next.subtotal_cents + taxes;
  }

  // Balance = total - paid (clamped)
  const paid = typeof next.amount_paid_cents === "number" ? next.amount_paid_cents : 0;
  next.amount_paid_cents = paid;
  next.balance_due_cents = Math.max(0, next.total_cents - paid);

  // If status moved to PAID and we don't have paid_at yet, set it
  if (next.status === "PAID" && !next.paid_at) {
    next.paid_at = new Date().toISOString();
    next.amount_paid_cents = next.total_cents;
    next.balance_due_cents = 0;
  }
  // If status changed away from PAID, clear paid_at & restore balance if not fully paid
  if (current.status === "PAID" && next.status !== "PAID") {
    next.paid_at = null;
    next.amount_paid_cents = Math.min(next.amount_paid_cents, next.total_cents);
    next.balance_due_cents = Math.max(0, next.total_cents - next.amount_paid_cents);
  }

  all[idx] = next;
  await writeInvoices(all);
  return next;
}

/** Mark invoice fully paid now with a method (sets paid_at and zeros balance). */
export async function markPaid(
  idOrNumber: string,
  method: PaymentMethod
): Promise<Invoice | null> {
  const all = await readInvoices();
  const idx = all.findIndex((x) => x.id === idOrNumber || x.number === idOrNumber);
  if (idx === -1) return null;

  const inv = all[idx];
  inv.status = "PAID";
  inv.amount_paid_cents = inv.total_cents;
  inv.balance_due_cents = 0;
  inv.payment_method = method;
  inv.paid_at = new Date().toISOString();

  all[idx] = inv;
  await writeInvoices(all);
  return inv;
}
