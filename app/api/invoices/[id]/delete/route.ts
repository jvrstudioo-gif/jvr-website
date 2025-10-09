import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const DATA_PATH = path.join(process.cwd(), "data", "invoices.json");

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);

  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const list = JSON.parse(raw || "[]");

    const index = list.findIndex((inv: any) => inv.id === id || inv.number === id);
    if (index === -1)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const deleted = list.splice(index, 1)[0];
    await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), "utf8");

    return NextResponse.json({ ok: true, deleted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 500 });
  }
}
