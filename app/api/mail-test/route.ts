// app/api/mail-test/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendQuoteNotification } from "@/lib/mailer";

const TO = process.env.ADMIN_EMAIL || "jvrstudioo@gmail.com";

export async function GET() {
  try {
    await sendQuoteNotification(TO, {
      id: "smtp-test-" + Date.now(),
      receivedAt: new Date().toISOString(),
      status: "new",
      source: "smtp-test",
      firstName: "SMTP",
      lastName: "Check",
      email: "no-reply@example.com",
      phone: null,
      ymm: null,
      vin: null,
      service: "Test",
      details: "SMTP sanity check",
      agree: false,
      tintType: null,
      tintShade: null,
      vehicleType: null,
      coverage: null,
      removalAreas: null,
      chromeAreas: null,
      decalSize: null,
      decalColor: null,
      decalPlacement: null,
      raw: { test: true },
    } as any);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("SMTP test failed:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
