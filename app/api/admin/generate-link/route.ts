// app/api/admin/generate-link/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

type MakeLinkBody = {
  name: string;
  phone?: string;
  email: string;
  service?: string;
  quotedPrice?: number;
  durationHours?: number;
  validDays?: number;
  sendEmail?: boolean;
  sendSms?: boolean;
};

type BookingLinkRecord = {
  token: string;
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  quotedPrice?: number;
  durationHours?: number;
  validDays?: number;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  status: "new" | "sent" | "booked" | "expired";
};

const DATA_DIR = path.join(process.cwd(), "data");
const TOKENS_FILE = path.join(DATA_DIR, "booking-links.json");

async function ensureTokensFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TOKENS_FILE);
  } catch {
    await fs.writeFile(TOKENS_FILE, "[]", "utf8");
  }
}

async function readTokens(): Promise<BookingLinkRecord[]> {
  await ensureTokensFile();
  const txt = await fs.readFile(TOKENS_FILE, "utf8");
  try {
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? (arr as BookingLinkRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeTokens(rows: BookingLinkRecord[]) {
  await ensureTokensFile();
  await fs.writeFile(TOKENS_FILE, JSON.stringify(rows, null, 2), "utf8");
}

function b64url(n = 10) {
  return crypto.randomBytes(n).toString("base64url");
}

export async function POST(req: Request) {
  // --- 0) Admin key guard ---
  const adminKeyHeader = req.headers.get("x-admin-key")?.trim();
  const ADMIN_KEY = process.env.ADMIN_KEY?.trim();
  if (!ADMIN_KEY || adminKeyHeader !== ADMIN_KEY) {
    return NextResponse.json(
      { error: "Unauthorized", reasons: ["Missing or invalid admin key."] },
      { status: 401 }
    );
  }

  // --- 1) Parse body ---
  let body: MakeLinkBody;
  try {
    body = (await req.json()) as MakeLinkBody;
  } catch {
    return NextResponse.json(
      { error: "Bad request", reasons: ["Body must be valid JSON."] },
      { status: 400 }
    );
  }

  // --- 2) Validate ---
  const reasons: string[] = [];
  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const service = body.service?.trim();
  const quotedPrice =
    typeof body.quotedPrice === "number"
      ? body.quotedPrice
      : body.quotedPrice
      ? Number(body.quotedPrice)
      : undefined;
  const durationHours =
    typeof body.durationHours === "number"
      ? body.durationHours
      : body.durationHours
      ? Number(body.durationHours)
      : undefined;
  const validDays =
    typeof body.validDays === "number"
      ? body.validDays
      : body.validDays
      ? Number(body.validDays)
      : 7;

  const sendEmail = !!body.sendEmail;
  const sendSms = !!body.sendSms;

  if (!name) reasons.push("Name is required.");
  if (!email) reasons.push("Email is required.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) reasons.push("Email is invalid.");
  if (quotedPrice !== undefined && Number.isNaN(quotedPrice))
    reasons.push("Quoted price must be a number.");
  if (durationHours !== undefined && Number.isNaN(durationHours))
    reasons.push("Duration hours must be a number.");
  if (validDays !== undefined && (Number.isNaN(validDays) || validDays <= 0))
    reasons.push("Valid days must be a positive number.");

  if (reasons.length) {
    return NextResponse.json(
      { error: "Validation failed", reasons },
      { status: 400 }
    );
  }

  // --- 3) Build token record ---
  const token = b64url(9); // short, URL-safe
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (validDays ?? 7) * 86400000);

  const rec: BookingLinkRecord = {
    token,
    name,
    email,
    phone,
    service,
    quotedPrice,
    durationHours,
    validDays,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "new",
  };

  // --- 4) Persist ---
  const rows = await readTokens();
  rows.push(rec);
  await writeTokens(rows);

  // --- 5) Build link ---
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";
  const url = `${origin}/book/${token}`;

  // --- 6) Email (optional) ---
  let emailSent = false;
  if (sendEmail) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const FROM_EMAIL =
      process.env.FROM_EMAIL || `JVR Studio <${SMTP_USER ?? "no-reply@example.com"}>`;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      try {
        const transport = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: false,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const prettyPrice =
          typeof quotedPrice === "number"
            ? Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(quotedPrice)
            : null;

        const lines: string[] = [
          `Hi ${name || "there"},`,
          "",
          `Here's your booking link for JVR Studio:`,
          url,
          "",
          service ? `Service: ${service}` : "",
          prettyPrice ? `Quoted Price: ${prettyPrice}` : "",
          durationHours ? `Duration: ${durationHours} hours` : "",
          `This link is valid until ${new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(expiresAt)}.`,
          "",
          "Thanks!",
          "— JVR Studio",
        ].filter(Boolean) as string[];

        await transport.sendMail({
          from: FROM_EMAIL,
          to: email!,
          subject: "Your JVR Studio booking link",
          text: lines.join("\n"),
        });

        emailSent = true;
      } catch (err) {
        reasons.push("Email send failed (check SMTP settings).");
      }
    } else {
      reasons.push("Email not sent: SMTP env vars are not configured.");
    }
  }

  // --- 7) SMS (optional & best-effort) ---
  let smsSent = false;
  if (sendSms) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM && phone) {
      try {
        // Dynamically import to avoid bundling if unused
        const twilio = (await import("twilio")).default;
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await client.messages.create({
          from: TWILIO_FROM,
          to: phone,
          body: `JVR Studio booking link: ${url}`,
        });
        smsSent = true;
      } catch (err) {
        reasons.push("SMS send failed (check Twilio settings/number).");
      }
    } else {
      reasons.push(
        "SMS not sent: Twilio env vars/phone are not configured or missing."
      );
    }
  }

  // --- 8) Respond ---
  return NextResponse.json(
    {
      url,
      emailSent,
      smsSent,
      ...(reasons.length ? { reasons } : null),
    },
    { status: 200 }
  );
}
