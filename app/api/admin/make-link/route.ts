// app/api/admin/make-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
function digitsOnly(v: unknown): string {
  return String(v ?? "").replace(/\D/g, "");
}

function withCountryE164(d: string): string {
  // Add +1 if US-length; otherwise just prefix + if not present.
  if (!d) return d;
  if (d.length === 10) return `+1${d}`;
  if (d.startsWith("+")) return d;
  return `+${d}`;
}

// ───────────────────────────────────────────────────────────
// Validation schema (accepts relaxed inputs, coerces where needed)
// ───────────────────────────────────────────────────────────
const BodySchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, "Name is required"),
  phone: z
    .preprocess((v) => digitsOnly(v), z.string().min(10, "Phone must have at least 10 digits"))
    .transform((d) => withCountryE164(d)),
  email: z.string().email("Invalid email"),
  service: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, "Service is required"),

  // optional / numeric
  quotedPrice: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive().max(100000).optional()
  ),
  durationHours: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive().max(200).optional()
  ),
  validDays: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().positive().max(365).optional()
  ),

  // toggles
  sendEmail: z.boolean().optional().default(false),
  sendSms: z.boolean().optional().default(false),
});

// ───────────────────────────────────────────────────────────
// Main handler
// ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1) Admin key guard
    const adminKey = req.headers.get("x-admin-key") ?? "";
    if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized (bad admin key)" }, { status: 401 });
    }

    // 2) Parse / validate
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);

    if (!parsed.success) {
      // Return concrete issues so you see exactly why it failed
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const body = parsed.data;

    // 3) Build a booking token & URL (use your existing logic if you already have it)
    // Here we create a simple opaque token using NEXTAUTH_SECRET as the signing key.
    // If you already have a token utility, swap this block for yours.
    const tokenPayload = {
      n: body.name,
      p: body.phone,
      e: body.email,
      s: body.service,
      price: body.quotedPrice,
      dur: body.durationHours,
      days: body.validDays,
      ts: Date.now(),
    };

    // Minimal token (base64 payload + HMAC). Replace with your own function if you have one.
    const cryptoKey = process.env.BOOKING_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "dev-key";
    const json = JSON.stringify(tokenPayload);
    const enc = Buffer.from(json).toString("base64url");

    // naive HMAC
    const sig = Buffer.from(
      await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(cryptoKey),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        ),
        new TextEncoder().encode(enc)
      )
    ).toString("base64url");

    const token = `${enc}.${sig}`;

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${origin}/book/${token}`;

    // 4) Optional: send email/SMS (no-op placeholders here—plug in your existing mailer/Twilio)
    let emailSent = false;
    let smsSent = false;

    // If you have a mailer already, call it here:
    // if (body.sendEmail) { emailSent = await sendBookingEmail(body.email, url, …); }
    // If you have Twilio wired up, call it here:
    // if (body.sendSms) { smsSent = await sendBookingSms(body.phone, url, …); }

    // 5) Respond
    return NextResponse.json(
      {
        ok: true,
        url,
        emailSent,
        smsSent,
        // Also return the normalized phone so you can see it’s accepted
        normalizedPhone: body.phone,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("make-link error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
