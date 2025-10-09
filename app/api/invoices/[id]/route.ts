// app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LineItem = {
  id: string;
  name: string;
  description?: string;
  qty: number;
  unit_price: number; // cents
};

type Customer = {
  name: string;
  email: string;
  phone?: string;
};

type Invoice = {
  id: string;                     // may differ from number (e.g., demo-001)
  number: string;                 // human-facing invoice no. (INV-YYYY-XXXX)
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  issue_date: string;             // YYYY-MM-DD
  due_date: string;               // YYYY-MM-DD
  customer: Customer;
  items: LineItem[];
  subtotal_cents: number;
  taxes_fees_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  balance_due_cents: number;
  payment_method: "square_card" | "square_tap" | "cash" | null;
  paid_at: string | null;
  notes?: string;
  terms?: string;
  sentAt?: string | null;
  updatedAt?: string;
  lastEmailId?: string | null;
};

const DATA_PATH = path.join(process.cwd(), "data", "invoices.json");

async function readAll(): Promise<Invoice[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "ENOENT"
    ) {
      return [];
    }
    throw err;
  }
}

async function writeAll(list: Invoice[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), "utf8");
}

/** Find by either invoice.id OR invoice.number (both are used in your data). */
function findIndexByIdOrNumber(list: Invoice[], key: string) {
  return list.findIndex((inv) => inv.id === key || inv.number === key);
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id);
  const all = await readAll();
  const idx = findIndexByIdOrNumber(all, id);
  if (idx === -1) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  return NextResponse.json(all[idx]);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const key = decodeURIComponent(params.id);

  let body: Partial<Invoice> = {};
  try {
    body = (await req.json()) as Partial<Invoice>;
  } catch {
    body = {};
  }

  const allowedStatus: ReadonlyArray<Invoice["status"]> = [
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "VOID",
  ];
  const allowedMethods: ReadonlyArray<Invoice["payment_method"]> = [
    "square_card",
    "square_tap",
    "cash",
    null,
  ];

  const all = await readAll();
  const idx = findIndexByIdOrNumber(all, key);
  if (idx === -1) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const inv = { ...all[idx] };

  // Optional updates supported from your UI:
  if (body.status) {
    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    inv.status = body.status;
  }

  // Only update payment_method if it was provided (can be null)
  const hasPaymentMethod = Object.prototype.hasOwnProperty.call(body, "payment_method");
  if (hasPaymentMethod) {
    const pm = (body.payment_method ?? null) as Invoice["payment_method"];
    if (!allowedMethods.includes(pm)) {
      return NextResponse.json({ error: "Invalid payment_method" }, { status: 400 });
    }
    inv.payment_method = pm;
  }

  // Auto-reconcile amounts when status flips to PAID
  if (inv.status === "PAID") {
    if (inv.amount_paid_cents < inv.total_cents) {
      inv.amount_paid_cents = inv.total_cents;
    }
    inv.balance_due_cents = Math.max(inv.total_cents - inv.amount_paid_cents, 0);
    if (!inv.paid_at) inv.paid_at = new Date().toISOString();
  }

  // If status is not PAID and amounts were fully paid, recompute balance (safety)
  if (inv.status !== "PAID") {
    inv.balance_due_cents = Math.max(inv.total_cents - inv.amount_paid_cents, 0);
    // Keep paid_at as-is; we don’t unset it if user toggles status.
  }

  inv.updatedAt = new Date().toISOString();
  all[idx] = inv;
  await writeAll(all);

  return NextResponse.json(inv);
}
