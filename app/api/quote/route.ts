// app/api/quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

function id() { return Math.random().toString(36).slice(2, 10); }
function denverTimestamp() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const record = {
      id: id(),
      receivedAt: denverTimestamp(),
      status: "new" as const,
      source: "web",

      // contact
      firstName: body.firstName ?? null,
      lastName:  body.lastName ?? null,
      email:     body.email ?? null,
      phone:     body.phone ?? null,

      // vehicle
      ymm: body.ymm ?? null,
      vin: body.vin ?? null,

      // service + details
      service: body.service ?? null,
      details: body.details ?? null,
      message: body.details ?? null,   // back-compat
      agree: !!body.agree,

      // window tint (conditional)
      tintType:    body.tintType ?? null,
      tintShade:   body.tintShade ?? null,
      vehicleType: body.vehicleType ?? null,
      coverage:    Array.isArray(body.coverage) ? body.coverage : (body.coverage ? [body.coverage] : null),

      // tint removal
      removalAreas: Array.isArray(body.removalAreas) ? body.removalAreas : (body.removalAreas ? [body.removalAreas] : null),

      // chrome delete
      chromeAreas: Array.isArray(body.chromeAreas) ? body.chromeAreas : (body.chromeAreas ? [body.chromeAreas] : null),

      // vinyl decal
      decalSize:      body.decalSize ?? null,
      decalColor:     body.decalColor ?? null,
      decalPlacement: body.decalPlacement ?? null,

      raw: { ...body, ua: req.headers.get("user-agent") },
    };

    const dataDir = path.join(process.cwd(), "data");
    const file = path.join(dataDir, "quotes.json");
    try { await fs.mkdir(dataDir, { recursive: true }); } catch {}
    let existing: any[] = [];
    try {
      const txt = await fs.readFile(file, "utf8");
      existing = JSON.parse(txt);
      if (!Array.isArray(existing)) existing = [];
    } catch {}
    existing.unshift(record);
    await fs.writeFile(file, JSON.stringify(existing, null, 2), "utf8");

    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error("Error saving quote:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
