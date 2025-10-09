// app/api/admin/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import {
  updateInvoice,
  markPaid,
} from "@/lib/invoices";

type Status = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
type PaymentMethod = "square_card" | "square_tap" | "cash" | null;

// PATCH /api/admin/invoices/:id
// Body: { status?: Status, payment_method?: PaymentMethod }
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const status: Status | undefined = body?.status;
    const payment_method: PaymentMethod =
      (body?.payment_method ?? null) as PaymentMethod;

    // If marking PAID and a method is provided, use markPaid (sets paid_at, zeroes balance)
    if (status === "PAID" && payment_method) {
      const done = await markPaid(params.id, payment_method);
      if (!done) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(done);
    }

    // Otherwise, do a shallow patch
    const updated = await updateInvoice(params.id, {
      status,
      payment_method: payment_method ?? null,
    });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
