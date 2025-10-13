// app/api/quote/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { addQuote, type QuoteRecord } from "@/lib/quotes";
import { sendQuoteNotification } from "@/lib/mailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jvrstudioo@gmail.com";

/** Simple id generator */
function id() {
  return Math.random().toString(36).slice(2, 10);
}

/** Format current time in America/Denver (no timezone suffix, same style you used) */
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
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

/* ------------------------------------------------------------------ */
/* Helpers to safely coerce incoming JSON                              */
/* ------------------------------------------------------------------ */

type Incoming = Record<string, unknown>;

function getString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim();
  return String(v);
}

function getBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "on" || s === "1" || s === "yes";
  }
  return Boolean(v);
}

function toStringArray(v: unknown): string[] | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map((x) => String(x));
  // single value => wrap as one element
  return [String(v)];
}

/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    // Parse body as a loose record so TS doesn’t complain about unknowns
    const body = (await req.json().catch(() => ({}))) as Incoming;

    const record: QuoteRecord = {
      id: id(),
      receivedAt: denverTimestamp(),
      status: "new",
      source: "web",

      firstName: getString(body.firstName),
      lastName: getString(body.lastName),
      email: getString(body.email),
      phone: getString(body.phone),

      ymm: getString(body.ymm),
      vin: getString(body.vin),

      service: getString(body.service),
      details: getString(body.details),
      message: getString(body.details), // keep both fields aligned as before
      agree: getBool(body.agree), // ok even if undefined


      tintType: getString(body.tintType),
      tintShade: getString(body.tintShade),
      vehicleType: getString(body.vehicleType),
      coverage: toStringArray(body.coverage),

      removalAreas: toStringArray(body.removalAreas),
      chromeAreas: toStringArray(body.chromeAreas),

      decalSize: getString(body.decalSize),
      decalColor: getString(body.decalColor),
      decalPlacement: getString(body.decalPlacement),

      raw: { ...body, ua: req.headers.get("user-agent") ?? null },
    };

    await addQuote(record);

    // fire-and-forget email (don’t block HTTP success)
    sendQuoteNotification(ADMIN_EMAIL, record).catch((e) =>
      console.error("Email notification failed:", e)
    );

    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error("Error saving quote:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
