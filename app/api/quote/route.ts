// app/api/quote/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { addQuote, type QuoteRecord } from "@/lib/quotes";
import { sendQuoteNotification } from "@/lib/mailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jvrstudioo@gmail.com";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function denverTimestamp() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const record: QuoteRecord = {
      id: id(),
      receivedAt: denverTimestamp(),
      status: "new",
      source: "web",

      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,

      ymm: body.ymm ?? null,
      vin: body.vin ?? null,

      service: body.service ?? null,
      details: body.details ?? null,
      message: body.details ?? null,
      agree: !!body.agree,

      tintType: body.tintType ?? null,
      tintShade: body.tintShade ?? null,
      vehicleType: body.vehicleType ?? null,
      coverage: Array.isArray(body.coverage)
        ? body.coverage
        : body.coverage
        ? [body.coverage]
        : null,

      removalAreas: Array.isArray(body.removalAreas)
        ? body.removalAreas
        : body.removalAreas
        ? [body.removalAreas]
        : null,

      chromeAreas: Array.isArray(body.chromeAreas)
        ? body.chromeAreas
        : body.chromeAreas
        ? [body.chromeAreas]
        : null,

      decalSize: body.decalSize ?? null,
      decalColor: body.decalColor ?? null,
      decalPlacement: body.decalPlacement ?? null,

      raw: { ...body, ua: req.headers.get("user-agent") },
    };

    // Save to Blob
    await addQuote(record);

    // Fire-and-forget email (don’t fail the request if SMTP hiccups)
    sendQuoteNotification(ADMIN_EMAIL, record).catch((e) =>
      console.error("Email notification failed:", e)
    );

    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error("Error saving quote:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
