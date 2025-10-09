import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
// app/api/invoices/[id]/send/route.ts
import { sendMail } from "../../../../../lib/mailer";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LineItem = { id: string; name: string; description?: string; qty: number; unit_price: number };
type Customer = { name: string; email: string; phone?: string };
type Invoice = {
  id: string;
  number: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  issue_date: string;
  due_date: string;
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

function cents(n: number) { return (n / 100).toFixed(2); }
function renderHtml(inv: Invoice) {
  const rows = inv.items?.map(li => `
    <tr>
      <td style="padding:8px 0">${li.name}${li.description ? ` — <span style="opacity:.75">${li.description}</span>` : ""}</td>
      <td style="text-align:right;padding:8px 0">${li.qty}</td>
      <td style="text-align:right;padding:8px 0">$${cents(li.unit_price)}</td>
    </tr>`).join("") || "";
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto">
    <h2 style="margin:0 0 8px">Invoice ${inv.number}</h2>
    <p style="margin:0 0 16px">Issue date: ${inv.issue_date} • Due: ${inv.due_date}</p>
    <p style="margin:0 0 12px">Hi ${inv.customer?.name || "Customer"},</p>
    <p style="margin:0 0 16px">Thanks for choosing <strong>JVR Studio</strong>. Your invoice details are below.</p>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:8px 0">Item</th>
          <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:8px 0">Qty</th>
          <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:8px 0">Price</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="3" style="padding:12px 0">No line items</td></tr>`}</tbody>
      <tfoot>
        <tr><td></td><td style="text-align:right;padding-top:12px">Subtotal</td><td style="text-align:right;padding-top:12px">$${cents(inv.subtotal_cents)}</td></tr>
        <tr><td></td><td style="text-align:right;padding-top:4px">Taxes/Fees</td><td style="text-align:right;padding-top:4px">$${cents(inv.taxes_fees_cents)}</td></tr>
        <tr><td></td><td style="text-align:right;padding-top:8px"><strong>Total</strong></td><td style="text-align:right;padding-top:8px"><strong>$${cents(inv.total_cents)}</strong></td></tr>
        <tr><td></td><td style="text-align:right;padding-top:8px">Amount Paid</td><td style="text-align:right;padding-top:8px">$${cents(inv.amount_paid_cents)}</td></tr>
        <tr><td></td><td style="text-align:right;padding-top:4px">Balance Due</td><td style="text-align:right;padding-top:4px">$${cents(inv.balance_due_cents)}</td></tr>
      </tfoot>
    </table>
    ${inv.notes ? `<p style="margin-top:16px"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
    ${inv.terms ? `<p style="margin-top:8px;opacity:.85"><strong>Terms:</strong> ${inv.terms}</p>` : ""}
    <p style="margin-top:16px">If you have any questions, just reply to this email.</p>
    <p style="margin-top:8px">— JVR Studio</p>
  </div>`;
}

async function readAll(): Promise<Invoice[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e: any) {
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}
async function writeAll(list: Invoice[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), "utf8");
}
function findIndexByIdOrNumber(list: Invoice[], key: string) {
  return list.findIndex((inv) => inv.id === key || inv.number === key);
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const key = decodeURIComponent(ctx.params.id);
  const all = await readAll();
  const idx = findIndexByIdOrNumber(all, key);
  if (idx === -1) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const inv = all[idx];
  const url = new URL(req.url);
  const overrideTo = url.searchParams.get("to");
  const to = overrideTo || inv.customer?.email;
  if (!to) return NextResponse.json({ error: "Missing customer.email" }, { status: 400 });

  try {
    const messageId = await sendMail({
      to,
      subject: `Invoice ${inv.number} from JVR Studio`,
      html: renderHtml(inv),
    });

    const now = new Date().toISOString();
    const updated: Invoice = {
      ...inv,
      status: inv.status === "PAID" ? "PAID" : "SENT",
      sentAt: now,
      updatedAt: now,
      lastEmailId: messageId ?? null,
    };
    all[idx] = updated;
    await writeAll(all);

    return NextResponse.json({ ok: true, messageId, invoice: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "SMTP send failed" }, { status: 500 });
  }
}
