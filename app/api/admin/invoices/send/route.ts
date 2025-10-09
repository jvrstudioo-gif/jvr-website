// app/api/admin/invoices/send/route.ts
import { NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/invoices";

export async function POST(req: Request) {
  try {
    const { id, to } = await req.json(); // { id, to? }
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const inv = await getInvoiceById(id);
    if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const recipient = to || inv.customer?.email;
    if (!recipient) {
      return NextResponse.json(
        { error: "No recipient email on invoice" },
        { status: 400 }
      );
    }

    // TODO: integrate your email provider here.
    // For now, simulate success so UI can proceed:
    console.log(`[SEND] Invoice ${inv.number} to ${recipient}`);

    return NextResponse.json({ ok: true, sent_to: recipient });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
