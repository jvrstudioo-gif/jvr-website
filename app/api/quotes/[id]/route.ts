import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "quotes.json");

async function readQuotes() {
  try {
    const txt = await fs.readFile(FILE, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeQuotes(quotes: any[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(quotes, null, 2), "utf8");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const allowed = ["new", "pending", "in_review", "quoted", "accepted", "declined", "won", "lost"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const id = params.id;
    const quotes = await readQuotes();
    const idx = quotes.findIndex((q: any) => q.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    quotes[idx].status = status;
    quotes[idx].updatedAt = new Date().toISOString();

    await writeQuotes(quotes);

    return NextResponse.json({ ok: true, id, status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
