// app/api/admin/invoices/route.ts
import { NextResponse } from "next/server";
import { readInvoices, createInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

// GET /api/admin/invoices (optional: handy for admin lists)
export async function GET() {
  try {
    const all = await readInvoices();
    return NextResponse.json(all, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to read invoices" }, { status: 500 });
  }
}

// POST /api/admin/invoices
export async function POST(req: Request) {
  try {
    const input = await req.json();

    const name: string = input?.customer?.name ?? "";
    if (!name) {
      return NextResponse.json({ error: "customer.name is required" }, { status: 400 });
    }

    const email: string | undefined = input?.customer?.email || undefined;
    const phone: string | undefined = input?.customer?.phone || undefined;

    const service: string = input?.service ?? "Service";
    const car: string | undefined = input?.car || undefined;
    const amountDollars: number = Number(input?.amount ?? 0);
    const amountCents = Math.round(amountDollars * 100);

    const newInv = await createInvoice({
      customer: { name, email, phone },
      items: [
        {
          name: service,
          description: car,
          qty: 1,
          unit_price: amountCents,
        },
      ],
      notes: input?.notes || "",
      terms: input?.terms || "",
      // status defaults to "SENT" in the lib
    });

    return NextResponse.json(newInv, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
