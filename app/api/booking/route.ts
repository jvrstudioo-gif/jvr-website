import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import nodemailer from "nodemailer";

/** ---- Paths / Types ---- */
const ROOT = process.cwd();
const LINKS_PATH = path.join(ROOT, "data", "booking-links.json");
const BOOKINGS_PATH = path.join(ROOT, "data", "bookings.json");

type LinkRecord = {
  token: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  quotedPrice?: number | null;
  durationHours?: number | null;
  createdAt: string;
  expiresAt?: string | null;
  used?: boolean;
};

type BookingRecord = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:mm
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  notes?: string | null;
  quotedPrice?: number | null;
  durationHours?: number | null;
};

/** ---- IO helpers ---- */
async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const buf = await fs.readFile(file, "utf8");
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}
async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/** ---- Responses ---- */
function bad(reason: string, reasons?: string[]) {
  return NextResponse.json({ ok: false, error: reason, reasons }, { status: 400 });
}
function serverError(reason = "Internal error") {
  return NextResponse.json({ ok: false, error: reason }, { status: 500 });
}

/** ---- Validation helpers ---- */
function isIsoDate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}
function isTime(v: string) {
  return /^\d{2}:\d{2}$/.test(v);
}

// Aurora, CO timezone
const DENVER_TZ = "America/Denver";

// weekend only (Sat/Sun) check for local Denver date
function isDenverWeekend(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  // interpret as calendar date; weekday via Intl in Denver tz
  const utc = new Date(Date.UTC(y, m - 1, d, 12)); // noon UTC to avoid DST edges
  const wk = new Intl.DateTimeFormat("en-US", { timeZone: DENVER_TZ, weekday: "short" })
    .format(utc)
    .toLowerCase(); // "sat" / "sun" etc
  return wk.startsWith("sat") || wk.startsWith("sun");
}

// 8:00 → 14:00 every 30 minutes (inclusive)
function isValidDenverSlot(hhmm: string) {
  if (!isTime(hhmm)) return false;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const mins = h * 60 + m;
  if (m % 30 !== 0) return false;
  return mins >= 8 * 60 && mins <= 14 * 60; // inclusive of 14:00
}

/** ---- Email (best-effort; skips if env missing) ---- */
function hasSmtp() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.FROM_EMAIL
  );
}
async function sendMail(to: string, subject: string, html: string) {
  if (!hasSmtp()) return { sent: false, skipped: true };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  const info = await transporter.sendMail({ from: process.env.FROM_EMAIL!, to, subject, html });
  return { sent: true, id: info.messageId };
}

/** ----------------------------------------------------------------
 * GET /api/bookings?date=YYYY-MM-DD
 * Returns availability for that date (one booking max per day).
 * --------------------------------------------------------------- */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || "";

  if (!isIsoDate(date)) {
    return NextResponse.json({ available: false, count: 0, error: "Invalid or missing date" }, { status: 400 });
  }

  const bookings = await readJson<BookingRecord[]>(BOOKINGS_PATH, []);
  const count = bookings.filter(b => b.date === date && b.status !== "cancelled").length;

  return NextResponse.json({ available: count === 0, count });
}

/** ----------------------------------------------------------------
 * POST /api/bookings
 * Body: { token, date, time, notes? }
 * Validates:
 *  - token valid and not expired/used
 *  - weekend only (Denver)
 *  - time between 09:00 and 14:00 in 30-min steps
 *  - at most one booking per date (non-cancelled)
 * --------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, date, time, notes } = body as {
      token?: string;
      date?: string;
      time?: string;
      notes?: string;
    };

    const reasons: string[] = [];
    if (!token || typeof token !== "string") reasons.push("Missing token");
    if (!date || !isIsoDate(String(date))) reasons.push("date must be YYYY-MM-DD");
    if (!time || !isTime(String(time))) reasons.push("time must be HH:mm");

    // business rules
    if (date && isIsoDate(date) && !isDenverWeekend(date)) {
      reasons.push("We only accept bookings on weekends.");
    }
    if (time && isTime(time) && !isValidDenverSlot(time)) {
      reasons.push("Time must be between 9:00 AM and 2:00 PM (every 30 minutes) in Aurora, CO time.");
    }

    if (reasons.length) return bad("Validation failed", reasons);

    // Load data files
    const links: LinkRecord[] = await readJson<LinkRecord[]>(LINKS_PATH, []);
    const bookings: BookingRecord[] = await readJson<BookingRecord[]>(BOOKINGS_PATH, []);

    // Enforce "one booking per day" (any non-cancelled blocks)
    const already = bookings.some(b => b.date === date && b.status !== "cancelled");
    if (already) return bad("That date is already fully booked. Please choose another weekend day.");

    // Find and validate token
    const link = links.find((l) => l.token === token);
    if (!link) return bad("Invalid booking link.");
    if (link.used) return bad("This booking link was already used.");

    if (link.expiresAt) {
      const now = Date.now();
      const expires = new Date(link.expiresAt).getTime();
      if (isFinite(expires) && now > expires) {
        return bad("This booking link is expired.");
      }
    }

    // Build and persist booking
    const id = `b_${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    const record: BookingRecord = {
      id,
      status: "pending", // or "confirmed" if you prefer
      createdAt: nowIso,
      updatedAt: nowIso,
      date: String(date),
      time: String(time),
      name: link.name ?? "",
      email: link.email ?? "",
      phone: link.phone ?? null,
      service: link.service ?? null,
      notes: notes?.trim() || null,
      quotedPrice: link.quotedPrice ?? null,
      durationHours: link.durationHours ?? null,
    };

    bookings.push(record);
    await writeJson(BOOKINGS_PATH, bookings);

    // Mark token used
    link.used = true;
    await writeJson(LINKS_PATH, links);

    // Email customer (best effort)
    let emailNote = "";
    if (record.email) {
      const customerMsg = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto">
          <h2>You're booked with JVR Studio 🎉</h2>
          <p>Thanks, ${record.name || "there"}! We received your booking.</p>
          <ul>
            <li><strong>Service:</strong> ${record.service || "-"}</li>
            <li><strong>Date / Time:</strong> ${record.date} ${record.time} (Aurora, CO)</li>
            <li><strong>Quoted Price:</strong> ${record.quotedPrice != null ? `$${record.quotedPrice}` : "-"}</li>
            <li><strong>Duration:</strong> ${record.durationHours != null ? `${record.durationHours} hours` : "-"}</li>
          </ul>
          ${record.notes ? `<p><strong>Your notes:</strong> ${record.notes}</p>` : ""}
          <p>We’ll reach out if anything else is needed. See you soon!</p>
        </div>
      `;
      try {
        await sendMail(record.email, "JVR Studio: Booking confirmed", customerMsg);
        emailNote = "Email sent.";
      } catch {
        emailNote = "Email failed (will not block booking).";
      }
    }

    // Email admin (best effort)
    if (hasSmtp() && process.env.ADMIN_EMAIL) {
      const adminMsg = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto">
          <h3>New booking</h3>
          <ul>
            <li><strong>Name:</strong> ${record.name}</li>
            <li><strong>Email:</strong> ${record.email}</li>
            <li><strong>Phone:</strong> ${record.phone || "-"}</li>
            <li><strong>Service:</strong> ${record.service || "-"}</li>
            <li><strong>Date/Time:</strong> ${record.date} ${record.time} (Aurora, CO)</li>
            <li><strong>Quoted Price:</strong> ${record.quotedPrice != null ? `$${record.quotedPrice}` : "-"}</li>
            <li><strong>Duration:</strong> ${record.durationHours != null ? `${record.durationHours} hours` : "-"}</li>
            <li><strong>Notes:</strong> ${record.notes || "-"}</li>
            <li><strong>ID:</strong> ${record.id}</li>
          </ul>
        </div>
      `;
      try {
        await sendMail(process.env.ADMIN_EMAIL!, "JVR Studio – New booking", adminMsg);
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      ok: true,
      bookingId: id,
      message: `Booking saved. ${emailNote}`.trim(),
    });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
